import {useEffect,useMemo,useRef,useState} from 'react';
import research from '../../creator/footage-research.json';
import '../styles/aura-footage-research.css';

const sourceTypes={
  authentic_fight_footage:'Real fight footage',
  studio_coverage:'Broadcaster coverage',
  interview_context:'Interview reference',
  journalism_context:'Research and still photographs'
};
function localDownload(value,name){
 const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)+'\n'],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),10000);
}
function safeTime(input){
 const s=String(input||'').trim();
 if(!s)return null;
 const numbers=s.split(':').map(Number);
 if(numbers.length>3||numbers.some(n=>!Number.isFinite(n)||n<0||!Number.isInteger(n)))return null;
 let seconds=0;
 for(const n of numbers)seconds=seconds*60+n;
 return seconds;
}
export default function FootageResearch({storyId,format,beats,articleUrl}){
 const [query,setQuery]=useState('');
 const [type,setType]=useState('all');
 const [sourceId,setSourceId]=useState(research.sources[0].id);
 const [beatIndex,setBeatIndex]=useState(0);
 const [start,setStart]=useState('00:10');
 const [end,setEnd]=useState('00:15');
 const [reason,setReason]=useState('Frame-by-frame assessment of the tactical exchange.');
 const [marks,setMarks]=useState([]);
 const [localVideo,setLocalVideo]=useState(null);
 const [localUrl,setLocalUrl]=useState('');
 const [rights,setRights]=useState('not-cleared');
 const [evidence,setEvidence]=useState('');
 const [notice,setNotice]=useState('');
 const localRef=useRef('');
 const matched=useMemo(()=>research.sources.filter(s=>(type==='all'||s.sourceType===type)&&
   [s.title,s.provider,...s.fighters,...s.topics].join(' ').toLowerCase().includes(query.toLowerCase())),[query,type]);
 const source=research.sources.find(s=>s.id===sourceId)||research.sources[0];
 const chosenBeat=beats?.[beatIndex]||beats?.[0];
 useEffect(()=>{if(beatIndex>=(beats||[]).length)setBeatIndex(0);},[beats,beatIndex]);
 useEffect(()=>()=>{if(localRef.current)URL.revokeObjectURL(localRef.current)},[]);
 function loadLocal(event){
  const file=event.target.files?.[0]||null;
  if(localRef.current){URL.revokeObjectURL(localRef.current);localRef.current='';}
  setLocalVideo(null);setLocalUrl('');setRights('not-cleared');setEvidence('');
  if(!file)return;
  const ext=file.name.split('.').pop()?.toLowerCase();
  if(!['mp4','mov','m4v','webm'].includes(ext)||file.size>250*1024*1024){
   setNotice('Choose an MP4/MOV/WEBM video under 250MB. Larger footage needs the future private storage uploader.');
   return;
  }
  localRef.current=URL.createObjectURL(file);setLocalUrl(localRef.current);setLocalVideo(file);
  setNotice('Clip loaded locally for review. It has not been uploaded or rendered.');
 }
 function addMark(){
  const a=safeTime(start),b=safeTime(end);
  if(a===null||b===null||b<=a||b-a>90){setNotice('Enter a valid timecode range, no longer than 90 seconds.');return;}
  if(!chosenBeat){setNotice('Select an editorial beat first.');return;}
  const entry={id:String(Date.now())+'-'+marks.length,sourceId:source.id,provider:source.provider,
   sourceUrl:source.url,sourceType:source.sourceType,rightsStatus:'reference_only',
   inSeconds:a,outSeconds:b,editorialBeatIndex:beatIndex,editorialBeat:chosenBeat.headline,
   purpose:String(reason||'').trim().slice(0,360),notes:'Research marker only. Not cleared for reuse or export.'};
  setMarks(old=>[...old,entry]);setNotice('Research marker saved in this session. No footage downloaded or copied.');
 }
 function addLocal(){
  if(!localVideo||!chosenBeat){setNotice('Choose a local file and editorial beat first.');return;}
  const a=safeTime(start),b=safeTime(end);
  if(a===null||b===null||b<=a){setNotice('Enter valid in/out timecodes.');return;}
  if(rights==='not-cleared'||String(evidence).trim().length<12){
   setNotice('Select the correct rights basis and add written evidence of reuse rights before adding to the usable timeline.');
   return;
  }
  setMarks(old=>[...old,{id:String(Date.now())+'-'+old.length,sourceId:'local-'+localVideo.name,
   sourceType:'local_approved_video',sourceUrl:null,provider:'User-supplied',
   filename:localVideo.name,fileSize:localVideo.size,rightsStatus:rights,evidence:evidence.trim().slice(0,500),
   inSeconds:a,outSeconds:b,editorialBeatIndex:beatIndex,editorialBeat:chosenBeat.headline,
   purpose:String(reason||'').trim().slice(0,360),
   notes:'Editor attested licensing. File remains local; copy into a private or licensed media storage before rendering.'}]);
  setNotice('Local clip added to research timeline. MP4 is still on your device; export transfers only the edit instructions.');
 }
 function watchSource(){
  if(!source)return;
  let url=source.url;
  if(url.startsWith('https://www.youtube.com/watch?v=')&&safeTime(start)!==null)url+='&t='+safeTime(start)+'s';
  window.open(url,'_blank','noopener,noreferrer');
 }
 function exportTimeline(){
  localDownload({schema:'aura-footage-edl/v1',storyId,format,sourceArticle:articleUrl,
   rightsNote:'Reference-only external source links must NEVER be downloaded or rendered without separate permission or editorial legal clearance. Local-file markers refer to media held on the editor device.',
   approvedClips:marks.filter(m=>m.sourceType==='local_approved_video'),
   referenceMarkers:marks.filter(m=>m.rightsStatus==='reference_only'),
   entries:marks.map(m=>({...m,assetPath:null})),
   footageAutomation:'Discovery and selection only. No ripping, scraping or unlicensed broadcast capture.'},
   'aura-'+storyId+'-'+format+'-clip-timeline.json');
  setNotice('Timeline exported. It contains metadata, not the actual broadcaster clips or your local file.');
 }
 return <section className="aura-footage" aria-label="Fight footage research and clip timeline">
  <div className="aura-footage__headline">
   <div><p className="aura-video-creator__kicker">04 / AUTHENTIC FIGHT FOOTAGE</p><h2>Research & clip library</h2>
    <p>Watch genuine fight sources, mark moments for tactical criticism, and assign footage to narration beats. Approved local files can also be reviewed in this browser.</p></div>
   <div className="aura-footage__stats"><strong>{marks.length}</strong><span>Marked clips</span></div>
  </div>
  <div className="aura-footage__filters">
   <label>Find a fighter or technique<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Dubois, knockdowns, footwork..."/></label>
   <label>Source type<select value={type} onChange={e=>setType(e.target.value)}>
    <option value="all">All source types</option>
    {Object.entries(sourceTypes).map(([value,label])=><option key={value} value={value}>{label}</option>)}
   </select></label>
  </div>
  <div className="aura-footage__sourceGrid">
   {matched.map(s=><button type="button" key={s.id} className={sourceId===s.id?'active':''} onClick={()=>setSourceId(s.id)}>
    <small>{s.provider} · {sourceTypes[s.sourceType]}</small>
    <strong>{s.title}</strong>
    <span>REFERENCE ONLY · NO REUSE LICENCE</span>
   </button>)}
   {matched.length===0&&<p>No research sources match this search yet. Try a fighter's name or topic.</p>}
  </div>
  <div className="aura-footage__researchPanel">
   <div className="aura-footage__sourceDetails">
    <p className="aura-footage__warning">The broadcaster footage below is for research. A public video or embedded player is not a licence to download it.</p>
    <h3>{source.title}</h3>
    <p>{source.provider} · {source.date} · {sourceTypes[source.sourceType]}</p>
    <p><strong>Relevant moments:</strong> {source.topics.join(' · ')}</p>
    <p><strong>Rights:</strong> {source.rightsHolder}</p>
    <button type="button" onClick={watchSource}>Watch at the original source ↗</button>
   </div>
   <div className="aura-footage__mark">
    <h3>Create shot reference</h3>
    <label>Place in narration<select value={beatIndex} onChange={e=>setBeatIndex(Number(e.target.value))}>
     {beats.map((beat,i)=><option key={i} value={i}>{String(i+1).padStart(2,'0')} — {beat.headline}</option>)}
    </select></label>
    <div className="aura-footage__timeInputs"><label>Clip in (mm:ss)<input inputMode="numeric" value={start} onChange={e=>setStart(e.target.value)} /></label>
     <label>Clip out (mm:ss)<input inputMode="numeric" value={end} onChange={e=>setEnd(e.target.value)} /></label></div>
    <label>Why this moment matters<textarea rows={3} value={reason} onChange={e=>setReason(e.target.value)} /></label>
    <button type="button" onClick={addMark}>Mark reference moment</button>
   </div>
  </div>
  <div className="aura-footage__local">
   <div><h3>Import licensed fight footage</h3>
    <p>Preview a clip you own or have permission to reuse. Record the licence basis and proof; the file remains in your browser, not our server.</p>
    <label>Choose video (under 250MB)<input type="file" accept="video/mp4,video/quicktime,video/webm,.m4v" onChange={loadLocal}/></label>
    {localUrl&&<video key={localUrl} src={localUrl} controls preload="metadata" playsInline />}
   </div>
   <div><label>Rights basis<select value={rights} onChange={e=>setRights(e.target.value)}>
    <option value="not-cleared">Not yet cleared</option>
    <option value="original">Our original footage</option>
    <option value="licensed">Written commercial/social-use licence</option>
    <option value="cc-compatible">Verified compatible Creative Commons licence</option>
   </select></label>
    <label>Evidence of licence / permission<textarea rows={4} value={evidence} onChange={e=>setEvidence(e.target.value)}
     placeholder="Owner, written permission date, usage scope, link to license terms..." /></label>
    <button type="button" onClick={addLocal}>Assign local clip to this shot</button></div>
  </div>
  <div className="aura-footage__licensing">
   <div><h3>Request original boxing footage legally</h3><p>Relevant official archives can supply licensed fight footage for future investigations. Ask for short-form digital reuse, editing and monetisation rights in writing.</p></div>
   <div className="aura-footage__contactGrid">{research.licensingContacts.map(contact=><article key={contact.organisation}>
    <h4>{contact.organisation}</h4>
    <p>{contact.contactRole}</p>
    <a href={contact.url} target="_blank" rel="noopener noreferrer">View licensing source ↗</a>
    <a href={'mailto:'+contact.contact+'?subject='+encodeURIComponent('AURA Fight Club — boxing footage licensing enquiry')} target="_blank" rel="noopener noreferrer">{contact.contact}</a>
    <small>{contact.request}</small>
   </article>)}</div>
  </div>
  <div className="aura-footage__timeline">
   <div className="aura-footage__timelineTitle"><h3>Editorial clip timeline</h3><button type="button" onClick={exportTimeline}>Export clip decisions (JSON)</button></div>
   {marks.length===0?<p>No moments marked yet. Start by watching an official source and marking the exact moment you want to discuss.</p>
   :<ol>{marks.map(m=><li key={m.id}>
    <div><strong>{m.editorialBeat}</strong><p>{m.provider} / {m.inSeconds}s–{m.outSeconds}s / {m.purpose}</p>
     <small className={m.rightsStatus==='reference_only'?'unlicensed':'approved'}>{m.rightsStatus==='reference_only'?'RESEARCH ONLY — NOT APPROVED FOR RENDER':m.rightsStatus.toUpperCase()}</small></div>
    <button type="button" onClick={()=>setMarks(a=>a.filter(x=>x.id!==m.id))} aria-label={'Remove clip '+m.sourceId}>Remove</button>
   </li>)}</ol>}
  </div>
  {notice&&<p role="status" className="aura-footage__notice">{notice}</p>}
  <p className="aura-footage__footnote">Next integration: licensed-clip storage and import, speech-timed edit points, frame-accurate trims, subtitle generation and an authenticated cloud render job. Source discovery does not grant copyright clearance.</p>
 </section>;
}
