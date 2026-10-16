#!/usr/bin/env python3
"""AURA major-fight video production queue (metadata and editorial drafts ONLY).

Creates review-required project briefs for notable bouts in public/news/fights.json.
Never downloads a broadcaster's videos, asserts a fight happened without verified results,
invents clip timestamps, guesses tactical observations or automatically posts.
"""
from __future__ import annotations
import argparse
import datetime as dt
import json
import os
from pathlib import Path
import re
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
FIGHTS = ROOT / "public/news/fights.json"
ARTICLES = ROOT / "public/news/articles.json"
OUT = ROOT / "public/news/video-production"
INDEX = OUT / "index.json"
SEARCH_KINDS = [
    ("recent-interview", "interview press conference", "press"),
    ("face-off", "face off weigh in", "faceoff"),
    ("fight-highlights", "highlights full fight", "fight"),
]


def safe_slug(value):
    return re.sub(r"[^a-z0-9]+", "-", str(value).lower()).strip("-")[:100]


def interesting(fight):
    stakes = fight.get("stakes") or ""
    return (
        fight.get("featured") is True
        or bool(re.search(r"world (?:title|championship)|world-title|unification|undisputed", stakes, re.I))
    )


def search_url(query):
    return "https://www.youtube.com/results?search_query=" + urllib.parse.quote_plus(query)


def pick_article(fight, articles):
    matches = [a for a in articles if a.get("fightId") == fight["id"]]
    matches.sort(key=lambda a: (str(a.get("date") or ""), int(a.get("priority") or 0)), reverse=True)
    return matches[0] if matches else None


def analysis_template(fight, article):
    # NO observed technical footage claims are fabricated by this template.
    fighters = fight.get("fighters") or []
    a = fighters[0] if fighters else "Boxer A"
    b = fighters[1] if len(fighters)>1 else "Boxer B"
    return {
        "status": "research_required",
        "editorialThesis": "",  # must be justified against real observable film
        "centralQuestion": f"Which technical adjustment decides {a} versus {b}?",
        "axes": [
            {"name": "Range and jab control", "question": f"Who dictates the opening distance, {a} or {b}?", "status": "not_observed", "sourceIds": [], "clipIds": [], "claim": ""},
            {"name": "Entries, counters and exits", "question": "What happens immediately after each boxer attacks?", "status": "not_observed", "sourceIds": [], "clipIds": [], "claim": ""},
            {"name": "Guard, angles and body work", "question": "Which defensive habits create repeatable openings?", "status": "not_observed", "sourceIds": [], "clipIds": [], "claim": ""},
            {"name": "Pace and tactical adjustments", "question": "How do patterns change under pressure or in later rounds?", "status": "not_observed", "sourceIds": [], "clipIds": [], "claim": ""},
        ],
        "prediction": {"pick": "", "method": "", "condition": "", "confidence": "unrated", "alternatives": ""},
        "claims": [
            {"text": f"{fight.get('name','Bout')} is listed on the AURA fight calendar for {fight.get('date','date pending')}.",
             "sourceUrl": fight.get("sourceUrl") or "", "claimType": "calendar_listing",
             "verification": "requires_source_review"}
        ],
        "linkedArticle": article.get("slug") if article else "",
        "reviewChecks": ["Names, event date, title stakes and broadcast verified",
                         "All observable technical claims tied to a timecoded real clip",
                         "At least one counterargument or alternative explanation",
                         "Quotes attributed, no invented round-by-round observations",
                         "Prediction distinguished from fact", "Source reuse reviewed per clip"],
    }


def youtube_api_candidates(fight, key, count=3):
    """Optional official metadata lookup, not footage access. Limit cost/calls."""
    if not key:
        return []
    title = " ".join((fight.get("fighters") or [])[:2])
    endpoint = "https://www.googleapis.com/youtube/v3/search?" + urllib.parse.urlencode({
        "part": "snippet", "type": "video", "maxResults": str(count),
        "q": f"{title} boxing press conference highlights",
        "order": "date", "safeSearch": "moderate", "key": key
    })
    request = urllib.request.Request(endpoint, headers={"User-Agent": "AURA-Research-Metadata/1.0"})
    with urllib.request.urlopen(request, timeout=15) as resp:
        data = json.loads(resp.read())
    items = []
    for record in data.get("items", []):
        vid = record.get("id", {}).get("videoId")
        s = record.get("snippet", {})
        if not vid or not re.fullmatch(r"[A-Za-z0-9_-]{11}", vid):
            continue
        items.append({
            "id": f"youtube-metadata-{vid}",
            "kind": "unclassified",
            "publisher": s.get("channelTitle", ""),
            "title": s.get("title", ""),
            "url": f"https://www.youtube.com/watch?v={vid}",
            "published": s.get("publishedAt", ""),
            "candidateStatus": "metadata_only_unreviewed",
            "verified": False,
            "localFile": "",
            "clearedForExport": False,
            "rightsNotes": "API returned metadata, not download permission or verified fight action."
        })
    return items


