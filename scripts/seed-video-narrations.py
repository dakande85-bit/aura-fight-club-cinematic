#!/usr/bin/env python3
"""Populate empty narration drafts from reviewed AURA editorial, without inventing footage.

This is a source-backed first pass for a HUMAN editor, not automatically verified
film analysis. Never overwrites approved or edited scripts.
"""
from __future__ import annotations
import json
import pathlib
import re

ROOT=pathlib.Path(__file__).resolve().parents[1]
ARTICLES=ROOT/"public/news/articles.json"
INDEX=ROOT/"public/news/video-production/index.json"
OUT=ROOT/"public/news/video-production"


def select_article(fight_id,articles):
    options=[a for a in articles if a.get("fightId")==fight_id and len(" ".join(a.get("body",[])).split())>=250]
    def priority(a):
        slug=(a.get("slug") or "").lower()
        lab=("prediction" in slug or "technical" in slug or "fight-lab" in slug)
        return (int(lab),int(a.get("priority") or 0),a.get("date") or "")
    return max(options,key=priority) if options else None


def paragraphs(article):
    return [re.sub(r"\s+"," ",item.replace("**","")).strip()
            for item in article.get("body",[])
            if isinstance(item,str) and not item.strip().startswith("## ") and len(item.split())>=14]


def seed(article):
    body=paragraphs(article)
    # The source's ORIGINAL claims are not certified as film observations.
    # Cuts and scene annotations will be tied to the video by the film reviewer.
    if not body:
        return "",""
    short_intro=str(article.get("summary") or "").strip()
    # Use original detail from body, avoid writing speculative film events.
    long="\n\n".join(body[:12])
    short_segments=[short_intro]
    for para in body:
        if len(" ".join(short_segments).split())>=98:break
        short_segments.append(" ".join(para.split()[:50]))
    short=" ".join(short_segments)
    short_words=short.split()
    if len(short_words)>135:short=" ".join(short_words[:135]).rstrip(".;:")+"."
    return long,short


def run():
    index=json.loads(INDEX.read_text())
    articles=json.loads(ARTICLES.read_text())["articles"]
    changed=0
    for item in index["projects"]:
        path=ROOT/"public"/item["path"].lstrip("/").removeprefix("news/") if False else ROOT/item["path"].lstrip("/")
        # index paths start /news/...; ROOT/public/news/... is the correct path.
        path=ROOT/"public"/item["path"].lstrip("/")
        project=json.loads(path.read_text())
        article=select_article(item["fightId"],articles)
        if not article:continue
        long,short=seed(article)
        scripts=project.setdefault("scripts",{})
        for channel,draft in (("youtube",long),("shorts",short)):
            script=scripts.setdefault(channel,{"approved":False})
            if not script.get("draft") and draft and not script.get("approved"):
                script["draft"]=draft
                script["draftOrigin"]={"type":"own_article","slug":article["slug"],"reviewRequired":True}
                changed+=1
        project.setdefault("analysis",{})["linkedArticle"]=article["slug"]
        project["storyUrl"]=f"https://www.aurafightclub.com/news/{article['slug']}"
        path.write_text(json.dumps(project,ensure_ascii=False,indent=2)+"\n")
    print(f"Seeded {changed} unapproved narration drafts from existing AURA articles. No fabricated clip observations.")


if __name__=="__main__":run()
