// Local, private project media persistence. Nothing is uploaded to Aura servers.
// Browser storage quotas and private browsing can prevent persistence; errors are surfaced.
const DB_NAME='aura-filmroom-workspace-v1';
const DB_VERSION=2;
const MAX_MEDIA_BYTES=220*1024*1024;
function connect(){
 if(typeof indexedDB==='undefined')return Promise.reject(new Error('This browser does not support offline video storage.'));
 return new Promise((resolve,reject)=>{
  const req=indexedDB.open(DB_NAME,DB_VERSION);
  req.onupgradeneeded=()=>{
   const db=req.result;
   if(!db.objectStoreNames.contains('media'))db.createObjectStore('media',{keyPath:'key'});
   if(!db.objectStoreNames.contains('edits'))db.createObjectStore('edits',{keyPath:'key'});
   if(!db.objectStoreNames.contains('voices'))db.createObjectStore('voices',{keyPath:'key'});
  };
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||new Error('Could not open media workspace.'));
 });
}
async function request(store,mode,operation){
 const db=await connect();
 try{
  return await new Promise((resolve,reject)=>{
   const tx=db.transaction(store,mode);
   const req=operation(tx.objectStore(store));
   let result;
   req.onsuccess=()=>{result=req.result;};
   req.onerror=()=>reject(req.error||new Error('Unable to save the video.'));
   tx.oncomplete=()=>resolve(result);
   tx.onerror=()=>reject(tx.error||new Error('Video storage was interrupted.'));
   tx.onabort=()=>reject(tx.error||new Error('Video storage was cancelled.'));
  });
 }finally{db.close();}
}
function keyOf(slug,id){return String(slug||'unknown')+'::'+String(id||'');}
export async function saveVideo(slug,asset){
 if(!asset?.file)throw new Error('Media file is missing.');
 if(asset.file.size>MAX_MEDIA_BYTES)throw new Error('For device storage use source clips under 220 MB; long originals need the future cloud media vault.');
 const record={
  key:keyOf(slug,asset.id),slug,id:asset.id,kind:asset.kind,title:asset.title,
  file:asset.file, duration:asset.duration,referenceUrl:asset.referenceUrl||'',
  rightsReviewed:Boolean(asset.rightsReviewed),peaks:Array.isArray(asset.peaks)?asset.peaks:[],
  updatedAt:new Date().toISOString()
 };
 await request('media','readwrite',s=>s.put(record));
 return record.key;
}
export async function getVideos(slug){
 const all=await request('media','readonly',s=>s.getAll());
 return (all||[]).filter(a=>a.slug===slug);
}
export async function deleteVideo(slug,id){
 return request('media','readwrite',s=>s.delete(keyOf(slug,id)));
}
export async function saveEdit(slug,format,data){
 return request('edits','readwrite',s=>s.put({
  key:keyOf(slug,format),
  slug,format,
  script:String(data.script||''),
  cuts:Array.isArray(data.cuts)?data.cuts:[],
  updatedAt:new Date().toISOString()
 }));
}
export async function getEdit(slug,format){
 return request('edits','readonly',s=>s.get(keyOf(slug,format)));
}
export async function saveVoice(slug,format,file){
 if(!file || file.size>30*1024*1024)throw new Error('Voiceover must be under 30 MB.');
 return request('voices','readwrite',s=>s.put({key:keyOf(slug,format),file,updatedAt:new Date().toISOString()}));
}
export async function getVoice(slug,format){
 const result=await request('voices','readonly',s=>s.get(keyOf(slug,format)));
 return result?.file||null;
}
export const DEMO={
 id:'aura-public-domain-boxing-demo',
 title:'1891 boxing film — public-domain workflow test',
 original:'https://commons.wikimedia.org/wiki/File:Men_Boxing.webm',
 mediaUrl:'https://upload.wikimedia.org/wikipedia/commons/0/07/Men_Boxing.webm',
 kind:'fight',
 credit:'Men Boxing (1891), W. K. L. Dickson and William Heise, Library of Congress; public-domain original film via Wikimedia Commons.',
 script:'This is a Film Room demonstration using genuine historic boxing footage from 1891. The editor cuts the source into short segments, places them on a timeline, and allows you to adjust the shots and record narration. This is a workflow test, not footage of a modern championship fight.'
};
export async function loadDemoFile({onProgress}={}){
 let response;
 try{
  response=await fetch(DEMO.mediaUrl,{mode:'cors',credentials:'omit'});
 }catch{
  throw new Error('Wikimedia blocked the demo download in this browser. Use the download link below and upload the saved WebM instead.');
 }
 if(!response.ok)throw new Error('Demo footage unavailable from Wikimedia (HTTP '+response.status+').');
 const type=response.headers.get('content-type')||'';
 if(type&&!/^(video\/|application\/octet-stream)/i.test(type))
   throw new Error('The demo source returned an invalid video response.');
 const len=Number(response.headers.get('content-length')||0);
 if(len>10*1024*1024)throw new Error('Demo source exceeds the 10 MB limit.');
 if(!response.body)throw new Error('Streaming video downloads are unsupported; download the demo directly and upload it.');
 const reader=response.body.getReader(),chunks=[];
 let size=0;
 try{
  while(true){
   const {value,done}=await reader.read();
   if(done)break;
   size+=value.byteLength;
   if(size>10*1024*1024){await reader.cancel();throw new Error('Demo source is larger than expected.');}
   chunks.push(value);
   if(len)onProgress?.(Math.min(100,Math.round(size/len*100)));
  }
 }finally{reader.releaseLock();}
 if(size<8192)throw new Error('Demo footage file is incomplete.');
 onProgress?.(100);
 return new File(chunks,'men-boxing-1891-public-domain-demo.webm',{type:'video/webm'});
}
