#!/usr/bin/env python3
"""Render a human-reviewed AURA trailer ZIP to a 9:16 MP4 using local FFmpeg.

No scraping, AI API, payment, remote media fetching or social posting.
Usage:
  python3 scripts/render-cinematic-trailer.py aura-trailer-pack.zip --output aura-tiktok.mp4
"""
from __future__ import annotations

import argparse
import json
import pathlib
import re
import shutil
import subprocess
import tempfile
import zipfile

SIZE = "1080:1920"
FPS = "24"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
MAX_BYTES = 900_000_000
KINDS = {"real_photo", "licensed_clip", "ai_scene", "reveal"}
RIGHTS = {"self_owned", "licensed", "written_permission", "original_ai"}


def fail(message):
    raise ValueError(message)


def run(args, timeout=300):
    subprocess.run(args, check=True, timeout=timeout)


def verify_manifest(manifest, names):
    if manifest.get("schema") != "aura-cinematic-trailer-v1":
        fail("Unsupported manifest schema")
    if manifest.get("fight_status") not in {"confirmed", "hypothetical", "non_fight"}:
        fail("Missing or invalid fight status")
    shots = manifest.get("shots")
    if not isinstance(shots, list) or not (1 <= len(shots) <= 20):
        fail("Supply 1–20 scenes")
    seconds = 0.0
    for idx, shot in enumerate(shots, 1):
        duration = float(shot.get("duration") or 0)
        if not 1 <= duration <= 12 or not shot.get("kind") in KINDS:
            fail("Scene %d has an invalid duration or kind" % idx)
        if shot.get("rights") not in RIGHTS or not shot.get("rights_verified") or not shot.get("approved"):
            fail("Scene %d lacks editorial/rights approval" % idx)
        if shot["kind"] == "ai_scene" and (shot["rights"] != "original_ai" or not shot.get("ai_illustration")):
            fail("Original AI scenes must be identified as illustrative")
        if shot["kind"] != "ai_scene" and not str(shot.get("source_reference") or "").strip():
            fail("Scene %d is missing its provenance reference" % idx)
        if not shot.get("file") in names:
            fail("Scene %d media file not found" % idx)
        seconds += duration
    if seconds > 90:
        fail("Trailers are limited to 90 seconds")
    for field in ("narration_file", "music_file"):
        if manifest.get(field) and manifest[field] not in names:
            fail("Missing attached " + field)
    if manifest.get("music_file") and not manifest.get("music_rights_reference"):
        fail("Music licence reference is required")
    return shots, seconds


def unpack_pack(archive, target):
    names = set()
    total = 0
    for item in archive.infolist():
        if item.is_dir():
            continue
        path = pathlib.PurePosixPath(item.filename)
        if path.is_absolute() or ".." in path.parts or "\\" in item.filename:
            fail("Unsafe ZIP entry: " + item.filename)
        total += item.file_size
        if total > MAX_BYTES:
            fail("ZIP exceeds 900 MB uncompressed limit")
        destination = target.joinpath(*path.parts)
        destination.parent.mkdir(parents=True, exist_ok=True)
        with archive.open(item) as src, destination.open("wb") as dst:
            shutil.copyfileobj(src, dst)
        names.add(item.filename)
    return names


def make_filter(shot, index, manifest, tmp):
    video_filter = "scale=1080:1920:force_original_aspect_ratio=increase,crop=" + SIZE + ",setsar=1,fps=" + FPS
    label = (shot.get("overlay_text") or "").strip() if shot.get("kind") == "reveal" else ""
    if label:
        textfile = tmp / ("overlay_%02d.txt" % index)
        textfile.write_text(label[:55], encoding="utf8")
        video_filter += (",drawtext=fontfile=" + FONT + ":textfile=" + str(textfile) +
                         ":expansion=none:fontcolor=white:fontsize=65:x=(w-text_w)/2:"
                         "y=h*0.76:box=1:boxcolor=black@0.62:boxborderw=22")
    if shot.get("kind") == "reveal" and manifest.get("fight_status") == "hypothetical":
        disclosure = tmp / ("disclosure_%02d.txt" % index)
        disclosure.write_text("DREAM MATCHUP - NOT ANNOUNCED", encoding="utf8")
        video_filter += (",drawtext=fontfile=" + FONT + ":textfile=" + str(disclosure) +
                         ":expansion=none:fontcolor=white:fontsize=26:"
                         "x=(w-text_w)/2:y=h*0.89:box=1:boxcolor=black@0.7:boxborderw=12")
    if shot.get("kind") == "ai_scene":
        disclosure = tmp / ("illustration_%02d.txt" % index)
        disclosure.write_text("ILLUSTRATIVE VISUAL", encoding="utf8")
        video_filter += (",drawtext=fontfile=" + FONT + ":textfile=" + str(disclosure) +
                         ":expansion=none:fontcolor=white:fontsize=23:"
                         "x=55:y=80:box=1:boxcolor=black@0.65:boxborderw=10")
    return video_filter + ",format=yuv420p"


