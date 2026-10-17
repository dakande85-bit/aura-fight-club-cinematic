#!/usr/bin/env python3
"""AURA automated subject -> licensed footage -> editable 5–10min rough cut.

No downloading from YouTube/watch pages. Official YouTube links are RESEARCH only.
Pexels API provides licensed generic boxing b-roll, not actual named-fighter action.
First-party/licensed footage supplied in --media-register can be used to show named fighters.
Without sufficient footage or a 5–10min script the worker creates an explicit blocked
production report rather than a fake/looped video.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
from urllib.parse import urlparse, urlencode
from urllib.request import Request, urlopen
from aura_youtube_ingest import source_authorised as youtube_authorised, ingest as ingest_youtube, discover as discover_youtube, sources_from_register as approved_youtube_registry

MAX_FILE=90_000_000
MAX_TOTAL=450_000_000
MAX_DOWNLOAD=28
MAX_DURATION=600
WPM=140
ROLE_RE={
    "weighin": re.compile(r"weigh.?in|scales|weight|face.?off|face to face|staredown", re.I),
    "press":re.compile(r"\\bpress(?: conference)?\\b|interview|said|claims|promoter|announce|spoke|trainer",re.I),
    "training":re.compile(r"training|camp|gym|spar|fitness|conditioning|prepare",re.I),
    "fight":re.compile(r"fight|exchange|knock|jab|hook|counter|right hand|ring|round|punch|pressure|footwork|defen",re.I)
}
QUERY={"weighin":["boxing weigh in scales","boxing face off"],
       "press":["boxing press conference microphone","boxing interview press"],
       "training":["boxing training heavy bag","boxing sparring boxing gym"],
       "fight":["boxing ring sparring action","boxing gloves boxing match"]}
def words(text): return re.findall(r"\b[\w'-]+\b",text)
def sentences(text):
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+|\n{2,}",text.strip()) if s.strip()]
def category(text):
    for k,pattern in ROLE_RE.items():
        if pattern.search(text): return k
    return "training"
def narrative_beats(script,desired_seconds=None):
    """Produce short independently editable visual shots with narration-aligned timings."""
    all_words=words(script)
    if not all_words: raise ValueError("Narration has no words")
    # Exact runtime estimate must follow the actual script; no repeated padding.
    natural_seconds=len(all_words)/WPM*60
    if desired_seconds is not None and not .75*desired_seconds<=natural_seconds<=1.25*desired_seconds:
        raise ValueError("Script does not fit chosen runtime; revise words rather than loop filler")
    beats=[];cursor=0;current=[]
    def commit():
        nonlocal cursor,current
        if not current:return
        phrase=" ".join(current)
        duration=max(2.5,len(words(phrase))/WPM*60)
        beats.append(dict(id=f"beat-{len(beats)+1:03d}",narration=phrase,role=category(phrase),
                          timelineIn=round(cursor,2),duration=round(duration,2),timelineOut=round(cursor+duration,2)))
        cursor+=duration;current=[]
    for sentence in sentences(script):
        chunks=words(sentence)
        if len(words(" ".join(current)))+len(chunks)>17 and current:commit()
        if len(chunks)>23:
            for n in range(0,len(chunks),15):
                current.append(" ".join(chunks[n:n+15]));commit()
        else:
            current.append(sentence)
            if len(words(" ".join(current)))>=10:commit()
    commit()
    return beats

def commons_file(url):
    p=urlparse(url)
    return (p.scheme=="https" and p.hostname=="upload.wikimedia.org" and
            p.path.lower().endswith((".webm",".ogv",".mp4")) and not p.username and not p.password)

def commons(query,kind,limit=20):
    params={"action":"query","generator":"search","gsrsearch":"filetype:video "+query,
       "gsrnamespace":"6","gsrlimit":str(limit),
       "prop":"imageinfo","iiprop":"url|size|extmetadata","format":"json","formatversion":"2"}
    req=Request("https://commons.wikimedia.org/w/api.php?"+urlencode(params),
                headers={"User-Agent":"AuraFightClub/1.0 (contact: editorial@aurafightclub.com)"})
    with urlopen(req,timeout=25) as result:data=json.load(result)
    entries=[]
    for page in data.get("query",{}).get("pages",[]):
        if not page.get("imageinfo"):continue
        info=page["imageinfo"][0];url=info.get("url","")
        if not commons_file(url):continue
        if int(info.get("size") or 0)>MAX_FILE:continue
        md=info.get("extmetadata") or {}
        tag=lambda name: re.sub(r"<[^>]*>","",str(md.get(name,{}).get("value",""))).strip()
        lic=tag("LicenseShortName")
        lic_norm=lic.lower().replace(" ","")
        # No CC NC/ND licences for monetised derivative news edits.
        canonical=re.sub(r"[^a-z0-9]+","",lic.lower())
        allowed=(canonical.startswith(("ccby","ccbysa")) or
                 canonical in ("pd","publicdomain","cc0","cc01","publicdomainmark"))
        if not allowed or "nc" in lic_norm or "nd" in lic_norm:continue
        ident=hashlib.sha256(url.encode()).hexdigest()[:12]
        entries.append({"id":"commons-"+ident,"kind":kind,"fileUrl":url,
            "originUrl":info.get("descriptionurl",""),
            "provider":"Wikimedia Commons", "license":lic,
            "attribution":tag("Artist")[:160] or "Wikimedia Commons creator",
            "displayName":"Creative Commons boxing footage",
            "duration":0,"illustrative":True,"namedFighterVerified":False,
            "rightsStatus":"commons_license_check_required",
            "licenseProof":info.get("descriptionurl","")})
    return entries

def archive_license_ok(value):
    """Only credit-required commercial derivative-friendly Creative Commons URLs."""
    if isinstance(value,list):value=next((v for v in value if isinstance(v,str)),"")
    value=str(value or "").lower()
    parsed=urlparse(value)
    if parsed.scheme not in ("https","http"):return False
    if parsed.hostname!="creativecommons.org":return False
    path=parsed.path.rstrip("/")
    return (path.startswith(("/licenses/by/","/licenses/by-sa/","/publicdomain/zero/","/publicdomain/mark/"))
            and "/by-nc" not in path and "/by-nd" not in path)

def archive_file(url):
    p=urlparse(str(url or ""))
    if p.scheme!="https" or p.username or p.password:return False
    host=(p.hostname or "").lower()
    return (host=="archive.org" or host.endswith(".archive.org")) and p.path.lower().endswith((".mp4",".webm",".ogv"))

def archive_search(query,kind,max_items=5):
    """Public Internet Archive metadata API; verifies per-item CC licence first."""
    search="mediatype:movies AND (title:boxing OR subject:boxing OR title:\"boxing training\")"
    params={"q":search,"fl[]":["identifier","title","licenseurl"],"rows":str(max_items*4),"page":"1","output":"json"}
    from urllib.parse import quote
    url="https://archive.org/advancedsearch.php?"+urlencode(params,doseq=True)
    req=Request(url,headers={"User-Agent":"AuraFightClub/1.0 (licence-checked video research)"})
    with urlopen(req,timeout=25) as response:data=json.load(response)
    sources=[]
    for item in data.get("response",{}).get("docs",[]):
        if len(sources)>=max_items:break
        ident=str(item.get("identifier") or "")
        if not re.fullmatch(r"[A-Za-z0-9_.-]{2,120}",ident):continue
        check=Request("https://archive.org/metadata/"+quote(ident,safe=""),
                     headers={"User-Agent":"AuraFightClub/1.0"})
        try:
            with urlopen(check,timeout=20) as response:meta=json.load(response)
        except Exception:continue
        md=meta.get("metadata") or {}
        licence=md.get("licenseurl") or item.get("licenseurl")
        if not archive_license_ok(licence):continue
        files=[x for x in meta.get("files",[]) if
               x.get("name") and x.get("source") in ("original","derivative") and
               re.fullmatch(r"[A-Za-z0-9_.() -]{3,160}\.(mp4|webm|ogv)",str(x["name"]),re.I)]
        files=[x for x in files if 30000<int(x.get("size") or 0)<MAX_FILE]
        files.sort(key=lambda x:(x.get("source")!="original",int(x.get("size") or 0)))
        if not files:continue
        filename=quote(files[0]["name"],safe="")
        file_url="https://archive.org/download/"+quote(ident,safe="")+"/"+filename
        creator=md.get("creator") or "Internet Archive contributor"
        if isinstance(creator,list):creator=", ".join(map(str,creator[:2]))
        sources.append({"id":"archive-"+hashlib.sha256(file_url.encode()).hexdigest()[:12],
          "kind":kind,"fileUrl":file_url,"originUrl":"https://archive.org/details/"+quote(ident,safe=""),
          "provider":"Internet Archive","license":str(licence),
          "licenseProof":str(licence),"attribution":str(creator)[:160],
          "displayName":"Creative Commons boxing archive footage",
          "duration":0,"illustrative":True,"namedFighterVerified":False,
          "rightsStatus":"archive_license_check_required"})
    return sources

def safety_url(url):
    p=urlparse(url)
    if p.scheme!="https" or p.username or p.password: return False
    hostname=(p.hostname or "").lower()
    # Official CDN that returns video files from the Pexels API.
    return hostname=="videos.pexels.com"

def pexels(query,key,per_page=14):
    url="https://api.pexels.com/v1/videos/search?"+urlencode({"query":query,"per_page":per_page,"size":"medium"})
    req=Request(url,headers={"Authorization":key,"User-Agent":"AuraFightClub/1.0 automated film research"})
    with urlopen(req,timeout=22) as result:
        response=json.load(result)
    entries=[]
    for v in response.get("videos",[]):
        options=[f for f in v.get("video_files",[]) if
                 f.get("file_type")=="video/mp4" and safety_url(str(f.get("link","")))]
        # Prefer 640-1280px footage to keep five-minute encoding jobs manageable.
        options.sort(key=lambda f:abs(int(f.get("width") or 1000)-960))
        if not options: continue
        f=options[0]
        entries.append({
            "id":"pexels-"+str(v["id"]), "kind":category(query),
            "fileUrl":f["link"],"originUrl":v.get("url", ""),
            "provider":"Pexels","license":"Pexels License", "attribution":v.get("user",{}).get("name","Pexels creator"),
            "displayName":"Licensed illustrative boxing footage",
            "duration":float(v.get("duration") or 0),
            "illustrative":True, "namedFighterVerified":False,
            "rightsStatus":"pexels_license_check_required"
        })
    return entries

def allowed_source(item):
    # The user can add individually approved YouTube sources (separate platform/copyright review).
    if item.get("provider")=="YouTube approved":
        return youtube_authorised(item)
    if item.get("provider")=="Internet Archive":
        return (item.get("rightsStatus")=="archive_license_check_required" and
            archive_license_ok(item.get("licenseProof","")) and archive_file(item.get("fileUrl","")))
    if item.get("provider")=="Wikimedia Commons":
        return (item.get('licenseProof') and commons_file(item.get('fileUrl','')) and
            item.get('rightsStatus')=='commons_license_check_required')
    if item.get("provider")=="Pexels":
        return item.get("license")=="Pexels License" and safety_url(item.get("fileUrl",""))
    return (item.get("rightsStatus")=="cleared" and item.get("licenseProof") and
        bool(item.get("localFile")) and item.get("provider") in ("owner","licensed_archive","promoter_delivery"))

def research(script,existing,key=None):
    needed=list(dict.fromkeys(b["role"] for b in narrative_beats(script)))
    sources=[{**x} for x in existing if allowed_source(x)]
    notes=[]
    used={s["id"] for s in sources}
    for role in needed:
        found=0
        if key:
            for query in QUERY.get(role,QUERY["training"]):
                try:options=pexels(query,key)
                except Exception as error:
                    notes.append(f"Pexels {role} search failed: {type(error).__name__}");continue
                for entry in options:
                    entry["kind"]=role
                    if entry["id"] in used:continue
                    used.add(entry["id"]);sources.append(entry);found+=1
                    if found>=5:break
                if found>=5:break
        for query in QUERY.get(role,QUERY["training"])[:1]:
            try:options=commons(query,role)
            except Exception as error:
                notes.append(f"Commons {role} search failed: {type(error).__name__}");continue
            for entry in options:
                if entry["id"] in used:continue
                used.add(entry["id"]);sources.append(entry);found+=1
                if found>=5:break
        if found<5:
            try:
                for entry in archive_search(query,role,max_items=5-found):
                    if entry["id"] in used:continue
                    used.add(entry["id"]);sources.append(entry);found+=1
            except Exception as error:
                notes.append(f"Internet Archive {role} search failed: {type(error).__name__}")
        if found==0:notes.append("No openly reusable downloadable video for "+role)
    if not key:notes.append("Pexels not configured; tried Commons reusable video searches only.")
    return sources,notes

def safe_local_file(media_dir,name):
    path=Path(name)
    if not name or path.name!=name or not re.fullmatch(r"[\w .()-]+",name):
        raise ValueError("Unsafe local footage path")
    full=(media_dir/name).resolve()
    if not full.is_relative_to(media_dir.resolve()):raise ValueError("Unsafe media path")
    return full

def download_video(entry,out_dir):
    if entry.get("provider")=="YouTube approved":
        return ingest_youtube(entry,out_dir)
    if entry.get("localFile"):
        local=safe_local_file(out_dir,entry["localFile"])
        if not local.is_file():raise FileNotFoundError("Missing licensed file "+entry["localFile"])
        return local
    provider=entry.get("provider")
    url=entry.get("fileUrl","")
    if provider=="Pexels" and safety_url(url): pass
    elif provider=="Wikimedia Commons" and commons_file(url):pass
    elif provider=="Internet Archive" and archive_file(url):pass
    else:raise ValueError("Only verified provider downloads are permitted")
    filename=entry["id"]+(".webm" if urlparse(url).path.lower().endswith(".webm") else ".ogv" if urlparse(url).path.lower().endswith(".ogv") else ".mp4")
    target=out_dir/filename
    if target.exists() and target.stat().st_size>1000:return target
    request=Request(url,headers={"User-Agent":"AuraFightClub/1.0 (editorial@aurafightclub.com)"})
    with urlopen(request,timeout=70) as response:
        if provider=="Pexels" and not safety_url(response.geturl()):raise ValueError("Unexpected redirected download")
        if provider=="Wikimedia Commons" and not commons_file(response.geturl()):raise ValueError("Unexpected Wikimedia download redirect")
        if provider=="Internet Archive" and not archive_file(response.geturl()):raise ValueError("Unexpected archive download redirect")
        declared=int(response.headers.get("content-length") or 0)
        if declared>MAX_FILE:raise ValueError("Footage is too large")
        total=0
        with target.open("wb") as writer:
            while (data:=response.read(1024*1024)):
                total+=len(data)
                if total>MAX_FILE:
                    target.unlink(missing_ok=True)
                    raise ValueError("Footage exceeds download limit")
                writer.write(data)
    if target.stat().st_size<30000:
        target.unlink(missing_ok=True);raise ValueError("Invalid footage")
    return target

def probe(path):
    data=json.loads(subprocess.check_output(["ffprobe","-v","error","-show_streams","-show_format","-of","json",str(path)],timeout=30))
    streams=[x for x in data.get("streams",[]) if x.get("codec_type")=="video"]
    if not streams: raise ValueError("Not a real video file")
    return float(data.get("format",{}).get("duration") or 0)

def assign(beats,library,min_sources=3):
    """Never create a five-minute video by looping the same ten-second source."""
    usable=[s for s in library if float(s.get("duration",0))>=3.5]
    distinct={s["id"] for s in usable}
    if len(distinct)<min_sources:
        raise ValueError(f"Only {len(distinct)} usable video sources, need at least {min_sources} diverse licensed sources")
    demand=sum(float(x["duration"]) for x in beats)
    supply=sum(max(0,float(x.get("duration",0))-.5) for x in usable)
    if supply < demand*.94:
        raise ValueError(f"Insufficient genuinely varied footage: {supply:.0f}s of usable media for {demand:.0f}s of narration. Never loop clips to fill time.")
    consumed={x["id"]:0.2 for x in usable}
    timeline=[]
    last=None
    for i,beat in enumerate(beats):
        length=min(float(beat["duration"]),9.8)
        candidates=[s for s in usable
            if float(s["duration"])-consumed[s["id"]]-0.15>=length]
        if not candidates:
            raise ValueError(f"Source footage exhausted near scene {i+1}. More legitimate boxing video is needed.")
        candidates.sort(key=lambda x:(
            x.get("kind")!=beat["role"],x["id"]==last,
            consumed[x["id"]]/max(1,x["duration"]),x["id"]))
        source=candidates[0]
        start=consumed[source["id"]]
        consumed[source["id"]]+=length+.08
        last=source["id"]
        timeline.append({**beat,"assetId":source["id"],"in":round(start,2),"out":round(start+length,2),
                         "shotSeconds":round(length,2), "title":source["displayName"],
                         "illustrative":bool(source.get("illustrative")),
                         "sourceCredit":source.get("attribution",""),"sourceUrl":source.get("originUrl",""),
                         "reuseVerified":False,"actualFighterFootage":bool(source.get("namedFighterVerified",False))})
    return timeline

def render(timeline,library,media_dir,out_file,portrait=False):
    # Pre-voiceover draft only. Cut durations are script-aligned, no voice track baked in.
    media={s["id"]:s for s in library}
    w,h=(720,1280) if portrait else (1280,720)
    with tempfile.TemporaryDirectory(prefix="aura-auto-film-") as tmp:
        tmp=Path(tmp)
        # Keep every short, processed scene so the editor can adjust the
        # automatic sequence instead of receiving just a flattened movie.
        clip_output=out_file.parent/"editable-clips"
        clip_output.mkdir(parents=True,exist_ok=True)
        clips=[]
        for i,cut in enumerate(timeline):
            source=safe_local_file(media_dir,media[cut["assetId"]]["localFile"])
            label=("ILLUSTRATIVE BOXING FOOTAGE" if cut["illustrative"] else "AURA FIGHT CLUB")
            v=tmp/f"clip-{i:03d}.mp4"
            vf=(f"scale={w}:{h}:force_original_aspect_ratio=decrease,"
                f"pad={w}:{h}:(ow-iw)/2:(oh-ih)/2:black,setsar=1,format=yuv420p,fps=24")
            # Drawtext uses a trusted static label, not user input or an untrusted URL.
            vf+=f",drawtext=text='{label}':x=20:y=h-45:fontcolor=white:fontsize=22:box=1:boxcolor=black@0.75"
            subprocess.run(["ffmpeg","-nostdin","-hide_banner","-loglevel","error","-y",
                "-ss",str(cut["in"]),"-i",str(source),"-t",str(cut["shotSeconds"]),
                "-vf",vf,"-an","-c:v","libx264","-preset","veryfast","-crf","29","-pix_fmt","yuv420p",str(v)],
                check=True,timeout=110)
            editable=clip_output/f"scene-{i+1:03d}.mp4"
            import shutil
            shutil.copyfile(v,editable)
            clips.append(v)
        concat=tmp/"list.txt"
        concat.write_text("".join(f"file '{v}'\n" for v in clips))
        out_file.parent.mkdir(parents=True,exist_ok=True)
        subprocess.run(["ffmpeg","-nostdin","-hide_banner","-loglevel","error","-y",
            "-f","concat","-safe","0","-i",str(concat),"-c","copy","-movflags","+faststart",str(out_file)],
            check=True,timeout=170)
    return out_file

def write_report(out,project,beats,sources,log,state,shots=None):
    out.mkdir(parents=True,exist_ok=True)
    report={
      "status":state,"project":project.get("slug"),"title":project.get("title"),
      "subject":project.get("fightId") or project.get("title"),
      "mode":project.get('requestedMode','analysis'),"scriptWords":len(words(project.get("scripts",{}).get("youtube",{}).get("draft",""))),
      "narrationSecondsEstimate":round(sum(b["duration"] for b in beats),2),
      "sourceCount":len(sources),
      "sourceRegister":[{k:s.get(k) for k in ["id","kind","provider","license","originUrl","attribution","illustrative","namedFighterVerified","rightsStatus"]} for s in sources],
      "notes":log,"shots":shots or [],
      "integrity":"Automatically selected footage is unverified technical evidence. Review shots and licensing before publishing."
    }
    (out/"production.json").write_text(json.dumps(report,indent=2)+"\n")
    return report

def produce(args):
    project=json.loads(Path(args.project).read_text())
    project['requestedMode']=getattr(args,'mode','analysis')
    script=project.get("scripts",{}).get("youtube",{}).get("draft","")
    out=Path(args.out).resolve()
    try:
        beats=narrative_beats(script,desired_seconds=getattr(args,'target_minutes',None)*60 if getattr(args,'target_minutes',None) else None)
    except ValueError as error:
        return write_report(out,project,[],[],[str(error)],"needs_script")
    media_dir=Path(args.media_dir).resolve();media_dir.mkdir(parents=True,exist_ok=True)
    raw=json.loads(Path(args.media_register).read_text()) if args.media_register else []
    catalog=raw.get("sources",[]) if isinstance(raw,dict) else raw
    if not isinstance(catalog,list):raise ValueError("Media register must contain a sources array.")
    fight_id=getattr(args,"fight_id",None) or project.get("fightId") or project.get("slug","")
    # Normalise and scope entries from the dedicated per-fight approval registry.
    approved=approved_youtube_registry(args.media_register,fight_id) if args.media_register else []
    catalog=[s for s in catalog if s.get("provider")!="YouTube approved"]+approved
    sources,notes=research(script,catalog,key=os.environ.get("PEXELS_API_KEY"))
    leads,lead_notes=discover_youtube(project.get("title") or fight_id,os.environ.get("YOUTUBE_DATA_API_KEY",""))
    notes.extend(lead_notes)
    out.mkdir(parents=True,exist_ok=True)
    (out/"youtube-research.json").write_text(json.dumps({
        "fightId":fight_id,"downloadIsNotAuthorizedBySearch":True,
        "found":len(leads),"candidates":leads},indent=2)+"\n")
    if leads:notes.append(f"Found {len(leads)} YouTube research leads; only sources with separate documented platform and copyright permission can be downloaded.")
    if args.dry_run:
        return write_report(out,project,beats,sources,notes,"research_ready" if sources else "needs_licensed_footage")
    if len(words(script))<400 or len(words(script))/WPM*60>MAX_DURATION:
        return write_report(out,project,beats,sources,notes+["Narration must be about 5–10 minutes (400–1400 words at 140 wpm). Revise editorial script."],"needs_script")
    if not sources:
        return write_report(out,project,beats,sources,notes+["No downloadable, licensed clips. Refusing to fabricate a fight video."],"needs_licensed_footage")
    usable=[];bytes_used=0
    for s in sources[:MAX_DOWNLOAD]:
        if not allowed_source(s):continue
        try:
            f=download_video(s,media_dir)
            bytes_used+=f.stat().st_size
            if bytes_used>MAX_TOTAL:notes.append("Total download budget reached");break
            usable.append({**s,"duration":probe(f),"localFile":f.name})
        except Exception as e:notes.append(f"Source {s.get('id')} could not load: {type(e).__name__}: {str(e)[:80]}")
    try:shots=assign(beats,usable)
    except ValueError as error:
        return write_report(out,project,beats,usable,notes+[str(error)],"needs_licensed_footage")
    # Not misleading: for generic footage no claims of actual Wardley/Dubois fight.
    if not args.no_render:
        try:render(shots,usable,media_dir,out/"roughcut-youtube.mp4")
        except Exception as error:
            return write_report(out,project,beats,usable,notes+[f"Rendering error: {type(error).__name__}: {str(error)[:200]}"],"render_failed",shots)
    (out/"narration.txt").write_text(script)
    (out/"editable-timeline.json").write_text(json.dumps({
        "format":"AURA-FILMROOM-EDIT-V1","project":project.get("slug"),
        "estimatedDurationSeconds":round(sum(float(s["shotSeconds"]) for s in shots),2),
        "sceneCount":len(shots),
        "scenes":[{**s,"localClip":"editable-clips/scene-"+str(i+1).zfill(3)+".mp4"}
                  for i,s in enumerate(shots)]},indent=2)+"\n")
    def srt_timestamp(value):
        millis=max(0,round(value*1000))
        hrs,ms=divmod(millis,3600000)
        mins,ms=divmod(ms,60000)
        sec,ms=divmod(ms,1000)
        return f"{hrs:02}:{mins:02}:{sec:02},{ms:03}"
    captions=[];timecode=0
    for i,shot in enumerate(shots):
        next_time=timecode+float(shot["shotSeconds"])
        captions.append(str(i+1)+"\n"+srt_timestamp(timecode)+" --> "+srt_timestamp(next_time)+"\n"+shot["narration"]+"\n")
        timecode=next_time
    (out/"narration-cues.srt").write_text("\n".join(captions)+"\n")
    with (out/"credits.txt").open("w") as handle:
        for s in usable:handle.write(f"{s['id']} | {s['provider']} | {s.get('attribution','')} | {s.get('originUrl','')}\n")
    return write_report(out,project,beats,usable,notes,"rough_cut_generated" if not args.no_render else "rough_cut_planned",shots)

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--project",required=True)
    p.add_argument("--out",default="aura-roughcut")
    p.add_argument("--media-dir",default="/tmp/aura-auto-media")
    p.add_argument("--media-register",help="JSON media registry of cleared owner footage and YouTube approved videos")
    p.add_argument("--fight-id",help="Official fight ID for licensed YouTube source matching")
    p.add_argument("--dry-run",action="store_true")
    p.add_argument("--no-render",action="store_true")
    p.add_argument("--target-minutes",type=int,choices=[5,7,10])
    p.add_argument("--mode",choices=["analysis","prediction","critique","profile"],default="analysis")
    args=p.parse_args()
    outcome=produce(args)
    print(json.dumps({k:outcome[k] for k in ("status","title","sourceCount","narrationSecondsEstimate","notes")},indent=2))
    if outcome["status"] in ("render_failed",):sys.exit(2)
if __name__=="__main__":main()
