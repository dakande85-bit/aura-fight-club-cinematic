#!/usr/bin/env python3
"""Populate the Film Room preview with actual, embed-eligible boxer videos.

YouTube's official Data API returns metadata. This does not download media or grant
permission for derivative MP4 exports. Only well-identified official boxing outlets
and videos containing both named fighters are included.
"""
import argparse
import json
import os
from pathlib import Path
import re
from urllib.parse import urlencode
from urllib.request import Request,urlopen
from urllib.error import HTTPError

CHANNELS={
 "DAZN Boxing","Queensberry Promotions","Seconds Out","talkSPORT",
 "Boxing Social","iFL TV","FightHype.com","Sky Sports Boxing",
 "Matchroom Boxing","The Ring Magazine","Premier Boxing Champions",
}
KINDS={
 "fight":"Daniel Dubois Fabio Wardley 2 fight highlights DAZN Boxing",
 "weighin":"Daniel Dubois Fabio Wardley 2 October 2026 weigh in face off",
 "press":"Daniel Dubois Fabio Wardley 2 press conference October 2026",
 "reaction":"Daniel Dubois Fabio Wardley 2 fight post fight interview reaction"
}
API="https://www.googleapis.com/youtube/v3/"
def request(endpoint,params,key):
 url=API+endpoint+"?"+urlencode({**params,"key":key})
 req=Request(url,headers={"User-Agent":"AURA Fight Club Video Editorial Research 1.0"})
 with urlopen(req,timeout=30) as response:return json.load(response)
def names_match(title,description):
 text=(str(title)+" "+str(description))[:2500].lower()
 return "dubois" in text and "wardley" in text
def discover(key):
 clips={};notes=[];seen=set()
 for kind,query in KINDS.items():
  try:
   result=request("search",{"part":"snippet","type":"video","maxResults":20,
      "order":"date","publishedAfter":"2026-04-01T00:00:00Z","q":query},key)
  except (HTTPError,OSError,ValueError) as e:
   notes.append(kind+" search failed: "+type(e).__name__);continue
  for item in result.get("items",[]):
   snippet=item.get("snippet") or {}
   title=snippet.get("title") or ""
   channel=snippet.get("channelTitle") or ""
   ident=(item.get("id") or {}).get("videoId") or ""
   if not re.fullmatch(r"[a-zA-Z0-9_-]{11}",ident) or ident in seen:continue
   if channel not in CHANNELS or not names_match(title,snippet.get("description","")):continue
   seen.add(ident)
   clips[ident]={"id":"youtube-"+ident,"videoId":ident,"title":title[:200],
     "publisher":channel,"kind":"faceoff" if kind=="weighin" else "press" if kind=="reaction" else kind,
     "url":"https://www.youtube.com/watch?v="+ident,
     "published":snippet.get("publishedAt"),"rightsStatus":"research_only",
     "clearedForExport":False,"startSeconds":0,"endSeconds":20,
     "editorialNote":"Verified named fighters and official outlet; content, cut points and rights still need review"}
 if not clips:return [],notes
 approved=[]
 ids=list(clips)
 for offset in range(0,len(ids),50):
  try:
   response=request("videos",{"part":"status,contentDetails","id":",".join(ids[offset:offset+50])},key)
  except (HTTPError,OSError,ValueError) as e:
   notes.append("Embeddability verification failed: "+type(e).__name__);return [],notes
  for video in response.get("items",[]):
   status=video.get("status") or {}
   if status.get("privacyStatus")!="public" or status.get("embeddable") is not True:continue
   entry=clips.get(video.get("id"));duration=(video.get("contentDetails") or {}).get("duration")
   if entry:
    entry["embedVerifiedByYouTubeAPI"]=True
    entry["durationISO8601"]=duration
    approved.append(entry)
 approved.sort(key=lambda x:(str(x.get("published") or ""),x["videoId"]),reverse=True)
 return approved[:25],notes

if __name__=="__main__":
 p=argparse.ArgumentParser()
 p.add_argument("--fight-id",default="dubois-wardley-2-postfight")
 p.add_argument("--out",required=True)
 a=p.parse_args()
 key=os.environ.get("YOUTUBE_DATA_API_KEY","").strip()
 if not key:raise SystemExit("YOUTUBE_DATA_API_KEY is missing. Do not generate fictional video entries.")
 videos,notes=discover(key)
 if not videos:raise SystemExit("No qualifying embed-enabled videos. Notes: "+"; ".join(notes))
 out=Path(a.out)
 out.parent.mkdir(parents=True,exist_ok=True)
 out.write_text(json.dumps({
  "fightId":a.fight_id,"generatedBy":"YouTube Data API v3","videoBytesDownloaded":False,
  "videos":videos,"notes":notes
 },indent=2)+"\n")
 print("AURA: discovered",len(videos),"genuine, embed-enabled Dubois/Wardley videos")
 print("Categories:",{k:sum(v['kind']==k for v in videos) for k in ("fight","press","faceoff")})
