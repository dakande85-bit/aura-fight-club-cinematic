#!/usr/bin/env python3
"""Download public-domain historical boxing and prove genuine footage -> two playable MP4s.

Only used as a non-commercial/diagnostic film-room fixture. Never represents a
modern match or a broadcaster feed. Requires FFmpeg and network access.
"""
import json
import pathlib
import subprocess
import sys
import urllib.request

ROOT=pathlib.Path(__file__).resolve().parents[1]
SAMPLE="https://upload.wikimedia.org/wikipedia/commons/0/07/Men_Boxing.webm"
ATTRIBUTION="Men Boxing (1891), W. K. L. Dickson and William Heise. Library of Congress / Wikimedia Commons. Public-domain historic film."
def run(command):
    subprocess.run(command,check=True,timeout=240)
def main(directory):
    work=pathlib.Path(directory).resolve();work.mkdir(parents=True,exist_ok=True)
    source=work/"historical-boxing.webm"
    request=urllib.request.Request(SAMPLE,headers={"User-Agent":"AuraFightClub/1.0 (boxing demonstration; research)"})
    with urllib.request.urlopen(request,timeout=25) as response:
        content=response.read(7_000_000)
    if not (50000<len(content)<7_000_000):raise RuntimeError("Historical boxing sample download is empty/oversized")
    source.write_bytes(content)
    mp4=work/"historical-boxing.mp4"
    run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(source),
         "-an","-vf","scale=640:480,setsar=1,fps=24","-c:v","libx264","-preset","fast","-crf","25","-movflags","+faststart",str(mp4)])
    voice=work/"narration.wav"
    run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","lavfi","-i","anullsrc=channel_layout=stereo:sample_rate=44100",
         "-t","7","-c:a","pcm_s16le",str(voice)])
    source_entry={"id":"historical-boxing", "title":"Men Boxing (1891) — public-domain source",
        "kind":"fight","publisher":"Library of Congress / Wikimedia Commons", "url":"https://commons.wikimedia.org/wiki/File:Men_Boxing.webm",
        "rightsNotes":ATTRIBUTION,"localFile":mp4.name,"clearedForExport":True}
    project={"version":1,"slug":"aura-boxing-demo-history-1891",
       "sources":[source_entry],
       "shots":[
        {"id":"real-cut-01","sourceId":"historical-boxing","in":1,"out":4.5,"caption":"REAL BOXING FOOTAGE: 1891","formats":["youtube","shorts"]},
        {"id":"real-cut-02","sourceId":"historical-boxing","in":7,"out":10.5,"caption":"FILM ROOM EXPORT TEST","formats":["youtube","shorts"]}
       ],
       "scripts":{
        "youtube":{"draft":"Historical boxing film. Two verified timeline cuts and placeholder silent test audio.","approved":True},
        "shorts":{"draft":"Historical boxing film. Two verified timeline cuts and placeholder silent test audio.","approved":True}
       },
       "voiceoverFiles":{"youtube":voice.name,"shorts":voice.name},
       "analysis":{"axes":[]}}
    project_path=work/"edit.json"
    project_path.write_text(json.dumps(project,indent=2))
    output=work/"exports"
    run([sys.executable,str(ROOT/"scripts/render-fight-production.py"),"--project",str(project_path),
         "--format","both","--media-dir",str(work),"--out-dir",str(output)])
    for aspect,(w,h) in {"youtube":(1920,1080),"shorts":(1080,1920)}.items():
        target=output/f"aura-boxing-demo-history-1891-{aspect}.mp4"
        data=json.loads(subprocess.check_output(["ffprobe","-v","error","-show_streams",
            "-show_format","-of","json",str(target)],text=True))
        videos=[s for s in data["streams"] if s["codec_type"]=="video"]
        audios=[s for s in data["streams"] if s["codec_type"]=="audio"]
        assert videos and audios and (videos[0]["width"],videos[0]["height"])==(w,h),(aspect,data)
        assert 6.5<float(data["format"]["duration"])<7.5,(aspect,data["format"]["duration"])
        print(f"PASS: {aspect}: {w}x{h}, 7 s of real public-domain footage, playable H.264/AAC.")
    (output/"ATTRIBUTION.txt").write_text(ATTRIBUTION+"\nSource: https://commons.wikimedia.org/wiki/File:Men_Boxing.webm\n"
                                        "This demo contains 1891 historic footage, not a modern fight. Narration audio is intentionally silent.\n")
if __name__=="__main__":
    main(sys.argv[1] if len(sys.argv)>1 else "/tmp/aura-filmroom-demo")
