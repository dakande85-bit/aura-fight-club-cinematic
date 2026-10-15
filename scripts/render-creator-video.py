#!/usr/bin/env python3
"""AURA Creator MVP: editorial, voice-led short and widescreen video rendering.

Inputs: one reviewed project JSON, approved local visual assets and optional
user-recorded voiceovers. Outputs: MP4 review files, metadata and shot list.
No scraping, third-party downloads, publishing or external AI APIs.
"""
from __future__ import annotations

import argparse
import json
import math
import os
import pathlib
import re
import shutil
import subprocess
import tempfile
from dataclasses import dataclass
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parents[1]
DEFAULT_PROJECTS = ROOT / "creator" / "projects"
VALID_ID = re.compile(r"^[a-z0-9][a-z0-9-]{1,90}$")
VALID_VIDEO = {".mp4", ".mov", ".m4v", ".webm"}
VALID_IMAGE = {".png", ".jpg", ".jpeg", ".webp"}
GOLD = (220, 183, 112)
INK = (12, 19, 26)
WHITE = (245, 247, 246)

@dataclass
class Clip:
    asset: pathlib.Path
    duration: float
    title: str
    deck: str
    label: str
    media_type: str
    attribution: str
    illustrative: bool

def ffprobe_duration(file: pathlib.Path) -> float:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(file)],
        check=True, capture_output=True, text=True, timeout=25
    )
    duration = float(result.stdout.strip())
    if not math.isfinite(duration) or duration <= 0:
        raise ValueError("Audio duration could not be established.")
    return duration

def file_in_repo(path: str) -> pathlib.Path:
    if not isinstance(path, str) or not path or "://" in path or "\x00" in path:
        raise ValueError("Asset must be a local path within the repository.")
    absolute = (ROOT / path).resolve()
    if not absolute.is_relative_to(ROOT):
        raise ValueError("Asset points outside repository.")
    if not absolute.is_file():
        raise FileNotFoundError("Required visual asset missing: " + path)
    return absolute

def get_font(size: int, bold=True):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold
        else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold
        else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf"
    ]
    for path in candidates:
        if os.path.isfile(path):
            return ImageFont.truetype(path, size)
    raise RuntimeError("Open-source DejaVu or Liberation fonts required.")

def wrap(draw, text, font, max_width: int, max_lines: int = 6):
    clean = re.sub(r"\s+", " ", str(text or "")).strip()
    output, current = [], ""
    for word in clean.split():
        trial = (current + " " + word).strip()
        if draw.textbbox((0, 0), trial, font=font)[2] <= max_width:
            current = trial
        else:
            if current: output.append(current)
            current = word
    if current: output.append(current)
    if len(output) > max_lines:
        output = output[:max_lines]
        output[-1] = output[-1].rstrip(" .") + "…"
    return output

