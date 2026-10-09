import {useState} from 'react';
import {Link} from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import {PageSEO} from '../components/SEO.jsx';
import edition from '../../public/news/fights.json';
import {getFighterByName} from '../data/seoEntities.js';
import articlesEdition from '../../public/news/articles.json';
import '../styles/fight-hub.css';

const timeLabel=(iso,zone)=>new Intl.DateTimeFormat('en-GB',{timeZone:zone,dateStyle:'medium',timeStyle:'short'}).format(new Date(iso));
const dateLabel=date=>new Date(date+'T12:00:00Z').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Atlantic/Canary',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const pictureByFight={'dubois-wardley-2':'dubois-wardley-rematch-technical-preview','fury-joshua':'fury-joshua-fight-preview','canelo-mbilli':'canelo-mbilli-prediction-analysis','fundora-hadribeaj':'sebastian-fundora-towering-inferno-profile'};
const photoFor=f=>articlesEdition.articles.find(a=>a.slug===pictureByFight[f.id])?.image;
const broadcastLabel=f=>f.broadcastStatus==='confirmed'?f.broadcast:'Broadcaster not confirmed';
function TimeInfo({fight}){
 const event=fight.schedule||{};
 return <div className="fh-times">
  <div><span>Broadcast / card start</span><strong>{event.broadcastStartUTC?timeLabel(event.broadcastStartUTC,'Atlantic/Canary')+' · Tenerife': 'Not confirmed'}</strong></div>
  {event.broadcastStartUTC&&<div><span>Venue local time</span><strong>{timeLabel(event.broadcastStartUTC,event.timeZone||'UTC')}</strong></div>}
  <div><span>Main-event ring walk</span><strong>{event.ringWalkStatus==='confirmed'&&event.ringWalkUTC?timeLabel(event.ringWalkUTC,'Atlantic/Canary')+' · Tenerife':'Not confirmed'}</strong></div>
  {event.timingNote&&<p>{event.timingNote}</p>}
 </div>;
}
export default function FightHub(){
 const [division,setDivision]=useState('All');
 const [scope,setScope]=useState('Upcoming');
 const fights=edition.fights.filter(f=>scope==='Upcoming'?f.date>=today()&&f.status!=='Completed':f.status==='Completed'||f.date<today()).filter(f=>division==='All'||division===f.division).sort((a,b)=>scope==='Upcoming'?a.date.localeCompare(b.date):b.date.localeCompare(a.date));
 return <><PageSEO title="Fight Hub — Boxing Schedule, Start Times & Where to Watch | AURA" description="Verified boxing events, dates, broadcaster information, local start times and reliable source links. Unconfirmed ring walks are clearly labelled." canonicalPath="/fight-hub"/><Header/>
 <main className="fh-page">
  <header className="fh-intro"><p className="fh-kicker">AURA / Fight Hub</p><h1>FIGHTS THAT MATTER.</h1><p>Dates, cards, broadcasters and ring walks. When a time or broadcaster isn't confirmed, we'll tell you instead of guessing.</p><small>Event information last reviewed {edition.checkedAt}. Broadcast availability varies by country.</small></header>
  <div className="fh-controls"><div className="fh-tabs">{['Upcoming','Results'].map(x=><button key={x} type="button" className={x===scope?'selected':''} onClick={()=>setScope(x)}>{x}</button>)}</div><label>Division<select value={division} onChange={e=>setDivision(e.target.value)}><option>All</option>{[...new Set(edition.fights.map(x=>x.division))].sort().map(x=><option key={x}>{x}</option>)}</select></label></div>
  <div className="fh-list">{fights.map(f=><article className="fh-event" key={f.id}>{photoFor(f)?.src&&<Link to={`/fights/${f.id}`} className="fh-event-image"><img src={photoFor(f).src} alt={photoFor(f).alt} loading="lazy" referrerPolicy="no-referrer" onError={e=>{e.currentTarget.parentElement.style.display="none"}} /></Link>}<div className="fh-event-top"><span className="fh-date">{dateLabel(f.date)}</span><span className="fh-division">{f.division}</span></div><h2><Link to={`/fights/${f.id}`}>{f.name}</Link></h2><p>{f.venue} · {f.stakes}</p><div className="fh-fighter-comparison">{(f.fighters||[]).map(name=>{const fighter=getFighterByName(name);return <div key={name}><strong>{name}</strong><span>{fighter?.record?`Record: ${fighter.record}`:"Record awaiting verification"}</span><span>{fighter?.nationality||"Nationality awaiting verification"}</span>{fighter&&<Link to={`/fighters/${fighter.slug}`}>Fighter profile ↗</Link>}</div>})}</div><TimeInfo fight={f}/><div className="fh-broadcast"><div><span>WHERE TO WATCH</span><strong>{broadcastLabel(f)}</strong><small>{f.broadcastTerritory||'Availability depends on territory; check your provider.'}</small></div>{f.watchUrl&&f.broadcastStatus==='confirmed'?<a href={f.watchUrl} rel="noreferrer" target="_blank">Broadcaster information ↗</a>:null}</div><div className="fh-links"><Link to={`/fights/${f.id}`}>Event details →</Link><a href={f.sourceUrl} target="_blank" rel="noreferrer">Verify event source ↗</a></div></article>)}</div>
  {!fights.length&&<p className="fh-empty">No events in this selection. Check back after confirmed announcements.</p>}
  <p className="fh-disclaimer">Exact ring walks may move on fight night. A broadcast start is not the main-event ring walk. Only confirmed times and broadcaster arrangements are presented as confirmed.</p>
 </main><Footer/></>;
}
