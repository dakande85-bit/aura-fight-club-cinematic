import {useState} from 'react';
import {Link} from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import {PageSEO} from '../components/SEO.jsx';
import edition from '../../public/news/fights.json';
import {getFighterByName} from '../data/seoEntities.js';
import {VerifiedPhoto} from '../components/VerifiedPhoto.jsx';
import '../styles/fight-hub.css';

const timeLabel=(iso,zone)=>new Intl.DateTimeFormat('en-GB',{timeZone:zone,dateStyle:'medium',timeStyle:'short'}).format(new Date(iso));
const dateLabel=date=>new Date(date+'T12:00:00Z').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Atlantic/Canary',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const eventICS=f=>{const y=f.date.replace(/-/g,'');const title=f.name.replace(/[,;\\]/g,' ').replace(/\n/g,' ');const description=('Check the verified event updates: https://www.aurafightclub.com/fights/'+f.id).replace(/[,;\\]/g,' ');const data=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//AURA Fight Club//Fight Events//EN','BEGIN:VEVENT','UID:'+f.id+'@aurafightclub.com','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'').replace('Z','Z'),'DTSTART;VALUE=DATE:'+y,'DTEND;VALUE=DATE:'+new Date(Date.parse(f.date+'T12:00:00Z')+86400000).toISOString().slice(0,10).replace(/-/g,''),'SUMMARY:'+title,'DESCRIPTION:'+description,'END:VEVENT','END:VCALENDAR'].join('\r\n');const blob=new Blob([data],{type:'text/calendar;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=f.id+'.ics';a.click();URL.revokeObjectURL(url);};
const broadcastLabel=f=>f.broadcastStatus==='confirmed'?f.broadcast:'Broadcaster not confirmed';
function TimeInfo({fight,displayZone}){
 const event=fight.schedule||{};
 return <div className="fh-times">
  <div><span>Broadcast / card start</span><strong>{event.broadcastStartUTC?timeLabel(event.broadcastStartUTC,displayZone)+' · '+(displayZone==='Atlantic/Canary'?'Tenerife':displayZone==='Europe/London'?'UK':displayZone==='Europe/Madrid'?'Spain mainland':'New York'): 'Not confirmed'}</strong></div>
  {event.broadcastStartUTC&&<div><span>Venue local time</span><strong>{timeLabel(event.broadcastStartUTC,event.timeZone||'UTC')}</strong></div>}
  <div><span>Main-event ring walk</span><strong>{event.ringWalkStatus==='confirmed'&&event.ringWalkUTC?timeLabel(event.ringWalkUTC,displayZone)+' · selected timezone':'Not confirmed'}</strong></div>
  {event.timingNote&&<p>{event.timingNote}</p>}
 </div>;
}
export default function FightHub(){
 const [division,setDivision]=useState('All');
 const [scope,setScope]=useState('Upcoming');
 const [showSaved,setShowSaved]=useState(false);
 const [displayZone,setDisplayZone]=useState('Atlantic/Canary');
 const [saved,setSaved]=useState(()=>{try{return JSON.parse(localStorage.getItem('aura-saved-fights')||'[]')}catch{return []}});
 const toggleSaved=id=>setSaved(old=>{const next=old.includes(id)?old.filter(x=>x!==id):[...old,id];try{localStorage.setItem('aura-saved-fights',JSON.stringify(next))}catch{}return next});
 const fights=edition.fights.filter(f=>scope==='Upcoming'?f.date>=today()&&f.status!=='Completed':f.status==='Completed'||f.date<today()).filter(f=>division==='All'||division===f.division).filter(f=>!showSaved||saved.includes(f.id)).sort((a,b)=>scope==='Upcoming'?a.date.localeCompare(b.date):b.date.localeCompare(a.date));
 return <><PageSEO title="Fight Hub — Boxing Schedule, Start Times & Where to Watch | AURA" description="Verified boxing events, dates, broadcaster information, local start times and reliable source links. Unconfirmed ring walks are clearly labelled." canonicalPath="/fight-hub"/><Header/>
 <main className="fh-page">
  <header className="fh-intro"><p className="fh-kicker">AURA / Fight Hub</p><h1>FIGHTS THAT MATTER.</h1><p>Dates, cards, broadcasters and ring walks. When a time or broadcaster isn't confirmed, we'll tell you instead of guessing.</p><small>Event information last reviewed {edition.checkedAt}. Broadcast availability varies by country.</small></header>
  <div className="fh-controls"><div className="fh-tabs">{['Upcoming','Results'].map(x=><button key={x} type="button" className={x===scope?'selected':''} onClick={()=>setScope(x)}>{x}</button>)}</div><label>Only saved <input type="checkbox" checked={showSaved} onChange={e=>setShowSaved(e.target.checked)} /></label><label>Show times in<select value={displayZone} onChange={e=>setDisplayZone(e.target.value)}><option value="Atlantic/Canary">Tenerife</option><option value="Europe/London">UK</option><option value="Europe/Madrid">Mainland Spain</option><option value="America/New_York">New York</option></select></label><label>Division<select value={division} onChange={e=>setDivision(e.target.value)}><option>All</option>{[...new Set(edition.fights.map(x=>x.division))].sort().map(x=><option key={x}>{x}</option>)}</select></label></div>
  <div className="fh-list">{fights.map(f=><article className="fh-event" key={f.id}><Link to={`/fights/${f.id}`} className="fh-event-image"><VerifiedPhoto fightId={f.id} label={f.name}/></Link><div className="fh-event-top"><span className="fh-date">{dateLabel(f.date)}</span><span className="fh-division">{f.division}</span></div><h2><Link to={`/fights/${f.id}`}>{f.name}</Link></h2><p>{f.venue} · {f.stakes}</p><div className="fh-fighter-comparison">{(f.fighters||[]).map(name=>{const fighter=getFighterByName(name);return <div key={name}><strong>{name}</strong><span>{fighter?.record?`Record: ${fighter.record}`:"Record awaiting verification"}</span><span>{fighter?.nationality||"Nationality awaiting verification"}</span>{fighter&&<Link to={`/fighters/${fighter.slug}`}>Fighter profile ↗</Link>}</div>})}</div><TimeInfo fight={f} displayZone={displayZone}/><div className="fh-broadcast"><div><span>WHERE TO WATCH</span><strong>{broadcastLabel(f)}</strong><small>{f.broadcastTerritory||'Availability depends on territory; check your provider.'}</small></div>{f.watchUrl&&f.broadcastStatus==='confirmed'?<a href={f.watchUrl} rel="noreferrer" target="_blank">Broadcaster information ↗</a>:null}</div><div className="fh-links"><button type="button" className="fh-inline-action" aria-pressed={saved.includes(f.id)} onClick={()=>toggleSaved(f.id)}>{saved.includes(f.id)?"★ Saved":"☆ Save fight"}</button><button type="button" className="fh-inline-action" onClick={()=>eventICS(f)}>Add to calendar ↓</button><Link to={`/fights/${f.id}`}>Event details →</Link><a href={f.sourceUrl} target="_blank" rel="noreferrer">Verify event source ↗</a></div></article>)}</div>
  {!fights.length&&<p className="fh-empty">No fights match this view. Change the filters or save an upcoming event.</p>}
  <p className="fh-disclaimer">Exact ring walks may move on fight night. A broadcast start is not the main-event ring walk. Only confirmed times and broadcaster arrangements are presented as confirmed.</p>
 </main><Footer/></>;
}