def render_frame(clip: Clip, size: tuple[int,int], out: pathlib.Path, preview: bool):
    """Create one copyright-labelled, voice-led image with readable type."""
    w,h=size
    if clip.media_type == "image":
        original = Image.open(clip.asset).convert("RGB")
        # Fill with an intentionally blurred edge-to-edge background, without
        # turning an image into a misleading full-screen fight photograph.
        bg=ImageOps.fit(original, size, method=Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(24))
        central=ImageOps.contain(original, (int(w*.95),int(h*.89)), method=Image.Resampling.LANCZOS)
        x=(w-central.width)//2
        y=(h-central.height)//2
        bg.paste(central,(x,y))
        frame=bg
    else:
        frame=Image.new("RGBA",size,(0,0,0,0))
    d=ImageDraw.Draw(frame,"RGBA")
    # Deep gradient for legibility; keep important moving footage visible.
    dark_y=int(h*.56)
    for y in range(dark_y,h):
        a=int(242*min(1,(y-dark_y)/max(1,h-dark_y)*1.3))
        d.line([(0,y),(w,y)],fill=(6,10,16,a))
    band=max(5,round(w*.008))
    d.rectangle((0,0,w,band),fill=GOLD+(255,))
    pad=int(w*.058)
    d.rounded_rectangle((pad,int(h*.055),pad+int(w*.68),int(h*.055)+int(h*.055)),radius=7,fill=(7,14,22,208))
    d.text((pad+int(w*.018),int(h*.067)),"AURA  /  FIGHT LAB",font=get_font(max(17,int(w*.032))),fill=WHITE+(255,))
    label=clip.label.upper()[:42]
    d.text((pad,int(h*.61)),label,font=get_font(max(16,int(w*.029))),fill=GOLD+(255,))
    heading=get_font(max(38,int(w*(.070 if h>w else .049))))
    top=int(h*.675)
    for line in wrap(d,clip.title.upper(),heading,w-pad*2,4):
        d.text((pad,top),line,font=heading,fill=WHITE+(255,),stroke_width=1,stroke_fill=(9,11,14,255))
        top+=int(heading.size*1.17)
    deck_font=get_font(max(19,int(w*.031)),False)
    if top<int(h*.89):
        for line in wrap(d,clip.deck,deck_font,w-pad*2,3):
            d.text((pad,top+int(h*.018)),line,font=deck_font,fill=(235,231,215,255))
            top+=int(deck_font.size*1.26)
    if clip.illustrative:
        d.text((pad,int(h*.94)),"ILLUSTRATIVE VISUAL — NOT FIGHT FOOTAGE",
               font=get_font(max(12,int(w*.018))),fill=(232,215,180,255))
    if clip.attribution:
        d.text((pad,int(h*.965)),clip.attribution[:110],
               font=get_font(max(11,int(w*.015)),False),fill=(207,216,219,255))
    if preview:
        d.rounded_rectangle((int(w*.62),int(h*.12),int(w*.95),int(h*.17)),radius=6,fill=(80,23,16,207))
        d.text((int(w*.64),int(h*.13)),"VOICEOVER NEEDED",font=get_font(max(11,int(w*.020))),fill=WHITE+(255,))
    if clip.media_type=="video": frame.save(out.with_suffix(".png"),"PNG",optimize=True)
    else: frame.save(out,"JPEG",quality=88,optimize=True)

def load_project(project_path: pathlib.Path) -> dict:
    p=json.loads(project_path.read_text(encoding="utf-8"))
    if not VALID_ID.fullmatch(str(p.get("id",""))):
        raise ValueError("A project must have a safe, lower-case ID.")
    if not p.get("sourceArticle") or not str(p["sourceArticle"]).startswith("https://www.aurafightclub.com/news/"):
        raise ValueError("A reviewed AURA article URL is required.")
    assets=p.get("assets",{})
    if not isinstance(assets,dict) or not assets:
        raise ValueError("Approved visual assets are required.")
    for key, v in assets.items():
        if not isinstance(v,dict) or not v.get("approved") or v.get("licence") in (None,"","unknown"):
            raise ValueError("Every visual must have review approval and an explicit licence: "+key)
        local=file_in_repo(v.get("path",""))
        if local.suffix.lower() not in VALID_VIDEO|VALID_IMAGE:
            raise ValueError("Unsupported visual media format: "+key)
        if local.suffix.lower() in VALID_VIDEO and not v.get("originalOrLicensedForVideo"):
            raise ValueError("Video footage requires an explicit rights clearance: "+key)
    for name in ("short","youtube"):
        if not isinstance(p.get(name),dict) or len(p[name].get("beats",[])) < 3:
            raise ValueError("Each format must have at least three approved shots: "+name)
        for beat in p[name]["beats"]:
            if beat.get("asset") not in assets:
                raise ValueError("Unregistered visual in "+name+": "+str(beat.get("asset")))
            if not beat.get("headline"):
                raise ValueError("Every scene needs an on-screen editorial headline.")
    return p

