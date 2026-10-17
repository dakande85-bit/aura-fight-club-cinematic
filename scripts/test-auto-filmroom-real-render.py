#!/usr/bin/env python3
"""Real FFmpeg integration acceptance test of Aura Film Room.

Uses the project's known public-domain historical boxing test clip plus 2 *synthetic*
source videos made in the CI runner. The sources are only test fixtures; this
is NOT a real Dubois/Wardley highlight compilation or an approval to publish.
"""
from __future__ import annotations
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile

ROOT=Path(__file__).resolve().parents[1]
FFMPEG="ffmpeg"
FFPROBE="ffprobe"
spec=importlib.util.spec_from_file_location("aura_auto_video",ROOT/"scripts/auto-filmroom-producer.py")
engine=importlib.util.module_from_spec(spec)
spec.loader.exec_module(engine)

def run(command,timeout=110):
    subprocess.run(command,check=True,timeout=timeout)

def duration(path):
    return float(subprocess.check_output([FFPROBE,"-v","error","-show_entries","format=duration",
        "-of","default=noprint_wrappers=1:nokey=1",str(path)],text=True).strip())

def main():
    out=Path(sys.argv[1] if len(sys.argv)>1 else "/tmp/aura-auto-film-e2e").resolve()
    out.mkdir(parents=True,exist_ok=True)
    input_dir=out/"source-fixtures";input_dir.mkdir(exist_ok=True)
    boxing=ROOT/"public/demos/boxing-1891-test.mp4"
    if not boxing.is_file():raise AssertionError("Real 1891 public-domain boxing demo missing")
    import shutil
    shutil.copyfile(boxing,input_dir/"boxing-1891.mp4")
    assert duration(input_dir/"boxing-1891.mp4")>9,"Historical video must be a genuine playable source"

    # 2 new, explicitly synthetic motion fixtures. Not labelled as real fight action.
    for i in (1,2):
        path=input_dir/f"synthetic-{i}.mp4"
        run([FFMPEG,"-nostdin","-hide_banner","-loglevel","error","-y",
             "-f","lavfi","-i",f"testsrc2=size=320x180:rate=12:duration=20",
             "-vf",f"hue=h={i*70}","-c:v","libx264","-preset","ultrafast",
             "-crf","30","-pix_fmt","yuv420p","-an",str(path)])

    script=(
        "Wardley probes with the jab and tries to win the range in the first exchange. "
        "The old boxing footage is historic archival illustration rather than either modern fighter. "
        "Training footage and press conference coverage support analysis but do not prove a specific punch landed. "
        "A counter right hand becomes dangerous when the front foot is planted and the head stays on the centre line. "
        "We need actual fight video with permission before making the final sporting judgement. "
    )
    beats=engine.narrative_beats(script)
    assert 5<=len(beats)<=10
    sources=[
      dict(id="historical-1891",provider="owner",localFile="boxing-1891.mp4",
           kind="fight",duration=duration(input_dir/"boxing-1891.mp4"),displayName="Historical boxing public-domain test",
           illustrative=True,rightsStatus="cleared",licenseProof="Wikimedia public-domain educational sample",
           namedFighterVerified=False),
      dict(id="test-pattern-training",provider="owner",localFile="synthetic-1.mp4",
           kind="training",duration=duration(input_dir/"synthetic-1.mp4"),displayName="Synthetic testing pattern",
           illustrative=True,rightsStatus="cleared",licenseProof="Runner-generated synthetic video",
           namedFighterVerified=False),
      dict(id="test-pattern-press",provider="owner",localFile="synthetic-2.mp4",
           kind="press",duration=duration(input_dir/"synthetic-2.mp4"),displayName="Synthetic testing pattern",
           illustrative=True,rightsStatus="cleared",licenseProof="Runner-generated synthetic video",
           namedFighterVerified=False)
    ]
    assert all(engine.allowed_source(x) for x in sources)
    edits=engine.assign(beats,sources)
    assert len(edits)==len(beats)
    assert len(set(x["assetId"] for x in edits))>=2
    assert all(x["illustrative"] and x["actualFighterFootage"] is False for x in edits)
    total=sum(x["shotSeconds"] for x in edits)
    assert 18<=total<=44,total

    movie=out/"roughcut-youtube.mp4"
    engine.render(edits,sources,input_dir,movie)
    assert movie.is_file() and movie.stat().st_size>20000
    actual=duration(movie)
    assert abs(actual-total)<2.5,(actual,total)
    stream=json.loads(subprocess.check_output([FFPROBE,"-v","error","-show_streams","-of","json",str(movie)]))
    assert any(x["codec_name"]=="h264" and x["codec_type"]=="video" for x in stream["streams"])
    clips=list((out/"editable-clips").glob("scene-*.mp4"))
    assert len(clips)==len(edits)
    assert all(duration(x)>1 and x.stat().st_size>1000 for x in clips)

    manifest={
      "status":"technical_integration_pass",
      "explicitlySynthetic":True,
      "actualFightFootage":False,
      "note":"Machine acceptance test only. One 1891 public-domain source plus two synthetic fixtures; not Dubois/Wardley footage.",
      "renderSeconds":round(actual,2),"plannedSeconds":round(total,2),
      "sceneCount":len(clips),"codec":"h264",
      "sourceIds":list(dict.fromkeys(x["assetId"] for x in edits)),
      "shots":edits
    }
    (out/"technical-result.json").write_text(json.dumps(manifest,indent=2)+"\n")
    print(json.dumps({k:v for k,v in manifest.items() if k!="shots"},indent=2))
    print("AUTO FILM REAL FFMPEG INTEGRATION: PASS")

if __name__=="__main__":main()
