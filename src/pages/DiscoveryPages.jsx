import { Link, useParams } from 'react-router-dom';
import {useState} from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { PageSEO, SITE_URL } from '../components/SEO.jsx';
import Breadcrumbs, { breadcrumbSchema } from '../components/Breadcrumbs.jsx';
import { fighters, topics, evergreenGuides, author } from '../data/seoEntities.js';
import { useArticles } from '../hooks/useArticles.js';
import fightEdition from '../../public/news/fights.json';
import {VerifiedPhoto} from '../components/VerifiedPhoto.jsx';
import '../styles/aura-editorial.css';
import '../styles/fight-hub.css';

const clean = value => String(value || '').toLowerCase();

function Shell({children, seo, crumbs=[]}) {
 const schema = seo?.schema
   ? {'@context':'https://schema.org','@graph':[...(Array.isArray(seo.schema)?seo.schema:[seo.schema]), breadcrumbSchema(crumbs)]}
   : breadcrumbSchema(crumbs);
 return <><PageSEO {...seo} schema={schema}/><Header/><main className="aura-editorial aura-ed-page"><Breadcrumbs items={crumbs}/>{children}</main><Footer/></>;
}

function ArticleLinks({items}) {
 if(!items.length) return <p className="aura-ed-note">Coverage will appear here as new AURA stories are published.</p>;
 return <div className="aura-coverage-list">{items.map(item=><article key={item.slug}><p className="aura-ed-kicker">{item.category} · {item.date}</p><h3><Link to={`/news/${item.slug}`}>{item.title}</Link></h3><p>{item.summary}</p><Link to={`/news/${item.slug}`}>Read article</Link></article>)}</div>;
}

export function FightersIndexPage(){
 const [query,setQuery]=useState('');
 const [division,setDivision]=useState('All divisions');
 const matches=fighters.filter(f=>(division==='All divisions'||f.division===division)&& (f.name+' '+f.division+' '+(f.nationality||'')).toLowerCase().includes(query.toLowerCase()));
 return <Shell seo={{title:'Boxing Fighters & Profiles | AURA Fight Club',description:'Explore AURA Fight Club fighter profiles, records, divisions, latest coverage and boxing analysis.',canonicalPath:'/fighters'}} crumbs={[{label:'Home',to:'/'},{label:'Fighters',to:'/fighters'}]}>
  <div className="aura-fighters-header"><p className="aura-ed-kicker">THE AURA INDEX / BOXING INTELLIGENCE</p><h1>THE FIGHTERS.</h1><p>Discover the champions, contenders and prospects shaping boxing. Profiles, records, upcoming matchups and independent analysis.</p></div>
  <div className="aura-directory-controls"><label>Search fighters<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search boxer or country…" type="search" /></label><label>Division<select value={division} onChange={e=>setDivision(e.target.value)}><option>All divisions</option>{[...new Set(fighters.map(f=>f.division))].sort().map(d=><option key={d}>{d}</option>)}</select></label></div>
  <div className="aura-directory-count"><Link to="/fighters/compare" className="aura-compare-cta">Compare two fighters ↗</Link> <strong>{matches.length}</strong> fighters <span>• Photo sources are identified; records are dated editorial snapshots.</span></div>
  <div className="aura-fighter-directory">{matches.map(f=><Link to={`/fighters/${f.slug}`} className="aura-fighter-tile" key={f.slug}>
    <div className="aura-fighter-tile__photo"><VerifiedPhoto fighterSlug={f.slug} label={f.name}/></div>
    <div className="aura-fighter-tile__info"><span>{f.division} {f.nationality?`· ${f.nationality}`:''}</span><h2>{f.name}</h2><p>{f.record||'Record under verification'}</p><strong>VIEW PROFILE <span aria-hidden="true">↗</span></strong></div>
  </Link>)}</div>
  {!matches.length&&<p className="aura-directory-empty">No fighters match this search. Try a different name or weight class.</p>}
 </Shell>;
}

