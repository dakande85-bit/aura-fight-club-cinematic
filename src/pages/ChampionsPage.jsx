import {useState} from 'react';
import {Link} from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import {PageSEO} from '../components/SEO.jsx';
import rankings from '../../public/news/rankings.json';
import {VerifiedPhoto} from '../components/VerifiedPhoto.jsx';
import {getFighterByName} from '../data/seoEntities.js';
import {fighterHref} from '../data/seoEntities.js';
import '../styles/fight-hub.css';

export default function ChampionsPage(){
 const [weight,setWeight]=useState('heavyweight');
 const [body,setBody]=useState('WBC');
 const division=rankings.divisions.find(x=>x.id===weight);
 const organization=rankings.organizations[body];
 return <><PageSEO title="Boxing Champions and Rankings | AURA Fight Club" description="Champions, contenders and rankings by division and sanctioning body, with sources and snapshot dates." canonicalPath="/rankings"/><Header/><main className="fh-page">
 <header className="fh-intro"><p className="fh-kicker">AURA / Championship intelligence</p><h1>CHAMPIONS & RANKINGS.</h1><p>Find the champion, the contenders and the official rankings source without broken portrait galleries.</p><small>Rankings are dated editorial snapshots, not live sanctioning-body feeds. Last compilation: {rankings.checkedAt}.</small></header>
 <div className="fh-controls"><label>Weight class <select value={weight} onChange={e=>setWeight(e.target.value)}>{rankings.divisions.map(d=><option value={d.id} key={d.id}>{d.name}</option>)}</select></label><label>Sanctioning body <select value={body} onChange={e=>setBody(e.target.value)}>{Object.keys(rankings.organizations).map(k=><option key={k}>{k}</option>)}</select></label></div>
 <div className="fh-ranking-panel"><div className="fh-champion-feature"><VerifiedPhoto fighterSlug={getFighterByName(division.champions?.[body])?.slug} label={division.champions?.[body]||division.name}/><div className="fh-ranking-title"><div><span>{body} · {division.name}</span><h2>{division.champions?.[body]||'Vacant / unconfirmed'}</h2><p>Listed champion · Source edition {organization.period}</p></div><a href={organization.url} rel="noreferrer" target="_blank">Official {body} rankings ↗</a></div>
 </div><h3>Ranked contenders</h3>{division.rows.map(row=>{const name=row[body]||'Not listed';const href=fighterHref(name);return <div className="fh-ranking-row" key={row.rank}><strong>#{row.rank}</strong>{href?<Link to={href}>{name}</Link>:<span>{name}</span>}</div>})}
 <p className="fh-ranking-note">Check the official source for changes in championship designation, mandatory positions and interim belts. Competing bodies publish separate lists and update at different times.</p></div>
 </main><Footer/></>;
}
