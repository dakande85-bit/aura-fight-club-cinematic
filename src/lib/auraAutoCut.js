// Real-footage-only, device-local rough-cut planning.
// Footage and timestamps must be visually checked before an analysis is approved.

export const seconds = n => Math.max(0,Number(n)||0);
const ACTION = /punch|counter|jab|hook|right hand|body|knock|stoppage|pressure|guard|distance|defen|power|hurt|recover|range|round|fight|ring|boxing|clip/i;
const PRESS = /interview|said|says|promise|admit|trainer|coach|press|conference|remark|comment|quote|spoke|react/i;
const FACE = /face.off|stare|weigh.in|fight week|look each other|eye.to.eye|event|tomorrow/i;
export function splitNarration(script, format='shorts') {
  const text=String(script||'').replace(/\s+/g,' ').trim();
  if(!text)return [];
  const sentences=text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[text];
  const parts=[];let line='';
  const maxWords=format==='shorts'?21:30;
  for(const sentence of sentences){
    const words=sentence.trim().split(/\s+/);
    if(line&&line.split(/\s+/).length+words.length>maxWords){parts.push(line);line='';}
    if(words.length<=maxWords){line=(line+' '+sentence.trim()).trim();continue;}
    for(let i=0;i<words.length;i+=maxWords){if(line){parts.push(line);line='';}parts.push(words.slice(i,i+maxWords).join(' '));}
  }
  if(line)parts.push(line);
  return parts.map((narration,index)=>({
    id:'narration-'+index, narration,
    role:FACE.test(narration)?'faceoff':PRESS.test(narration)?'press':ACTION.test(narration)?'fight':'broll',
    duration:Math.max(3,Math.min(11,narration.trim().split(/\s+/).length/2.6))
  }));
}
export function chooseAsset(assets,role,index){
  const ready=assets.filter(a=>a?.file && Number(a.duration)>0);
  if(!ready.length)return null;
  const preferred=ready.filter(a=>a.kind===role || (role==='broll'&&a.kind!=='fight'));
  const pool=preferred.length?preferred:ready;
  return pool[index%pool.length];
}
export function planCuts({script,format='shorts',assets=[]}){
 const beats=splitNarration(script,format);
 const max=format==='shorts'?60:480;
 let used=0;
 const cuts=[];
 for(let i=0;i<beats.length;i++){
   const beat=beats[i],asset=chooseAsset(assets,beat.role,i);
   if(used>=max)break;
   const available=asset && Number.isFinite(asset.duration) ? Math.max(0,asset.duration-0.05) : Infinity;
   const amount=Math.min(Math.max(0,Math.round((max-used)*10)/10),Math.round(beat.duration*10)/10,Math.floor(available*10)/10);
   if(amount<0.2){if(!asset)break;continue;}
   let start=0;
   if(asset){
    const peaks=(asset.peaks||[]).filter(p=>Number.isFinite(p.time)&&p.time>=0&&p.time<asset.duration-amount);
    const pick=peaks.length?peaks[(i+Math.floor(i/3))%peaks.length]:null;
    // Without reviewed timestamps these are MOTION CANDIDATES, not verified punches.
    start=pick?Math.max(0,Math.min(asset.duration-amount,pick.time-amount/2)):
      Math.max(0,Math.min(asset.duration-amount,4+(i*8)%(Math.max(1,asset.duration-amount))));
   }
   cuts.push({id:'cut-'+i,assetId:asset?.id||null,sourceId:asset?.sourceId||null,
     start:Math.round(start*10)/10,duration:Math.round(amount*10)/10,
     caption:'',narration:beat.narration,role:beat.role,
     reviewStatus:'suggested_not_verified',usedFallback:!asset});
   used=Math.round((used+amount)*10)/10;
 }
 return cuts;
}
function waitFor(video, name,timeout=9000){
 return new Promise((resolve,reject)=>{
  const tid=setTimeout(()=>{cleanup();reject(new Error('Video '+name+' timed out'));},timeout);
  function cleanup(){clearTimeout(tid);video.removeEventListener(name,done);video.removeEventListener('error',fail);}
  function done(){cleanup();resolve();}
  function fail(){cleanup();reject(new Error('Cannot read this video file'));}
  video.addEventListener(name,done,{once:true});video.addEventListener('error',fail,{once:true});
 });
}
async function seek(video,time){
 const pos=Math.max(0,Math.min(video.duration-0.05,time));
 if(Math.abs(video.currentTime-pos)<0.025 && video.readyState>=2)return;
 const done=waitFor(video,'seeked');
 video.currentTime=pos;await done;
}
function snapshot(canvas,ctx,video){
 ctx.drawImage(video,0,0,canvas.width,canvas.height);
 const image=ctx.getImageData(0,0,canvas.width,canvas.height).data;
 const ys=[];for(let p=0;p<image.length;p+=16){ys.push((image[p]*3+image[p+1]*6+image[p+2])/10);}
 return ys;
}
export async function scanActionPeaks(file,{onProgress,signal}={}){
 // Motion heuristic detects visual changes, NOT knockdowns, tactics, or an event result.
 const url=URL.createObjectURL(file);
 const video=document.createElement('video');
 video.muted=true;video.preload='metadata';video.playsInline=true;
 try{
  // Attach event listeners before assigning src; otherwise a cached iOS MP4
  // can signal loadedmetadata before the listener exists.
  const pending=waitFor(video,'loadedmetadata',12000);
  video.src=url;video.load();
  await pending;
  const duration=video.duration;
  if(!Number.isFinite(duration)||duration<=0)throw Error('Unable to read video duration');
  const canvas=document.createElement('canvas');canvas.width=88;canvas.height=50;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  const spots=Array.from({length:Math.min(56,Math.max(5,Math.floor(duration/4)))},(_,i)=>4+i*(Math.max(1,duration-8)/Math.max(1,Math.min(56,Math.max(5,Math.floor(duration/4)))-1)));
  let peaks=[];
  for(let i=0;i<spots.length;i++){
   if(signal?.aborted)throw Error('Analysis cancelled');
   const t=Math.min(duration-0.7,spots[i]);if(t<0)continue;
   await seek(video,t);const first=snapshot(canvas,ctx,video);
   await seek(video,t+0.28);const after=snapshot(canvas,ctx,video);
   let motion=0;for(let p=0;p<first.length;p++){motion+=Math.abs(first[p]-after[p]);}
   peaks.push({time:t,score:motion/first.length});
   onProgress?.(Math.round((i+1)/spots.length*100));
  }
  peaks.sort((a,b)=>b.score-a.score);
  const diverse=[];
  for(const entry of peaks){
   if(diverse.every(p=>Math.abs(p.time-entry.time)>4))diverse.push(entry);
   if(diverse.length>=35)break;
  }
  return {duration,peaks:diverse};
 }finally{video.removeAttribute('src');video.load();URL.revokeObjectURL(url);}
}