def build(fight, article, key=""):
    title=fight["name"]
    slug=safe_slug(fight["id"])
    source_url=fight.get("sourceUrl") or ""
    sources=[]
    if source_url.startswith("https://"):
        sources.append({
            "id":"fight-announcement", "kind":"official_event", "publisher":fight.get("source") or "Event organiser",
            "title":f"Fight announcement: {title}", "url":source_url,
            "candidateStatus":"source_needs_review", "verified":False,
            "localFile":"", "clearedForExport":False,
            "rightsNotes":"Page citation only; not a reusable video file."
        })
    official_video=fight.get("officialVideo") or {}
    if official_video.get("sourceUrl"):
        sources.append({
            "id":"calendar-official-video", "kind":"faceoff",
            "publisher":official_video.get("publisher") or "Source publisher",
            "title":official_video.get("title") or f"{title} official video",
            "url":official_video["sourceUrl"], "candidateStatus":"needs_editorial_review",
            "verified":False, "localFile":"", "clearedForExport":False,
            "rightsNotes":"Official watch page. Check clip relevance and lawful reuse."
        })
    for name,query,kind in SEARCH_KINDS:
        sources.append({
            "id":name, "kind":kind, "publisher":"YouTube search (research lead)",
            "title": f"Find {title} {query}", "url":search_url(f"{title} {query} boxing"),
            "candidateStatus":"search_lead_only", "verified":False,
            "localFile":"", "clearedForExport":False,
            "rightsNotes":"Search page, NOT verified media. Replace with the genuine primary source."
        })
    if key:
        sources.extend(youtube_api_candidates(fight,key))
    fighters = (fight.get("fighters") or []) + ["Fighter A", "Fighter B"]
    name_a, name_b = fighters[:2]
    return {
        "version":1,"fightId":fight["id"], "slug":slug, "title":title+" — AURA Film Room",
        "eventDate":fight.get("date"), "fightStatus":fight.get("status","unconfirmed"),
        "eventSourceUrl":source_url,
        "storyUrl":f"https://www.aurafightclub.com/news/{article['slug']}" if article else "",
        "status":"research_required","editorialAngle":"",
        "analysis":analysis_template(fight,article),
        "narrationScript":"",
        "scripts": {"youtube":{"draft":"", "approved":False, "targetMinutes":[4,8]},
                    "shorts":{"draft":"", "approved":False,"targetSeconds":[35,60]}},
        "deliverables":{"youtube":{"aspect":"16:9","reviewStatus":"waiting_for_research"},
                        "shorts":{"aspect":"9:16","reviewStatus":"waiting_for_research"}},
        "sources":sources,
        "suggestedBeats":[
            {"purpose":"Hook","description":f"Find decisive action that actually illustrates {name_a} vs {name_b}","preferredSource":"fight-highlights"},
            {"purpose":"Evidence","description":"Mark a real exchange. Form a testable, timecoded tactical claim; no guessed observations","preferredSource":"fight-highlights"},
            {"purpose":"Alternative","description":"Show the other boxer's credible answer with genuine footage","preferredSource":"fight-highlights"},
            {"purpose":"Reaction","description":"Use relevant genuine interview or press material only with proper attribution","preferredSource":"recent-interview"},
            {"purpose":"Verdict","description":"Explain the prediction conditions, uncertainty and what would change the assessment","preferredSource":"face-off"}
        ],
        "shots":[], "voiceoverFile":"", "voiceoverFiles":{"youtube":"","shorts":""},
        "notes":"Autogenerated metadata brief. Never implies actual source videos have been downloaded or footage studied."
    }


def sync(today,days,lookback,with_api=False):
    fights=json.loads(FIGHTS.read_text())["fights"]
    articles=json.loads(ARTICLES.read_text()).get("articles",[])
    OUT.mkdir(parents=True,exist_ok=True)
    selected=[]
    for fight in fights:
        if not interesting(fight) or not fight.get("date"):
            continue
        try:
            date=dt.date.fromisoformat(fight["date"])
        except ValueError:
            continue
        if not (today-dt.timedelta(days=lookback) <= date <= today+dt.timedelta(days=days)):
            continue
        # No result claims for a fight reported as scheduled.
        if fight.get("status","").lower() in {"cancelled","canceled","postponed"}:
            continue
        selected.append(fight)
    selected.sort(key=lambda f:(f.get("date",""),not f.get("featured",False),f["name"]))
    index=[]
    key=os.environ.get("YOUTUBE_DATA_API_KEY","") if with_api else ""
    for fight in selected:
        slug=safe_slug(fight["id"])
        filename="dubois-wardley-ii.json" if fight["id"]=="dubois-wardley-2" else f"{slug}.json"
        path=OUT/filename
        if path.exists():
            project=json.loads(path.read_text())
        else:
            project=build(fight,pick_article(fight,articles),key)
            path.write_text(json.dumps(project,indent=2,ensure_ascii=False)+"\n")
        index.append({"fightId":fight["id"],"name":fight["name"],"date":fight["date"],
                      "fightStatus":fight.get("status",""),"featured":bool(fight.get("featured")),
                      "stakes":fight.get("stakes",""),"path":f"/news/video-production/{path.name}",
                      "editorialStatus":project.get("status") or "research_required",
                      "sourceCount":len(project.get("sources",[])),
                      "clipCount":len(project.get("shots",[])),
                      "reviewReady":False})
    if not index:
        raise SystemExit("No major bouts met the date range; use --days 90 or check the fight calendar.")
    INDEX.write_text(json.dumps({"version":1,"generatedOn":today.isoformat(),
                                 "note":"A research/work queue, NOT finished footage, automated rights or auto-publishing.",
                                 "projects":index},indent=2,ensure_ascii=False)+"\n")
    print(f"Prepared {len(index)} major-fight production briefs (all require editorial/media review)")
    return index


if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--today",default=dt.date.today().isoformat())
    parser.add_argument("--days",type=int,default=30)
    parser.add_argument("--lookback",type=int,default=3)
    parser.add_argument("--youtube-metadata",action="store_true",
                        help="Optional YouTube metadata search, requires YOUTUBE_DATA_API_KEY")
    args=parser.parse_args()
    if not (1<=args.days<=120 and 0<=args.lookback<=30):
        raise SystemExit("Outside supported discovery horizon")
    sync(dt.date.fromisoformat(args.today),args.days,args.lookback,args.youtube_metadata)
