import {useEffect,useMemo,useState} from 'react';
import {Link,useLocation} from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import {articles as fallbackArticles} from '../data/editorial.js';
import {latestArticles,articleUrl} from '../lib/tiktokStudio.js';
import {PageSEO} from '../components/SEO.jsx';
import '../styles/aura-tiktok-landing.css';

export default function TikTokLanding(){
 const [stories,setStories]=useState(()=>latestArticles(fallbackArticles,24));
 const [query,setQuery]=useState('');
 const {search}=useLocation();
 const campaign=new URLSearchParams(search).get('utm_campaign')==='link_in_bio'?'link_in_bio':'tiktok_landing';
 useEffect(()=>{
  const controller=new AbortController();
  fetch('/api/articles',{cache:'no-store',signal:controller.signal})
   .then(r=>r.ok?r.json():Promise.reject(new Error('Offline')))
   .then(data=>{if(Array.isArray(data.articles)&&data.articles.length)setStories(latestArticles(data.articles,24));})
   .catch(()=>{});
  return()=>controller.abort();
 },[]);
 const visible=useMemo(()=>stories.filter(a=>(a.title+' '+a.summary+' '+(a.tags||[]).join(' ')).toLowerCase().includes(query.toLowerCase())).slice(0,18),[stories,query]);
 const lead=visible[0],rest=visible.slice(1);
 const href=a=>articleUrl(a.slug,campaign);
 return <><PageSEO title="The Fight Desk | From TikTok to the Full Story | AURA Fight Club" description="Seen the boxing debate on TikTok? Read the original reporting, fight predictions and detailed analysis at the AURA Fight Desk." canonicalPath="/tiktok"/><Header/>
 <main className="aura-tiktok-hub">
  <header className="aura-tiktok-hub__hero">
   <p>FROM THE FEED TO THE FIGHT DESK</p>
   <h1>THE HEADLINE IS JUST THE START.</h1>
   <div className="aura-tiktok-hub__hero-bottom"><p>Seen one of our boxing stories on TikTok? Get the context, the sources and the deeper tactical breakdown here. Independent news. Unfiltered analysis. Boxing culture.</p>
    <Link to="/news">Browse all boxing news ↗</Link></div>
  </header>
  <section className="aura-tiktok-hub__content">
   <div className="aura-tiktok-hub__section-title"><div><p>THE LATEST</p><h2>Find the story you saw.</h2></div>
    <label>Search fighters and headlines<input type="search" placeholder="Crawford, Dubois, Wardley…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
   </div>
   {lead?<div className="aura-tiktok-hub__layout">
    <article className="aura-tiktok-hub__lead">
     <Link to={href(lead)}>
      <img src={lead.image?.src||lead.image?.fallbackSrc||'/news/media/aura-fight-desk.svg'} alt={lead.image?.alt||lead.title} onError={e=>{if(lead.image?.fallbackSrc&&e.currentTarget.src!==new URL(lead.image.fallbackSrc,window.location.href).href)e.currentTarget.src=lead.image.fallbackSrc;else e.currentTarget.style.display='none';}} loading="eager"/>
      <div className="aura-tiktok-hub__lead-body"><span>{lead.category||'FIGHT DESK'} · {lead.date}</span><h3>{lead.title}</h3><p>{lead.summary}</p><strong>Read the full breakdown →</strong></div>
     </Link>
    </article>
    <div className="aura-tiktok-hub__stories">{rest.map(a=><article key={a.slug}>
     <Link to={href(a)}><span>{a.category||'BOXING'} · {a.date}</span><h3>{a.title}</h3><p>{a.summary}</p><strong>Read analysis →</strong></Link>
    </article>)}</div>
   </div>:<p className="aura-tiktok-hub__empty">No headlines match that search. <button type="button" onClick={()=>setQuery('')}>Show all stories</button></p>}
  </section>
  <aside className="aura-tiktok-hub__footer"><p>MORE THAN THE SCORECARDS.</p><h2>FOLLOW THE SPORT. UNDERSTAND THE FIGHT.</h2><div><Link to="/fighters">Explore fighters ↗</Link><Link to="/fight-hub">Upcoming fights ↗</Link><Link to="/members">Discover Aura ↗</Link></div></aside>
 </main><Footer/></>;
}
