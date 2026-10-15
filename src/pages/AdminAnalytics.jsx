import {useState} from 'react';
import {Link} from 'react-router-dom';
import {PageSEO} from '../components/SEO.jsx';
import '../styles/aura-analytics-dashboard.css';

const format=n=>Number.isFinite(n)?new Intl.NumberFormat('en-GB').format(n):'—';
const total=r=>r?.total||{};
function Breakdown({title,items=[],field,asLinks=false}){
 const rows=Array.isArray(items)?items.filter(x=>x[field]!=='Others').slice(0,10):[];
 const max=Math.max(1,...rows.map(x=>x.pageviews||0));
 return <section className="aa-panel"><h2>{title}</h2>{!rows.length?<p className="aa-empty">No statistics available yet.</p>:rows.map((x,i)=><div className="aa-bar" key={i}><div className="aa-bar-label">{asLinks&&String(x[field]||'').startsWith('/')?<a href={x[field]} target="_blank" rel="noreferrer">{x[field]}</a>:<span>{x[field]||'Direct / unknown'}</span>}<b>{format(x.pageviews)}</b></div><div className="aa-rail"><i style={{width:(100*(x.pageviews||0)/max)+'%'}}/></div></div>)}</section>;
}
function Trend({items=[]}){
 const rows=Array.isArray(items)?[...items].sort((a,b)=>String(a.timestamp).localeCompare(String(b.timestamp))):[];
 if(!rows.length)return <p className="aa-empty">Daily visitor data will appear here after tracking is enabled.</p>;
 const max=Math.max(1,...rows.map(r=>r.pageviews||0));
 const points=rows.map((r,i)=>[16+i*828/Math.max(1,rows.length-1),165-(r.pageviews||0)*145/max]);
 return <><svg viewBox="0 0 860 180" className="aa-chart" role="img" aria-label="Daily traffic trend"><polyline fill="none" stroke="#d7ae63" strokeWidth="4" strokeLinejoin="round" points={points.map(p=>p.join(',')).join(' ')}/>{points.map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="#d7ae63"><title>{rows[i].timestamp?.slice(0,10)} — {format(rows[i].pageviews)} page views</title></circle>)}</svg><p className="aa-chart-labels"><span>{rows[0].timestamp?.slice(0,10)}</span><span>Highest day: {format(max)} views</span><span>{rows.at(-1).timestamp?.slice(0,10)}</span></p></>;
}
export default function AdminAnalytics(){
 const [secret,setSecret]=useState('');
 const [days,setDays]=useState(30);
 const [loading,setLoading]=useState(false);
 const [report,setReport]=useState(null);
 const [error,setError]=useState('');
 const pages=report?.pages||[];
 const articles=pages.filter(x=>String(x.requestPath||'').startsWith('/news/'));
 async function refresh(n=days){
  if(!secret){setError('Enter the newsroom editor password.');return;}
  setLoading(true);setError('');
  try{
   const r=await fetch('/api/admin/analytics?days='+n,{headers:{Authorization:'Bearer '+secret},cache:'no-store'});
   const body=await r.json();
   if(!r.ok)throw Error(body.error||'Could not load statistics.');
   setReport(body);setDays(n);
  }catch(e){setError(e.message);setReport(null);}finally{setLoading(false);}
 }
 return <><PageSEO title="Private Audience Analytics | AURA Fight Club" description="Private boxing newsroom analytics." canonicalPath="/admin/analytics" noindex/>
 <main className="aa-shell">
  <nav className="aa-nav"><Link to="/admin">AURA ADMIN</Link><span> / AUDIENCE INTELLIGENCE</span><Link to="/news">Fight Desk ↗</Link></nav>
  <header className="aa-hero"><small>AURA / READER INTELLIGENCE</small><h1>KNOW YOUR <em>AUDIENCE.</em></h1><p>Real web traffic, most-read stories and where boxing fans discover the club.</p></header>
  <section className="aa-login"><div><h2>Private newsroom reporting</h2><p>Real Vercel Web Analytics data. No sample traffic or artificial numbers.</p></div><form onSubmit={e=>{e.preventDefault();refresh();}}><label htmlFor="aa-secret">Editor password</label><input id="aa-secret" type="password" autoComplete="current-password" value={secret} onChange={e=>setSecret(e.target.value)} placeholder="Enter editor password" required/><button disabled={loading}>{loading?'Loading…':'Load live analytics'}</button></form></section>
  {error&&<div className="aa-error" role="alert">{error}</div>}
  <div className="aa-controls"><span>PERIOD</span>{[7,30].map(n=><button type="button" className={days===n?'selected':''} aria-pressed={days===n} key={n} onClick={()=>refresh(n)} disabled={loading||!secret}>{n} days</button>)}{report&&<small>Updated {new Date(report.retrievedAt).toLocaleString('en-GB')}</small>}</div>
  <section className="aa-kpis">
   <article><span>PAGE VIEWS</span><strong>{format(total(report).pageviews)}</strong><small>All pages opened</small></article>
   <article><span>UNIQUE VISITORS</span><strong>{format(total(report).visitors)}</strong><small>Vercel daily-hash estimate</small></article>
   <article><span>VIEWS PER VISITOR</span><strong>{total(report).visitors>0?(total(report).pageviews/total(report).visitors).toFixed(2):'—'}</strong><small>Selected reporting period</small></article>
   <article><span>TOP STORY VIEWS</span><strong>{format(articles[0]?.pageviews)}</strong><small>Among the top twenty pages</small></article>
  </section>
  <section className="aa-panel aa-full"><h2>Daily traffic</h2><Trend items={report?.trend}/></section>
  <div className="aa-grid">
   <Breakdown title="Most visited pages" items={pages} field="requestPath" asLinks/>
   <Breakdown title="Most read articles" items={articles} field="requestPath" asLinks/>
   <Breakdown title="Referring websites" items={report?.referrers} field="referrerHostname"/>
   <Breakdown title="Reader countries" items={report?.countries} field="country"/>
   <Breakdown title="Devices" items={report?.devices} field="deviceType"/>
   <Breakdown title="UTM social sources" items={report?.sources} field="utmSource"/>
  </div>
  {report&&Object.keys(report.errors||{}).length>0&&<p className="aa-error" role="status">Some data is unavailable: {Object.entries(report.errors).map(([k,v])=>k+': '+v).join('; ')}</p>}
  <section className="aa-next"><h2>Search and referral performance</h2><p>Use these tools to review search rankings, indexing and advanced engagement. They require their own accounts and configuration.</p><div><a href="https://search.google.com/search-console" target="_blank" rel="noreferrer">Google Search Console ↗</a><a href="https://analytics.google.com/" target="_blank" rel="noreferrer">Google Analytics 4 ↗</a><a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer">Vercel analytics ↗</a></div></section>
  <footer>AURA FIGHT CLUB / PRIVATE REPORTING</footer>
 </main></>;
}
