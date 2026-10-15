import {useEffect,useMemo,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import project from '../../creator/projects/dubois-wardley-ii.json';
import stockLibrary from '../../creator/stock-library.json';
import '../styles/aura-video-creator.css';

const repo='https://github.com/dakande85-bit/aura-fight-club-cinematic';
const branch='feature/aura-video-creator-mvp';
const workflow=repo+'/actions/workflows/aura-creator-render.yml';
const uploadUrl=repo+'/upload/'+branch+'/creator/voiceovers';
const assetUrl=key=>{const p=project.assets[key]?.path||'';return p.startsWith('public/')?'/'+p.slice(7):''};
function download(data,name,mime){
 const url=URL.createObjectURL(new Blob([data],{type:mime}));
 const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),10000);
}
export default function VideoCreator(){
 const [kind,setKind]=useState('short');
 const [scripts,setScripts]=useState({short:project.short.voiceoverScript,youtube:project.youtube.voiceoverScript});
 const [selected,setSelected]=useState(0);
 const [audioFile,setAudioFile]=useState(null);
 const [audioUrl,setAudioUrl]=useState('');
 const [audioSeconds,setAudioSeconds]=useState(0);
 const [recording,setRecording]=useState(false);
 const [message,setMessage]=useState('');
 const recorderRef=useRef(null),streamRef=useRef(null),partsRef=useRef([]),urlRef=useRef('');
 const active=project[kind],beats=active.beats||[];
 const part=beats[Math.min(selected,beats.length-1)]||beats[0];
 const length=audioSeconds||active.previewSeconds;
 const timeline=useMemo(()=>{
  const weights=beats.reduce((sum,b)=>sum+Number(b.weight||1),0)||1;
  return beats.map((b,i)=>({...b,index:i,seconds:length*Number(b.weight||1)/weights}));
 },[beats,length]);
 function setVoice(file){
  setAudioFile(file);setAudioSeconds(0);
  if(urlRef.current)URL.revokeObjectURL(urlRef.current);
  urlRef.current='';
  if(!file){setAudioUrl('');return;}
  if(file.size>60*1024*1024){setAudioFile(null);setMessage('Voiceover exceeds 60 MB.');return;}
  urlRef.current=URL.createObjectURL(file);setAudioUrl(urlRef.current);
  setMessage('Voiceover loaded locally. No file was uploaded to Aura.');
 }
 useEffect(()=>()=>{if(urlRef.current)URL.revokeObjectURL(urlRef.current);
  if(recorderRef.current?.state==='recording')recorderRef.current.stop();
  streamRef.current?.getTracks().forEach(track=>track.stop());
 },[]);
 function switchFormat(next){setKind(next);setSelected(0);setVoice(null);setMessage('');}
 async function start(){
  if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){
   setMessage('Microphone recording unavailable in this browser. Use an existing audio file.');return;}
  try{
   const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
   streamRef.current=stream;
   const format=['audio/mp4','audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus'].find(m=>MediaRecorder.isTypeSupported(m));
   const recorder=new MediaRecorder(stream,format?{mimeType:format}:undefined);
   recorderRef.current=recorder;partsRef.current=[];
   recorder.ondataavailable=e=>{if(e.data?.size)partsRef.current.push(e.data)};
   recorder.onstop=()=>{
    const mime=recorder.mimeType||'audio/webm',ext=mime.includes('mp4')?'m4a':mime.includes('ogg')?'ogg':'webm';
    const file=new File([new Blob(partsRef.current,{type:mime})],project.id+'-'+kind+'-voiceover.'+ext,{type:mime});
    stream.getTracks().forEach(t=>t.stop());streamRef.current=null;
    setRecording(false);setVoice(file);
   };
   recorder.start(500);setRecording(true);setMessage('Recording started. Press Stop when you finish speaking.');
  }catch(e){setMessage('Microphone unavailable: '+e.message);}
 }
 function stop(){if(recorderRef.current?.state==='recording')recorderRef.current.stop();}
 function scriptDownload(){download(scripts[kind],project.id+'-'+kind+'-script.txt','text/plain;charset=utf-8')}
 function audioDownload(){if(!audioFile){setMessage('Record or upload voiceover audio first.');return;}download(audioFile,audioFile.name,audioFile.type||'application/octet-stream')}
 function shotlistDownload(){
  const rows=['AURA FIGHT LAB VIDEO STORYBOARD',project.sourceArticle,'FORMAT: '+kind,'VOICEOVER: '+(audioFile?.name||'NOT PROVIDED'),'',
    ...timeline.map(s=>String(s.index+1).padStart(2,'0')+' / '+s.seconds.toFixed(1)+'s / '+s.headline+' / '+project.assets[s.asset].path),
    '','REVIEW: illustrative footage is not original event footage. Confirm all media licences.','NOT APPROVED TO PUBLISH.'];
  download(rows.join('\n'),project.id+'-'+kind+'-shotlist.txt','text/plain;charset=utf-8');
 }
 async function copyScript(){
  try{await navigator.clipboard.writeText(scripts[kind]);setMessage('Narration script copied.')}
  catch{setMessage('Copy blocked by browser. Use Download script.')}
 }
 return <><Header/><main className="aura-video-creator">
  <header className="aura-video-creator__hero">
   <p className="aura-video-creator__kicker">AURA / ORIGINAL BOXING CONTENT</p>
   <h1>VIDEO <em>CREATOR</em></h1>
   <p>One researched fight story. Your voice. Two formats. Review the shots, record narration and produce faceless video analysis. No Lovable credits or AI video subscription needed.</p>
   <div className="aura-video-creator__heroLinks"><Link to="/admin/social">Social newsroom ↗</Link><a href={workflow} target="_blank" rel="noopener noreferrer">MP4 rendering workflow ↗</a><Link to="/admin/analytics">Audience analytics ↗</Link></div>
  </header>
  <div className="aura-video-creator__state"><span>STORY 01 / {project.title}</span><strong>EDITORIAL PROTOTYPE — NO AUTOMATIC POSTING</strong></div>
  <div className="aura-video-creator__switch" aria-label="Choose output format">
   <button type="button" className={kind==='short'?'active':''} onClick={()=>switchFormat('short')}>Vertical Short <small>9:16 / TikTok & Shorts</small></button>
   <button type="button" className={kind==='youtube'?'active':''} onClick={()=>switchFormat('youtube')}>YouTube Analysis <small>16:9 / Longer format</small></button>
  </div>
  <div className="aura-video-creator__layout">
   <section className="aura-video-creator__editor">
    <div className="aura-video-creator__section"><span className="aura-video-creator__num">01</span><div><h2>Prepare your narration</h2><p>The script is editable. Record your own opinion and analysis; the visuals are only the supporting material.</p></div></div>
    <label className="aura-video-creator__label" htmlFor="aura-narration-script">Voice-over script</label>
    <textarea id="aura-narration-script" rows={kind==='short'?9:16} value={scripts[kind]} onChange={e=>setScripts(x=>({...x,[kind]:e.target.value}))}/>
    <div className="aura-video-creator__buttons"><button type="button" onClick={copyScript}>Copy script</button><button type="button" onClick={scriptDownload}>Download script</button></div>
    <div className="aura-video-creator__section"><span className="aura-video-creator__num">02</span><div><h2>Add your voice</h2><p>Record here or use your existing microphone/Audacity audio file. The recording stays on your device until you explicitly upload it.</p></div></div>
    <div className="aura-video-creator__recorder">
     {recording?<button type="button" className="recording" onClick={stop}>■ Stop recording</button>:<button type="button" onClick={start}>● Record your voice</button>}
     <label>Choose audio file <input type="file" accept="audio/*,.m4a,.mp3,.wav,.webm,.ogg" onChange={e=>setVoice(e.target.files?.[0]||null)}/></label>
     {audioUrl&&<><audio controls src={audioUrl} onLoadedMetadata={e=>{const s=e.currentTarget.duration;if(Number.isFinite(s))setAudioSeconds(s)}}/>
      <p>{audioFile?.name} · {audioSeconds?Math.round(audioSeconds)+' seconds':'Loading length…'}</p>
      <button type="button" className="download" onClick={audioDownload}>Download voice file</button></>}
    </div>
    {message&&<p role="status" className="aura-video-creator__feedback">{message}</p>}
    <div className="aura-video-creator__section"><span className="aura-video-creator__num">03</span><div><h2>Render to MP4</h2><p>The FFmpeg pipeline combines your recording, editorial shot list and approved images/footage.</p></div></div>
    <ol className="aura-video-creator__steps">
     <li>Download your recording. In the current prototype, upload it through <a href={uploadUrl} target="_blank" rel="noopener noreferrer">GitHub's voiceover folder ↗</a> only if public sharing is acceptable.</li>
     <li>Open <a href={workflow} target="_blank" rel="noopener noreferrer">the AURA Creator workflow ↗</a>, choose Short or YouTube, and supply the path to your audio file.</li>
     <li>Download <strong>aura-creator-review-exports</strong>, check the final MP4 and authorise the upload.</li>
    </ol>
    <p className="aura-video-creator__warning">Voiceovers uploaded to this public GitHub repository are public. A private upload and cloud-render backend is still to be built. This page does not publish or directly render MP4s in the browser.</p>
    <div className="aura-video-creator__buttons"><button type="button" onClick={shotlistDownload}>Download shot list</button><a className="primary" href={workflow} target="_blank" rel="noopener noreferrer">Open MP4 renderer ↗</a></div>
   </section>
   <section className="aura-video-creator__visual" aria-label="Storyboard">
    <div className="aura-video-creator__visualTitle"><div><p className="aura-video-creator__kicker">FIGHT LAB / STORYBOARD</p><h2>{kind==='short'?'Fast vertical edit':'Long-form analysis cut'}</h2></div><span>{beats.length} beats</span></div>
    <div className={'aura-video-creator__screen '+(kind==='short'?'vertical':'widescreen')}>
     {part?.asset&&<img src={assetUrl(part.asset)} alt={'Approved visual: '+part.asset} />}
     <div className="aura-video-creator__screenOverlay"><small>{part?.label}</small><h3>{part?.headline}</h3><p>{part?.deck}</p><span>{project.assets[part?.asset]?.illustrative?'ILLUSTRATIVE VISUAL':project.assets[part?.asset]?.attribution}</span></div>
    </div>
    <div className="aura-video-creator__storyboard">
     {timeline.map(s=><button type="button" key={s.index} className={selected===s.index?'active':''} onClick={()=>setSelected(s.index)}>
      <img src={assetUrl(s.asset)} alt=""/><span>{String(s.index+1).padStart(2,'0')} · {s.seconds.toFixed(1)}s</span><strong>{s.headline}</strong>
     </button>)}
    </div>
    <p className="aura-video-creator__footerNote">This is an editorial storyboard, not the rendered video. Actual exports apply motion and timed cuts. Archive dates and illustrative imagery remain labelled for accuracy.</p>
   </section>
  </div>
  <section className="aura-video-creator__stock">
   <div><p className="aura-video-creator__kicker">APPROVED SOURCING WORKFLOW</p><h2>Boxing stock-footage shortlist</h2><p>Six starting sources for training, mittwork and ringside atmosphere. These links are candidate stock footage, not downloads; inspect licence terms and download only the clips you want to use. Do not label generic boxers as Dubois or Wardley.</p></div>
   <div className="aura-video-creator__stockGrid">
    {stockLibrary.clips.map(clip=><article key={clip.id}>
     <span>{clip.source} · {clip.orientation} · {clip.durationSeconds}s</span>
     <h3>{clip.title}</h3>
     <p>Creator: {clip.creator}</p>
     <a href={clip.url} target="_blank" rel="noopener noreferrer">Review stock footage ↗</a>
    </article>)}
   </div>
  </section>
  <aside className="aura-video-creator__roadmap"><strong>FUTURE STAGE</strong><p>Private audio uploads, licensed stock-video picker, precise speech-aligned subtitles, editable shot timings and YouTube/TikTok publishing after approval.</p></aside>
 </main><Footer/></>;
}
