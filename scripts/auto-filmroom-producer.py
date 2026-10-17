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

MAX_FILE=90_000_000
MAX_TOTAL=450_000_000
MAX_DOWNLOAD=14
WPM=140
ROLE_RE={
    "weighin": re.compile(r"weigh.?in|scales|weight|face.?off|face to face|staredown", re.I),
    "press":re.compile(r"press|interview|said|claims|promoter|announce|spoke|trainer",re.I),
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
    # The user can add direct licensed first-party assets through the source register.
    if item.get("provider")=="Pexels":
        return item.get("license")=="Pexels License" and safety_url(item.get("fileUrl",""))
    return (item.get("rightsStatus")=="cleared" and item.get("licenseProof") and
        bool(item.get("localFile")) and item.get("provider") in ("owner","licensed_archive","promoter_delivery"))

def research(script,existing,key=None):
    needed=list(dict.fromkeys(b["role"] for b in narrative_beats(script)))
    sources=[{**x} for x in existing if allowed_source(x)]
    notes=[]
    if not key:
        notes.append("PEXELS_API_KEY missing: no automatic legal b-roll can be downloaded.")
        return sources,notes
    used={s["id"] for s in sources}
    for role in needed:
        found=0
        for query in QUERY.get(role,QUERY["training"]):
            try:
                options=pexels(query,key)
            except Exception as error:
                notes.append(f"Pexels {role} search failed: {type(error).__name__}");continue
            for entry in options:
                entry["kind"]=role
                if entry["id"] in used:continue
                used.add(entry["id"]);sources.append(entry);found+=1
                if found>=5:break
            if found>=5:break
        if found==0:notes.append("No licensed downloadable video for "+role)
    return sources,notes

def safe_local_file(media_dir,name):
    path=Path(name)
    if not name or path.name!=name or not re.fullmatch(r"[\w .()-]+",name):
        raise ValueError("Unsafe local footage path")
    full=(media_dir/name).resolve()
    if not full.is_relative_to(media_dir.resolve()):raise ValueError("Unsafe media path")
    return full

def download_video(entry,out_dir):
    if entry.get("localFile"):
        local=safe_local_file(out_dir,entry["localFile"])
        if not local.is_file():raise FileNotFoundError("Missing licensed file "+entry["localFile"])
        return local
    if entry.get("provider")!="Pexels" or not safety_url(entry.get("fileUrl","")):
        raise ValueError("Only verified provider downloads are permitted")
    filename=entry["id"]+".mp4"
    target=out_dir/filename
    if target.exists() and target.stat().st_size>1000:return target
    request=Request(entry["fileUrl"],headers={"User-Agent":"AuraFightClub/1.0"})
    with urlopen(request,timeout=70) as response:
        if not safety_url(response.geturl()):raise ValueError("Unexpected redirected download")
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
    usable=[s for s in library if float(s.get("duration",0))>=3.5]
    distinct={s["id"] for s in usable}
    if len(distinct)<min_sources:raise ValueError(f"Only {len(distinct)} usable video sources, need at least {min_sources} diverse licensed sources")
    allocated={x["id"]:0 for x in usable}
    timeline=[]
    last=None
    for i,beat in enumerate(beats):
        candidates=[x for x in usable if x.get("kind")==beat["role"]]
        if not candidates:candidates=usable
        candidates=sorted(candidates,key=lambda x:(x["id"]==last, allocated[x["id"]],x["id"]))
        source=candidates[0]
        length=min(float(beat["duration"]),9.8,float(source["duration"])-.2)
        # Avoid fake fighter action: stock footage is always explicitly "ILLUSTRATIVE"
        maximum=max(0,float(source["duration"])-length)
        start=(allocated[source["id"]]*11.9 + i*3.7)%max(1,maximum)
        allocated[source["id"]]+=1
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
      "mode":"analysis","scriptWords":len(words(project.get("scripts",{}).get("youtube",{}).get("draft",""))),
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
    script=project.get("scripts",{}).get("youtube",{}).get("draft","")
    beats=narrative_beats(script)
    out=Path(args.out).resolve()
    media_dir=Path(args.media_dir).resolve();media_dir.mkdir(parents=True,exist_ok=True)
    catalog=json.loads(Path(args.media_register).read_text()) if args.media_register else []
    sources,notes=research(script,catalog,key=os.environ.get("PEXELS_API_KEY"))
    if args.dry_run:
        return write_report(out,project,beats,sources,notes,"research_ready" if sources else "needs_licensed_footage")
    if len(words(script))<400:
        return write_report(out,project,beats,sources,notes+["Narration is too short for a 5–10 minute report; expand editorial script."],"needs_script")
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
    with (out/"credits.txt").open("w") as handle:
        for s in usable:handle.write(f"{s['id']} | {s['provider']} | {s.get('attribution','')} | {s.get('originUrl','')}\n")
    return write_report(out,project,beats,usable,notes,"rough_cut_generated" if not args.no_render else "rough_cut_planned",shots)

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--project",required=True)
    p.add_argument("--out",default="aura-roughcut")
    p.add_argument("--media-dir",default="/tmp/aura-auto-media")
    p.add_argument("--media-register",help="JSON array of individually cleared first-party or licensed local videos")
    p.add_argument("--dry-run",action="store_true")
    p.add_argument("--no-render",action="store_true")
    args=p.parse_args()
    outcome=produce(args)
    print(json.dumps({k:outcome[k] for k in ("status","title","sourceCount","narrationSecondsEstimate","notes")},indent=2))
    if outcome["status"] in ("render_failed",):sys.exit(2)
if __name__=="__main__":main()
