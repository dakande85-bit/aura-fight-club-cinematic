// Automatically break a narration script into timed, editorially useful visual beats.
// This plans a rough cut; without actual licensed source files no MP4 exists.
const PATTERNS=[
 {kind:'weighin',label:'Weigh-in / face-off',pattern:/weigh.?in|scales|stare|face.?off|face to face|weight/i},
 {kind:'press',label:'Press conference / interviews',pattern:/\\bpress(?: conference)?\\b|interview|said|spoke|coach|trainer|promoter|claim|announce/i},
 {kind:'training',label:'Training / preparation',pattern:/training|camp|gym|sparring|conditioning|practice/i},
 {kind:'fight',label:'Actual fight action required',pattern:/fight|exchange|jab|hook|knock|counter|right hand|punch|round|guard|pressure|defen|footwork/i}
];
const words=str=>String(str||'').trim().split(/\s+/).filter(Boolean);
export function roleForText(text){
 return PATTERNS.find(x=>x.pattern.test(text))?.kind||'training';
}
export function roleLabel(role){
 return PATTERNS.find(x=>x.kind===role)?.label||'Boxing footage';
}
export function buildNarrationShots(script){
 const text=String(script||'').replace(/\s+/g,' ').trim();
 const pieces=text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[];
 const sceneTexts=[];let current=[];
 for(const sentence of pieces){
  const items=words(sentence);
  if(current.length&&words(current.join(' ')).length+items.length>18){sceneTexts.push(current.join(' '));current=[];}
  if(items.length>23){
   for(let i=0;i<items.length;i+=15){if(current.length){sceneTexts.push(current.join(' '));current=[];}sceneTexts.push(items.slice(i,i+15).join(' '));}
  }else{current.push(sentence.trim());}
 }
 if(current.length)sceneTexts.push(current.join(' '));
 let elapsed=0;
 return sceneTexts.map((line,i)=>{
  const duration=Math.max(2.5,words(line).length/140*60);
  const shot={id:'scene-'+(i+1),scene:i+1,start:Math.round(elapsed*10)/10,
    end:Math.round((elapsed+duration)*10)/10,seconds:Math.round(duration*10)/10,
    kind:roleForText(line),label:roleLabel(roleForText(line)),narration:line,
    mediaReady:false,rightsStatus:'requires_licensed_video'};
  elapsed+=duration;return shot;
 });
}
export function minutesForShots(shots){return Math.round(shots.reduce((n,s)=>n+s.seconds,0)/6)/10;}
export function storyboardCoverage(shots,media){
 const allowed=(media||[]).filter(x=>x.clearedForExport===true);
 return {scenes:shots.length,
  estimatedMinutes:minutesForShots(shots),
  licensedVideoCount:allowed.length,
  sourceClasses:[...new Set(shots.map(x=>x.kind))],
  actualFighterFootage:allowed.filter(x=>x.namedFighterVerified).length,
  requiresLicensing:allowed.length===0,
  coveredScenes:shots.filter(s=>allowed.some(x=>x.kind===s.kind)).length};
}
