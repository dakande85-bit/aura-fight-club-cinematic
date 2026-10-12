#!/usr/bin/env python3
"""Create upload-ready 9:16 MP4 boxing news briefings from reviewed AURA articles.

No generative API, scraping, OAuth or automatic posting. Only original typography
and source-backed prose. Video MP4 files are temporary GitHub Actions artifacts.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import re
import shutil
import subprocess
import tempfile
from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parents[1]
ARTICLES = ROOT / "public/news/articles.json"
OUT = ROOT / "social-exports"
SIZE = (1080, 1920)
INK = (9, 15, 20)
GOLD = (213, 174, 101)
WHITE = (248, 246, 239)
FADED = (178, 192, 205)


def font(size: int, bold: bool = False):
    names = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold
        else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold
        else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for name in names:
        if pathlib.Path(name).exists():
            return ImageFont.truetype(name, size)
    raise RuntimeError("No open-source TrueType font installed on runner")


def wrap(draw, text, face, width, max_lines=10):
    text = re.sub(r"\s+", " ", str(text)).strip()
    lines, line = [], ""
    for word in text.split(" "):
        candidate = (line + " " + word).strip()
        if draw.textbbox((0, 0), candidate, font=face)[2] <= width:
            line = candidate
        else:
            if line:
                lines.append(line)
            line = word
        if len(lines) >= max_lines:
            break
    if line and len(lines) < max_lines:
        lines.append(line)
    if len(lines) == max_lines and len(" ".join(lines).split()) < len(text.split()):
        while len(lines[-1]) > 3 and draw.textbbox((0, 0), lines[-1] + "…", font=face)[2] > width:
            lines[-1] = lines[-1].rsplit(" ", 1)[0]
        lines[-1] += "…"
    return lines


def slide(title, copy, category, counter, output):
    im = Image.new("RGB", SIZE, INK)
    d = ImageDraw.Draw(im)
    w, h = SIZE
    d.polygon([(390, 0), (1080, 0), (1080, 940), (0, 1700)], fill=(20, 29, 39))
    for y in [1380, 1460, 1540]:
        d.line([(0, y), (1080, y - 190)], fill=(61, 61, 56), width=5)
    d.rectangle([0, 0, w, 13], fill=GOLD)
    d.text((74, 117), "FIGHT DESK   /   NEWS", font=font(39, True), fill=WHITE)
    d.text((74, 220), category[:36].upper(), font=font(27, True), fill=GOLD)
    d.line([(74, 302), (1006, 302)], fill=(79, 88, 92), width=2)
    size = 79 if len(title) > 85 else 89
    f = font(size, True)
    y = 398
    for line in wrap(d, title, f, 905, 8):
        d.text((74, y), line, fill=WHITE, font=f)
        y += size + 24
    y = max(1080, y + 80)
    d.rectangle((74, y, 230, y+6), fill=GOLD)
    bodyface = font(39)
    cy = y + 55
    for line in wrap(d, copy, bodyface, 910, 8):
        if cy > 1670: break
        d.text((74, cy), line, fill=FADED, font=bodyface)
        cy += 63
    d.rectangle((74, 1790, 1006, 1792), fill=(98, 98, 91))
    d.text((74, 1828), f"BOXING INTELLIGENCE  •  {counter} / 3", font=font(25, True), fill=GOLD)
    im.save(output, "JPEG", quality=91, subsampling=0)


def paragraph(article, index=0):
    p = [s for s in article["body"] if s and not s.startswith("## ")]
    return p[index] if len(p) > index else article["summary"]


def storyboard(article):
    title = article["title"]
    # Do not invent boxing facts; use only reviewed text from the published edition.
    return [
        (title, article["summary"], "Fight news"),
        ("THE STORY BEHIND THE HEADLINE", paragraph(article, 0), "What happened"),
        ("WHAT MATTERS IN THE RING", paragraph(article, 2), "The analysis"),
    ]


def make_video(article, outdir, seconds=4):
    slug = article["slug"]
    outdir.mkdir(parents=True, exist_ok=True)
    filename = outdir / f"{slug}.mp4"
    with tempfile.TemporaryDirectory() as tmp:
        temp = pathlib.Path(tmp)
        segments = []
        for index, (title, copy, category) in enumerate(storyboard(article), 1):
            jpg = temp / f"frame{index}.jpg"
            mp4 = temp / f"clip{index}.mp4"
            slide(title, copy, category, index, jpg)
            cmd = [
                "ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y",
                "-loop", "1", "-framerate", "24", "-i", str(jpg),
                "-t", str(seconds), "-vf",
                f"fade=t=in:st=0:d=0.32,fade=t=out:st={seconds-0.40}:d=0.40,format=yuv420p",
                "-r", "24", "-an", "-c:v", "libx264", "-preset", "veryfast",
                "-crf", "24", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(mp4),
            ]
            subprocess.run(cmd, check=True, timeout=120)
            segments.append(mp4)
        listfile = temp / "list.txt"
        listfile.write_text("".join("file '" + str(segment) + "'\n" for segment in segments))
        subprocess.run([
            "ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y",
            "-f", "concat", "-safe", "0", "-i", str(listfile),
            "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "96k", "-shortest",
            "-movflags", "+faststart", str(filename),
        ], check=True, timeout=60)
    return filename


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=3)
    parser.add_argument("--slug", default="")
    args = parser.parse_args()
    if not shutil.which("ffmpeg"):
        raise SystemExit("ffmpeg must be installed to render MP4 videos")
    edition = json.loads(ARTICLES.read_text())
    articles = edition["articles"]
    if args.slug:
        articles = [a for a in articles if a.get("slug") == args.slug]
        if not articles:
            raise SystemExit("Story not found: " + args.slug)
    else:
        articles = sorted(articles, key=lambda a: (
            a.get("updatedAt") or a.get("date") or "", a.get("priority", 0)), reverse=True)
    videos = []
    for article in articles:
        body_words = len(" ".join(p for p in article["body"] if not p.startswith("## ")).split())
        # Briefs cannot be repackaged into apparently detailed video reporting.
        if body_words < 475 or len(article.get("sources", [])) < 1:
            continue
        result = make_video(article, OUT)
        videos.append({"slug": article["slug"], "file": result.name,
            "article": f"https://www.aurafightclub.com/news/{article['slug']}",
            "caption": article["title"] + " — full evidence and analysis via the website link in our profile. #Boxing #BoxingNews",
            "length_seconds": 12, "review_status": "ready_for_human_approval",
            "published": False, "has_audio": False})
        print("Rendered", result, f"({result.stat().st_size} bytes)")
        if len(videos) >= max(1, min(args.limit, 8)):
            break
    if not videos:
        raise SystemExit("No substantial, sourced articles available to render")
    (OUT / "upload-manifest.json").write_text(json.dumps({
        "format": "H.264 MP4 / 1080x1920 / 24fps",
        "destination": "manual TikTok or Metricool posting",
        "notice": "No social upload or login attempted. Add authorised music in TikTok/Metricool before publishing.",
        "videos": videos
    }, indent=2) + "\n")
    print("Prepared", len(videos), "manual-upload videos. No paid API used.")


if __name__ == "__main__":
    main()
