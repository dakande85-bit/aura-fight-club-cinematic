import {useEffect,useMemo,useRef,useState} from 'react';
import {buildRealFootageReel,iframePreviewUrl,validSegment} from '../lib/auraRealFootageReel.js';
import '../styles/aura-real-footage-reel.css';

export default function AuraRealFootageReel({project}){
 const initial=useMemo(()=>buildRealFootageReel(project),[project]);
 const [scenes,setScenes]=useState(initial);
 const [selected,setSelected]=useState(0);
 const [running,setRunning]=useState(false);
 const [playing,setPlaying]=useState(false);
 const [fault,setFault]=useState('');
 const timer=useRef(null);
 const index=useRef(0);
 useEffect(()=>{setScenes(initial);setSelected(0);setRunning(false);setPlaying(false);setFault('');index.current=0;},[initial]);
 const scene=scenes[selected];
 const total=scenes.reduce((sum,s)=>sum+(s.endSeconds-s.startSeconds),0);
 const stop=()=>{
  clearTimeout(timer.current);
  timer.current=null;
  setRunning(false);
 };
 const pick=i=>{
  stop();index.current=i;setSelected(i);setPlaying(false);setFault('');
 };
 function advance(){
  const next=index.current+1;
  if(next>=scenes.length){stop();setPlaying(false);return;}
  index.current=next;setSelected(next);setPlaying(true);
 }
 useEffect(()=>{
  clearTimeout(timer.current);
  if(!running||!playing||!scene)return undefined;
  timer.current=setTimeout(advance,(scene.endSeconds-scene.startSeconds)*1000+1300);
  return()=>clearTimeout(timer.current);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[selected,running,playing,scene?.startSeconds,scene?.endSeconds]);
 function updateTime(which,value){
  stop();setPlaying(false);
  const number=Number(value);
  if(!Number.isFinite(number))return;
  const next={...scene,[which]:Math.max(0,Math.floor(number))};
  if(!validSegment(next.startSeconds,next.endSeconds)){
   setFault('Keep each preview excerpt between 1 and 90 seconds, with the end later than the start.');
   return;
  }
  setFault('');setScenes(old=>old.map((s,i)=>i===selected?next:s));
 }
 function startReel(){
  if(!scenes.length)return;
  index.current=selected;
  setRunning(true);setPlaying(true);setFault('');
 }
 const videoUrl=scene&&iframePreviewUrl(scene.id,scene.startSeconds,scene.endSeconds,
  typeof window!=='undefined'?window.location.origin:undefined);
 return <section className="aura-real-reel" aria-label="Real boxing video sources">
  <div className="aura-real-reel-heading">
   <div>
    <p className="aura-real-reel-kicker">REAL FIGHTERS · ORIGINAL CHANNELS</p>
    <h2>Real boxing footage, inside Film Room</h2>
    <p>Actual YouTube footage of the named fighters. Screen the clips here, set excerpt points and run a preview sequence—no external searching or irrelevant test patterns.</p>
   </div>
   <div className="aura-real-reel-counter"><b>{scenes.length}</b> relevant videos <span>{Math.round(total)} seconds of proposed excerpts</span></div>
  </div>
  {!scene?<p className="aura-real-reel-none">No verified YouTube video URLs have been attached to this boxing project yet. The research system must find real sources before it can preview them.</p>:<>
   <div className="aura-real-reel-workspace">
    <div className="aura-real-reel-player">
     <div className="aura-real-reel-screen">
      {playing?<iframe key={scene.id+':'+scene.startSeconds+':'+scene.endSeconds+':'+selected}
        title={scene.title} src={videoUrl+'&autoplay=1'} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>:
       <div className="aura-real-reel-poster">
        <img src={scene.thumbnail} alt={scene.title} loading="lazy"/>
        <button type="button" onClick={()=>{setFault('');setPlaying(true);}}>Play real YouTube footage</button>
       </div>}
     </div>
     <div className="aura-real-reel-player-caption">
      <strong>{scene.title}</strong><small>{scene.publisher} · {scene.role==='fight'?'Fight highlights':scene.role==='weighin'?'Face-off / weigh-in':'Interviews and press'}</small>
     </div>
     <div className="aura-real-reel-trim">
      <label>Start at (seconds)<input type="number" min="0" max="21500" step="1" value={scene.startSeconds} onChange={e=>updateTime('startSeconds',e.target.value)}/></label>
      <label>End at (seconds)<input type="number" min="1" max="21600" step="1" value={scene.endSeconds} onChange={e=>updateTime('endSeconds',e.target.value)}/></label>
      <span>{scene.endSeconds-scene.startSeconds}s excerpt</span>
     </div>
     <div className="aura-real-reel-actions">
      <button type="button" className="aura-real-reel-play" onClick={startReel}>{running?'Restart sequence':'Play selected sequence'}</button>
      <button type="button" onClick={()=>{stop();setPlaying(false);}}>Stop</button>
      <button type="button" onClick={()=>{stop();advance();}}>Next source →</button>
     </div>
     {fault&&<p className="aura-real-reel-error" role="alert">{fault}</p>}
     <p className="aura-real-reel-notice">This screens excerpts through the official YouTube player; it is <b>not</b> a downloadable edited MP4. The timing is provisional, and video availability or autoplay depends on the original channel and the device. Review the exact action before using it as evidence. Downloading or exporting clips needs the necessary permissions and a media file.</p>
    </div>
    <div className="aura-real-reel-sources">
     <h3>Automatic source reel</h3>
     {scenes.map((s,i)=><button type="button" key={s.id} className={'aura-real-reel-tile '+(i===selected?'is-active':'')} onClick={()=>pick(i)}>
      <img src={s.thumbnail} alt="" loading="lazy"/>
      <span><strong>{s.title}</strong><small>{s.publisher}</small><small>{s.startSeconds}–{s.endSeconds}s · {s.rightsCleared?'Approved media':'Preview only'}</small></span>
     </button>)}
    </div>
   </div>
  </>}
 </section>;
}
