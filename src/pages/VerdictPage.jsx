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
const isPreview=a=>/prediction|preview|build-up|tactic|technical|fight lab/i.test([a.title,a.category,a.coverageStage,a.articleType,...(a.tags||[])].join(' '));
export default function VerdictPage(){
 const {articles=[]}=useArticles();
 const [picks,setPicks]=useState(()=>{try{return JSON.parse(localStorage.getItem('aura-predictions')||'{}')}catch{return {}}});
 const selectPick=(id,name)=>setPicks(old=>{const next={...old,[id]:name};try{localStorage.setItem('aura-predictions',JSON.stringify(next))}catch{}return next});
 const upcoming=edition.fights.filter(f=>f.status!=='Completed'&&f.date>=today()).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,12);
 return <><PageSEO title="Fight Predictions & Previews | AURA Fight Club" canonicalPath="/verdict" description="Upcoming boxing events, original technical predictions, verified event details and your own fighter picks."/><Header/>
 <main className="fh-page aura-verdict-page">
 <header className="fh-intro"><p className="fh-kicker">AURA / FIGHT PREDICTIONS</p><h1>BEFORE THE BELL.</h1><p>The fight starts long before the opening bell. Explore the tactics, research our previews and make your call for the fights that matter.</p><small>Our previews are boxing opinions, not betting advice. Your choices are stored on your device only.</small></header>
 <section className="aura-verdict-grid" aria-label="Upcoming fight previews">{upcoming.map(f=>{
  const articlesForFight=articles.filter(a=>a.fightId===f.id&&isPreview(a));
  const preview=articlesForFight.find(a=>/prediction|preview/i.test(a.title))||articlesForFight[0];
  const names=(f.fighters||[]).slice(0,2);
  const profiles=names.map(getFighterByName);
  return <article className="aura-verdict-card" key={f.id}>
   <div className="aura-verdict-event-photo"><VerifiedPhoto fightId={f.id} label={f.name}/></div>
   <div className="aura-verdict-card__content">
    <p className="fh-kicker">{new Date(f.date+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})} · {f.division}</p>
    <h2><Link to={`/fights/${f.id}`}>{f.name}</Link></h2>
    <p className="aura-verdict-meta">{f.venue} · <strong>{f.broadcastStatus==='confirmed'?f.broadcast:'Broadcast not confirmed'}</strong></p>
    {preview?<div className="aura-verdict-preview"><span>ORIGINAL AURA ANALYSIS</span><h3><Link to={`/news/${preview.slug}`}>{preview.title}</Link></h3><p>{preview.summary}</p><Link className="aura-verdict-read" to={`/news/${preview.slug}`}>Read the tactical breakdown →</Link></div>:<div className="aura-verdict-preview"><span>FIGHT INTELLIGENCE</span><p>Full tactical prediction not yet published. Check verified card details and follow our updates.</p></div>}
    {names.length===2&&<fieldset className="aura-verdict-poll"><legend>Who do you pick?</legend><div className="fh-pick-options">{names.map(name=><button key={name} type="button" aria-pressed={picks[f.id]===name} onClick={()=>selectPick(f.id,name)}>{name}</button>)}</div>{picks[f.id]&&<small>Your selection: {picks[f.id]} · Saved on this device</small>}</fieldset>}
    <div className="aura-verdict-footer"><Link to={`/fights/${f.id}`}>Full event and viewing details ↗</Link>{profiles[0]&&profiles[1]&&<Link to={`/fighters/compare?left=${profiles[0].slug}&right=${profiles[1].slug}`}>Compare fighters ↗</Link>}</div>
   </div>
  </article>;
 })}</section>
 {!upcoming.length&&<p>No verified upcoming events are currently listed.</p>}
 </main><Footer/></>;
}