def plan(project:dict, name:str, duration:float) -> list[Clip]:
    beats=project[name]["beats"]
    limit=4.2 if name=="short" else 5.4
    visual=project["assets"]
    # Rotate through approved beats frequently to avoid static poster videos.
    # Allocate each beat weighted screen time, then cut into short shots.
    total_weight=sum(max(0.1,float(b.get("weight",1))) for b in beats)
    result=[]
    for beat in beats:
        allocated=duration*max(0.1,float(beat.get("weight",1)))/total_weight
        n=max(1,math.ceil(allocated/limit))
        asset_info=visual[beat["asset"]]
        for i in range(n):
            local=file_in_repo(asset_info["path"])
            result.append(Clip(
                asset=local,duration=allocated/n,title=beat["headline"],
                deck=beat.get("deck",""),label=beat.get("label","THE FIGHT LAB"),
                media_type="video" if local.suffix.lower() in VALID_VIDEO else "image",
                attribution=asset_info.get("attribution",""),
                illustrative=bool(asset_info.get("illustrative",True))
            ))
    return result

def render(project:dict,name:str,voiceover:pathlib.Path|None,outdir:pathlib.Path,
           max_seconds:float|None=None,size_override:tuple[int,int]|None=None):
    if voiceover and not voiceover.is_file(): raise FileNotFoundError(str(voiceover))
    duration=ffprobe_duration(voiceover) if voiceover else float(project[name].get("previewSeconds",24 if name=="short" else 100))
    if max_seconds: duration=min(duration,max_seconds)
    if duration < 3.0: raise ValueError("Recording must be at least 3 seconds.")
    if name=="short" and duration>90: raise ValueError("Short clip narration is too long (>90s).")
    if name=="youtube" and duration>3600: raise ValueError("YouTube narration exceeds 60 minutes.")
    size=size_override or ((1080,1920) if name=="short" else (1920,1080))
    clips=plan(project,name,duration)
    outdir.mkdir(parents=True,exist_ok=True)
    artifact=outdir / (project["id"]+"-"+name+"-"+("narrated" if voiceover else "preview")+".mp4")
    width,height=size
    fps=24
    with tempfile.TemporaryDirectory(prefix="aura-creator-") as tmp:
        work=pathlib.Path(tmp)
        paths=[]
        for i,clip in enumerate(clips):
            jpg=work/f"shot-{i:03}.jpg"
            segment=work/f"shot-{i:03}.mp4"
            render_frame(clip,size,jpg,preview=voiceover is None)
            frames=max(1,round(clip.duration*fps))
            vf=(f"scale={width}:{height}:flags=bicubic,"
                f"zoompan=z='min(zoom+0.0012,1.16)':"
                f"x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2':"
                f"d={frames}:s={width}x{height}:fps={fps},"
                f"format=yuv420p")
            if clip.media_type=="video":
                vf=(f"scale={width}:{height}:force_original_aspect_ratio=increase,"
                    f"crop={width}:{height},format=yuv420p")
                overlay=jpg.with_suffix(".png")
                cmd=["ffmpeg","-y","-nostdin","-v","error","-stream_loop","-1",
                     "-i",str(clip.asset),"-loop","1","-i",str(overlay),
                     "-t",f"{clip.duration:.4f}",
                     "-filter_complex",f"[0:v]{vf}[bg];[bg][1:v]overlay=0:0:shortest=1,format=yuv420p[out]",
                     "-map","[out]","-an","-r",str(fps),"-c:v","libx264","-preset","veryfast",
                     "-crf","26","-pix_fmt","yuv420p",str(segment)]
            else:
                cmd=["ffmpeg","-y","-nostdin","-v","error","-loop","1","-i",str(jpg),
                     "-frames:v",str(frames),"-vf",vf,
                     "-c:v","libx264","-preset","veryfast","-crf","26",
                     "-pix_fmt","yuv420p",str(segment)]
            subprocess.run(cmd,check=True,timeout=max(90,int(clip.duration*12)))
            paths.append(segment)
        concat=work/"list.txt"
        concat.write_text("".join(f"file '{p.as_posix()}'\n" for p in paths))
        joined=work/"joined.mp4"
        subprocess.run(["ffmpeg","-y","-nostdin","-v","error","-f","concat","-safe","0",
            "-i",str(concat),"-c","copy",str(joined)],check=True,timeout=120)
        # Recordings are optional only for a demonstrator export. No fake voice.
        if voiceover:
            subprocess.run(["ffmpeg","-y","-nostdin","-v","error",
                "-i",str(joined),"-i",str(voiceover),
                "-filter_complex","[1:a]highpass=f=80,lowpass=f=12000,loudnorm=I=-16:TP=-1.5:LRA=11[a]",
                "-map","0:v:0","-map","[a]","-c:v","copy","-c:a","aac","-b:a","160k",
                "-shortest","-movflags","+faststart",str(artifact)],check=True,timeout=120)
        else:
            subprocess.run(["ffmpeg","-y","-nostdin","-v","error",
                "-i",str(joined),"-f","lavfi",
                "-i","anullsrc=channel_layout=stereo:sample_rate=44100",
                "-map","0:v:0","-map","1:a:0","-c:v","copy","-c:a","aac",
                "-b:a","96k","-shortest","-movflags","+faststart",str(artifact)],
                check=True,timeout=120)
    return {"format":name,"file":str(artifact),"durationSeconds":round(duration,2),
            "voiceoverProvided":bool(voiceover),"reviewOnly":True,
            "shotCount":len(clips),"resolution":f"{width}x{height}",
            "clips":[{"duration":round(c.duration,3),"headline":c.title,"asset":c.asset.relative_to(ROOT).as_posix(),
                      "illustrative":c.illustrative} for c in clips]}

