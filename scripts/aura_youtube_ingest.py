#!/usr/bin/env python3
"""Rights-gated YouTube video research and editable media intake for AURA Film Room.

YouTube Data API = discovery/metadata only; its API does NOT authorise downloads.
Optional yt-dlp extracts a PUBLIC video's media only when documentary evidence of
the copyright and *platform* permissions/legal basis is supplied beforehand.
No DRM bypass, cookies, login sessions, token-generator plugins or PO-token workarounds.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import urlparse, parse_qs, urlencode
from urllib.request import Request, urlopen

VIDEO_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")
KNOWN_HOSTS = {"www.youtube.com", "youtube.com", "m.youtube.com", "youtu.be", "www.youtu.be"}
KINDS = ("fight", "weighin", "press", "training")
SEARCH = {
 "fight": "{subject} official fight highlights boxing",
 "weighin": "{subject} weigh in face off boxing",
 "press": "{subject} press conference interview",
 "training": "{subject} boxing training camp"
}
SUPPORTED_BASIS = {"youtube_written_approval", "applicable_law"}
MAX_VIDEO_SECONDS = 3600
MAX_VIDEO_SIZE = 400 * 1024 * 1024

class IngestRefused(ValueError):
    pass

def video_id(value):
    try:
        u = urlparse(str(value or "").strip())
        if u.scheme != "https" or u.hostname not in KNOWN_HOSTS or u.username or u.password:
            return None
        if u.hostname in ("youtu.be", "www.youtu.be"):
            candidate = u.path.strip("/").split("/")[0]
        elif u.path == "/watch":
            candidate = parse_qs(u.query).get("v", [""])[0]
        elif u.path.startswith(("/shorts/", "/live/", "/embed/")):
            candidate = u.path.strip("/").split("/")[1]
        else:
            return None
        return candidate if VIDEO_ID.fullmatch(candidate) else None
    except (ValueError, IndexError, TypeError):
        return None

def canonical_url(value):
    ident=video_id(value)
    if not ident:
        raise IngestRefused("Only standard public HTTPS YouTube video links are supported.")
    return "https://www.youtube.com/watch?v="+ident

def source_authorised(source):
    """Fail closed: copyright basis AND a separate YouTube/platform exception."""
    if not isinstance(source,dict) or source.get("provider") != "YouTube approved":
        return False
    try: canonical_url(source.get("url"))
    except IngestRefused:return False
    basis=source.get("platformBasis")
    note=str(source.get("platformEvidence") or "").strip()
    licence=str(source.get("rightsEvidence") or "").strip()
    return (basis in SUPPORTED_BASIS and len(note)>=12 and
            len(licence)>=12 and source.get("rightsStatus")=="cleared" and
            source.get("kind") in KINDS and source.get("namedFighterVerified") is True)

def sources_from_register(path, fight_id):
    if not path or not Path(path).is_file():return []
    data=json.loads(Path(path).read_text())
    sources=data.get("sources",[]) if isinstance(data,dict) else data
    if not isinstance(sources,list):raise IngestRefused("Source register must be a JSON array.")
    scoped=[]
    for item in sources:
        if not isinstance(item,dict):continue
        if item.get("fightId")!=fight_id:continue
        if not source_authorised(item):continue
        ident=video_id(item["url"])
        scoped.append({
            "id":"youtube-approved-"+ident,
            "provider":"YouTube approved", "kind":item["kind"],
            "url":canonical_url(item["url"]),
            "originUrl":canonical_url(item["url"]), "displayName":str(item.get("title") or "Approved video"),
            "title":str(item.get("title") or "Approved video"),
            "license":str(item.get("rightsEvidence")),
            "licenseProof":str(item.get("rightsEvidence")),
            "platformBasis":item["platformBasis"],
            "platformEvidence":item["platformEvidence"],
            "rightsEvidence":item["rightsEvidence"],
            "rightsStatus":"cleared","attribution":str(item.get("publisher") or "YouTube video owner"),
            "illustrative":False,"namedFighterVerified":True
        })
    return scoped

def _api(endpoint,params,key):
    if not key:return {}
    args=urlencode({**params,"key":key})
    request=Request("https://www.googleapis.com/youtube/v3/"+endpoint+"?"+args,
       headers={"User-Agent":"AuraFightClub/1.0 (editorial research)"})
    with urlopen(request,timeout=25) as response:
        return json.load(response)

def discover(subject, key, max_per_role=5):
    """Research leads only. API metadata is never treated as permission to download."""
    if not key:return [],["YOUTUBE_DATA_API_KEY is not configured; curated source links remain visible."]
    found=[];seen=set();notes=[]
    for role,query in SEARCH.items():
        try:
            data=_api("search",{"part":"snippet","type":"video",
                "maxResults":str(max_per_role),"q":query.format(subject=subject)},key)
            for item in data.get("items",[]):
                ident=item.get("id",{}).get("videoId","")
                if not VIDEO_ID.fullmatch(ident) or ident in seen:continue
                seen.add(ident)
                snippet=item.get("snippet",{})
                found.append({"id":ident,"url":"https://www.youtube.com/watch?v="+ident,
                 "title":snippet.get("title",""),"publisher":snippet.get("channelTitle",""),
                 "kind":role,"published":snippet.get("publishedAt"),
                 "rightsStatus":"research_only","mediaDownloaded":False})
        except Exception as error:
            notes.append("YouTube "+role+" search unavailable: "+type(error).__name__)
    return found,notes

def ingest(source,directory,timeout=300):
    if not source_authorised(source):
        raise IngestRefused("YouTube download declined: rights and platform-use permissions must be documented.")
    url=canonical_url(source["url"])
    destination=Path(directory).resolve();destination.mkdir(parents=True,exist_ok=True)
    ident=video_id(url)
    output=destination/("youtube-approved-"+ident+".mp4")
    if output.exists() and 50000<output.stat().st_size<MAX_VIDEO_SIZE:
        return output
    # No cookies, login, authentication bypass, DRM unblocking, or per-video token tricks.
    cmd=[sys.executable,"-m","yt_dlp","--ignore-config","--no-playlist",
        "--no-cache-dir","--no-warnings","--no-progress",
        "--socket-timeout","20","--retries","2","--fragment-retries","2",
        "--max-filesize","400M","--match-filter","duration <= 3600",
        "--format","bv*[height<=720]+ba/b[height<=720]",
        "--merge-output-format","mp4","--remux-video","mp4",
        "--output",str(output),url]
    try:
        result=subprocess.run(cmd,capture_output=True,text=True,timeout=timeout,check=False)
    except (FileNotFoundError,subprocess.TimeoutExpired) as exc:
        raise IngestRefused("YouTube media retrieval could not complete: "+type(exc).__name__) from exc
    if result.returncode!=0:
        # Never relay huge error logs, URL signatures or account details into JSON.
        raise IngestRefused("YouTube refused this non-DRM retrieval or yt-dlp could not retrieve a public file. No bypass attempted.")
    if not output.exists():
        raise IngestRefused("No usable MP4 returned by the downloader.")
    if not 50000 < output.stat().st_size < MAX_VIDEO_SIZE:
        output.unlink(missing_ok=True)
        raise IngestRefused("Downloaded video is empty or exceeds the 400 MB limit.")
    return output

def main():
    parser=argparse.ArgumentParser()
    sub=parser.add_subparsers(dest="command",required=True)
    discovery=sub.add_parser("discover")
    discovery.add_argument("--subject",required=True)
    discovery.add_argument("--out",required=True)
    fetch=sub.add_parser("ingest")
    fetch.add_argument("--register",required=True)
    fetch.add_argument("--fight-id",required=True)
    fetch.add_argument("--out",required=True)
    args=parser.parse_args()
    if args.command=="discover":
        import os
        entries,notes=discover(args.subject,os.getenv("YOUTUBE_DATA_API_KEY",""))
        Path(args.out).parent.mkdir(parents=True,exist_ok=True)
        Path(args.out).write_text(json.dumps({"subject":args.subject,"researchOnly":True,
           "candidates":entries,"notes":notes},indent=2)+"\n")
        print(json.dumps({"candidates":len(entries),"notes":notes}))
    else:
        sources=sources_from_register(args.register,args.fight_id)
        result=[]
        for source in sources:
            try:
                path=ingest(source,args.out)
                result.append({"id":source["id"],"file":str(path),"status":"downloaded"})
            except IngestRefused as exc:
                result.append({"id":source["id"],"status":"unavailable","reason":str(exc)})
        print(json.dumps({"fightId":args.fight_id,"results":result},indent=2))
if __name__=="__main__":main()
