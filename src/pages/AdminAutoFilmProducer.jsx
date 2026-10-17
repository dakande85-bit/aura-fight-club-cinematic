import {useEffect,useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import {Clapperboard,Film,AudioLines,ShieldAlert,Play,RefreshCw,CheckCircle2} from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import {buildNarrationShots,minutesForShots,storyboardCoverage} from '../lib/auraAutoFilmStoryboard.js';
import '../styles/aura-auto-film-producer.css';

const FORMAT=[{value:'analysis',label:'Fight analysis'},{value:'prediction',label:'Fight prediction'},{value:'profile',label:'Fighter profile'},{value:'critique',label:'Critical breakdown'}];
export default function AdminAutoFilmProducer(){
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
  setProject(null);setStatus('');setJobs([]);setJobState('');
  fetch(selected,{signal:ctrl.signal,cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Fight production briefing is missing');return r.json();})
   .then(setProject).catch(e=>{if(e.name!=='AbortError')setStatus(e.message);});
  return()=>ctrl.abort();
 },[selected]);
 const script=project?.scripts?.youtube?.draft||project?.narrationScript||'';
 const shots=useMemo(()=>buildNarrationShots(script),[script]);
 const coverage=useMemo(()=>storyboardCoverage(shots,project?.sources),[shots,project?.sources]);
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
 async function getArtifact(artifactId){
  if(!password)return setJobState('Enter the editor password first.');
  setDownloading(artifactId);setJobState('Requesting your production draft download…');
  try{
   const response=await fetch('/api/auto-film-download',{
    method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+password},
    body:JSON.stringify({fightId:selectedFight.fightId,artifactId})
   });
   const data=await response.json();
   if(!response.ok)throw Error(data.error||'Draft download failed.');
   const link=document.createElement('a');link.href=data.url;link.download=data.filename;
   link.rel='noopener noreferrer';link.target='_blank';document.body.appendChild(link);link.click();link.remove();
   setJobState('Opened the production pack. It may contain a silent MP4 or a report explaining missing footage.');
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
   {jobs.map(job=><div key={job.id} className="aura-producer-job">
     <div>
      <strong>{job.subject||selectedFight?.name}</strong>
      <small>{job.status==='completed'?(job.conclusion==='success'?'Worker finished; check the output':'Worker '+(job.conclusion||'ended')):'Worker '+job.status}
       {job.createdAt?' · '+new Date(job.createdAt).toLocaleString():''}</small>
     </div>
     <div className="aura-producer-job-actions">
      {job.downloadable?.map(x=><button key={x.id} type="button" disabled={downloading===x.id} onClick={()=>getArtifact(x.id)}>
       {downloading===x.id?'Preparing…':'Download draft pack'}
      </button>)}
      {job.url&&<a href={job.url} target="_blank" rel="noopener noreferrer">Worker log ↗</a>}
     </div>
   </div>)}
  </section>
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
