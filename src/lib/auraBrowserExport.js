// Browser-only real-footage exporter. Small previews are deliberately lightweight.
// Any failed render returns the exact failed stage + FFmpeg diagnostic lines.
import {FFmpeg} from '@ffmpeg/ffmpeg';
import {toBlobURL,fetchFile} from '@ffmpeg/util';
import {checkExport,videoFilter} from './auraExportProfile.js';

let enginePromise=null;
let engine=null;
const recentLogs=[];
const CORE_BASE='https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';

function diagnosticText(){
 return recentLogs.slice(-9).join('\n').slice(-1600);
}
function fail(stage,detail=''){
 const explanation=(detail||diagnosticText()||'The browser video engine stopped unexpectedly.').trim();
 return new Error(stage+': '+explanation);
}
async function getEngine(onStatus){
 if(!enginePromise){
  enginePromise=(async()=>{
   onStatus?.('Loading the video renderer (first use downloads about 31 MB)…');
   const ffmpeg=new FFmpeg();
   ffmpeg.on('log',({message})=>{
    if(message){recentLogs.push(String(message));if(recentLogs.length>60)recentLogs.shift();}
   });
   try{
    await ffmpeg.load({
      coreURL:await toBlobURL(CORE_BASE+'/ffmpeg-core.js','text/javascript'),
      wasmURL:await toBlobURL(CORE_BASE+'/ffmpeg-core.wasm','application/wasm')
    });
   }catch(error){
    try{ffmpeg.terminate();}catch{}
    throw fail('Renderer could not initialise',String(error?.message||error));
   }
   engine=ffmpeg;
   return ffmpeg;
  })().catch(e=>{enginePromise=null;engine=null;throw e;});
 }
 return enginePromise;
}
function resetEngine(){
 if(engine){try{engine.terminate();}catch{}}
 engine=null;enginePromise=null;
}
async function run(ffmpeg,args,stage){
 recentLogs.length=0;
 let exit;
 try{exit=await ffmpeg.exec(args,300000);}
 catch(error){throw fail(stage,String(error?.message||error));}
 if(exit!==0)throw fail(stage,'FFmpeg returned code '+exit+'. '+diagnosticText());
}
function suffix(file){
 const name=file.name||'';
 const extension=name.split('.').pop()?.toLowerCase()||'';
 if(['mp4','m4v','mov','webm','mkv','avi'].includes(extension))return extension;
 return file.type?.includes('webm')?'webm':'mp4';
}
function audioSuffix(file){
 const name=file.name||'';
 const extension=name.split('.').pop()?.toLowerCase()||'';
 if(['mp3','m4a','wav','ogg','opus','webm','aac','mp4'].includes(extension))return extension;
 return file.type?.includes('webm')?'webm':'m4a';
}
export async function exportAutoVideo({cuts,assets,format='shorts',voiceFile,onStatus}){
 const agent=typeof navigator!=='undefined'?navigator.userAgent:'';
 const profile=checkExport(cuts,assets,format,agent);
 const ffmpeg=await getEngine(onStatus);
 const nonce='aura-'+Date.now().toString(36);
 const temporary=[];
 const seen=new Map();
 const add=(name)=>{temporary.push(name);return name;};
 const sources=new Map(assets.map(a=>[a.id,a]));
 onStatus?.('Preparing '+cuts.length+' cuts for a '+profile.width+' × '+profile.height+' '+format+' export…');
 try{
  for(const cut of cuts){
   if(seen.has(cut.assetId))continue;
   const source=sources.get(cut.assetId);
   const input=add(nonce+'-source-'+seen.size+'.'+suffix(source.file));
   onStatus?.('Loading footage: '+source.title);
   await ffmpeg.writeFile(input,await fetchFile(source.file));
   seen.set(cut.assetId,input);
  }
  const clips=[];
  for(let i=0;i<cuts.length;i++){
   const cut=cuts[i],target=add(nonce+'-shot-'+String(i).padStart(3,'0')+'.mp4');
   onStatus?.('Encoding cut '+(i+1)+'/'+cuts.length+' at '+profile.width+' × '+profile.height+'…');
   await run(ffmpeg,[
    '-ss',Number(cut.start).toFixed(2),'-i',seen.get(cut.assetId),
    '-t',Number(cut.duration).toFixed(2),
    '-vf',videoFilter(profile),'-an',
    '-c:v','libx264','-preset','ultrafast','-crf',profile.mobile?'34':'31',
    '-threads','1','-r',String(profile.fps),'-pix_fmt','yuv420p','-y',target
   ],'Video encoding failed on cut '+(i+1));
   clips.push(target);
  }
  const list=add(nonce+'-cuts.txt');
  await ffmpeg.writeFile(list,new TextEncoder().encode(
   clips.map(file=>"file '"+file+"'").join('\n')+'\n'));
  const joined=add(nonce+'-joined.mp4');
  onStatus?.('Joining '+clips.length+' real-footage cuts…');
  await run(ffmpeg,['-f','concat','-safe','0','-i',list,
    '-c','copy','-movflags','+faststart','-y',joined],'Joining video clips failed');
  if(!voiceFile){
   const bytes=await ffmpeg.readFile(joined);
   if(bytes.byteLength<5000)throw fail('Export produced an empty video');
   onStatus?.('Silent MP4 ready. You can record narration and export again.');
   return new Blob([bytes.slice().buffer],{type:'video/mp4'});
  }
  const audioName=add(nonce+'-narration.'+audioSuffix(voiceFile));
  onStatus?.('Adding your recorded narration…');
  await ffmpeg.writeFile(audioName,await fetchFile(voiceFile));
  const output=add(nonce+'-narrated.mp4');
  await run(ffmpeg,[
   '-i',joined,'-i',audioName,
   '-map','0:v:0','-map','1:a:0','-c:v','copy',
   '-c:a','aac','-b:a','128k','-af','aresample=async=1,apad',
   '-t',String(profile.seconds),'-movflags','+faststart','-y',output
  ],'Narration mix failed');
  const bytes=await ffmpeg.readFile(output);
  if(bytes.byteLength<5000)throw fail('Export produced an empty video');
  onStatus?.('Finished MP4 ready, with your voiceover.');
  return new Blob([bytes.slice().buffer],{type:'video/mp4'});
 }catch(error){
  // A failed FFmpeg job can leave its WASM worker in an unusable state.
  resetEngine();
  throw error;
 }finally{
  if(engine===ffmpeg){
   for(const file of temporary){try{await ffmpeg.deleteFile(file);}catch{}}
  }
 }
}
