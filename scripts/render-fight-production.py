#!/usr/bin/env python3
"""Render 16:9 YouTube and 9:16 TikTok/Shorts from reviewed local real footage.

AURA refuses invented clip timestamps, unreviewed clips, synthetic fight footage,
or off-tempo narration. Uses only local source files, never downloads broadcasts.
"""
from __future__ import annotations
import argparse
import json
import math
import pathlib
import re
import shutil
import subprocess
import tempfile

ROOT=pathlib.Path(__file__).resolve().parents[1]
FORMATS={"youtube":(1920,1080),"shorts":(1080,1920)}
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def local_media(base, name):
    if not isinstance(name,str) or name in ("","..",".") or pathlib.Path(name).name!=name:
        raise ValueError("Invalid local filename: "+str(name))
    if not re.fullmatch(r"[A-Za-z0-9_. ()-]+",name):
        raise ValueError("Unsafe local filename: "+name)
    result=(base/name).resolve()
    if not result.is_relative_to(base.resolve()):
        raise ValueError("Media must remain within --media-dir")
    return result


def selected_cuts(project, channel):
    return [cut for cut in project.get("shots",[]) if channel in cut.get("formats",["youtube","shorts"])]


def validate(project, channel, media_dir=None, files_required=False):
    if channel not in FORMATS or project.get("version")!=1:
        raise ValueError("Unsupported format or project version")
    shots=selected_cuts(project,channel)
    if not shots:
        raise ValueError(f"No real footage cuts selected for {channel}")
    sources={item["id"]:item for item in project.get("sources",[])}
    if not sources:
        raise ValueError("Missing original footage source register")
    total=0.0
    for index,cut in enumerate(shots):
        if cut.get("sourceId") not in sources:
            raise ValueError(f"Cut {index+1} refers to unknown source")
        try:
            start,end=float(cut["in"]),float(cut["out"])
        except (ValueError,TypeError,KeyError):
            raise ValueError(f"Cut {index+1} needs actual marked timecodes") from None
        if not (math.isfinite(start) and math.isfinite(end) and 0<=start<end<=43200):
            raise ValueError(f"Cut {index+1} has invalid timecodes")
        if end-start>12:
            raise ValueError("Cut exceeds internal editorial 12-second review threshold (not a legal safe harbour)")
        total+=end-start
        if files_required:
            src=sources[cut["sourceId"]]
            if src.get("clearedForExport") is not True:
                raise ValueError("Original source has not passed the footage-rights review: "+src["id"])
            if not local_media(media_dir,src.get("localFile","")).is_file():
                raise FileNotFoundError("Actual footage file not found for "+src["id"])
    if total>1200:
        raise ValueError("Edit exceeds the twenty-minute rendering safety cap")
    script=project.get("scripts",{}).get(channel,{})
    if files_required:
        if not script.get("approved"):
            raise ValueError(f"{channel} analysis narration has not been approved by an editor")
        if not str(script.get("draft") or "").strip():
            raise ValueError(f"{channel} narration script is empty")
        filename=project.get("voiceoverFiles",{}).get(channel) or project.get("voiceoverFile","")
        if not local_media(media_dir,filename).is_file():
            raise FileNotFoundError(f"{channel} voiceover is missing")
        for axis in project.get("analysis",{}).get("axes",[]):
            if axis.get("status")=="timecoded_observation":
                ids={s.get("id") for s in shots}
                if not any(a in ids for a in axis.get("clipIds",[])):
                    raise ValueError("Verified tactical observation requires a supporting selected real clip: "+axis.get("name","axis"))
    return shots,sources,total


def execute(args, timeout=600):
    subprocess.run(args,check=True,timeout=timeout)


def probe_seconds(filename):
    p=subprocess.run(["ffprobe","-v","error","-show_entries","format=duration",
                      "-of","default=noprint_wrappers=1:nokey=1",str(filename)],
                     text=True,capture_output=True,check=True,timeout=30)
    return float(p.stdout.strip())


