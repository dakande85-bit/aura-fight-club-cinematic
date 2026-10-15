#!/usr/bin/env python3
"""AURA Newsroom Radar: discovery + editorial triage, never publication.

Standard-library only; reads public RSS search results and Google Trends RSS.
Output is an unverified research queue requiring original-source checking.
"""
from __future__ import annotations

import argparse
import html
import json
import math
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "newsroom" / "sources.json"
ARTICLES = ROOT / "public" / "news" / "articles.json"
UA = "AuraFightClubEditorialRadar/0.1 (public RSS; review-only)"
STOP = set("a an and as at be boxing boxers by for from has have in into is its of on or over the their this to vs v with after before says said more new full fight fights latest live update preview exclusive report reports reaction".split())
RISK = re.compile(r"\b(accus(?:e|ed|ation|ations)|cheat(?:ing)?|doping|drug|arrest|lawsuit|charged|fraud|corrupt|fixed|ban(?:ned)?|rumou?r|claims?|alleg(?:e|ed|ations?))\b", re.I)
REACTION = re.compile(r"\b(reaction|responds?|slams?|fires back|call(?:s|ed)? out|warns?|accus(?:e|es|ed)|criticis(?:e|es|ed)|criticiz(?:e|es|ed))\b", re.I)
BUSINESS = re.compile(r"\b(contract|purse|money|rights|deal|offer|sanction|rules?|referee|scoring|testing|promot(?:er|ion)|ranking|injury|appeal)\b", re.I)
TRENDS_NS = "{https://trends.google.com/trending/rss}"

def utcnow() -> datetime:
    return datetime.now(timezone.utc)

