import {useEffect,useMemo,useRef,useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {Clapperboard,Film,AudioLines,ShieldAlert,Play,RefreshCw,CheckCircle2} from 'lucide-react';
import Header from '../components/Header.jsx';
import AuraApprovedYouTube from '../components/AuraApprovedYouTube.jsx';
import Footer from '../components/Footer.jsx';
import {buildNarrationShots,minutesForShots,storyboardCoverage} from '../lib/auraAutoFilmStoryboard.js';
import {inspectFilmArtifact,extractEditableFilmClips} from '../lib/auraFilmArtifact.js';
import {saveVideo,saveEdit,saveVoice} from '../lib/auraMediaVault.js';
import '../styles/aura-auto-film-producer.css';

const FORMAT=[{value:'analysis',label:'Fight analysis'},{value:'prediction',label:'Fight prediction'},{value:'profile',label:'Fighter profile'},{value:'critique',label:'Critical breakdown'}];
export default function AdminAutoFilmProducer(){
 const navigate=useNavigate();
 const [queue,setQueue]=useState([]);
 const [selected,setSelected]=useState('');
 const [project,setProject]=useState(null);
 const [kind,setKind]=useState('analysis');
 const [minutes,setMinutes]=useState(7);
 const [config,setConfig]=useState(null);
 const [password,setPassword]=useState('');
 const [status,setStatus]=useState('');
 const [sending,setSending]=useState(false);
 const [showScenes,setShowScenes]=useState(false);
 const [jobs,setJobs]=useState([]);
 const [jobState,setJobState]=useState('');
 const [jobsLoading,setJobsLoading]=useState(false);
 const [downloading,setDownloading]=useState(0);
 const [archiveLink,setArchiveLink]=useState('');
 const [draftPreview,setDraftPreview]=useState(null);
 const [draftVideoUrl,setDraftVideoUrl]=useState('');
 const [draftPack,setDraftPack]=useState(null);
 const [openingEditor,setOpeningEditor]=useState(false);
 const [voiceover,setVoiceover]=useState(null);
 const [voiceoverUrl,setVoiceoverUrl]=useState('');
 const [isNarrating,setIsNarrating]=useState(false);
 const [playhead,setPlayhead]=useState(0);
 const videoRef=useRef(null),recorderRef=useRef(null),chunksRef=useRef([]);
 useEffect(()=>{
  Promise.all([
   fetch('/news/video-production/index.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Fight research queue unavailable');return r.json();}),
   fetch('/api/auto-film',{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null)
  ]).then(([list,settings])=>{
    const all=(list.projects||[]);
    setQueue(all);setConfig(settings);if(all.length)setSelected(all[0].path);
  }).catch(e=>setStatus(e.message));
 },[]);
 useEffect(()=>{
  if(!selected)return;
  const ctrl=new AbortController();
  setProject(null);setStatus('');setJobs([]);setJobState('');setArchiveLink('');setDraftPreview(null);setDraftPack(null);setVoiceover(null);setPlayhead(0);
  fetch(selected,{signal:ctrl.signal,cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Fight production briefing is missing');return r.json();})
   .then(setProject).catch(e=>{if(e.name!=='AbortError')setStatus(e.message);});
  return()=>ctrl.abort();
 },[selected]);
 const script=project?.scripts?.youtube?.draft||project?.narrationScript||'';
 const shots=useMemo(()=>buildNarrationShots(script),[script]);
 const coverage=useMemo(()=>storyboardCoverage(shots,project?.sources),[shots,project?.sources]);
 useEffect(()=>{
  if(!draftPreview?.video){setDraftVideoUrl('');return;}
  const url=URL.createObjectURL(draftPreview.video);
  setDraftVideoUrl(url);
  return()=>URL.revokeObjectURL(url);
 },[draftPreview]);
 useEffect(()=>{
  if(!voiceover){setVoiceoverUrl('');return;}
  const url=URL.createObjectURL(voiceover);
  setVoiceoverUrl(url);
  return()=>URL.revokeObjectURL(url);
 },[voiceover]);
 const activeCue=shots.find(s=>playhead>=s.start&&playhead<s.end)?.narration||shots[Math.min(shots.length-1,Math.max(0,Math.floor(playhead/5)))]?.narration||'';
 const ready=Boolean(config?.ready);
 const selectedFight=queue.find(x=>x.path===selected);
 const measured=minutesForShots(shots);
 const actualLengthOk=measured>=4.5&&measured<=10.5;
 const hasActualFootage=coverage.actualFighterFootage>0;
 async function checkJobs(){
  if(!selectedFight||!password){setJobState('Enter the Aura editor password to view private production jobs.');return;}
  setJobsLoading(true);setJobState('Checking the automatic film worker…');
  try{
   const response=await fetch('/api/auto-film-jobs?fightId='+encodeURIComponent(selectedFight.fightId),{
    headers:{Authorization:'Bearer '+password},cache:'no-store'
   });
   const payload=await response.json();
   if(!response.ok)throw Error(payload.error||'Could not retrieve video jobs.');
   setJobs(payload.jobs||[]);
   setJobState(payload.jobs?.length?'Job history loaded. Completed jobs provide a draft ZIP or a missing-media report.':'No automatic production runs for this fight yet.');
  }catch(e){setJobState(e.message);}
  finally{setJobsLoading(false);}
 }
 async function startNarration(){
  if(!draftVideoUrl||!videoRef.current)return setJobState('Open a completed rough cut before recording.');
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)return setJobState('This browser does not support microphone recording. Try Safari or Chrome.');
  try{
   const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
   const mime=['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(x=>MediaRecorder.isTypeSupported(x));
   const recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);
   recorderRef.current=recorder;chunksRef.current=[];
   recorder.ondataavailable=event=>{if(event.data?.size)chunksRef.current.push(event.data);};
   recorder.onstop=()=>{
    stream.getTracks().forEach(t=>t.stop());
    const extension=recorder.mimeType.includes('mp4')?'m4a':'webm';
    setVoiceover(new File(chunksRef.current,(selectedFight?.fightId||'aura')+'-narration.'+extension,{type:recorder.mimeType}));
    setIsNarrating(false);
    setJobState('Narration recorded. Review and download the audio alongside your edited video. The server-side final mix still requires private media storage.');
   };
   recorder.onerror=()=>{stream.getTracks().forEach(t=>t.stop());setIsNarrating(false);setJobState('Microphone recording was interrupted.');};
   videoRef.current.currentTime=0;videoRef.current.muted=true;
   recorder.start();setIsNarrating(true);
   await videoRef.current.play().catch(()=>{});
   setJobState('Recording your commentary over the prepared video. Stop when finished.');
  }catch(error){setJobState('Microphone access failed: '+error.message);}
 }
 function stopNarration(){
  if(recorderRef.current?.state==='recording')recorderRef.current.stop();
  videoRef.current?.pause();
 }
 async function loadLocalEditPack(file){
  if(!file)return;
  setJobState('Opening exported Aura video and scene files from this device…');
  setDraftPack(null);setDraftPreview(null);
  try{
   const bytes=await file.arrayBuffer();
   const inspected=await inspectFilmArtifact(bytes);
   setDraftPack(bytes);setDraftPreview(inspected);
   setJobState(inspected.report?.testFixture?'Technical test footage loaded. These are not modern fight clips.':inspected.description);
  }catch(error){setJobState('Could not open the edit pack: '+error.message);}
 }
 async function openEditableTimeline(){
  if(!draftPack||!project?.slug||!selectedFight)return setJobState('Open a completed video draft ZIP before editing.');
  setOpeningEditor(true);setJobState('Transferring the automatically cut MP4 scenes into your Film Room editor…');
  try{
   const result=await extractEditableFilmClips(draftPack);
   const key='auto-'+Date.now();
   const cuts=[];
   for(let i=0;i<result.clips.length;i++){
    const clip=result.clips[i],id=key+'-'+String(i+1).padStart(3,'0');
    const file=new File([clip.blob],clip.filename,{type:'video/mp4'});
    await saveVideo(project.slug,{
     id,title:clip.title,kind:clip.kind,file,duration:clip.duration,
     referenceUrl:clip.referenceUrl,rightsReviewed:false,peaks:[]
    });
    cuts.push({id:'auto-cut-'+i,assetId:id,sourceId:null,start:0,
      duration:clip.duration,caption:'',narration:clip.narration,
      role:clip.kind==='faceoff'?'weighin':clip.kind==='broll'?'training':clip.kind,
      reviewStatus:'suggested_not_verified',usedFallback:false});
   }
   await saveEdit(project.slug,'youtube',{
    script:project?.scripts?.youtube?.draft||project?.narrationScript||'',
    cuts
   });
   if(voiceover)await saveVoice(project.slug,'youtube',voiceover);
   setJobState(cuts.length+' real MP4 scene files saved locally. Opening the editor.');
   navigate('/admin/video-production/editor?fightId='+encodeURIComponent(selectedFight.fightId));
  }catch(error){setJobState('Could not import the editable footage: '+error.message);}
  finally{setOpeningEditor(false);}
 }
 async function getArtifact(artifactId,preview=true){
  if(!password)return setJobState('Enter the editor password first.');
  setDownloading(artifactId);setDraftPreview(null);setArchiveLink('');
  setJobState(preview?'Opening automatic video rough cut…':'Getting a secure clip-pack download…');
  try{
   const response=await fetch('/api/auto-film-download',{
    method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+password},
    body:JSON.stringify({fightId:selectedFight.fightId,artifactId})
   });
   const data=await response.json();
   if(!response.ok)throw Error(data.error||'Draft retrieval failed.');
   setArchiveLink(data.url);
   if(!preview){
    setJobState('Your complete scene pack is ready. Use the Download ZIP link below; it includes individual edited shots when rendering succeeded.');
    return;
   }
   try{
    const pack=await fetch(data.url,{credentials:'omit',mode:'cors'});
    if(!pack.ok)throw Error('The signed artifact download returned '+pack.status);
    const len=Number(pack.headers.get('content-length')||0);
    if(len>100*1024*1024)throw Error('The footage pack is too large for an in-browser preview.');
    const buffer=await pack.arrayBuffer();
    const inspected=await inspectFilmArtifact(buffer);
    setDraftPack(buffer);
    setDraftPreview(inspected);
    setJobState(inspected.description);
   }catch(error){
    setJobState('Direct video preview is unavailable ('+error.message+'). Use the secure Download ZIP link below to obtain the MP4, individual clips and script.');
   }
  }catch(e){setJobState(e.message);}
  finally{setDownloading(0);}
 }
 async function start(){
  if(!selectedFight){setStatus('Select a researched boxing fight first.');return;}
  setSending(true);setStatus('Requesting automatic film production…');
  try{
   const response=await fetch('/api/auto-film',{
    method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+password},
    body:JSON.stringify({fightId:selectedFight.fightId,mode:'prepare',kind,targetMinutes:minutes})
   });
   const result=await response.json();
   if(!response.ok)throw Error(result.error||'Automatic production could not be queued.');
   setStatus('Automatic video research queued for '+result.subject+'. The worker will only render from lawful video assets. The output remains a draft, not a published video.');
   setJobState('Production requested. Press Check job results to track the backend render and download the review pack.');
  }catch(e){setStatus(e.message);}
  finally{setSending(false);}
 }
 return <><Header/><main className="aura-producer">
  <div className="aura-producer-eyebrow">AURA FIGHT CLUB · AUTOMATED FILM ROOM</div>
  <div className="aura-producer-top">
   <div><h1>One subject. One prepared video.</h1>
    <p>A real boxing analysis studio: research the footage, prepare clips, assemble a narrated five-to-ten-minute structure, then record your commentary.</p></div>
   <Link to="/admin/video-production/editor">Manual editor / existing recordings →</Link>
  </div>
  <section className="aura-producer-create">
    <div className="aura-producer-controls">
      <label>1 · What is the video about?
       <select value={selected} onChange={e=>setSelected(e.target.value)}>
        {queue.map(q=><option key={q.path} value={q.path}>{q.name}</option>)}
       </select>
      </label>
      <label>2 · Type of video
       <select value={kind} onChange={e=>setKind(e.target.value)}>
        {FORMAT.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}
       </select>
      </label>
      <label>3 · Target duration
       <select value={minutes} onChange={e=>setMinutes(Number(e.target.value))}>
        <option value={5}>5-minute commentary</option>
        <option value={7}>7-minute commentary</option>
        <option value={10}>10-minute commentary</option>
       </select>
      </label>
    </div>
    <div className="aura-producer-pipeline">
      <div><Film size={18}/><strong>Find actual footage</strong><small>Licensed clip sources, tagged by subject</small></div>
      <div><Clapperboard size={18}/><strong>Clip and edit</strong><small>Real MP4 scene selections and transitions</small></div>
      <div><AudioLines size={18}/><strong>Lay out narration</strong><small>Script timed against the assembled shots</small></div>
      <div><Play size={18}/><strong>Ready to record</strong><small>Silent rough cut for your narration</small></div>
    </div>
    <div className="aura-producer-action">
      <div>
        <h2>Prepare the full video automatically</h2>
        <p>Find reusable footage, download the actual files into the backend editor and assemble them into a draft. No manual YouTube searching.</p>
        {!ready&&<p className="aura-producer-note"><ShieldAlert size={14}/> Backend job connection is not configured on this deployment yet. The plan below is available, but the render cannot start.</p>}
      </div>
      <div className="aura-producer-launch">
        {ready&&<input type="password" autoComplete="off" aria-label="Aura editor password" placeholder="Aura editor password" value={password} onChange={e=>setPassword(e.target.value)}/>}
        <button type="button" onClick={start} disabled={!project||!ready||!password||sending}>
          {sending?<><RefreshCw size={17}/> Preparing…</>:<><Clapperboard size={17}/> Generate my rough cut</>}
        </button>
      </div>
    </div>
    {status&&<div className="aura-producer-status" role="status">{status}</div>}
  </section>
  <section className="aura-producer-card aura-producer-jobs">
   <div className="aura-producer-cardtitle"><h2>Produced drafts and job status</h2>
    <button type="button" onClick={checkJobs} disabled={!password||!selectedFight||jobsLoading}>{jobsLoading?'Checking…':'Check job results'}</button>
   </div>
   <p>Each production runs in the background. When complete, inspect its genuine footage report and download any finished rough-cut MP4. Nothing is published automatically.</p>
   {!ready&&<p className="aura-producer-note">The production workflow is not yet activated in this deployment. Its source code is in the GitHub review branch.</p>}
   {!password&&<label className="aura-producer-job-login">Aura editor password for private job history
      <input type="password" autoComplete="off" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Editor password"/>
    </label>}
   {jobState&&<div className="aura-producer-status" role="status">{jobState}</div>}
   <label className="aura-producer-local-zip">Already have an Aura-produced video pack?
    <input type="file" accept=".zip,application/zip" onChange={e=>{const file=e.target.files?.[0];if(file)loadLocalEditPack(file);e.target.value='';}} />
   </label>
   {draftPack&&draftPreview?.video&&<button type="button" className="aura-producer-open-editor" disabled={openingEditor} onClick={openEditableTimeline}>
     {openingEditor?'Importing the cut scenes…':'Open all automatic cuts in the editor'}
    </button>}
   {archiveLink&&<a className="aura-producer-archive-link" href={archiveLink} target="_blank" rel="noopener noreferrer">Download full edit pack (.zip) ↗</a>}
   {draftPreview&&<div className="aura-producer-draft-preview">
    <h3>{draftPreview.video?'Automatically edited rough cut':'Production is waiting for real footage'}</h3>
    {draftVideoUrl&&<video ref={videoRef} src={draftVideoUrl} controls playsInline preload="metadata" muted onTimeUpdate={e=>setPlayhead(e.currentTarget.currentTime)} onEnded={stopNarration}/>}
    {draftVideoUrl&&<div className="aura-producer-narration-controls">
      <h4>Record your analysis over the automatic video</h4>
      <p className="aura-producer-teleprompter">{activeCue||'Your prepared narration will follow the video timeline.'}</p>
      <div>
        <button type="button" disabled={isNarrating} onClick={startNarration}>● Start narration</button>
        <button type="button" disabled={!isNarrating} onClick={stopNarration}>■ Stop and save</button>
      </div>
      {voiceoverUrl&&<><audio src={voiceoverUrl} controls/><a href={voiceoverUrl} download={voiceover?.name||'aura-commentary.webm'}>Download narration audio</a></>}
      <small>Recordings are kept locally in this session. Final five-to-ten-minute audio/video merging requires the cloud renderer.</small>
    </div>}
    {draftPreview.video&&<a href={draftVideoUrl} download={(selectedFight?.fightId||'aura')+'-roughcut.mp4'}>Download playable MP4</a>}
    {draftPreview.youtubeResearch&&<div className="aura-producer-video-research">
      <h4>Automatically discovered YouTube footage ({draftPreview.youtubeResearch.found||0})</h4>
      <p>These are matched research videos, not yet downloaded or rights-cleared clips. Videos approved in the source register are retrieved automatically when the backend worker runs.</p>
      {(draftPreview.youtubeResearch.candidates||[]).slice(0,14).map((source,i)=><div className="aura-producer-research-video" key={source.id+'-'+i}>
        <span>{source.kind||'Source'}</span><strong>{source.title||'YouTube research lead'}</strong>
        <small>{source.publisher||'YouTube'} · {source.mediaDownloaded?'Video downloaded':'Permission/usable file pending'}</small>
      </div>)}
    </div>}
    {draftPreview.report?.notes?.length>0&&<div className="aura-producer-draft-notes">
     {draftPreview.report.notes.slice(0,8).map((note,i)=><p key={i}>{note}</p>)}
    </div>}
    <p>{draftPreview.report?.shots?.length||0} edited clips · {Math.round(draftPreview.report?.narrationSecondsEstimate||0)} seconds of proposed narration. Review the footage and rights before narration or publication.</p>
   </div>}
   {jobs.map(job=><div key={job.id} className="aura-producer-job">
     <div>
      <strong>{job.subject||selectedFight?.name}</strong>
      <small>{job.status==='completed'?(job.conclusion==='success'?'Worker finished; check the output':'Worker '+(job.conclusion||'ended')):'Worker '+job.status}
       {job.createdAt?' · '+new Date(job.createdAt).toLocaleString():''}</small>
     </div>
     <div className="aura-producer-job-actions">
      {job.downloadable?.map(x=><div className="aura-producer-pack-actions" key={x.id}>
       <button type="button" disabled={Boolean(downloading)} onClick={()=>getArtifact(x.id,true)}>
        {downloading===x.id?'Opening…':'Watch prepared video'}
       </button>
       <button type="button" disabled={Boolean(downloading)} onClick={()=>getArtifact(x.id,false)}>Get editable clips</button>
      </div>)}
      {job.url&&<a href={job.url} target="_blank" rel="noopener noreferrer">Worker log ↗</a>}
     </div>
   </div>)}
  </section>
  {project&&selectedFight&&<AuraApprovedYouTube project={project} fightId={selectedFight.fightId} password={password}/>}
  <div className="aura-producer-columns">
   <section className="aura-producer-card">
     <div className="aura-producer-cardtitle"><h2>Automatically prepared narration</h2><span>{script.trim().split(/\s+/).filter(Boolean).length} words</span></div>
     <div className="aura-producer-script">{script||'Loading script from the researched fight analysis…'}</div>
     <p>The existing Aura editorial script is the starting point. It is not automatically rewritten to claim things the video hasn't shown.</p>
   </section>
   <section className="aura-producer-card">
     <div className="aura-producer-cardtitle"><h2>Production readiness</h2><span>{selectedFight?.fightStatus||'Draft'}</span></div>
     <div className="aura-producer-summary">
      <div><strong>{shots.length}</strong><small>Automatic scene cuts planned</small></div>
      <div><strong>{measured.toFixed(1)} min</strong><small>Script narration estimate</small></div>
      <div><strong>{coverage.actualFighterFootage}</strong><small>Licensed named-fighter source files</small></div>
      <div><strong>{coverage.licensedVideoCount}</strong><small>Downloadable sources cleared</small></div>
     </div>
     <div className="aura-producer-evidence">
      <p><ShieldAlert size={15}/> The script and source links exist, but these are <b>not yet cut footage</b>. Official broadcaster watch pages do not give the producer an editable file.</p>
      {!actualLengthOk&&<p>To reach a {minutes}-minute analysis, the narration will need expanding or reducing. It currently estimates {measured.toFixed(1)} minutes.</p>}
      {!hasActualFootage&&<p>Fight-action sequences featuring the actual boxers require authorised footage. Generic boxing stock can support atmosphere and training scenes but cannot be presented as actual Wardley–Dubois fight action.</p>}
      {config?.licensedStockConfigured?<p><CheckCircle2 size={14}/> Pexels discovery API configured for illustrative b-roll.</p>:<p>Pexels API not configured; automatic stock footage discovery is unavailable on this deployment.</p>}
     </div>
   </section>
  </div>
  <section className="aura-producer-card aura-producer-storyboard">
   <div className="aura-producer-cardtitle">
    <div><h2>Script-aligned video timeline</h2><p>{shots.length} editorial beats. These are planned cuts, not yet downloaded videos.</p></div>
    <button type="button" onClick={()=>setShowScenes(v=>!v)}>{showScenes?'Collapse':'Show'} all scenes</button>
   </div>
   <div className="aura-producer-scenes">
    {(showScenes?shots:shots.slice(0,12)).map(shot=><div key={shot.id} className="aura-producer-scene">
      <span className="aura-producer-scene-index">{String(shot.scene).padStart(2,'0')}</span>
      <div><strong>{shot.label}</strong><p>{shot.narration}</p></div>
      <div className="aura-producer-scene-time">{Math.round(shot.start)}–{Math.round(shot.end)}s<small>Footage pending</small></div>
     </div>)}
   </div>
  </section>
  <p className="aura-producer-smallprint">This is a draft producer, not a YouTube ripper. Licensed footage can be assembled automatically; copyrighted broadcast clips cannot be taken from YouTube as if they were cleared. Publishing always requires editorial and rights review.</p>
 </main><Footer/></>;
}
