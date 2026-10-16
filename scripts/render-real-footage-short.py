#!/usr/bin/env python3
"""Render an Aura Fight Club vertical analysis from locally supplied, rights-reviewed footage.

Does not download, rip or scrape broadcasts or YouTube. Requires FFmpeg and FFprobe.
Usage: python scripts/render-real-footage-short.py --project edit.json --media-dir ./media --out short.mp4
       python scripts/render-real-footage-short.py --project edit.json --check
"""
import argparse
import json
import pathlib
import re
import shutil
import subprocess
import tempfile
import textwrap

FRAME_RATE = 30
WIDTH, HEIGHT = 1080, 1920
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def local_media(directory, basename):
    if not isinstance(basename, str) or not basename or pathlib.Path(basename).name != basename:
        raise ValueError("Media must be a filename inside --media-dir, never a path or URL")
    if basename in {".", ".."} or not re.fullmatch(r"[A-Za-z0-9_. ()-]+", basename):
        raise ValueError("Unsupported filename: " + basename)
    resolved = (directory / basename).resolve()
    if not resolved.is_relative_to(directory.resolve()):
        raise ValueError("Media filename points outside the permitted folder")
    return resolved


def validate(data, require_assets=False, media_dir=None):
    if data.get("version") != 1 or not isinstance(data.get("sources"), list):
        raise ValueError("Expected version 1 project containing a sources array")
    sources = {source.get("id"): source for source in data["sources"]}
    if not sources or None in sources or len(sources) != len(data["sources"]):
        raise ValueError("Sources must have unique IDs")
    shots = data.get("shots")
    if not isinstance(shots, list) or not shots:
        raise ValueError("No cuts selected. Open the video studio and mark the actual footage timestamps.")
    duration = 0
    for i, shot in enumerate(shots, 1):
        source = sources.get(shot.get("sourceId"))
        if source is None:
            raise ValueError(f"Shot {i} references an unknown source")
        try:
            start = float(shot["in"])
            end = float(shot["out"])
        except (KeyError, TypeError, ValueError):
            raise ValueError(f"Shot {i} needs valid in/out timestamps") from None
        if not (0 <= start < end <= 43200) or end - start > 12:
            raise ValueError(f"Shot {i}: use a positive extract of at most 12 seconds")
        duration += end - start
        if require_assets:
            if source.get("clearedForExport") is not True:
                raise ValueError(f"Source '{source['id']}' must be reviewed and cleared for this particular use")
            video = local_media(media_dir, source.get("localFile", ""))
            if not video.is_file():
                raise FileNotFoundError(f"Source file missing: {video}")
    if duration > 180:
        raise ValueError("The total selected clip length exceeds 180 seconds")
    if require_assets and data.get("voiceoverFile"):
        audio = local_media(media_dir, data["voiceoverFile"])
        if not audio.is_file():
            raise FileNotFoundError(f"Voiceover file missing: {audio}")
    return sources, duration


def run(args):
    subprocess.run(args, check=True, timeout=420)


def render(data, sources, total, media_dir, output):
    if not shutil.which("ffmpeg"):
        raise RuntimeError("Install FFmpeg first")
    with tempfile.TemporaryDirectory(prefix="aura-real-footage-") as t:
        temp = pathlib.Path(t)
        clips = []
        for i, shot in enumerate(data["shots"]):
            src = local_media(media_dir, sources[shot["sourceId"]]["localFile"])
            output_part = temp / f"shot_{i:03d}.mp4"
            caption = str(shot.get("caption") or "").strip()[:95]
            textfile = temp / f"caption_{i}.txt"
            textfile.write_text("\n".join(textwrap.wrap(caption, width=25)[:3]), encoding="utf-8")
            # The full landscape frame remains visible, over a blurred vertical backdrop.
            filtergraph = (
                f"[0:v]split=2[background][foreground];"
                f"[background]scale={WIDTH}:{HEIGHT}:force_original_aspect_ratio=increase,"
                f"crop={WIDTH}:{HEIGHT},boxblur=15:2[bg];"
                f"[foreground]scale={WIDTH}:{HEIGHT}:force_original_aspect_ratio=decrease[fg];"
                f"[bg][fg]overlay=(W-w)/2:(H-h)/2,"
                f"fps={FRAME_RATE},setsar=1,format=yuv420p"
            )
            if caption:
                filtergraph += (
                    f",drawtext=fontfile={FONT}:textfile={textfile}:"
                    f"fontcolor=white:fontsize=53:line_spacing=12:"
                    f"box=1:boxcolor=black@0.70:boxborderw=22:"
                    f"x=(w-text_w)/2:y=h-text_h-250"
                )
            filtergraph += "[v]"
            length = float(shot["out"]) - float(shot["in"])
            run(["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y",
                 "-ss", str(shot["in"]), "-i", str(src), "-t", str(length),
                 "-filter_complex", filtergraph, "-map", "[v]", "-an",
                 "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
                 "-pix_fmt", "yuv420p", str(output_part)])
            clips.append(output_part)
        concat = temp / "concat.txt"
        concat.write_text("".join(f"file '{p}'\n" for p in clips))
        silent = temp / "picture_only.mp4"
        run(["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y",
             "-f", "concat", "-safe", "0", "-i", str(concat), "-c", "copy", str(silent)])
        audio = data.get("voiceoverFile")
        if audio:
            audio_input = ["-i", str(local_media(media_dir, audio))]
        else:
            audio_input = ["-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo"]
        output.parent.mkdir(parents=True, exist_ok=True)
        run(["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y",
             "-i", str(silent), *audio_input, "-map", "0:v:0", "-map", "1:a:0",
             "-filter:a", "apad", "-t", str(total), "-c:v", "copy",
             "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", str(output)])
    return output


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", required=True)
    parser.add_argument("--media-dir", default="media")
    parser.add_argument("--out", default="social-exports/aura-real-footage-short.mp4")
    parser.add_argument("--check", action="store_true", help="Validate EDL without rendering or needing footage files")
    args = parser.parse_args()
    data = json.loads(pathlib.Path(args.project).read_text(encoding="utf-8"))
    directory = pathlib.Path(args.media_dir).resolve()
    sources, total = validate(data, not args.check, directory)
    print(f"Validated {len(data['shots'])} cuts, {total:.2f} seconds across {len(sources)} registered sources")
    if not args.check:
        result = render(data, sources, total, directory, pathlib.Path(args.out))
        print("Rendered original analysis MP4:", result)


if __name__ == "__main__":
    main()