def main():
    ap=argparse.ArgumentParser(description="Render voiceover-led boxing videos for editorial review.")
    ap.add_argument("--project",default="creator/projects/dubois-wardley-ii.json")
    ap.add_argument("--format",choices=("short","youtube","both"),default="both")
    ap.add_argument("--voiceover-short",type=pathlib.Path)
    ap.add_argument("--voiceover-youtube",type=pathlib.Path)
    ap.add_argument("--output",type=pathlib.Path,default=ROOT/"creator-exports")
    ap.add_argument("--max-seconds",type=float,help="For fast preview/smoke tests only")
    ap.add_argument("--size-test",action="store_true",help="Use reduced resolution for CI smoke test")
    ap.add_argument("--dry-run",action="store_true",help="Validate project and report shots, without rendering")
    args=ap.parse_args()
    if not args.dry_run and (not shutil.which("ffmpeg") or not shutil.which("ffprobe")):
        raise SystemExit("ffmpeg and ffprobe are required")
    project=load_project(file_in_repo(args.project))
    results=[]
    for name in ("short","youtube") if args.format=="both" else (args.format,):
        voice=args.voiceover_short if name=="short" else args.voiceover_youtube
        if voice: voice=voice.resolve()
        if args.dry_run:
            duration=ffprobe_duration(voice) if voice else project[name].get("previewSeconds",24)
            results.append({"format":name,"duration":duration,"beats":len(project[name]["beats"]),
                            "voiceover":bool(voice),"reviewOnly":True})
        else:
            size=((360,640) if name=="short" else (640,360)) if args.size_test else None
            results.append(render(project,name,voice,args.output,args.max_seconds,size))
    args.output.mkdir(parents=True,exist_ok=True)
    manifest={"project":project["id"],"article":project["sourceArticle"],
        "publishing":"manual_review_only","youtubeAutomaticUpload":False,
        "tiktokAutomaticUpload":False,
        "notice":"These exports do not certify rights for unapproved broadcaster footage.",
        "outputs":results}
    (args.output/"review-manifest.json").write_text(json.dumps(manifest,indent=2)+"\n")
    print(json.dumps(manifest,indent=2))

if __name__=="__main__":
    main()
