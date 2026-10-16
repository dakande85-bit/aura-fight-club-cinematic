import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/aura-video-production.css';

const PROJECT_URL='/news/video-production/dubois-wardley-ii.json';
const STORE='aura-video-production-dubois-wardley-v1';
const RENDER_DOC='https://github.com/dakande85-bit/aura-fight-club-cinematic/blob/feature/real-footage-production-studio/docs/REAL_FOOTAGE_PRODUCTION.md';
function saveBlob(name, content, mime='application/json') {
 const url=URL.createObjectURL(new Blob([content],{type:mime}));
 const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),2500);
}
function watchLink(source, at=0) {
 try{
  const url=new URL(source.url);
  if(!['https:'].includes(url.protocol))return '';
  if(url.hostname==='youtu.be'||url.hostname.endsWith('youtube.com')){
   const id=url.hostname==='youtu.be'?url.pathname.slice(1):url.searchParams.get('v');
   if(id && /^[A-Za-z0-9_-]{11}$/.test(id)) return 'https://www.youtube.com/watch?v='+id+'&t='+Math.floor(at)+'s';
  }
  return url.href;
 }catch{return '';}
}
function seconds(value){return Number(value).toFixed(1)+'s';}
export default function AdminVideoProduction(){
 const [project,setProject]=useState(null);
 const [activeId,setActiveId]=useState('first-fight-highlights');
 const [uploaded,setUploaded]=useState({});
 const [voiceFile,setVoiceFile]=useState(null);
 const [start,setStart]=useState('0');
 const [end,setEnd]=useState('3');
 const [purpose,setPurpose]=useState('Tactical evidence');
 const [caption,setCaption]=useState('');
 const [narration,setNarration]=useState('');
 const [status,setStatus]=useState('');
 const [loading,setLoading]=useState(true);
 const videoRef=useRef(null);
 useEffect(()=>{
  let cancelled=false;
  fetch(PROJECT_URL,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Production manifest not available');return r.json();})
   .then(d=>{
    if(cancelled)return;
    let cached=null;try{cached=JSON.parse(localStorage.getItem(STORE)||'null');}catch{}
    setProject(cached?.version===1&&cached.slug===d.slug?cached:d);
    setLoading(false);
   }).catch(e=>{if(!cancelled){setStatus(e.message);setLoading(false);}});
  return()=>{cancelled=true;};
 },[]);
 useEffect(()=>{if(project){try{localStorage.setItem(STORE,JSON.stringify(project));}catch{}}},[project]);
 const active=useMemo(()=>project?.sources.find(s=>s.id===activeId)||project?.sources[0],[project,activeId]);
 const clipFile=active?uploaded[active.id]:null;
 const localPreview=useMemo(()=>clipFile?URL.createObjectURL(clipFile):null,[clipFile]);
 useEffect(()=>()=>{if(localPreview)URL.revokeObjectURL(localPreview);},[localPreview]);
 const total=useMemo(()=>project?.shots.reduce((sum,s)=>sum+(Number(s.out)-Number(s.in)),0)||0,[project]);
 const missing=useMemo(()=>project?.shots.filter(shot=>{
  const source=project.sources.find(s=>s.id===shot.sourceId);
  return !source?.clearedForExport||!source?.localFile||!uploaded[source.id];
 })||[],[project,uploaded]);
 function patch(fn){setProject(previous=>previous?fn(previous):previous);}
 function editSource(id,changes){patch(p=>({...p,sources:p.sources.map(s=>s.id===id?{...s,...changes}:s)}));}
 function attachClip(id,file){
  if(!file)return;
  setUploaded(prev=>({...prev,[id]:file}));
  editSource(id,{localFile:file.name,clearedForExport:false});
  setStatus('Video attached in this browser only. Review each source before exporting the final MP4.');
 }
 function attachVoice(file){setVoiceFile(file);patch(p=>({...p,voiceoverFile:file?.name||''}));}
 function addSource(){
  const id='source-'+Date.now();
  patch(p=>({...p,sources:[...p.sources,{
   id,title:'New local source',kind:'broll',publisher:'My recording',url:'',
   localFile:'',clearedForExport:false,rightsNotes:'Check the legal basis for this use.'
  }]}));setActiveId(id);
 }
 function addShot(){
  const i=Number(start),o=Number(end);
  if(!active||!Number.isFinite(i)||!Number.isFinite(o)||i<0||o<=i||o-i>12){
   setStatus('Set a valid in/out range. Every video extract must be positive and at most 12 seconds.');return;
  }
  const shot={id:'cut-'+Date.now(),sourceId:active.id,in:i,out:o,purpose,caption:caption.trim().slice(0,95),narration:narration.trim()};
  patch(p=>({...p,shots:[...p.shots,shot]}));setStatus('Real-video cut added to the edit decision list.');setStart(String(o));setEnd(String(o+3));
 }
 function moveShot(index,diff){
  patch(p=>{
   const shots=[...p.shots],dest=index+diff;
   if(dest<0||dest>=shots.length)return p;
   [shots[index],shots[dest]]=[shots[dest],shots[index]];
   return {...p,shots};
  });
 }
 function reviewShot(shot){
  setActiveId(shot.sourceId);setStart(String(shot.in));setEnd(String(shot.out));
  setPurpose(shot.purpose||'Tactical evidence');setCaption(shot.caption||'');setNarration(shot.narration||'');
  setStatus('Selected cut. Preview it with the source player or external watch link.');
 }
 function exportProject(){
  if(!project?.shots.length){setStatus('Add at least one real-footage cut before exporting the project.');return;}
  saveBlob('aura-dubois-wardley-real-footage-edit.json',JSON.stringify(project,null,2)+'\n');
  setStatus('Edit project downloaded. Media files remain on your device; supply them to the FFmpeg renderer.');
 }
 function seek(){
  if(videoRef.current && localPreview){videoRef.current.currentTime=Math.max(0,Number(start)||0);videoRef.current.play().catch(()=>{});}
 }
 async function importProject(event){
  const f=event.target.files?.[0];if(!f)return;
  try{
   const data=JSON.parse(await f.text());
   if(data.version!==1||!Array.isArray(data.sources)||!Array.isArray(data.shots))throw Error('Not a supported Aura edit file');
   setProject(data);setUploaded({});setVoiceFile(null);setActiveId(data.sources[0]?.id||'');
   setStatus('Edit project imported. Reattach any local video and voiceover files before rendering.');
  }catch(e){setStatus(e.message);}
 }
 if(loading)return <><Header/><main className="aura-video-page"><h1>Loading real-footage studio…</h1></main><Footer/></>;
 if(!project)return <><Header/><main className="aura-video-page"><h1>Real-footage studio unavailable</h1><p role="alert">{status}</p></main><Footer/></>;
 const cuts=project.shots;
 return <><Header/><main className="aura-video-page">
  <div className="aura-video-hero">
   <p className="aura-video-kicker">AURA FIGHT DESK / PRODUCTION WORKSPACE</p>
   <h1>Real Footage Studio</h1>
   <p>Make an original boxing analysis from short real fight exchanges, press conferences and face-offs. Source links are for research; attach locally held reusable MP4s to render your own edit. No AI fight scenes, automated downloads, Lovable credits or automatic publishing.</p>
   <div className="aura-video-actions"><Link to="/admin/social">Social News Studio</Link><Link to="/admin/articles">Articles</Link><a href={RENDER_DOC} target="_blank" rel="noreferrer">Rendering guide ↗</a></div>
  </div>
  <div className="aura-video-summary"><div><span>PROJECT</span><strong>{project.title}</strong></div><div><span>SOURCE VIDEOS</span><strong>{project.sources.length}</strong></div><div><span>SELECTED CUTS</span><strong>{cuts.length}</strong></div><div><span>EDIT DURATION</span><strong>{seconds(total)}</strong></div></div>
  <div className="aura-video-columns">
   <section className="aura-video-panel">
    <div className="aura-video-panel-title"><h2>1. Actual footage sources</h2><button onClick={addSource}>+ Add own footage</button></div>
    <p className="aura-video-sub">Verified reporting sources linked below. Use their embedded/watch pages to locate decisive moments; exact clip timestamps have not been assumed.</p>
    <div className="aura-video-source-list">
     {project.sources.map(source=><button type="button" key={source.id} className={source.id===active?.id?'selected':''} onClick={()=>setActiveId(source.id)}>
       <small>{source.kind.toUpperCase()} · {source.publisher}</small><strong>{source.title}</strong><span>{uploaded[source.id]?'LOCAL VIDEO ATTACHED':'REFERENCE ONLY'}</span>
      </button>)}
    </div>
    {active&&<div className="aura-video-active">
      <h3>{active.title}</h3>
      {watchLink(active)&&<a href={watchLink(active,Number(start)||0)} target="_blank" rel="noopener noreferrer">Watch original footage at {seconds(Number(start)||0)} ↗</a>}
      <label>Attach a real local video file (MP4/MOV/WebM)
       <input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={e=>attachClip(active.id,e.target.files?.[0])}/>
      </label>
      {localPreview?<div><video key={localPreview} ref={videoRef} src={localPreview} controls playsInline preload="metadata" /><button type="button" onClick={seek}>Jump to in-point</button></div>:
       <p className="aura-video-tip">Source link available to research. Upload an eligible local copy to preview actual footage here. No video is fetched from YouTube or uploaded to our server.</p>}
      <label className="aura-video-check"><input type="checkbox" checked={Boolean(active.clearedForExport)} onChange={e=>editSource(active.id,{clearedForExport:e.target.checked})}/> I reviewed the rights or applicable legal exception for this particular source and use.</label>
      <label>Rights / context notes<textarea rows={2} value={active.rightsNotes||''} onChange={e=>editSource(active.id,{rightsNotes:e.target.value})}/></label>
     </div>}
   </section>
   <section className="aura-video-panel">
    <h2>2. Mark short cuts</h2>
    <p className="aura-video-sub">Make every extract earn its place: the action must illustrate something you actually explain.</p>
    <div className="aura-video-duo">
     <label>Source in (seconds)<input type="number" min="0" step=".1" value={start} onChange={e=>setStart(e.target.value)}/></label>
     <label>Source out (seconds)<input type="number" min="0" step=".1" value={end} onChange={e=>setEnd(e.target.value)}/></label>
    </div>
    <label>Why this cut matters
     <select value={purpose} onChange={e=>setPurpose(e.target.value)}>
      {['Hook','Tactical evidence','Press conference','Face-off','Transition','Closing prediction'].map(t=><option key={t}>{t}</option>)}
     </select>
    </label>
    <label>On-screen analytical caption<input maxLength={95} value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Wardley catches Dubois on the exit"/></label>
    <label>Your narration for this cut<textarea value={narration} onChange={e=>setNarration(e.target.value)} rows={3} placeholder="Explain exactly what this exchange shows"/></label>
    <button type="button" className="aura-video-primary" onClick={addShot}>+ Add this real footage cut</button>
    <h3>Suggested edit beats</h3>
    <ol className="aura-video-beats">{project.suggestedBeats?.map(beat=><li key={beat.purpose}><strong>{beat.purpose}:</strong> {beat.description}</li>)}</ol>
   </section>
  </div>
  <section className="aura-video-panel">
   <div className="aura-video-panel-title"><h2>3. Build the timeline</h2><span>{cuts.length} cuts · {seconds(total)}</span></div>
   {cuts.length?<ol className="aura-video-timeline">{cuts.map((shot,i)=><li key={shot.id}>
    <div className="aura-video-cut-time">{String(i+1).padStart(2,'0')} · {seconds(Number(shot.out)-Number(shot.in))}</div>
    <div><strong>{shot.purpose}</strong><p>{project.sources.find(s=>s.id===shot.sourceId)?.title||shot.sourceId}</p><small>Source {shot.in}s → {shot.out}s · {shot.caption||'No caption'}</small></div>
    <div className="aura-video-cut-actions"><button onClick={()=>reviewShot(shot)}>Review</button><button disabled={i===0} onClick={()=>moveShot(i,-1)}>↑</button><button disabled={i===cuts.length-1} onClick={()=>moveShot(i,1)}>↓</button><button onClick={()=>patch(p=>({...p,shots:p.shots.filter(s=>s.id!==shot.id)}))}>Remove</button></div>
   </li>)}</ol>:<p className="aura-video-tip">Your timeline is empty. Watch the real highlight video and add short, relevant cuts using the timestamps above.</p>}
  </section>
  <div className="aura-video-columns">
   <section className="aura-video-panel">
    <h2>4. Your narration</h2>
    <textarea rows={9} value={project.narrationScript||''} onChange={e=>patch(p=>({...p,narrationScript:e.target.value}))}/>
    <label>Attach recorded voiceover (MP3/WAV/M4A)
     <input type="file" accept="audio/*" onChange={e=>attachVoice(e.target.files?.[0])}/>
    </label><p className="aura-video-sub">{voiceFile?'Attached: '+voiceFile.name:'You can export the edit without voiceover, but the final cut needs your recording.'}</p>
   </section>
   <section className="aura-video-panel">
    <h2>5. Export and review</h2>
    <p>Before generating the final MP4, review the script, trim positions, source usage and audio. Exporting the project does <strong>not</strong> publish or download a third-party broadcast.</p>
    <p className="aura-video-sub">Local clips still needed for export: {missing.length} of {cuts.length}. These remain on this device; files must be placed beside the rendering script when creating the MP4.</p>
    <div className="aura-video-publish">
     <button type="button" className="aura-video-primary" onClick={exportProject}>Download edit timeline JSON</button>
     <label className="aura-video-import">Resume a saved project <input type="file" accept="application/json" onChange={importProject}/></label>
     <a href={RENDER_DOC} target="_blank" rel="noreferrer">Instructions for converting footage + voiceover to MP4 ↗</a>
    </div>
    <p className="aura-video-tip">Production state is saved in this browser. For privacy and rights safety, local media bytes are not persisted, uploaded or scraped; reattach files after a refresh.</p>
   </section>
  </div>
  {status&&<p role="status" className="aura-video-status">{status}</p>}
 </main><Footer/></>;
}
