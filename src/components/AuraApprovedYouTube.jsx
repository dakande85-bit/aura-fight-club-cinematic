import {useEffect,useMemo,useState} from 'react';
const youtube=(url)=>{
 try{
  const u=new URL(url);
  if(u.protocol!=='https:'||!['youtube.com','www.youtube.com','youtu.be','m.youtube.com'].includes(u.hostname))return false;
  return Boolean((u.searchParams.get('v')||u.pathname.match(/[A-Za-z0-9_-]{11}/)?.[0]||'').match(/^[A-Za-z0-9_-]{11}$/));
 }catch{return false;}
};
export default function AuraApprovedYouTube({project,fightId,password}){
 const available=useMemo(()=>(project?.sources||[]).filter(x=>youtube(x.url)),[project?.sources]);
 const [choice,setChoice]=useState('');
 const [type,setType]=useState('youtube_written_approval');
 const [holder,setHolder]=useState('');
 const [platform,setPlatform]=useState('');
 const [verified,setVerified]=useState(false);
 const [saved,setSaved]=useState([]);
 const [message,setMessage]=useState('');
 const [working,setWorking]=useState(false);
 const [open,setOpen]=useState(false);
 useEffect(()=>{setChoice(available[0]?.url||'');setSaved([]);setMessage('');setOpen(false);},[fightId,available]);
 useEffect(()=>{
  if(!password||!fightId||!open)return;
  let cancelled=false;
  fetch('/api/auto-film-source?fightId='+encodeURIComponent(fightId),{
   headers:{Authorization:'Bearer '+password},cache:'no-store'
  }).then(r=>r.json().then(x=>({ok:r.ok,data:x}))).then(({ok,data})=>{
   if(cancelled)return;
   if(ok)setSaved(data.approved||[]);
   else setMessage(data.error||'Could not read licensed sources.');
  }).catch(()=>{if(!cancelled)setMessage('Approved video list unavailable.')});
  return()=>{cancelled=true;};
 },[fightId,password,open]);
 const current=available.find(x=>x.url===choice);
 async function approve(){
  if(!password){setMessage('Enter the Aura editor password in the production panel.');return;}
  if(!current){setMessage('Select one of the automatically researched YouTube sources first.');return;}
  setWorking(true);setMessage('Saving documented footage permissions…');
  try{
   const response=await fetch('/api/auto-film-source',{
    method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+password},
    body:JSON.stringify({
      fightId,url:current.url,kind:current.kind==='faceoff'?'weighin':current.kind,
      title:current.title,publisher:current.publisher,
      rightsEvidence:holder,platformBasis:type,platformEvidence:platform,
      namedFighterVerified:verified
    })
   });
   const data=await response.json();
   if(!response.ok)throw Error(data.error||'Cannot save footage permission.');
   setSaved(rows=>[...rows.filter(x=>x.id!==data.sourceId),{
    id:data.sourceId,title:current.title,kind:current.kind,url:choice
   }]);setMessage('Source saved. The next production run can download this video and automatically make cuts if YouTube permits retrieval.');
  }catch(e){setMessage(e.message);}
  finally{setWorking(false);}
 }
 return <section className="aura-producer-approved">
   <div className="aura-producer-cardtitle"><div><h2>Automatic YouTube footage intake</h2>
    <p>Aura already knows the fight-highlights, interviews and weigh-in sources. Once authorised, future jobs can fetch their usable media automatically.</p></div>
    <button type="button" onClick={()=>setOpen(x=>!x)}>{open?'Close source approval':'Manage permitted sources'}</button>
   </div>
   <div className="aura-producer-approved-count">
    <strong>{available.length}</strong> researched YouTube links · <strong>{saved.length}</strong> authorised source entries loaded
   </div>
   {open&&<div className="aura-producer-approval-form">
    <p><strong>Important:</strong> a YouTube watch link or uploader's Creative Commons label alone does not grant the Film Room permission to download it. Supply the permission or applicable-law reference for this source. Use reference IDs rather than confidential licence documents.</p>
    <label>Existing fight video
      <select value={choice} onChange={e=>setChoice(e.target.value)}>
       {available.map(x=><option key={x.url} value={x.url}>{x.title||x.url}</option>)}
      </select>
    </label>
    <label>Copyright reuse permission / licence reference
      <input value={holder} onChange={e=>setHolder(e.target.value)} placeholder="e.g. promoter media licence reference and scope"/>
    </label>
    <label>YouTube/platform-use basis
      <select value={type} onChange={e=>setType(e.target.value)}>
       <option value="youtube_written_approval">Prior written YouTube approval</option>
       <option value="applicable_law">Documented applicable-law exception</option>
      </select>
    </label>
    <label>YouTube approval or applicable-law assessment reference
      <input value={platform} onChange={e=>setPlatform(e.target.value)} placeholder="Reference for written approval or legal-use assessment"/>
    </label>
    <label className="aura-producer-approval-check"><input type="checkbox" checked={verified} onChange={e=>setVerified(e.target.checked)}/>
      I have reviewed this video and verified it contains the actual named fighter(s) and that these stated permissions apply.
    </label>
    <button className="aura-producer-save-source" type="button" disabled={working||!choice||holder.length<12||platform.length<12||!verified} onClick={approve}>
     {working?'Saving…':'Save authorised video for automatic cuts'}
    </button>
    {message&&<p className="aura-producer-source-status" role="status">{message}</p>}
    {saved.length>0&&<div className="aura-producer-saved-sources">{saved.map(s=><div key={s.id}><span>Approved entry</span> {s.title}</div>)}</div>}
   </div>}
  </section>;
}