def render_scene(file, shot, index, manifest, tmp):
    out = tmp / ("scene_%02d.mp4" % index)
    duration = float(shot["duration"])
    extension = file.suffix.lower()
    is_video = extension in {".mp4", ".mov", ".m4v", ".webm", ".mkv"}
    if not is_video and extension not in {".jpg", ".jpeg", ".png", ".webp"}:
        fail("Scene %d uses an unsupported media extension" % (index + 1))
    inputs = ["-stream_loop", "-1", "-i", str(file)] if is_video else ["-loop", "1", "-framerate", FPS, "-i", str(file)]
    run(["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y", *inputs,
         "-t", str(duration), "-vf", make_filter(shot, index, manifest, tmp),
         "-r", FPS, "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "21",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(out)], timeout=300)
    return out


def assemble_audio(video, manifest, work, seconds, destination):
    narration = manifest.get("narration_file")
    music = manifest.get("music_file")
    cmd = ["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-i", str(video)]
    voices = []
    if narration:
        cmd += ["-i", str(work / narration)]
        voices.append("[" + str(len(voices) + 1) + ":a]volume=1.0,aresample=48000[voice]")
    if music:
        cmd += ["-stream_loop", "-1", "-i", str(work / music)]
        voices.append("[" + str(len(voices) + 1) + ":a]volume=0.20,aresample=48000[track]")
    if narration and music:
        audio_filter = ";".join(voices) + ";[voice][track]amix=inputs=2:duration=longest:dropout_transition=0,atrim=duration=" + str(seconds) + "[mix]"
        audio_filter += ";[mix]afade=t=out:st=" + str(max(0, seconds - .5)) + ":d=0.5[aout]"
        cmd += ["-filter_complex", audio_filter, "-map", "0:v:0", "-map", "[aout]"]
    elif narration or music:
        audio_filter = ";".join(voices) + ";[" + ("voice" if narration else "track") + "]apad,atrim=duration=" + str(seconds) + "[aout]"
        cmd += ["-filter_complex", audio_filter, "-map", "0:v:0", "-map", "[aout]"]
    else:
        cmd += ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-map", "0:v:0", "-map", "1:a:0"]
    cmd += ["-t", str(seconds), "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
            "-movflags", "+faststart", str(destination)]
    run(cmd, timeout=300)


def render(zip_path, output):
    if not shutil.which("ffmpeg"):
        fail("FFmpeg is required")
    if not pathlib.Path(FONT).exists():
        fail("DejaVu Sans Bold font is required at " + FONT)
    with tempfile.TemporaryDirectory(prefix="aura-trailer-") as temp:
        work = pathlib.Path(temp)
        with zipfile.ZipFile(zip_path) as archive:
            names = unpack_pack(archive, work)
        if "manifest.json" not in names:
            fail("Missing manifest.json")
        manifest = json.loads((work / "manifest.json").read_text(encoding="utf8"))
        scenes, seconds = verify_manifest(manifest, names)
        clips = [render_scene(work / scene["file"], scene, i, manifest, work) for i, scene in enumerate(scenes)]
        concat = work / "clips.txt"
        # Paths created by TemporaryDirectory are controlled by this renderer.
        concat.write_text("".join("file '" + str(clip) + "'\n" for clip in clips), encoding="utf8")
        silent = work / "video-only.mp4"
        run(["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y",
             "-f", "concat", "-safe", "0", "-i", str(concat),
             "-c:v", "copy", "-an", str(silent)])
        output.parent.mkdir(parents=True, exist_ok=True)
        assemble_audio(silent, manifest, work, seconds, output)
        print("Rendered %s (%.1f s; %d scenes). No social publication." % (output, seconds, len(scenes)))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("zip", type=pathlib.Path, help="Reviewed local media pack from /admin/social/trailer")
    parser.add_argument("--output", type=pathlib.Path, default=pathlib.Path("aura-trailer.mp4"))
    args = parser.parse_args()
    try:
        render(args.zip, args.output)
    except (ValueError, subprocess.CalledProcessError, TimeoutError, zipfile.BadZipFile) as exc:
        parser.exit(2, "AURA renderer stopped: %s\n" % exc)


if __name__ == "__main__":
    main()
