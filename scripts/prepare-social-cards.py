#!/usr/bin/env python3
"""Create original TikTok/Shorts editorial card drafts with NO AI API expense.

No upload occurs here. Authorisation and platform approval are separate requirements.
Outputs 1080x1920 JPEGs and a publish-queue manifest for connected social schedulers.
"""
import datetime
import hashlib
import json
import os
import pathlib
import re
import textwrap
from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/news/articles.json"
DEST = ROOT / "public/news/social"
MANIFEST = ROOT / "public/news/social-queue.json"
SITE = "https://www.aurafightclub.com"
MAX_NEW = max(1, min(12, int(os.getenv("AURA_SOCIAL_BATCH", "6"))))
DEST.mkdir(parents=True, exist_ok=True)


def font(size, bold=False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for candidate in candidates:
        if os.path.isfile(candidate):
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def lines_to_fit(draw, text, body_font, maxwidth, maxlines):
    words = re.sub(r"\s+", " ", str(text)).strip().split(" ")
    lines, current = [], ""
    for word in words:
        next_line = (current + " " + word).strip()
        if draw.textbbox((0, 0), next_line, font=body_font)[2] <= maxwidth:
            current = next_line
        else:
            if current:
                lines.append(current)
            current = word
        if len(lines) == maxlines:
            break
    if current and len(lines) < maxlines:
        lines.append(current)
    if len(lines) == maxlines and len(" ".join(lines).split()) < len(words):
        while lines[-1] and draw.textbbox((0, 0), lines[-1] + "…", font=body_font)[2] > maxwidth:
            lines[-1] = lines[-1].rsplit(" ", 1)[0] if " " in lines[-1] else lines[-1][:-1]
        lines[-1] += "…"
    return lines


def story_hash(article):
    key = json.dumps(["platform-safe-v2", article.get("title"), article.get("summary"), article.get("body"), article.get("image",{}).get("src")], ensure_ascii=False, sort_keys=True)
    return hashlib.sha256(key.encode()).hexdigest()[:14]


def make_card(article, dest):
    W, H = 1080, 1920
    im = Image.new("RGB", (W, H), (8, 12, 16))
    d = ImageDraw.Draw(im)
    # Original abstract boxing-ring motif; no impersonations or unlicensed athlete photos.
    d.polygon([(525, 0), (1080, 0), (1080, 850), (120, 1600)], fill=(24, 33, 42))
    for i in range(6):
        k = 65 * i
        d.line([(420 + k, 410), (965 + k, 0)], fill=(69, 65, 54), width=3)
    gold = (216, 177, 103)
    d.rectangle([0, 0, W, 15], fill=gold)
    d.text((72, 100), "BOXING  /  FIGHT DESK", fill=(249, 247, 242), font=font(47, True))
    d.text((72, 194), (article.get("category") or "FIGHT DESK").upper()[:34], fill=gold, font=font(26, True))
    d.line([(72, 282), (1008, 282)], fill=(95, 94, 85), width=2)
    headline = article["title"]
    head_font = font(86 if len(headline) < 63 else 73, True)
    title_lines = lines_to_fit(d, headline, head_font, 920, 8)
    y = 380
    for line in title_lines:
        d.text((72, y), line, fill=(255, 255, 251), font=head_font, stroke_width=0)
        y += 103 if len(headline) < 63 else 90
    y = max(y + 65, 1080)
    d.rectangle([72, y, 230, y + 6], fill=gold)
    d.text((72, y + 45), "THE STORY", fill=gold, font=font(30, True))
    summary_font = font(42, False)
    for line in lines_to_fit(d, article.get("summary", ""), summary_font, 915, 6):
        y += 68
        d.text((72, y + 50), line, fill=(225, 228, 228), font=summary_font)
    d.line([(72, 1740), (1008, 1740)], fill=(87, 89, 90), width=2)
    d.text((72, 1770), "INDEPENDENT BOXING REPORTING & ANALYSIS", fill=(191, 195, 195), font=font(23, True))
    d.text((72, 1822), article.get("date", ""), fill=gold, font=font(26, True))
    im.save(dest, format="JPEG", quality=88, optimize=True)


def main():
    articles = json.loads(SOURCE.read_text(encoding="utf-8")).get("articles", [])
    previous = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {"items":[]}
    stored = {x.get("slug"): x for x in previous.get("items", []) if x.get("slug")}
    today = datetime.date.today().isoformat()
    # Use article dates and revised timestamps; avoid rewriting the same assets each run.
    ranked = sorted(articles, key=lambda a: (a.get("updatedAt") or a.get("date") or "", a.get("date") or ""), reverse=True)
    generated = 0
    for a in ranked:
        slug = a.get("slug")
        if not slug or not a.get("title") or not a.get("summary"):
            continue
        h = story_hash(a)
        if stored.get(slug, {}).get("fingerprint") == h:
            continue
        if generated >= MAX_NEW:
            break
        out = DEST / (slug + ".jpg")
        make_card(a, out)
        stored[slug] = {
            "slug": slug, "article_url": SITE + "/news/" + slug,
            "image_url": SITE + "/news/social/" + out.name,
            "fingerprint": h, "generated_on": today,
            "headline": a["title"],
            "suggested_caption": a["title"] + " — AURA Fight Club. Full breakdown on our website (profile link where available). #Boxing #BoxingNews",
            "status": "draft_not_posted",
            "platforms": ["TikTok", "Instagram", "YouTube"],
            "requires": ["platform account connected", "publishing permission granted", "platform/content-policy review", "image and source rights checked", "TikTok content sharing rules: no external promotional branding"],
        }
        generated += 1
    results = sorted(stored.values(), key=lambda x: (x.get("generated_on",""),x.get("slug","")), reverse=True)[:200]
    MANIFEST.write_text(json.dumps({"version":1,"note":"Draft assets only; no TikTok or YouTube publishing performed.","items":results}, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    print(f"Generated {generated} social image drafts; {len(results)} queued/archived. No social API called.")


if __name__ == "__main__":
    main()
