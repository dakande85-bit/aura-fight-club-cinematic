// In-browser FFmpeg MP4 exporter for rights-cleared local footage.
// Uses no server uploads; loads FFmpeg WASM lazily only after the user clicks Export.
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

let enginePromise;
const CORE_BASE='https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd';

async function getEngine(onStatus){
 if(!enginePromise){
  enginePromise=(async()=>{
   onStatus?.('Loading the video engine for the first time (about 30 MB)…');
   const ffmpeg=new FFmpeg();
   await ffmpeg.load({
    coreURL:await toBlobURL(CORE_BASE+'/ffmpeg-core.js','text/javascript'),
    wasmURL:await toBlobURL(CORE_BASE+'/ffmpeg-core.wasm','application/wasm'),
   });
   return ffmpeg;
  })().catch(err=>{enginePromise=null;throw err;});
 }
 return enginePromise;
}
const encoding=(channel)=>{
 // Reduced resolution fits a wider range of mobile devices; server jobs can do full 1080p.
 if(channel==='shorts')return {w:720,h:1280};
 return {w:1280,h:720};
};
const fitVF=(channel)=>{
 const {w,h}=encoding(channel);
 if(channel==='shorts')return `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1,fps=24`;
 return `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1,fps=24`;
};
const mustBeFile=file=>{
 if(!(file instanceof File || file instanceof Blob))throw Error('Attach actual, reusable source video files first.');
 return file;
};
export async function exportAutoVideo({cuts,assets,format='shorts',voiceFile,onStatus}){
 if(!['shorts','youtube'].includes(format))throw Error('Choose YouTube or Shorts output.');
 if(!Array.isArray(cuts)||!cuts.length)throw Error('There are no assembled shots on the timeline.');
 const lookup=Object.fromEntries(assets.map(a=>[a.id,a]));
 for(const cut of cuts){
  const asset=lookup[cut.assetId];
  if(!asset||!asset.file)throw Error('One or more timeline shots are missing their real source video.');
  if(asset.rightsReviewed!==true)throw Error(`Review the reuse basis for "${asset.title}" before export.`);
  if(!(Number(cut.duration)>0&&Number(cut.start)>=0&&cut.start+cut.duration<=asset.duration+0.5))
   throw Error('At least one video cut extends outside its actual source footage.');
 }
 const estimated=assets.filter(a=>cuts.some(c=>c.assetId===a.id)).reduce((s,a)=>s+(a.file?.size||0),0);
 if(estimated>400*1024*1024)throw Error('Selected footage is too large for reliable in-browser export. Use shorter source files or the server rendering workflow.');
 const ffmpeg=await getEngine(onStatus);
 const prefix='aura-'+Date.now().toString(36);
 const cleanups=[];
 try{
  const uploaded=new Map();
  for(const asset of assets){
   if(!cuts.some(c=>c.assetId===asset.id))continue;
   const path=`${prefix}-input-${uploaded.size}.mp4`;
   onStatus?.('Loading actual fight footage: '+asset.title);
   await ffmpeg.writeFile(path,await fetchFile(mustBeFile(asset.file)));
   uploaded.set(asset.id,path);
   cleanups.push(path);
  }
  const clips=[];
  for(let i=0;i<cuts.length;i++){
   const shot=cuts[i],input=uploaded.get(shot.assetId),out=`${prefix}-clip-${i}.mp4`;
   onStatus?.(`Trimming and assembling real footage ${i+1} of ${cuts.length}…`);
   const args=['-ss',Number(shot.start).toFixed(2),'-i',input,'-t',Number(shot.duration).toFixed(2),
    '-vf',fitVF(format),'-an','-c:v','libx264','-preset','ultrafast','-crf','28','-r','24',
    '-pix_fmt','yuv420p','-movflags','+faststart','-y',out];
   const exit=await ffmpeg.exec(args, -1);
   if(exit!==0)throw Error(`Encoding failed on scene ${i+1}; try a smaller video or desktop browser.`);
   clips.push(out);cleanups.push(out);
  }
  const concat=`${prefix}-list.txt`;
  const lines=clips.map(name=>`file '${name}'`).join('\n')+'\n';
  await ffmpeg.writeFile(concat,new TextEncoder().encode(lines));cleanups.push(concat);
  const merged=`${prefix}-picture.mp4`;
  onStatus?.('Joining the trimmed scenes into one video…');
  if(await ffmpeg.exec(['-f','concat','-safe','0','-i',concat,'-c','copy','-y',merged],-1)!==0)
   throw Error('Unable to join trimmed shots.');
  cleanups.push(merged);
  const output=`${prefix}-final.mp4`;
  if(voiceFile){
   onStatus?.('Mixing your own narration into the finished video…');
   const audio=`${prefix}-voice.${voiceFile.type?.includes('webm')?'webm':'m4a'}`;
   await ffmpeg.writeFile(audio,await fetchFile(mustBeFile(voiceFile)));cleanups.push(audio);
   const args=['-i',merged,'-i',audio,'-map','0:v:0','-map','1:a:0','-c:v','copy',
       '-c:a','aac','-b:a','160k','-af','apad','-shortest','-movflags','+faststart','-y',output];
   if(await ffmpeg.exec(args,-1)!==0)throw Error('Narration could not be mixed. Try MP3, WAV or M4A.');
  }else{
   onStatus?.('Creating a silent draft, ready for narration…');
   if(await ffmpeg.exec(['-i',merged,'-c','copy','-y',output],-1)!==0)throw Error('Unable to save edited video.');
  }
  cleanups.push(output);
  const bytes=await ffmpeg.readFile(output);
  onStatus?.('Real-footage MP4 assembled.');
  return new Blob([bytes],{type:'video/mp4'});
 }finally{
  for(const name of cleanups)try{await ffmpeg.deleteFile(name);}catch{}
 }
}