def clip_filter(channel,caption,caption_path=None):
    width,height=FORMATS[channel]
    target=f"{width}:{height}"
    if channel=="shorts":
        graph=(f"[0:v]split[bg][front];[bg]scale={target}:force_original_aspect_ratio=increase,"
               f"crop={target},boxblur=18:1[b];[front]scale={target}:force_original_aspect_ratio=decrease[f];"
               f"[b][f]overlay=(W-w)/2:(H-h)/2,format=yuv420p,fps=30")
    else:
        graph=f"[0:v]scale={target}:force_original_aspect_ratio=decrease,pad={target}:(ow-iw)/2:(oh-ih)/2:black,format=yuv420p,fps=30"
    if caption and caption_path and pathlib.Path(FONT).is_file():
        size=47 if channel=="shorts" else 39
        y="h-text_h-240" if channel=="shorts" else "h-text_h-125"
        graph+=(f",drawtext=fontfile={FONT}:textfile={caption_path}:fontcolor=white:"
                f"fontsize={size}:box=1:boxcolor=black@0.7:boxborderw=20:x=(w-text_w)/2:y={y}")
    return graph


def render(project,channel,media_dir,out_dir):
    shots,sources,total=validate(project,channel,media_dir,True)
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        raise EnvironmentError("FFmpeg and FFprobe are required")
    audio_name=project.get("voiceoverFiles",{}).get(channel) or project.get("voiceoverFile")
    audio=local_media(media_dir,audio_name)
    audio_length=probe_seconds(audio)
    # Do not silently cut off narration or pad it with unexplained silence.
    if abs(audio_length-total)>1.0:
        raise ValueError(f"{channel}: narration lasts {audio_length:.1f}s but timecoded footage totals {total:.1f}s. "
                         "Edit the cuts or re-record so the narration and pictures align within one second.")
    with tempfile.TemporaryDirectory(prefix="aura-video-") as t:
        work=pathlib.Path(t); rendered=[]
        for i,cut in enumerate(shots):
            src=local_media(media_dir,sources[cut["sourceId"]]["localFile"])
            piece=work/f"shot-{i:03d}.mp4"
            label=str(cut.get("caption") or "").strip()[:95]
            capfile=work/f"caption-{i}.txt"
            # Drawtext textfile avoids FFmpeg filter injection from the editor's text.
            if label: capfile.write_text("\n".join(label[j:j+40] for j in range(0,len(label),40)),encoding="utf-8")
            vf=clip_filter(channel,label,str(capfile))
            execute(["ffmpeg","-nostdin","-hide_banner","-loglevel","error","-y",
              "-ss",str(cut["in"]),"-i",str(src),"-t",str(float(cut["out"])-float(cut["in"])),
              "-vf",vf,"-an","-c:v","libx264","-preset","veryfast","-crf","21",
              "-pix_fmt","yuv420p","-r","30",str(piece)])
            rendered.append(piece)
        listfile=work/"cuts.txt"
        listfile.write_text("".join(f"file '{file}'\n" for file in rendered))
        video=work/"video.mp4"
        execute(["ffmpeg","-nostdin","-hide_banner","-loglevel","error","-y",
            "-f","concat","-safe","0","-i",str(listfile),"-c","copy",str(video)])
        out_dir.mkdir(parents=True,exist_ok=True)
        output=out_dir/f"{project['slug']}-{channel}.mp4"
        execute(["ffmpeg","-nostdin","-hide_banner","-loglevel","error","-y",
           "-i",str(video),"-i",str(audio),"-map","0:v:0","-map","1:a:0",
           "-c:v","copy","-c:a","aac","-b:a","160k","-af","aresample=async=1",
           "-t",str(total),"-movflags","+faststart",str(output)])
    return output


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--project",required=True)
    p.add_argument("--format",choices=["youtube","shorts","both"],default="both")
    p.add_argument("--media-dir",default="media")
    p.add_argument("--out-dir",default="social-exports")
    p.add_argument("--check",action="store_true")
    args=p.parse_args()
    data=json.loads(pathlib.Path(args.project).read_text(encoding="utf-8"))
    media_dir=pathlib.Path(args.media_dir).resolve()
    for channel in FORMATS if args.format=="both" else [args.format]:
        if args.check:
            shots,_,seconds=validate(data,channel)
            print(f"{channel}: valid edit plan, {len(shots)} authentic cuts, {seconds:.1f} seconds")
        else:
            print("Produced:",render(data,channel,media_dir,pathlib.Path(args.out_dir)))

if __name__=="__main__":
    main()