export function FighterProfilePage(){
 const {slug}=useParams(); const fighter=fighters.find(f=>f.slug===slug); const {articles}=useArticles();
 if(!fighter) return <Shell seo={{title:'Fighter not found | AURA Fight Club',description:'Fighter profile not found.',canonicalPath:`/fighters/${slug}`,noindex:true}} crumbs={[{label:'Home',to:'/'},{label:'Fighters',to:'/fighters'},{label:'Not found',to:`/fighters/${slug}`}]}><div className="aura-ed-page-title"><h1>Fighter not found.</h1><Link to="/fighters">Browse fighters</Link></div></Shell>;
 const related=articles.filter(a=>fighter.aliases.some(alias=>clean(a.title+' '+a.summary+' '+(a.body||[]).join(' ')).includes(clean(alias)))).slice(0,12);
 const fights=fightEdition.fights.filter(f=>(f.fighters||[]).some(name=>fighter.aliases.some(alias=>clean(name)===clean(alias))) || fighter.aliases.some(alias=>clean(f.name).includes(clean(alias)))).slice(0,8);
 const personSchema={'@type':'Person','@id':`${SITE_URL}/fighters/${fighter.slug}#person`,name:fighter.name,nationality:fighter.nationality||undefined,description:fighter.summary,url:`${SITE_URL}/fighters/${fighter.slug}`,jobTitle:'Professional boxer'};
 const crumbs=[{label:'Home',to:'/'},{label:'Fighters',to:'/fighters'},{label:fighter.name,to:`/fighters/${fighter.slug}`}];
 return <Shell seo={{title:`${fighter.name} — Record, Division, News & Analysis | AURA Fight Club`,description:`${fighter.name}: ${fighter.summary} Latest AURA Fight Club news, rankings and fight coverage.`,canonicalPath:`/fighters/${fighter.slug}`,schema:personSchema}} crumbs={crumbs}>
  <p className="aura-compare-profile-link"><Link to="/fighters/compare">Compare fighters side by side ↗</Link></p><div className="aura-ed-page-title aura-profile-hero"><VerifiedPhoto fighterSlug={fighter.slug} label={fighter.name}/><div><p className="aura-ed-kicker">{fighter.division}{fighter.nationality?` · ${fighter.nationality}`:''}</p><h1>{fighter.name}</h1>{fighter.record&&<p className="aura-article-deck">{fighter.record}</p>}<p>{fighter.summary}</p></div></div>
  <section className="aura-ed-section"><div className="aura-ed-section-head"><h2>Fighter intelligence.</h2></div><div className="fh-profile-stats">{[['Record',fighter.record],['Division',fighter.division],['Country',fighter.nationality],['Stance',fighter.stance],['Height',fighter.height],['Reach',fighter.reach],['Date of birth',fighter.birthDate]].map(([label,value])=><div key={label}><span>{label}</span><strong>{value||'Not verified'}</strong></div>)}</div><p className="aura-ed-note">Data is displayed only when an editorial source has been reviewed. Profiles are not connected to BoxRec's live database.</p>{fighter.bioSourceUrl&&<a href={fighter.bioSourceUrl} rel="noreferrer" target="_blank">Profile source ↗</a>}</section>
  {fights.length>0&&<section className="aura-ed-section"><div className="aura-ed-section-head"><h2>Fight record on AURA.</h2></div><div className="aura-coverage-list">{fights.map(f=><article key={f.id}><p className="aura-ed-kicker">{f.date} · {f.division}</p><h3><Link to={`/fights/${f.id}`}>{f.name}</Link></h3><p>{f.stakes}</p><p>Broadcaster: {f.broadcastStatus==='confirmed'?f.broadcast:'Not confirmed'} · Ring walk: {f.schedule?.ringWalkStatus==='confirmed'?'Confirmed':'Not confirmed'}</p><a href={f.sourceUrl} rel="noreferrer" target="_blank">Check official event information ↗</a></article>)}</div></section>}
  <section className="aura-ed-section"><div className="aura-ed-section-head"><h2>Latest coverage.</h2></div><ArticleLinks items={related}/></section>
  <p className="aura-ed-note"><strong>Accuracy notice:</strong> Fighter records and divisions are editorial snapshots, not a live BoxRec feed. Unverified measurements, bout results and title changes are deliberately omitted. Confirm current records against official fight results before relying on them.</p>
 </Shell>;
}

