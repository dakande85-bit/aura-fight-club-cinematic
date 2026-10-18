import {useEffect,useMemo,useState} from 'react';
import {directVideoUrl,embedUrl,fetchDirectVideo,researchQueries,watchUrl,youtubeId,youtubeSearchUrl} from '../lib/auraFootageSources.js';
import '../styles/aura-footage-finder.css';

const KINDS={fight:'Fight action',press:'Interview / press',faceoff:'Face-off',broll:'Training / other'};
const localKey=slug=>'aura-footage-references-v1-'+(slug||'default');
function classify(kind){return Object.hasOwn(KINDS,kind)?kind:'broll';}
function mergeRefs(provided, saved){
 const base=(Array.isArray(provided)?provided:[]).filter(s=>typeof s.url==='string' && /^https:\/\//i.test(s.url))
   .map(s=>({...s,kind:classify(s.kind),saved:false}));
 return [...base,...saved.filter(s=>!base.some(b=>b.url===s.url))];
}
export default function AuraFootageFinder({project,onAddFile,working=false,onNotice}){
 const [section,setSection]=useState('youtube');
 const [search,setSearch]=useState('');
 const [pasted,setPasted]=useState('');
 const [direct,setDirect]=useState('');
 const [customKind,setCustomKind]=useState('fight');
 const [saved,setSaved]=useState([]);
 const [selected,setSelected]=useState('');
 const [importing,setImporting]=useState(false);
 const [pct,setPct]=useState(0);
 const [message,setMessage]=useState('');
 const [dragging,setDragging]=useState(false);
 const slug=project?.slug||'boxing';
 const refs=useMemo(()=>mergeRefs(project?.sources,saved),[project?.sources,saved]);
 const chosen=refs.find(s=>s.url===selected)||null;
 const playerId=chosen?youtubeId(chosen.url):null;
 const queryOptions=useMemo(()=>researchQueries(project),[project?.title]);
 const notify=value=>{setMessage(value);onNotice?.(value);};
 useEffect(()=>{
  let stored=[];try{stored=JSON.parse(localStorage.getItem(localKey(slug))||'[]');}catch{}
  if(!Array.isArray(stored))stored=[];
  setSaved(stored.filter(s=>s&&/^https:\/\//.test(s.url||'')).slice(0,40));
  setSelected('');
  setSearch(queryOptions[0]?.q||'boxing highlights');
  setMessage('');
 },[slug]);
 useEffect(()=>{
  if(!selected&&refs.length)setSelected(refs[0].url);
 },[slug,selected,refs]);
 const remember=(record)=>{
  const next=[record,...saved.filter(s=>s.url!==record.url)].slice(0,40);
  setSaved(next);
  try{localStorage.setItem(localKey(slug),JSON.stringify(next));}catch{}
 };
 function saveYouTube(){
  const id=youtubeId(pasted);
  if(!id){notify('Paste a real YouTube watch, Shorts, live, or youtu.be link.');return;}
  const url=watchUrl(id);
  const ref={id:'yt-'+id,kind:customKind,publisher:'YouTube reference',title:'Saved video • '+id,url,saved:true};
  remember(ref);setSelected(url);setPasted('');
  setSection('youtube');
  notify('Video saved to your research shelf and opened in the player. Next, import a reusable MP4 for actual cutting.');
 }
 async function intake(file,kind){
  if(!file)return;
  if(!file.type.startsWith('video/')&&!/\.(mp4|mov|m4v|webm)$/i.test(file.name)){
   notify('Choose an MP4, MOV or WebM video.');return;
  }
  if(file.size>350*1024*1024){notify('Choose a video under 350 MB for this browser editor. Trim longer footage first.');return;}
  setImporting(true);
  try{
   await onAddFile?.(file,kind,chosen?.url||'');
   notify(file.name+' added to the Film Room timeline sources. The editor can now analyse and cut the actual video.');
   setSection('files');
  }catch(e){notify('Video import failed: '+e.message);}
  finally{setImporting(false);}
 }
 async function importDirect(){
  if(!directVideoUrl(direct)){
   notify('Enter a direct HTTPS MP4/MOV/WebM file link, not a YouTube watch URL.');return;
  }
  setImporting(true);setPct(0);
  try{
   const file=await fetchDirectVideo(direct,{onProgress:setPct});
   await onAddFile?.(file,customKind,direct);
   notify('Downloaded authorised video file into this editor: '+file.name+'. You can now trim it.');
   setDirect('');setSection('files');
  }catch(e){notify(e.message);}
  finally{setImporting(false);setPct(0);}
 }
 async function drop(event){
  event.preventDefault();setDragging(false);
  if(event.dataTransfer?.files?.length)await intake(event.dataTransfer.files[0],customKind);
 }
 function openSearch(query){window.open(youtubeSearchUrl(query),'_blank','noopener,noreferrer');}
 return <div className="aura-finder">
  <div className="aura-finder-head">
   <div><span className="aura-finder-eyebrow">YOUR FOOTAGE DESK</span><h3>Find videos and bring them into the edit</h3></div>
   <span className="aura-finder-counter">{refs.length} source leads</span>
  </div>
  <div className="aura-finder-tabs" role="tablist" aria-label="Footage library">
   <button type="button" role="tab" aria-selected={section==='youtube'} className={section==='youtube'?'active':''} onClick={()=>setSection('youtube')}>1. Find on YouTube</button>
   <button type="button" role="tab" aria-selected={section==='files'} className={section==='files'?'active':''} onClick={()=>setSection('files')}>2. Bring in footage</button>
  </div>
  {section==='youtube'?<div role="tabpanel" className="aura-finder-panel">
    <label className="aura-finder-label">Search for boxing footage
     <div className="aura-finder-search">
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Dubois Wardley fight highlights"/>
      <button type="button" onClick={()=>openSearch(search)} disabled={!search.trim()}>Search YouTube ↗</button>
     </div>
    </label>
    <div className="aura-finder-quick">
      {queryOptions.map(q=><button key={q.kind} onClick={()=>{setSearch(q.q);openSearch(q.q)}} type="button">{q.label} ↗</button>)}
    </div>
    <label className="aura-finder-label">Paste a YouTube video to watch and save here
      <div className="aura-finder-search">
       <input inputMode="url" value={pasted} onChange={e=>setPasted(e.target.value)} placeholder="https://www.youtube.com/watch?v=…"/>
       <button type="button" onClick={saveYouTube}>Add video</button>
      </div>
    </label>
    <div className="aura-finder-shelf" aria-label="Research video library">
     <h4>Fight research shelf</h4>
     {refs.length?refs.slice(0,30).map((s,i)=><button type="button" key={s.id+'-'+i} className={selected===s.url?'active':''} onClick={()=>setSelected(s.url)}>
       <span>{KINDS[s.kind]||'Source'}</span><strong>{s.title}</strong>
      </button>):<p>Find a fight and paste its YouTube link to build your research shelf.</p>}
    </div>
    {chosen&&<div className="aura-finder-player">
      <strong>{chosen.title}</strong>
      {playerId?<iframe title={chosen.title} src={embedUrl(playerId)} allow="encrypted-media; fullscreen; picture-in-picture" loading="lazy" allowFullScreen/>:
       <div className="aura-finder-not-embeddable">This source opens on its original website.</div>}
      <div className="aura-finder-actions">
       <a href={chosen.url} target="_blank" rel="noopener noreferrer">Open original video ↗</a>
       <button type="button" onClick={()=>setSection('files')}>I have an MP4 — import it →</button>
      </div>
    </div>}
    <div className="aura-finder-info">
     <strong>Watching on YouTube is not the same as importing footage.</strong>
     <p>To cut a video here, obtain an editable file from your own YouTube Studio download, the uploader/licensor, an authorised download, or a source providing a direct file. YouTube does not offer an official API for downloading other channels' videos as MP4s. Once you have the file, the editor takes over.</p>
     <a href="https://studio.youtube.com/" target="_blank" rel="noopener noreferrer">Download your own videos in YouTube Studio ↗</a>
    </div>
  </div>:<div role="tabpanel" className="aura-finder-panel">
    <div className={'aura-finder-drop '+(dragging?'dragging':'')} onDragEnter={e=>{e.preventDefault();setDragging(true)}} onDragOver={e=>e.preventDefault()} onDragLeave={e=>{e.preventDefault();setDragging(false)}} onDrop={drop}>
      <span className="aura-finder-drop-symbol">↓</span>
      <strong>Upload a real boxing video</strong>
      <p>Drop an MP4, MOV or WebM here, or choose one saved on your device.</p>
      <input type="file" accept="video/mp4,video/quicktime,video/webm,video/x-m4v" disabled={working||importing} onChange={e=>intake(e.target.files?.[0],customKind)}/>
    </div>
    <label className="aura-finder-label">What footage is this?
     <select value={customKind} onChange={e=>setCustomKind(e.target.value)}>
      {Object.entries(KINDS).map(([id,name])=><option key={id} value={id}>{name}</option>)}
     </select>
    </label>
    <div className="aura-finder-direct">
     <strong>Have a direct downloadable video-file URL?</strong>
     <p>Import a reusable MP4/MOV/WebM from a host that allows file downloads and cross-origin access. This does not work with ordinary YouTube watch links.</p>
     <div className="aura-finder-search">
      <input value={direct} onChange={e=>setDirect(e.target.value)} placeholder="https://media.example.com/boxing-footage.mp4" inputMode="url"/>
      <button type="button" onClick={importDirect} disabled={importing||working}>Import video file</button>
     </div>
     {importing&&pct>0&&<progress max="100" value={pct}/>}
    </div>
    <div className="aura-finder-options">
     <strong>Downloadable footage providers</strong>
     <a href="https://www.pexels.com/search/videos/boxing/" target="_blank" rel="noopener noreferrer">Pexels — free boxing videos ↗</a>
     <a href="https://pixabay.com/videos/search/boxing/" target="_blank" rel="noopener noreferrer">Pixabay — boxing footage ↗</a>
     <a href="https://imgvideoarchive.com/client/frank_warren_boxing" target="_blank" rel="noopener noreferrer">Queensberry archive — fight footage licensing ↗</a>
    </div>
  </div>}
  {message&&<p className="aura-finder-message" role="status">{message}</p>}
 </div>;
}
