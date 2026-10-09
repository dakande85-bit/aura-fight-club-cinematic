import {useState} from 'react';
import {Link} from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import {PageSEO} from '../components/SEO.jsx';
import {fighters} from '../data/seoEntities.js';
import {VerifiedPhoto} from '../components/VerifiedPhoto.jsx';
import '../styles/fight-hub.css';

const fields=[['Record','record'],['Division','division'],['Country','nationality'],['Stance','stance'],['Height','height'],['Reach','reach']];
function FighterColumn({fighter}){
 return <div className="fh-compare-fighter"><VerifiedPhoto fighterSlug={fighter.slug} label={fighter.name}/><h2>{fighter.name}</h2><Link to={`/fighters/${fighter.slug}`}>View full profile →</Link></div>;
}
export default function FighterComparePage(){
 const [left,setLeft]=useState('oleksandr-usyk');
 const [right,setRight]=useState('tyson-fury');
 const a=fighters.find(f=>f.slug===left);
 const b=fighters.find(f=>f.slug===right);
 return <><PageSEO title="Compare Boxing Fighters — Head to Head | AURA Fight Club" canonicalPath="/fighters/compare" description="Compare professional boxing fighters side by side: records, divisions, stance and verified measurements."/><Header/><main className="fh-page"><header className="fh-intro"><p className="fh-kicker">AURA / Fighter intelligence</p><h1>HEAD TO HEAD.</h1><p>Select two fighters to compare their available published records and attributes. Unverified values are never guessed.</p></header>
 <div className="fh-comparison-selectors"><label>Fighter one<select value={left} onChange={e=>setLeft(e.target.value)}>{fighters.map(f=><option value={f.slug} key={f.slug}>{f.name}</option>)}</select></label><span aria-hidden="true">VS</span><label>Fighter two<select value={right} onChange={e=>setRight(e.target.value)}>{fighters.map(f=><option value={f.slug} key={f.slug}>{f.name}</option>)}</select></label></div>
 {left===right&&<p className="fh-compare-note">Choose two different fighters for a meaningful comparison.</p>}
 <div className="fh-compare-grid"><FighterColumn fighter={a}/><FighterColumn fighter={b}/></div>
 <div className="fh-compare-table">{fields.map(([label,key])=><div className="fh-compare-row" key={key}><strong>{a[key]||'Not verified'}</strong><span>{label}</span><strong>{b[key]||'Not verified'}</strong></div>)}</div>
 <p className="fh-compare-note">These are editorial snapshots, not real-time official records. Bout outcomes, heights and title changes need confirmation from recognised fight records or official promoters before publication.</p><Link to="/fighters">Browse all fighter profiles →</Link></main><Footer/></>;
}
