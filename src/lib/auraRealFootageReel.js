// First-class, in-app screening of genuine YouTube boxing videos.
// YouTube IFrame Player API is a preview only, not downloadable footage.
export const YOUTUBE_HOSTS=new Set(['www.youtube.com','youtube.com','m.youtube.com','youtu.be','www.youtu.be']);
export function youtubeId(value){
 try{
  const u=new URL(String(value||''));
  if(u.protocol!=='https:'||!YOUTUBE_HOSTS.has(u.hostname)||u.username||u.password)return null;
  let id='';
  if(u.hostname.includes('youtu.be'))id=u.pathname.slice(1).split('/')[0];
  else if(u.pathname==='/watch')id=u.searchParams.get('v')||'';
  else if(/^\/(?:shorts|live|embed)\//.test(u.pathname))id=u.pathname.split('/')[2]||'';
  return /^[A-Za-z0-9_-]{11}$/.test(id)?id:null;
 }catch{return null;}
}
export function buildRealFootageReel(project){
 // All videos are actual named-fighter references. No unrelated stock media.
 const raw=(project?.sources||[]).map((s,i)=>({...s,_originalIndex:i}))
   .filter(s=>youtubeId(s.url));
 const result=[],seen=new Set();
 for(const source of raw){
  const id=youtubeId(source.url);
  if(seen.has(id))continue;
  seen.add(id);
  const role=source.kind==='faceoff'?'weighin':source.kind||'press';
  const range=project?.sourceReel?.find(s=>s.sourceId===source.id);
  const start=Math.max(0,Math.floor(Number(range?.startSeconds)||0));
  const end=Math.max(start+5,Math.min(600,Math.floor(Number(range?.endSeconds)||start+20)));
  result.push({
   id,sourceId:String(source.id||id),title:source.title||'Boxing source',
   publisher:source.publisher||'Original channel',role,
   startSeconds:start,endSeconds:end,
   thumbnail:'https://i.ytimg.com/vi/'+id+'/hqdefault.jpg',
   sourceUrl:'https://www.youtube.com/watch?v='+id,
   rightsCleared:source.clearedForExport===true,
   verification:'Source matches the fighters; exact action and cut timestamps require editorial review',
   _originalIndex:source._originalIndex
  });
 }
 return result;
}
export function validSegment(start,end){
 return Number.isFinite(Number(start))&&Number.isFinite(Number(end))&&
  Number(start)>=0&&Number(end)>Number(start)&&
  Number(end)-Number(start)<=90&&Number(end)<=21600;
}
export function iframePreviewUrl(id,start,end,origin){
 if(!/^[A-Za-z0-9_-]{11}$/.test(String(id)))throw Error('Invalid YouTube video ID');
 if(!validSegment(start,end))throw Error('Invalid video excerpt range');
 const p=new URLSearchParams({
  start:String(Math.floor(Number(start))),end:String(Math.ceil(Number(end))),
  playsinline:'1',rel:'0',enablejsapi:'1',
  ...(origin&&/^https?:\/\//.test(origin)?{origin}:{})
 });
 return 'https://www.youtube-nocookie.com/embed/'+id+'?'+p.toString();
}
