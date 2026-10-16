import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import Header from '../components/Header.jsx';
import AuraFootageFinder from '../components/AuraFootageFinder.jsx';
import Footer from '../components/Footer.jsx';
import {planCuts,scanActionPeaks} from '../lib/auraAutoCut.js';
import {exportAutoVideo} from '../lib/auraBrowserExport.js';
import {DEMO,loadDemoFile,saveVideo,getVideos,deleteVideo,saveEdit,getEdit,saveVoice,getVoice} from '../lib/auraMediaVault.js';
import '../styles/aura-auto-video-editor.css';

const QUEUE='/news/video-production/index.json';
const CUT_KEY='aura-auto-rough-cut-v1-';
const WORDING={fight:'Fight highlights',press:'Press conference / interview',faceoff:'Face-off / weigh-in',broll:'Other real boxing footage'};
const time=n=>{const v=Math.max(0,Number(n)||0);return Math.floor(v/60)+':'+String(Math.floor(v%60)).padStart(2,'0');};
const save=(blob,filename)=>{
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),10000);
};
function getDuration(file){
 return new Promise((resolve,reject)=>{
  const el=document.createElement('video'),url=URL.createObjectURL(file);
  const timeout=setTimeout(()=>finish(new Error('Video metadata timed out')),15000);
  const finish=(error)=>{
   clearTimeout(timeout);URL.revokeObjectURL(url);el.removeAttribute('src');el.load();
   error?reject(error):resolve(duration);
  };
  let duration=0;
  el.preload='metadata';el.muted=true;el.onloadedmetadata=()=>{duration=el.duration;finish();};
  el.onerror=()=>finish(new Error('This video could not be opened'));
  el.src=url;
 });
}
function formatScript(project,format){
 return (project?.scripts?.[format]?.draft||project?.narrationScript||'').trim();
}
export default function AdminAutoVideoEditor(){
 const [queue,setQueue]=useState([]);
 const [project,setProject]=useState(null);
 const [selectedPath,setSelectedPath]=useState('');
 const [format,setFormat]=useState('shorts');
 const [assets,setAssets]=useState([]);
 const [cuts,setCuts]=useState([]);
 const [manualEdits,setManualEdits]=useState(false);
 const [activeIndex,setActiveIndex]=useState(0);
 const [script,setScript]=useState('');
 const [voice,setVoice]=useState(null);
 const [recording,setRecording]=useState(false);
 const [isPlaying,setIsPlaying]=useState(false);
 const [working,setWorking]=useState(false);
 const [status,setStatus]=useState('');
 const [progress,setProgress]=useState(0);
 const [resultUrl,setResultUrl]=useState('');
 const [resultBlob,setResultBlob]=useState(null);
 const videoRef=useRef(null),recorderRef=useRef(null),chunksRef=useRef([]),assetUrls=useRef(new Map()),narrationRef=useRef(null);
 const [voiceUrl,setVoiceUrl]=useState('');
 const [workspaceNotice,setWorkspaceNotice]=useState('');
 const [demoProject,setDemoProject]=useState(false);
 const workspaceReady=useRef(false);

 useEffect(()=>{
  fetch(QUEUE,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Production queue unavailable');return r.json();})
   .then(d=>{const q=d.projects||[];setQueue(q);if(q.length)setSelectedPath(q[0].path);})
   .catch(e=>setStatus(e.message));
  return()=>{for(const url of assetUrls.current.values())URL.revokeObjectURL(url);};
 },[]);
 useEffect(()=>{
  if(!selectedPath)return;
  let active=true;workspaceReady.current=false;setWorkspaceNotice('');setDemoProject(false);setStatus('');setProject(null);setCuts([]);setAssets([]);setManualEdits(false);setActiveIndex(0);
  for(const url of assetUrls.current.values())URL.revokeObjectURL(url);
  assetUrls.current.clear();setVoice(null);
  fetch(selectedPath,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Fight briefing is unavailable');return r.json();}).then(d=>{
   if(!active)return;setProject(d);setScript(formatScript(d,format));
   try{
    const cached=JSON.parse(localStorage.getItem(CUT_KEY+d.slug+'-'+format)||'null');
    if(cached?.script)setScript(cached.script);
   }catch{}
  }).catch(e=>setStatus(e.message));
  return()=>{active=false;};
 },[selectedPath]);
 useEffect(()=>{
  if(!project?.slug)return;
  let active=true;
  workspaceReady.current=false;setManualEdits(true);
  setCuts([]);setActiveIndex(0);setIsPlaying(false);
  setResultUrl('');setResultBlob(null);setVoice(null);setVoiceUrl('');
  (async()=>{
   let files=[],prior=null,recordedVoice=null;const messages=[];
   try{files=await getVideos(project.slug);}catch(e){messages.push('Device media storage unavailable: '+e.message);}
   try{prior=await getEdit(project.slug,format);}catch(e){messages.push('Previous cuts could not be restored: '+e.message);}
   try{recordedVoice=await getVoice(project.slug,format);}catch(e){messages.push('Previous narration could not be restored: '+e.message);}
   if(!active)return;
   for(const url of assetUrls.current.values())URL.revokeObjectURL(url);
   assetUrls.current.clear();
   const restored=files.filter(x=>x.file).map(x=>{
    const objectUrl=URL.createObjectURL(x.file);assetUrls.current.set(x.id,objectUrl);
    return {...x,objectUrl};
   });
   setAssets(restored);
   if(recordedVoice)setVoice(recordedVoice);
   let savedScript=prior?.script;
   try{const cached=JSON.parse(localStorage.getItem(CUT_KEY+project.slug+'-'+format)||'null');if(!savedScript&&cached?.script)savedScript=cached.script;}catch{}
   const text=savedScript||formatScript(project,format);
   setScript(text);
   setCuts(prior?.cuts?.length?prior.cuts:planCuts({script:text,format,assets:restored}));
   setManualEdits(Boolean(prior?.cuts?.length));
   setWorkspaceNotice(messages.join(' '));workspaceReady.current=true;
  })();
  return ()=>{active=false;workspaceReady.current=false;};
 },[format,project?.slug]);
 useEffect(()=>{
  if(!project||!script)return;
  try{localStorage.setItem(CUT_KEY+project.slug+'-'+format,JSON.stringify({script}));}catch{}
 },[script,project?.slug,format]);
 useEffect(()=>{
  if(!project||!script.trim()||manualEdits||!workspaceReady.current)return;
  setCuts(planCuts({script,format,assets}));setActiveIndex(0);
 },[project?.slug,format,assets,script,manualEdits]);
 useEffect(()=>{
  if(!project?.slug||!workspaceReady.current)return;
  const timer=setTimeout(()=>{saveEdit(project.slug,format,{script,cuts}).catch(e=>setWorkspaceNotice('This edit could not be saved: '+e.message));},450);
  return()=>clearTimeout(timer);
 },[script,cuts,project?.slug,format]);
  const selected=cuts[activeIndex]||null;
 const asset=assets.find(a=>a.id===selected?.assetId)||null;
 const playable=Boolean(asset?.objectUrl);
 const missing=cuts.filter(c=>!assets.some(a=>a.id===c.assetId));
 const total=cuts.reduce((n,c)=>n+(Number(c.duration)||0),0);
 const rightsReady=cuts.length>0&&cuts.every(c=>assets.some(a=>a.id===c.assetId&&a.rightsReviewed));
 const currentlyReady=rightsReady&&missing.length===0&&!working;
 const previewDuration=total?time(total):'—';
 const sourceStatus=assets.length?assets.map(a=>WORDING[a.kind]).join(', '):'Not yet supplied';
 const setCut=(patch)=>{setManualEdits(true);setCuts(old=>old.map((c,i)=>i===activeIndex?{...c,...patch}:c));};

 const addAsset=async(file,kind,referenceUrl='',approvedDemo=false)=>{
  if(!file)return;
  if(!file.type.startsWith('video/')){setStatus('Choose a real MP4, MOV or WebM video file.');return;}
  setWorking(true);setStatus('Reading '+file.name+'…');setProgress(0);
  try{
   const duration=await getDuration(file);
   if(!Number.isFinite(duration)||duration<=0)throw Error('Video has no recognised duration.');
   const id='media-'+Date.now()+'-'+Math.random().toString(36).slice(2,6);
   const url=URL.createObjectURL(file);assetUrls.current.set(id,url);
   const item={id,kind,title:file.name,file,duration,objectUrl:url,referenceUrl,rightsReviewed:Boolean(approvedDemo),peaks:[]};
   try{await saveVideo(project.slug,item);}catch(err){setWorkspaceNotice('Video usable now, but not saved offline: '+err.message);}
   setAssets(old=>[...old,item]);
   setStatus('Real footage loaded. Analysing changes of scene and motion to create possible cut points…');
   try{
    const scanned=await scanActionPeaks(file,{onProgress:setProgress});
    item.peaks=scanned.peaks;
    setAssets(old=>old.map(a=>a.id===id?{...a,peaks:scanned.peaks}:a));
    saveVideo(project.slug,{...item,peaks:scanned.peaks}).catch(e=>setWorkspaceNotice('Motion analysis was not saved: '+e.message));
    setStatus('Footage analysed. Press “Assemble my video” to build an editable rough cut.');
   }catch(err){setStatus('Footage loaded; advanced motion scan unavailable. Auto edit can still make a provisional cut from the video.');}
  }catch(e){setStatus('Source video error: '+e.message);throw e;}
  finally{setWorking(false);setProgress(0);}
 };
 const loadPublicDemo=async()=>{
  if(!project||working)return;
  setWorking(true);setProgress(0);
  setStatus('Fetching historic public-domain boxing footage from Wikimedia Commons…');
  try{
   const movie=await loadDemoFile({onProgress:setProgress});
   setWorking(false);
   await addAsset(movie,'fight',DEMO.original,true);
   setDemoProject(true);setScript(DEMO.script);setManualEdits(false);
   setStatus('Real historical boxing footage loaded and ready to edit. This is NOT a current Dubois–Wardley video.');
  }catch(e){setStatus('Demo did not download: '+e.message+' Use the manual file link and upload it instead.');}
  finally{setWorking(false);setProgress(0);}
 };
 async function removeAsset(id){
  const target=assets.find(a=>a.id===id);if(!target)return;
  try{await deleteVideo(project.slug,id);}catch(e){setWorkspaceNotice('Removing saved footage failed: '+e.message);}
  if(target.objectUrl){URL.revokeObjectURL(target.objectUrl);assetUrls.current.delete(id);}
  setAssets(list=>list.filter(a=>a.id!==id));setManualEdits(false);
  setStatus('Source removed; rebuilding cuts from the remaining footage.');
 }
 const setReviewed=(id,checked)=>setAssets(old=>old.map(a=>{
  if(a.id!==id)return a;const next={...a,rightsReviewed:checked};
  saveVideo(project.slug,next).catch(e=>setWorkspaceNotice('Usage status was not saved: '+e.message));
  return next;
 }));
 const autoAssemble=()=>{
  if(!script.trim()){setStatus('No narration yet. Add or edit the voiceover script first.');return;}
  if(!assets.length){setStatus('Attach genuine fight or press-conference video files first. Source links alone cannot be copied into an MP4.');return;}
  const result=planCuts({script,format,assets});
  setManualEdits(false);setCuts(result);setActiveIndex(0);setIsPlaying(false);setResultUrl('');setResultBlob(null);
  setStatus(`A ${result.length}-scene rough cut has been assembled from real uploaded video. Review the actual exchanges and adjust any incorrect selections before publishing.`);
 };
 const play=useCallback(()=>{
  const audio=narrationRef.current;if(audio){audio.currentTime=0;audio.play().catch(()=>{});}
  setActiveIndex(0);setIsPlaying(true);
 },[]);
 useEffect(()=>{
  const v=videoRef.current;
  if(!isPlaying||!v||!selected)return;
  try{v.currentTime=Math.max(0,selected.start);}catch{}
  v.play().catch(()=>{});
 },[isPlaying,activeIndex,asset?.objectUrl]);
 useEffect(()=>{
  if(!isPlaying){narrationRef.current?.pause();}
 },[isPlaying]);
 const handleLoaded=()=>{
  const v=videoRef.current,c=cuts[activeIndex];if(!v||!c)return;
  try{v.currentTime=Math.min(c.start,Math.max(0,v.duration-.1));}catch{}
  if(isPlaying)v.play().catch(()=>setIsPlaying(false));
 };
 const timeUpdate=()=>{
  const v=videoRef.current,c=cuts[activeIndex];if(!v||!c||!isPlaying)return;
  if(v.currentTime>=Number(c.start)+Number(c.duration)-.08){
   if(activeIndex<cuts.length-1){setActiveIndex(i=>i+1);}else{setIsPlaying(false);v.pause();narrationRef.current?.pause();}
  }
 };
 const selectCut=i=>{setActiveIndex(i);setIsPlaying(false);narrationRef.current?.pause();};
 const moveCut=(i,d)=>{
  setManualEdits(true);
  setCuts(old=>{const a=[...old],to=i+d;if(to<0||to>=a.length)return old;[a[i],a[to]]=[a[to],a[i]];return a;});
  setActiveIndex(Math.max(0,Math.min(cuts.length-1,i+d)));setIsPlaying(false);
 };
 const deleteCut=()=>{
  setManualEdits(true);
  setCuts(old=>old.filter((_,i)=>i!==activeIndex));
  setActiveIndex(i=>Math.max(0,i-1));setIsPlaying(false);
 };
 const replaceSource=(id)=>{setCut({assetId:id,start:0});setIsPlaying(false);};
 const startVoice=async()=>{
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){setStatus('Recording requires microphone access. You can upload an audio file instead.');return;}
  try{
   const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
   const mime=['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(m=>MediaRecorder.isTypeSupported(m));
   const r=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);
   recorderRef.current=r;chunksRef.current=[];
   r.ondataavailable=e=>{if(e.data?.size)chunksRef.current.push(e.data);};
   r.onstop=()=>{
    const ext=r.mimeType.includes('mp4')?'m4a':'webm';
    const newFile=new File(chunksRef.current,project.slug+'-'+format+'-voiceover.'+ext,{type:r.mimeType});
    setVoice(newFile);setRecording(false);stream.getTracks().forEach(t=>t.stop());
    setStatus('Voiceover recorded. Listen to it below, then preview or export with your real clips.');
   };
   r.onerror=()=>{setRecording(false);stream.getTracks().forEach(t=>t.stop());setStatus('Recording failed.');};
   r.start();setRecording(true);setStatus('Recording — read your narration script.'); 
  }catch(e){setStatus('Microphone access failed: '+e.message);}
 };
 const stopVoice=()=>{if(recorderRef.current?.state==='recording')recorderRef.current.stop();};
 useEffect(()=>{
  if(!voice){setVoiceUrl('');return;}
  const url=URL.createObjectURL(voice);setVoiceUrl(url);
  return()=>URL.revokeObjectURL(url);
 },[voice]);
 useEffect(()=>{
  if(!project?.slug||!voice||!workspaceReady.current)return;
  saveVoice(project.slug,format,voice).catch(e=>setWorkspaceNotice('Audio could not be saved to the device: '+e.message));
 },[voice,format,project?.slug]);
 const doExport=async()=>{
  if(!currentlyReady)return;
  setWorking(true);setStatus('Preparing the real-footage MP4…');setResultUrl('');setResultBlob(null);
  try{
   const blob=await exportAutoVideo({cuts,assets,format,voiceFile:voice,onStatus:setStatus});
   const url=URL.createObjectURL(blob);setResultUrl(url);setResultBlob(blob);
   setStatus('Finished MP4 ready to preview and download. This video has NOT been posted anywhere.');
  }catch(e){setStatus('Export did not complete: '+e.message);}
  finally{setWorking(false);}
 };
 const sourceRefs=(project?.sources||[]).filter(s=>/^https?:\/\//.test(s.url||''));
 const srtTime=t=>{
  const v=Math.max(0,Math.floor(t*1000)),h=Math.floor(v/3600000),m=Math.floor(v/60000)%60,s=Math.floor(v/1000)%60,ms=v%1000;
  return [h,m,s].map(n=>String(n).padStart(2,'0')).join(':')+','+String(ms).padStart(3,'0');
 };
 function exportCaptions(){
  let elapsed=0;
  const captions=cuts.map((c,i)=>{
   const from=elapsed;elapsed+=Number(c.duration)||0;
   return (i+1)+'\n'+srtTime(from)+' --> '+srtTime(elapsed)+'\n'+c.narration+'\n';
  }).join('\n');
  save(new Blob([captions],{type:'text/plain'}),project.slug+'-'+format+'.srt');
 }
 return <><Header/><main className="aura-edit-main">
  <header className="aura-edit-header">
   <div><p className="aura-edit-kicker">AURA FIGHT CLUB / VIDEO PRODUCTION</p><h1>Film Room Studio</h1>
    <p>Real footage. Real boxing analysis. Your voice. One finished video.</p></div>
   <div className="aura-edit-header-links"><Link to="/admin/social">Social posts</Link><Link to="/admin/video-production/advanced">Advanced setup</Link></div>
  </header>
  <section className="aura-edit-demo">
   <div className="aura-edit-demo-copy">
    <strong>TEST THE EDITOR — no API key or fight download needed</strong>
    <p>Load genuine public-domain boxing footage from 1891, then preview the automatically arranged clips, record your voice, and export a sample MP4. This is historical test footage, not footage from a modern title fight.</p>
    <a href={DEMO.original} target="_blank" rel="noopener noreferrer">Check the public-domain film and its source ↗</a>
   </div>
   <div className="aura-edit-demo-controls">
    <button type="button" className="aura-edit-primary" onClick={loadPublicDemo} disabled={!project||working}>
     {working?'Loading the boxing demo…':'▶ Load test boxing footage'}
    </button>
    <a href={DEMO.mediaUrl} target="_blank" rel="noopener noreferrer">Manual demo download ↗</a>
   </div>
  </section>
  <div className="aura-edit-top">
   <label className="aura-edit-select">Choose the fight
    <select value={selectedPath} onChange={e=>setSelectedPath(e.target.value)}>{queue.map(x=><option key={x.path} value={x.path}>{x.date} · {x.name}</option>)}</select>
   </label>
   <div className="aura-edit-formats" role="group" aria-label="Video format">
    <button type="button" className={format==='shorts'?'on':''} onClick={()=>setFormat('shorts')}>Vertical / TikTok</button>
    <button type="button" className={format==='youtube'?'on':''} onClick={()=>setFormat('youtube')}>YouTube / Widescreen</button>
   </div>
  </div>
  {project?<div className="aura-edit-workspace">
   <section className="aura-edit-viewer-panel">
    {demoProject&&<p className="aura-edit-demo-flag">Real historical boxing — test project only</p>}
    {workspaceNotice&&<p className="aura-edit-persist-warning" role="status">{workspaceNotice}</p>}
    <div className="aura-edit-panel-head"><h2>Video preview</h2><span>{cuts.length?cuts.length+' clips · '+previewDuration:'No video assembled'}</span></div>
    <div className={'aura-edit-screen '+(format==='shorts'?'vertical':'widescreen')}>
     {playable?<video key={asset.objectUrl+'-'+activeIndex} ref={videoRef} controls={!isPlaying} playsInline preload="auto"
       src={asset.objectUrl} onLoadedMetadata={handleLoaded} onTimeUpdate={timeUpdate} onEnded={timeUpdate} muted />:
      <div className="aura-edit-empty-view"><span className="aura-edit-film-icon">▶</span><strong>{assets.length?'Select a clip to preview':'Your scripted rough cut is waiting for genuine footage'}</strong><small>No generated boxers or slideshow placeholders</small></div>}
     {selected&&<div className="aura-edit-viewer-caption"><span>FIGHT INTELLIGENCE</span><strong>{selected.caption||selected.narration?.slice(0,86)||'Review this sequence'}</strong></div>}
    </div>
    {voiceUrl&&<audio ref={narrationRef} src={voiceUrl} preload="metadata" aria-label="Voiceover preview" hidden/>}
    <div className="aura-edit-viewer-tools">
     <button type="button" onClick={play} disabled={!cuts.length||missing.length>0}>▶ Play assembled edit</button>
     {isPlaying&&<button type="button" onClick={()=>{setIsPlaying(false);videoRef.current?.pause();}}>Pause</button>}
     <span>{cuts.length?activeIndex+1+' / '+cuts.length:'Waiting for footage'}</span>
    </div>
    <div className="aura-edit-divider"/>
    <div className="aura-edit-panel-head"><h2>Your video timeline</h2><span>Click a shot to edit it</span></div>
    <div className="aura-edit-timeline" aria-label="Editable assembled video clips">
     {cuts.length?cuts.map((c,i)=>{
      const src=assets.find(a=>a.id===c.assetId);
      return <button type="button" key={c.id} onClick={()=>selectCut(i)} className={'aura-edit-shot '+(i===activeIndex?'active':'')}>
       <span>{String(i+1).padStart(2,'0')} · {time(c.duration)}</span>
       <strong>{WORDING[c.role]||'Real footage'}</strong>
       <small>{src?.title||'Video required'}</small>
      </button>;
     }):<p className="aura-edit-placeholder">Your script is broken into draft scenes automatically. Attach real fight footage to fill those scenes and preview the edit.</p>}
    </div>
    {selected&&<div className="aura-edit-shot-settings">
     <h3>Edit selected scene</h3>
     <label>Which real video?<select value={selected.assetId||''} onChange={e=>replaceSource(e.target.value)}>
      <option value="">Choose footage</option>{assets.map(a=><option key={a.id} value={a.id}>{a.title}</option>)}
     </select></label>
     <div className="aura-edit-inline">
      <label>Start (seconds)<input type="number" step=".1" min="0" value={selected.start}
       onChange={e=>setCut({start:Math.max(0,Number(e.target.value))})}/></label>
      <label>Clip length (seconds)<input type="number" step=".1" min=".2" max="12" value={selected.duration}
       onChange={e=>setCut({duration:Math.max(.2,Math.min(12,Number(e.target.value)||.2))})}/></label>
     </div>
     <label>On-screen caption<input value={selected.caption} placeholder="Explain the exchange" onChange={e=>setCut({caption:e.target.value})}/></label>
     <div className="aura-edit-scene-narration">{selected.narration}</div>
     <div className="aura-edit-inline-buttons"><button onClick={()=>moveCut(activeIndex,-1)} disabled={activeIndex===0}>← Earlier</button><button onClick={()=>moveCut(activeIndex,1)} disabled={activeIndex===cuts.length-1}>Later →</button><button onClick={deleteCut}>Remove scene</button></div>
    </div>}
   </section>
   <aside className="aura-edit-sidebar">
    <section className="aura-edit-card">
     <div className="aura-edit-panel-head"><h2>1. Footage</h2><span>{assets.length} real sources loaded</span></div>
     <p>Search and watch authentic fight videos, add YouTube research references, then upload or import video files for automated scene cuts.</p>
     <AuraFootageFinder project={project} onAddFile={addAsset} working={working} onNotice={setStatus}/>
     {assets.map(a=><div key={a.id} className="aura-edit-asset">
      <div><strong>{a.title}</strong><small>{WORDING[a.kind]} · {time(a.duration)} · {a.peaks.length} suggested moments</small>{a.referenceUrl&&<a href={a.referenceUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:'#dfc28f'}}>View source ↗</a>}</div>
      <div className="aura-edit-asset-actions"><button type="button" onClick={()=>save(a.file,a.title)}>Save file</button><label><input type="checkbox" checked={a.rightsReviewed} onChange={e=>setReviewed(a.id,e.target.checked)}/> Usage reviewed</label><button type="button" onClick={()=>removeAsset(a.id)}>Remove</button></div>
     </div>)}
    </section>
    <section className="aura-edit-card">
     <div className="aura-edit-panel-head"><h2>2. Narration script</h2><span>Editable</span></div>
     <textarea rows={format==='shorts'?7:10} value={script} onChange={e=>setScript(e.target.value)}
      aria-label="Narration script" placeholder="The fight analysis narration appears here for editing."/>
     <div className="aura-edit-inline-buttons"><button type="button" className="aura-edit-primary" onClick={autoAssemble} disabled={!assets.length||working||!script.trim()}>✂ Assemble my video</button></div>
     <small className="aura-edit-hint">Rough-cut timing follows the words you narrate. Automatically selected motion is a draft, not independently verified tactical evidence.</small>
    </section>
    <section className="aura-edit-card">
     <div className="aura-edit-panel-head"><h2>3. Record your voiceover</h2><span>{recording?'● Recording':'Optional for silent draft'}</span></div>
     <div className="aura-edit-inline-buttons">
      <button onClick={startVoice} disabled={recording}>● Record</button><button onClick={stopVoice} disabled={!recording}>■ Stop</button>
     </div>
     <label className="aura-edit-audio-upload">Or upload a voice recording<input type="file" accept="audio/*" onChange={e=>setVoice(e.target.files?.[0]||null)}/></label>
     {voiceUrl&&<audio controls src={voiceUrl}/>}
     <small className="aura-edit-hint">Listen back, review the script and adjust clip lengths to your speaking pace.</small>
    </section>
    <section className="aura-edit-card aura-edit-export">
     <div className="aura-edit-panel-head"><h2>4. Export video</h2><span>MP4</span></div>
     <p>{format==='shorts'?'Vertical video, optimised for TikTok / Reels / YouTube Shorts.':'Widescreen analysis, designed for YouTube.'}</p>
     <button type="button" className="aura-edit-primary" onClick={doExport} disabled={!currentlyReady}>▶ Render finished MP4</button>
     {cuts.length>0&&!rightsReady&&<small>Review the footage source usage to enable rendering.</small>}
     {cuts.length===0&&<small>Assemble your real video first.</small>}
     {cuts.length>0&&<button type="button" onClick={exportCaptions}>Download timed subtitles (.srt)</button>}
     {resultUrl&&<div className="aura-edit-rendered"><strong>Finished edit</strong><video src={resultUrl} controls playsInline/>
      <button type="button" onClick={()=>save(resultBlob,project.slug+'-'+format+'.mp4')}>Download finished MP4</button></div>}
     <small className="aura-edit-hint">Current export runs in your browser without Lovable/API credits. It may be too memory-intensive for long footage on phones; desktop Chrome is recommended. No automatic social publishing.</small>
    </section>
   </aside>
  </div>:<div className="aura-edit-loading">{status||'Opening your fight production…'}</div>}
  {working&&<div className="aura-edit-working"><span className="aura-edit-spinner"/>{status}{progress>0?' '+progress+'%':''}</div>}
  {!working&&status&&<div className="aura-edit-status" role="status">{status}</div>}
  <footer className="aura-edit-foot"><Link to="/admin/social">Social studio</Link> · <Link to="/news">Fight Desk articles</Link> · <Link to="/admin/video-production/advanced">Research and advanced controls</Link></footer>
 </main><Footer/></>;
}