def download(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/rss+xml, application/xml, text/xml"})
    with urllib.request.urlopen(req, timeout=18) as response:
        return response.read(2_500_000)

def words(text: str) -> set[str]:
    return {w for w in re.findall(r"[a-z0-9]+", html.unescape(text).lower()) if len(w) > 2 and w not in STOP}

def similarity(a: str, b: str) -> float:
    x, y = words(a), words(b)
    return len(x & y) / len(x | y) if x and y else 0.0

def parse_date(raw: str) -> datetime | None:
    try:
        value = parsedate_to_datetime(raw)
        return value.astimezone(timezone.utc) if value.tzinfo else value.replace(tzinfo=timezone.utc)
    except (TypeError, ValueError, OverflowError):
        return None

def parse_rss(xml: bytes, fallback_source: str = "") -> list[dict]:
    root = ET.fromstring(xml)
    output = []
    for entry in root.findall(".//channel/item"):
        title = html.unescape((entry.findtext("title") or "").strip())
        link = (entry.findtext("link") or "").strip()
        dt = parse_date(entry.findtext("pubDate") or "")
        publisher = (entry.findtext("source") or fallback_source).strip()
        if title and link.startswith("https://") and dt:
            output.append({"title": title, "url": link, "published": dt, "source": publisher})
    return output

def parse_trends(xml: bytes) -> list[dict]:
    root = ET.fromstring(xml)
    results = []
    for item in root.findall(".//channel/item"):
        title = html.unescape((item.findtext("title") or "").strip())
        traffic = (item.findtext(TRENDS_NS + "approx_traffic") or "").strip()
        if title:
            results.append({"topic": title, "traffic": traffic})
    return results

def matches_boxing_trend(topic: str, terms: list[str]) -> bool:
    low = topic.lower()
    return "boxing" in low or any(re.search(r"\b" + re.escape(term.lower()) + r"\b", low) for term in terms)

def trend_match(headline: str, trends: list[dict]) -> dict | None:
    # Only named overlaps count, not generic words such as "fight".
    for trend in trends:
        name = trend["topic"].strip().lower()
        if len(name) >= 5 and (name in headline.lower() or similarity(name, headline) >= 0.55):
            return trend
    return None

def already_covered(title: str, articles: list[dict]) -> tuple[bool, str | None]:
    for article in articles:
        existing = article.get("title", "")
        if similarity(title, existing) >= 0.73:
            return True, existing
    return False, None

def story_type(title: str, age_hours: float, sources: int) -> str:
    if BUSINESS.search(title):
        return "Explainer / Investigation"
    if REACTION.search(title):
        return "Reaction + Fact Check"
    if age_hours <= 18 and sources >= 2:
        return "Breaking / News"
    return "Analysis / Follow-up"

def editorial_angle(title: str) -> str:
    if RISK.search(title):
        return "Separate the allegation from established facts; seek the original statement, a response, and applicable rules."
    if BUSINESS.search(title):
        return "Explain the decision-makers, incentives, official documents and consequences for the division."
    if REACTION.search(title):
        return "Check the complete interview or statement, add opposing views and distinguish opinion from evidence."
    return "Identify what actually changed and use fight history, footage or official records to explain why it matters."

def choose_clusters(items: list[dict], now: datetime) -> list[list[dict]]:
    # Jaccard headline clustering, conservative to avoid merging unrelated bouts.
    unique = {}
    for item in items:
        unique.setdefault(item["url"], item)
    recent = [r for r in unique.values() if timedelta(0) <= now - r["published"] <= timedelta(days=7)]
    recent.sort(key=lambda x: x["published"], reverse=True)
    groups: list[list[dict]] = []
    for item in recent:
        target = next((g for g in groups if similarity(item["title"], g[0]["title"]) >= 0.56), None)
        if target is None:
            groups.append([item])
        else:
            target.append(item)
    return groups

def rank(items: list[dict], trends: list[dict], articles: list[dict], now: datetime) -> list[dict]:
    output = []
    for group in choose_clusters(items, now):
        representative = sorted(group, key=lambda x: x["published"], reverse=True)[0]
        unique_sources = sorted({r["source"] for r in group if r["source"]})
        age = (now - representative["published"]).total_seconds() / 3600
        matched = trend_match(" ".join(r["title"] for r in group), trends)
        duplication, existing = already_covered(representative["title"], articles)
        recent_points = 30 if age <= 12 else 24 if age <= 24 else 16 if age <= 72 else 8
        # Each extra *independent* publisher is an additional signal, not confirmation.
        corroboration = min(max(len(unique_sources) - 1, 0) * 7, 20)
        trend_points = 20 if matched else 0
        novelty = 0 if duplication else 15
        relevance = 10
        # A primary publisher is a useful lead, but not proof its claim is true.
        primary = 5 if any(any(term in s.lower() for term in ("wbc", "wba", "ibf", "wbo", "matchroom", "queensberry", "top rank", "dazn")) for s in unique_sources) else 0
        score = max(0, min(100, recent_points + corroboration + trend_points + novelty + relevance + primary - (35 if duplication else 0)))
        output.append({
            "headline": representative["title"],
            "score": score,
            "published": representative["published"].isoformat(),
            "type": story_type(representative["title"], age, len(unique_sources)),
            "angle": editorial_angle(representative["title"]),
            "independent_publishers": len(unique_sources),
            "google_trend": matched,
            "already_covered": duplication,
            "matching_article": existing,
            "verification": "HOLD_FOR_ORIGINAL_SOURCE_AND_RESPONSE" if RISK.search(representative["title"]) else "EDITORIAL_REVIEW_REQUIRED",
            "evidence": [{"publisher": x["source"], "title": x["title"], "url": x["url"], "published": x["published"].isoformat()} for x in group[:8]],
        })
    return sorted(output, key=lambda x: (x["score"], x["published"]), reverse=True)

def safe_markdown(s: str) -> str:
    return s.replace("|", "/").replace("\r", " ").replace("\n", " ").replace("[", "(").replace("]", ")")

def render_md(stories: list[dict], now: datetime, errors: list[str], trend_count: int) -> str:
    lines = [
        "# AURA / Editorial Radar",
        f"Generated: {now.isoformat()}",
        "",
        "> Research leads, not verified reporting or a definitive measure of what's most talked about. No automatic publishing.",
        "",
        f"Source signals: Google News RSS searches; {trend_count} boxing-related Google Trends topics (UK).",
        "Social views, comments, search growth and direct fighter statements are **not measured** by this version.",
        "",
        "## Ranked story opportunities",
        "",
    ]
    if not stories:
        lines.append("No candidates found. Check fetch diagnostics; do not interpret an empty queue as no boxing news.")
    for i, story in enumerate(stories[:25], 1):
        lines.extend([
            f"### {i}. {safe_markdown(story['headline'])} — {story['score']}/100",
            f"- **Format:** {story['type']} | **Published:** {story['published']} | **Independent publications observed:** {story['independent_publishers']}",
            f"- **Status:** {story['verification']} | **Covered already:** {'yes — ' + safe_markdown(story['matching_article']) if story['already_covered'] else 'no close title match'}",
            f"- **Trend:** {safe_markdown(story['google_trend']['topic']) + ' (' + safe_markdown(story['google_trend']['traffic']) + ')' if story['google_trend'] else 'none observed'}",
            f"- **Aura angle:** {story['angle']}",
        ])
        for evidence in story["evidence"][:5]:
            lines.append(f"- **Lead:** [{safe_markdown(evidence['publisher'] or 'Source')}]({evidence['url']}) — {safe_markdown(evidence['title'])}")
        lines.append("")
    if errors:
        lines.extend(["## Data-source warnings", *["- " + safe_markdown(x) for x in errors], ""])
    lines.extend([
        "## Mandatory publishing gate",
        "Confirm the originating statement, fight details and date; seek a second independent source for contested claims; give subjects a fair opportunity to respond; check article duplication, image rights and factual accuracy; obtain editor approval.",
        "",
    ])
    return "\n".join(lines)

def run(args: argparse.Namespace) -> int:
    cfg = json.loads(CONFIG.read_text(encoding="utf-8"))
    now = utcnow()
    prior = json.loads(ARTICLES.read_text(encoding="utf-8")).get("articles", [])
    found, errors, trends = [], [], []
    success = 0
    for source in cfg["searches"]:
        url = "https://news.google.com/rss/search?" + urllib.parse.urlencode({
            "q": source["query"], "hl": "en-GB", "gl": "GB", "ceid": "GB:en"
        })
        try:
            rows = parse_rss(download(url), source["name"])
            found.extend(rows)
            success += 1
            print(f"{source['name']}: {len(rows)} items", file=sys.stderr)
        except Exception as e:
            errors.append(f"{source['name']}: {type(e).__name__}: {e}")
    try:
        all_trends = parse_trends(download("https://trends.google.com/trending/rss?geo=GB"))
        trends = [t for t in all_trends if matches_boxing_trend(t["topic"], cfg["watch_terms"])]
    except Exception as e:
        errors.append(f"Google Trends: {type(e).__name__}: {e}")
    if not success:
        print("All news feeds failed; no candidate report generated.", file=sys.stderr)
        for e in errors:
            print(e, file=sys.stderr)
        return 1
    stories = rank(found, trends, prior, now)
    output = Path(args.output).resolve()
    output.mkdir(parents=True, exist_ok=True)
    payload = {"generated_at": now.isoformat(), "caveat": "Research-only: no facts verified, no social velocity measured", "source_feeds_succeeded": success, "warnings": errors, "stories": stories[:100]}
    (output / "stories.json").write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    (output / "editorial-brief.md").write_text(render_md(stories, now, errors, len(trends)), encoding="utf-8")
    print(f"Wrote {len(stories)} ranked candidates to {output}")
    return 0

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="newsroom-output", help="Private workflow artifact folder, not public site content")
    sys.exit(run(parser.parse_args()))
