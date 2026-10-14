import {useState} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import {PageSEO} from '../components/SEO.jsx';
import {fighters} from '../data/seoEntities.js';
import {VerifiedPhoto} from '../components/VerifiedPhoto.jsx';
import '../styles/fight-hub.css';

const choices=fighters.filter(f=>!f.editorialHidden);
const suggestions=[
 {label:'Usyk vs Fury',left:'oleksandr-usyk',right:'tyson-fury'},
 {label:'Inoue vs Nakatani',left:'naoya-inoue',right:'junto-nakatani'},
 {label:'Canelo vs Mbilli',left:'canelo-alvarez',right:'christian-mbilli'},
 {label:'Ennis vs Fundora',left:'jaron-ennis',right:'sebastian-fundora'}
];
const fields=[['Record','record'],['Weight class','division'],['Nationality','nationality'],['Stance','stance'],['Height','height'],['Reach','reach'],['Date of birth','birthDate']];
function SourceBadge({fighter}){
 const source=fighter.recordSource||fighter.bioSourceUrl;
 return <div className="aura-compare-source">
  <span>{fighter.recordCheckedAt?'Reviewed '+fighter.recordCheckedAt:'Statistics not recently source-verified'}</span>
  {source&&<a href={source} target="_blank" rel="noopener noreferrer">Source for available statistics ↗</a>}
 </div>;
}
function FighterColumn({fighter}){
 return <section className="fh-compare-fighter" aria-label={fighter.name}>
  <VerifiedPhoto fighterSlug={fighter.slug} label={fighter.name} creditLink/>
  <p className="aura-compare-status">{fighter.careerStatus==='Retired'?'Career archive':'Fighter profile'}</p>
  <h2>{fighter.name}</h2>
  <p className="aura-compare-style">{fighter.summary}</p>
  <Link to={`/fighters/${fighter.slug}`}>View fighter intelligence →</Link>
  <SourceBadge fighter={fighter}/>
 </section>;
}
export default function FighterComparePage(){
 const [params,setParams]=useSearchParams();
 const [copyStatus,setCopyStatus]=useState('');
 const valid=id=>choices.some(f=>f.slug===id);
 const left=valid(params.get('left'))?params.get('left'):'oleksandr-usyk';
 const right=valid(params.get('right'))?params.get('right'):'tyson-fury';
 const a=choices.find(f=>f.slug===left);
 const b=choices.find(f=>f.slug===right);
 const same=left===right;
 const update=(nextLeft,nextRight)=>{
  setParams({left:nextLeft,right:nextRight});
  setCopyStatus('');
 };
 const copyLink=()=>{
  const url=window.location.origin+'/fighters/compare?left='+encodeURIComponent(left)+'&right='+encodeURIComponent(right);
  if(!navigator.clipboard?.writeText){setCopyStatus('Copy unavailable on this device');return;}
  navigator.clipboard.writeText(url).then(()=>setCopyStatus('Comparison link copied')).catch(()=>setCopyStatus('Copy unavailable; use the address bar'));
 };
 return <><PageSEO title="Compare Two Boxers — Fighter Head-to-Head | AURA Fight Club" canonicalPath="/fighters/compare" description="Compare two boxing fighters side by side with profile images, records, fighting styles and cited editorial statistics."/><Header/>
  <main className="fh-page aura-compare-page">
   <header className="fh-intro"><p className="fh-kicker">AURA / FIGHTER INTELLIGENCE</p><h1>HEAD TO HEAD.</h1><p>Put two fighters side by side. Compare their skills, records and measurable attributes without inventing missing statistics or a predicted winner.</p></header>
   <div className="aura-compare-suggestions" aria-label="Suggested boxing comparisons">
    <span>Explore a matchup</span>
    {suggestions.map(s=><button key={s.label} type="button" onClick={()=>update(s.left,s.right)} aria-pressed={left===s.left&&right===s.right}>{s.label}</button>)}
   </div>
   <div className="fh-comparison-selectors">
    <label>First fighter<select value={left} onChange={e=>update(e.target.value,right)}>{choices.map(f=><option value={f.slug} key={f.slug}>{f.name}{f.careerStatus==='Retired'?' (retired)':''}</option>)}</select></label>
    <button type="button" className="aura-compare-swap" onClick={()=>update(right,left)} aria-label="Swap the two fighters">⇄ <span>Swap</span></button>
    <label>Second fighter<select value={right} onChange={e=>update(left,e.target.value)}>{choices.map(f=><option value={f.slug} key={f.slug}>{f.name}{f.careerStatus==='Retired'?' (retired)':''}</option>)}</select></label>
   </div>
   {same?<p className="fh-compare-note" role="status">Choose two different fighters to compare.</p>:<>
    <div className="fh-compare-grid"><FighterColumn fighter={a}/><FighterColumn fighter={b}/></div>
    <div className="fh-compare-table" aria-label="Side-by-side fighter statistics">{fields.map(([label,key])=><div className="fh-compare-row" key={key}>
     <strong>{a[key]||'Not verified'}</strong><span>{label}</span><strong>{b[key]||'Not verified'}</strong>
    </div>)}</div>
   </>}
   <div className="aura-compare-actions"><button type="button" onClick={copyLink}>Copy comparison link ↗</button>{copyStatus&&<span role="status">{copyStatus}</span>}<Link to="/fighters">Browse the fighter index →</Link></div>
   <p className="fh-compare-note">Records and measurements are editorial snapshots, not a live BoxRec feed. If a source is absent, the statistic has not been recently verified. Current title status, results and rankings require confirmation from official records.</p>
  </main><Footer/>
 </>;
}
