#!/usr/bin/env python3
"""Find probable cut windows in a transcript of authorised, locally held footage.

Not a boxing-action detector: matches commentary phrases, not visual ground truth.
All suggestions require a human to view the real sequence, set proper boundaries
and confirm that spoken narration accurately describes the pictures.
"""
import argparse
import json
import pathlib
import re

KEYWORDS={
    "stoppage":("stoppage","referee","stopped","technical knockout","tko","knockout","finish"),
    "knockdown":("knockdown","knocked down","on the canvas","goes down","dropped"),
    "jab and range":("jab","distance","range","lead hand","double jab"),
    "counter and defence":("counter","slip","guard","blocked","missed","duck","roll"),
    "pressure and pace":("pressure","pace","fatigue","late round","aggression"),
    "body work":("body shot","liver shot","hook to the body","body punch"),
    "interview and weigh-in":("press conference","face off","weigh in","interview"),
}
def propose(transcript,source_id,max_candidates=14):
    entries=transcript.get("segments") if isinstance(transcript,dict) else transcript
    if not isinstance(entries,list):raise ValueError("Transcript must contain a list of timecoded segments")
    proposals=[]
    for i,segment in enumerate(entries):
        try: start=float(segment["start"]);end=float(segment["end"])
        except (ValueError,TypeError,KeyError):continue
        text=str(segment.get("text") or "").strip()
        if not (0<=start<end and text):continue
        l=text.lower()
        matches=[category for category,words in KEYWORDS.items() if any(re.search(r"\b"+re.escape(phrase)+r"\b",l) for phrase in words)]
        if not matches:continue
        # A transcript mention can refer to past events; it is NOT verified visual action.
        midpoint=(start+end)/2
        a=max(0,round(midpoint-3,2));b=round(midpoint+4,2)
        if b-a>10:b=a+10
        value=sum({"stoppage":6,"knockdown":6,"jab and range":3,"counter and defence":4,
                   "pressure and pace":2,"body work":4,"interview and weigh-in":2}.get(t,1) for t in matches)
        proposals.append({"id":f"candidate-{source_id}-{i}","sourceId":source_id,
          "in":a,"out":b,"purpose":"Transcript lead: "+", ".join(matches),
          "caption":"","narration":"","formats":["youtube","shorts"],"score":value,
          "reviewStatus":"visual_verification_required","transcriptEvidence":text[:220]})
    proposals.sort(key=lambda x:(-x["score"],x["in"]))
    picked=[]
    for entry in proposals:
        if all(not (entry["sourceId"]==v["sourceId"] and abs(entry["in"]-v["in"])<7) for v in picked):
            picked.append(entry)
        if len(picked)>=max_candidates:break
    return sorted(picked,key=lambda x:x["in"])

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--transcript",required=True,help="Timecoded Whisper-style JSON of genuine source")
    parser.add_argument("--source-id",required=True,help="Registered source id in the edit project")
    parser.add_argument("--project",required=True)
    parser.add_argument("--out",required=True)
    args=parser.parse_args()
    project=json.loads(pathlib.Path(args.project).read_text())
    if args.source_id not in {x.get("id") for x in project.get("sources",[])}:
        raise SystemExit("Not a registered film source: "+args.source_id)
    transcript=json.loads(pathlib.Path(args.transcript).read_text())
    suggestions=propose(transcript,args.source_id)
    result={"version":1,"fightId":project.get("fightId"),"suggestedCuts":suggestions,
       "warning":"Transcript-only candidates are NOT verified moments. Check visual footage and its reuse basis before approving.",
       "approved":False}
    pathlib.Path(args.out).write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n")
    print("Prepared",len(suggestions),"review-required candidate cuts; no actual media downloaded or clips extracted.")

if __name__=="__main__":main()
