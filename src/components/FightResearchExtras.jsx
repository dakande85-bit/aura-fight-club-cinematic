import {useState} from 'react';
import {BookmarkPlus, Check, ExternalLink, Film, Play, ShieldCheck, X} from 'lucide-react';

/**
 * Each pinned factor is an editorial question, not a measured result.
 * Sources are provided as a separate bibliography because they are not
 * individually mapped or proven to establish each tactical inference.
 */
export function PinCurrentFactor({factor,selected,pinned,onToggle}){
 if(!factor)return null;
 return <button
  type="button"
  className={'fdc-pin-action'+(pinned?' fdc-pin-action--active':'')}
  onClick={()=>onToggle(selected)}
  aria-pressed={pinned}
  title={pinned?'Remove question from my fight notebook':'Save question to my fight notebook'}
 >
  {pinned?<Check size={15}/>:<BookmarkPlus size={15}/>}
  {pinned?'Saved to your notebook':'Keep this fight question'}
 </button>;
}

export function FightNotebook({fight,scouting,selected=[],onRemove,onBack}){
 const questions=scouting?.keys||[];
 const saved=selected.filter(index=>Number.isInteger(index)&&index>=0&&index<questions.length);
 return <section className="fdc-notebook" aria-label="Your saved fight questions">
  <div className="fdc-notebook-header">
   <div><p className="fdc-kicker">YOUR FIGHT NOTEBOOK</p><h3>What will decide the fight?</h3></div>
   <span className="fdc-notebook-count">{saved.length} / {questions.length||'—'} QUESTIONS</span>
  </div>
  {saved.length?<>
   <p className="fdc-notebook-guidance">These are scouting questions you chose to follow, not verified outcomes. Use them to explain your own pick.</p>
   <div className="fdc-notebook-list">{saved.map(index=><div key={index} className="fdc-notebook-item"><span>0{index+1}</span><p>{questions[index]}</p><button type="button" onClick={()=>onRemove(index)} aria-label={'Remove saved question: '+questions[index]}><X size={15}/></button></div>)}</div>
  </>:<div className="fdc-notebook-empty"><BookmarkPlus size={21}/><p>No tactical questions selected yet. Explore the ring blueprint and save what you want to investigate before making a pick.</p><button type="button" onClick={onBack}>Go to the scouting room →</button></div>}
  {scouting?.evidence?.length>0&&<details className="fdc-notebook-biblio"><summary>Background sources ({scouting.evidence.length})</summary><div>{scouting.evidence.map((item,index)=><a key={index} href={item.url} target="_blank" rel="noopener noreferrer">{item.label}<ExternalLink size={12}/></a>)}</div><small>Links provide the background to AURA's editorial preview. A saved tactical question is an interpretation, not a data point.</small></details>}
 </section>;
}

/** Only embeds an ID explicitly supplied by a fight's editorial event entry. */
export function OfficialVideoPanel({fight}){
 const [open,setOpen]=useState(false);
 const video=fight?.officialVideo;
 if(!video || !/^[a-zA-Z0-9_-]{11}$/.test(video.youtubeId||''))return null;
 const shareUrl=video.sourceUrl || ('https://www.youtube.com/watch?v='+video.youtubeId);
 return <section className="fdc-video-panel" aria-label="Official promotional fight footage">
  <div className="fdc-video-summary">
   <div className="fdc-video-icon"><Film size={22}/></div>
   <div><p className="fdc-kicker">OFFICIAL VIDEO / SOURCE MATERIAL</p><h3>{video.title}</h3><p>Published by {video.publisher}. Explore the fighters' demeanour and comments; promotional video is not evidence of punch statistics or future performance.</p></div>
   {!open&&<button className="fdc-video-play" type="button" onClick={()=>setOpen(true)}><Play size={16}/> Watch on this page</button>}
  </div>
  {open&&<div className="fdc-video-player"><div className="fdc-video-frame">
   <iframe title={video.title} src={'https://www.youtube-nocookie.com/embed/'+video.youtubeId+'?rel=0'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen loading="lazy"/>
   </div><div className="fdc-video-utilities"><span><ShieldCheck size={14}/> Official publisher embed, loaded at your request</span><button type="button" onClick={()=>setOpen(false)}><X size={15}/> Close video</button></div></div>}
  <div className="fdc-video-footer"><a href={shareUrl} target="_blank" rel="noopener noreferrer">Open the official video <ExternalLink size={12}/></a><span>No fight footage is stored or redistributed by AURA</span></div>
 </section>;
}