export function TopicsIndexPage(){
 return <Shell seo={{title:'Boxing Topics, Guides & Analysis | AURA Fight Club',description:'Browse AURA Fight Club topic hubs covering heavyweight boxing, prospects, predictions, British boxing, pound-for-pound and boxing guides.',canonicalPath:'/topics'}} crumbs={[{label:'Home',to:'/'},{label:'Topics',to:'/topics'}]}>
  <div className="aura-ed-page-title"><p className="aura-ed-kicker">Search hubs</p><h1>Boxing topics.</h1><p>Evergreen hubs that organise AURA reporting around the subjects fans search for repeatedly.</p></div>
  <div className="aura-coverage-list">{topics.map(t=><article key={t.slug}><h2><Link to={`/topics/${t.slug}`}>{t.title}</Link></h2><p>{t.description}</p></article>)}</div>
 </Shell>;
}

export function TopicPage(){
 const {slug}=useParams(); const topic=topics.find(t=>t.slug===slug); const {articles}=useArticles();
 if(!topic) return <Shell seo={{title:'Topic not found | AURA Fight Club',description:'Topic not found.',canonicalPath:`/topics/${slug}`,noindex:true}} crumbs={[{label:'Home',to:'/'},{label:'Topics',to:'/topics'},{label:'Not found',to:`/topics/${slug}`}]}><div className="aura-ed-page-title"><h1>Topic not found.</h1></div></Shell>;
 const related=articles.filter(a=>topic.keywords.some(k=>clean(a.title+' '+a.summary+' '+a.category+' '+(a.body||[]).join(' ')).includes(clean(k)))).slice(0,20);
 const crumbs=[{label:'Home',to:'/'},{label:'Topics',to:'/topics'},{label:topic.title,to:`/topics/${topic.slug}`}];
 return <Shell seo={{title:`${topic.title} — News, Rankings & Analysis | AURA Fight Club`,description:topic.description,canonicalPath:`/topics/${topic.slug}`}} crumbs={crumbs}>
  <div className="aura-ed-page-title"><p className="aura-ed-kicker">AURA topic hub</p><h1>{topic.title}.</h1><p>{topic.description}</p></div>
  <ArticleLinks items={related}/>
 </Shell>;
}

export function GuidesIndexPage(){
 return <Shell seo={{title:'Boxing Guides & Explainers | AURA Fight Club',description:'Boxing rules, rankings, belts, scoring, weight classes and tactical concepts explained clearly by AURA Fight Club.',canonicalPath:'/guides'}} crumbs={[{label:'Home',to:'/'},{label:'Guides',to:'/guides'}]}>
  <div className="aura-ed-page-title"><p className="aura-ed-kicker">Learn the sport</p><h1>Boxing guides.</h1><p>Evergreen explainers designed for casual fans and serious followers who want the sport made clear.</p></div>
  <div className="aura-coverage-list">{evergreenGuides.map(g=><article key={g.slug}><p className="aura-ed-kicker">{g.category}</p><h2><Link to={`/guides/${g.slug}`}>{g.title}</Link></h2><p>{g.description}</p></article>)}</div>
 </Shell>;
}

