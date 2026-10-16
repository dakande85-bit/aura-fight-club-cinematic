// YouTube watch links are research references, not transferable video files.
// The actual editor accepts locally held MP4/WebM/MOV or direct URLs with CORS.
const YOUTUBE_HOSTS=new Set([
 'youtube.com','www.youtube.com','m.youtube.com','music.youtube.com',
 'www.youtube-nocookie.com','youtube-nocookie.com','youtu.be','www.youtu.be'
]);
const VIDEO_EXT=/\.(mp4|m4v|mov|webm)(?:$|[?#])/i;
export function youtubeId(raw){
 try{
  const url=new URL(String(raw||'').trim());
  if(url.protocol!=='https:' || !YOUTUBE_HOSTS.has(url.hostname.toLowerCase()))return null;
  const host=url.hostname.toLowerCase();
  let candidate='';
  if(host==='youtu.be'||host==='www.youtu.be'){
   candidate=url.pathname.split('/').filter(Boolean)[0]||'';
  }else{
   const parts=url.pathname.split('/').filter(Boolean);
   if(parts[0]==='watch')candidate=url.searchParams.get('v')||'';
   else if(['embed','shorts','live','v'].includes(parts[0]))candidate=parts[1]||'';
  }
  return /^[A-Za-z0-9_-]{11}$/.test(candidate)?candidate:null;
 }catch{return null;}
}
export function watchUrl(id){
 if(!/^[A-Za-z0-9_-]{11}$/.test(String(id||'')))return '';
 return 'https://www.youtube.com/watch?v='+id;
}
export function embedUrl(id){
 if(!/^[A-Za-z0-9_-]{11}$/.test(String(id||'')))return '';
 return 'https://www.youtube-nocookie.com/embed/'+id+'?rel=0';
}
export function directVideoUrl(raw){
 try{
  const url=new URL(String(raw||'').trim());
  if(url.protocol!=='https:'||url.username||url.password)return '';
  if(YOUTUBE_HOSTS.has(url.hostname.toLowerCase())||/(^|\.)googlevideo\.com$/i.test(url.hostname))return '';
  if(!VIDEO_EXT.test(url.pathname))return '';
  return url.href;
 }catch{return '';}
}
export function researchQueries(fight){
 const base=String(fight?.title||fight?.name||'boxing').replace(/\s+—.+$/,'').replace(/\bAURA Film Room\b/ig,'').trim();
 return [
  {label:'Previous fights & highlights',kind:'fight',q:base+' boxing fight highlights DAZN Queensberry'},
  {label:'Press conferences',kind:'press',q:base+' full press conference boxing'},
  {label:'Face-offs & weigh-ins',kind:'faceoff',q:base+' boxing face off weigh in'},
  {label:'Training & interviews',kind:'broll',q:base+' boxing training interview'},
 ];
}
export function youtubeSearchUrl(query){
 return 'https://www.youtube.com/results?search_query='+encodeURIComponent(String(query||'').trim());
}
export async function fetchDirectVideo(url,{maxBytes=250*1024*1024,onProgress}={}){
 const valid=directVideoUrl(url);
 if(!valid)throw new Error('Enter a direct HTTPS .mp4, .mov or .webm file URL, not a YouTube watch link.');
 let response;
 try{response=await fetch(valid,{mode:'cors',credentials:'omit',redirect:'follow'});}
 catch{throw new Error('The video host blocked direct imports (CORS). Use the source website’s Download option, then upload the saved MP4.');}
 const ultimate=new URL(response.url);
 if(ultimate.protocol!=='https:' || YOUTUBE_HOSTS.has(ultimate.hostname.toLowerCase()) || /(^|\\.)googlevideo\\.com$/i.test(ultimate.hostname)){
  throw new Error('This link redirects to a protected streaming service rather than an authorised downloadable file.');
 }
 if(!response.ok)throw new Error('The video file could not be opened (HTTP '+response.status+').');
 const type=response.headers.get('content-type')||'';
 if(!/^video\//i.test(type) && !/^(application\/octet-stream|binary\/octet-stream)/i.test(type) && type!==''){
  throw new Error('The source returned '+type+' instead of a video file.');
 }
 const header=Number(response.headers.get('content-length')||0);
 if(header>maxBytes)throw new Error('File is larger than the 250 MB browser import limit.');
 if(!response.body)throw new Error('This browser cannot stream the video; download the file and upload it instead.');
 const reader=response.body.getReader();
 const parts=[];let total=0;
 try{
  while(true){
   const {done,value}=await reader.read();
   if(done)break;
   total+=value.length;
   if(total>maxBytes){await reader.cancel();throw new Error('File is larger than the 250 MB browser import limit.');}
   parts.push(value);
   if(header)onProgress?.(Math.min(99,Math.round(total/header*100)));
  }
 }finally{reader.releaseLock();}
 if(total<1024)throw new Error('The returned file is too small to be a useful video.');
 const name=decodeURIComponent(new URL(valid).pathname.split('/').pop()||'footage.mp4').replace(/[^a-zA-Z0-9_. -]/g,'_');
 const mime=type.toLowerCase().startsWith('video/')?type.split(';')[0]:'video/mp4';
 onProgress?.(100);
 return new File(parts,name,{type:mime});
}
