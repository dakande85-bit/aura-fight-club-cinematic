import {Link} from 'react-router-dom';
import {useState} from 'react';
import edition from '../../public/news/fights.json';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import {PageSEO} from '../components/SEO.jsx';
import {useArticles} from '../hooks/useArticles.js';
import {VerifiedPhoto} from '../components/VerifiedPhoto.jsx';
import {getFighterByName} from '../data/seoEntities.js';
import '../styles/fight-hub.css';
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Atlantic/Canary',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export default function VerdictPage(){
 const {articles=[]}=useArticles();
 const [picks,setPicks]=useState(()=>{try{return JSON.parse(localStorage.getItem('aura-predictions')||'{}')}catch{return {}}});
 const selectPick=(id,name)=>setPicks(current=>{const next={...current,[id]:name};try{localStorage.setItem('aura-predictions',JSON.stringify(next))}catch{}return next});
 const upcoming=edition.fights.filter(f=>f.status!=='Completed'&&f.date>=today()).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,10);
 return <><PageSEO title="Fight Predictions & Previews | AURA Fight Club" canonicalPath="/verdict" description="Upcoming boxing fights, tactical predictions, verified broadcast information and your own predictions."/><Header/>
 <main className="fh-page aura-verdict-page">
 <header className="fh-intro"><p className="fh-kicker">AURA / FIGHT PREDICTIONS</p><h1>BEFORE THE BELL.</h1><p>Who wins — and why? Upcoming matchups, technical keys, tactical previews and your fight-night predictions.</p><small>Predictions are opinions, not betting advice. Your picks stay on this device; no artificial voting totals.</small></header>
 <div className="aura-verdict-grid">{upcoming.map(f=>{
 const preview=articles.find(a=>a.fightId===f.id&&/prediction|preview|build-up|analysis/i.test([a.title,a.category,a.coverageStage].join(' ')));
 const names=(f.fighters||[]).slice(0,2);
 return <article className="aura-verdict-card" key={f.id}>
  <p className="fh-kicker">{f.date} · {f.division}</p>
  <div className="aura-verdict-faceoff">{names.map(name=>{const fighter=getFighterByName(name);return <div key={name} className="aura-verdict-faceoff__side"><VerifiedPhoto fighterSlug={fighter?.slug} label={name}/><strong>{name}</strong></div>})}{names.length===2&&<span className="aura-verdict-vs">VS</span>}</div>
  <h2><Link to={`/fights/${f.id}`}>{f.name}</Link></h2><p>{f.venue} · <strong>{f.broadcastStatus==='confirmed'?f.broadcast:'Broadcaster not confirmed'}</strong></p>
  {preview?<div className="aura-verdict-preview"><span>THE TACTICAL PREVIEW</span><Link to={`/news/${preview.slug}`}>{preview.title} →</Link></div>:<p className="aura-verdict-awaiting">Detailed preview coming when independently researched.</p>}
  {names.length===2&&<div className="fh-pick-options">{names.map(name=><button key={name} type="button" aria-pressed={picks[f.id]===name} onClick={()=>selectPick(f.id,name)}>{name}</button>)}</div>}
  {picks[f.id]&&<small>Your pick: {picks[f.id]}</small>}
  <Link className="aura-verdict-details" to={`/fights/${f.id}`}>Fight details and verified start times →</Link>
 </article>})}</div>
 {!upcoming.length&&<p>No upcoming confirmed events are currently listed.</p>}
 </main><Footer/></>;
}