export function GuidePage(){
 const {slug}=useParams(); const guide=evergreenGuides.find(g=>g.slug===slug);
 if(!guide) return <Shell seo={{title:'Guide not found | AURA Fight Club',description:'Guide not found.',canonicalPath:`/guides/${slug}`,noindex:true}} crumbs={[{label:'Home',to:'/'},{label:'Guides',to:'/guides'},{label:'Not found',to:`/guides/${slug}`}]}><div className="aura-ed-page-title"><h1>Guide not found.</h1></div></Shell>;
 const crumbs=[{label:'Home',to:'/'},{label:'Guides',to:'/guides'},{label:guide.title,to:`/guides/${guide.slug}`}];
 const articleSchema={'@type':'Article',headline:guide.title,description:guide.description,author:{'@id':`${SITE_URL}/authors/${author.slug}#person`},publisher:{'@type':'Organization',name:'AURA Fight Club',url:SITE_URL},mainEntityOfPage:`${SITE_URL}/guides/${guide.slug}`,inLanguage:'en'};
 return <Shell seo={{title:`${guide.title} | AURA Fight Club`,description:guide.description,canonicalPath:`/guides/${guide.slug}`,type:'article',schema:articleSchema}} crumbs={crumbs}>
  <article className="aura-article"><p className="aura-ed-kicker">AURA boxing guide</p><h1>{guide.title}</h1><p className="aura-article-deck">{guide.description}</p><p>This guide is part of AURA Fight Club’s evergreen boxing knowledge base. It is structured and indexed now so editorial copy can be expanded without changing the URL, internal links or search intent.</p><p className="aura-ed-note">Editorial owner: <Link to={`/authors/${author.slug}`}>{author.name}</Link>. Update this page whenever rules, sanctioning-body procedures or terminology materially change.</p></article>
 </Shell>;
}

export function AuthorPage(){
 const personSchema={'@type':'Person','@id':`${SITE_URL}/authors/${author.slug}#person`,name:author.name,jobTitle:author.role,description:author.bio,url:`${SITE_URL}/authors/${author.slug}`};
 return <Shell seo={{title:`${author.name} | AURA Fight Club`,description:author.bio,canonicalPath:`/authors/${author.slug}`,schema:personSchema}} crumbs={[{label:'Home',to:'/'},{label:'Authors',to:'/authors/dare-akande'},{label:author.name,to:`/authors/${author.slug}`}]}>
  <div className="aura-ed-page-title"><p className="aura-ed-kicker">Author</p><h1>{author.name}</h1><p className="aura-article-deck">{author.role}</p><p>{author.bio}</p></div>
 </Shell>;
}

export function EditorialPolicyPage(){
 return <Shell seo={{title:'Editorial Policy | AURA Fight Club',description:'How AURA Fight Club researches, writes, updates and corrects boxing coverage.',canonicalPath:'/editorial-policy'}} crumbs={[{label:'Home',to:'/'},{label:'Editorial Policy',to:'/editorial-policy'}]}>
  <article className="aura-article"><p className="aura-ed-kicker">Trust & standards</p><h1>Editorial policy.</h1><p>AURA Fight Club separates verified reporting from analysis and opinion. Factual claims should be checked against primary or reputable sources before publication, sources should be linked where practical, and articles should show publication and modification dates.</p><h2>Original analysis</h2><p>Our aim is not to rewrite headlines. We add tactical context, career context, rankings implications and clearly-labelled opinion.</p><h2>Images and media</h2><p>Images must be relevant to the named fighter or event, accurately described with alt text, and credited where a source requires it. Prominent stories should not recycle the same hero image unless editorially necessary.</p><h2>Updates</h2><p>Fight schedules, rankings and fighter information change quickly. Material changes should update the page dateModified value and visible update note.</p></article>
 </Shell>;
}

export function CorrectionsPolicyPage(){
 return <Shell seo={{title:'Corrections Policy | AURA Fight Club',description:'AURA Fight Club corrections and update policy for boxing news, rankings and analysis.',canonicalPath:'/corrections'}} crumbs={[{label:'Home',to:'/'},{label:'Corrections',to:'/corrections'}]}>
  <article className="aura-article"><p className="aura-ed-kicker">Trust & standards</p><h1>Corrections policy.</h1><p>When a material factual error is confirmed, AURA Fight Club should correct it promptly, update the modification date and make the corrected version clear to readers where the change affects the meaning of the story.</p><p>Minor spelling, formatting and style corrections may be made without a correction note when they do not alter the substance of the report.</p></article>
 </Shell>;
}
