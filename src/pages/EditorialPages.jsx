import FightDetailExperience from '../components/FightDetailExperience.jsx';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { NewsSection, WatchSection, LifestyleSection, ExternalLink, Video, StoryImage } from '../components/EditorialSections.jsx';
import ArticleBody, { articleReadingMinutes } from '../components/ArticleBody.jsx';
import OfficialMediaGallery from '../components/OfficialMediaGallery.jsx';
import { useArticles } from '../hooks/useArticles.js';
import '../styles/aura-editorial.css';
import '../styles/fight-hub.css';
import { FightCalendar, BeltRankings, FightCoverage, fights } from '../components/FightDesk.jsx';
import { AdSlot, AffiliateLink, AffiliateDisclosure, GearCommerce, HowToWatch } from '../components/Monetization.jsx';
import { PageSEO, SITE_URL } from '../components/SEO.jsx';
import Breadcrumbs, { breadcrumbSchema } from '../components/Breadcrumbs.jsx';
import { fighters, author, getFighterByName } from '../data/seoEntities.js';
import articlesEdition from '../../public/news/articles.json';
function Frame({title, children, seo}) {
 useEffect(() => { document.title = `${title} | AURA Fight Club`; window.scrollTo(0,0); }, [title]);
 return <><PageSEO title={seo?.title || `${title} | AURA Fight Club`} description={seo?.description || 'Boxing news, analysis and fight culture from AURA Fight Club.'} canonicalPath={seo?.canonicalPath} image={seo?.image} type={seo?.type} schema={seo?.schema} /><Header /><main className="aura-editorial aura-ed-page">{children}</main><Footer /></>;
}
export function NewsPage() { return <Frame title="Fight News" seo={{title:'Boxing News & Original Analysis | AURA Fight Club',description:'Original boxing news, fight-night reactions and tactical analysis.',canonicalPath:'/news'}}><section className="aura-news-masthead" aria-labelledby="fight-desk-title"><div className="aura-news-masthead__copy"><p className="aura-ed-kicker">AURA / THE NEWSROOM</p><h1 id="fight-desk-title">The Fight Desk<span>.</span></h1><p>Boxing beyond the headlines. Breaking stories, real analysis and the people shaping the fight game.</p><a href="#fight-news">Read the latest ↓</a></div><div className="aura-news-masthead__image" aria-hidden="true"/></section><NewsSection full /></Frame>; }
export function WatchPage() { return <Frame title="Watch"><div className="aura-ed-page-title"><p className="aura-ed-kicker">AURA / Watch</p><h1>Closer to the fight.</h1><p>Interviews, press conferences and behind-the-scenes coverage from official boxing channels.</p><div className="aura-home-actions"><AffiliateLink partnerKey="dazn" placement="watch-page">Subscribe / watch on DAZN</AffiliateLink></div><AffiliateDisclosure /></div><WatchSection /><GearCommerce /></Frame>; }
export function LifestylePage() { return <Frame title="Lifestyle"><LifestyleSection /></Frame>; }
export function ArticlePage() {
 const {slug} = useParams(); const {articles,loading}=useArticles(); const article = articles.find(item => item.slug === slug);
 if(!article && loading) return <Frame title="Loading story"><p className="aura-ed-page-title" role="status">Loading story…</p></Frame>;
 if (!article) return <Frame title="Story not found"><div className="aura-ed-page-title"><h1>Story not found.</h1><Link to="/news">Return to Fight News</Link></div></Frame>;
 const articleImage = article.image?.src || undefined;
 const articleUrl = `${SITE_URL}/news/${article.slug}`;
 const taggedFighters=fighters.filter(f=>(article.fighterSlugs||[]).includes(f.slug));
 const inferredFighters=fighters.filter(f=>f.aliases.some(alias=>(article.title+' '+article.summary+' '+(article.body||[]).join(' ')).toLowerCase().includes(alias.toLowerCase())));
 const relatedFighters=[...taggedFighters,...inferredFighters.filter(f=>!taggedFighters.some(t=>t.slug===f.slug))].slice(0,6);
 const relatedArticles=articles.filter(candidate=>{
  if(candidate.slug===article.slug) return false;
  const sharedFighter=(article.fighterSlugs||[]).some(slug=>(candidate.fighterSlugs||[]).includes(slug));
  const sharedFight=article.fightId && candidate.fightId===article.fightId;
  const sharedTag=(article.tags||[]).some(tag=>(candidate.tags||[]).includes(tag));
  return sharedFighter || sharedFight || sharedTag || candidate.category===article.category;
 }).slice(0,4);
 const crumbs=[{label:'Home',to:'/'},{label:'Fight News',to:'/news'},{label:article.title,to:`/news/${article.slug}`}];
 const articleSchema = {
  '@context':'https://schema.org',
  '@graph':[
   {
    '@type':'NewsArticle',
    headline: article.title,
    description: article.summary,
    image: articleImage ? [articleImage] : undefined,
    datePublished: article.date,
    dateModified: article.updatedAt || article.date,
    mainEntityOfPage: articleUrl,
    author: { '@type':'Person','@id':`${SITE_URL}/authors/${author.slug}#person`, name:author.name, url:`${SITE_URL}/authors/${author.slug}` },
    publisher: { '@type':'Organization', name:'AURA Fight Club', url:SITE_URL, logo:{'@type':'ImageObject',url:`${SITE_URL}/assets/aura-live/logos/mark-white.png`} },
    articleSection: article.category,
    about: relatedFighters.map(f=>({'@type':'Person','@id':`${SITE_URL}/fighters/${f.slug}#person`,name:f.name,url:`${SITE_URL}/fighters/${f.slug}`})),
    inLanguage:'en'
   },
   breadcrumbSchema(crumbs)
  ]
 };
 return <Frame title={article.title} seo={{title:article.seoTitle || `${article.title} | AURA Fight Club`,description:article.metaDescription || article.summary,canonicalPath:`/news/${article.slug}`,image:articleImage,type:'article',schema:articleSchema}}><article className="aura-article"><Breadcrumbs items={crumbs}/><StoryImage key={article.slug} article={article} eager /><p className="aura-ed-kicker">{article.category} · <time dateTime={article.date}>{article.date}</time></p><h1>{article.title}</h1><p className="aura-article-deck">{article.summary}</p><p className="aura-ed-note">By <Link to={`/authors/${author.slug}`}>{author.name}</Link> · Published <time dateTime={article.date}>{article.date}</time>{article.updatedAt && article.updatedAt!==article.date ? <> · Updated <time dateTime={article.updatedAt}>{article.updatedAt}</time></> : null} · {articleReadingMinutes(article.body)} min read</p>{relatedFighters.length>0&&<div className="aura-life-links" aria-label="Fighters in this story">{relatedFighters.map(f=><Link key={f.slug} to={`/fighters/${f.slug}`}>{f.name}</Link>)}</div>}<AdSlot slot="article-top" /><OfficialMediaGallery article={article} /><ArticleBody body={article.body} monetized /><AdSlot slot="article-bottom" />{relatedArticles.length>0&&<aside className="aura-article-source"><p className="aura-ed-kicker">Keep reading</p><h2>Related AURA coverage</h2><ul>{relatedArticles.map(item=><li key={item.slug}><Link to={`/news/${item.slug}`}>{item.title}</Link></li>)}</ul></aside>}<aside className="aura-article-source"><p className="aura-ed-kicker">Sources</p><h2>{article.source}</h2><ExternalLink href={article.sourceUrl}>Read the primary source</ExternalLink>{article.sources?.length > 0 && <ul>{article.sources.map(source => <li key={source.url}><ExternalLink href={source.url}>{source.name}</ExternalLink></li>)}</ul>}</aside>{article.videoUrl && <Video item={{name:'Related coverage', description:'Video linked to this story.', url:article.videoUrl, youtubeId:article.youtubeId}} />}</article><NewsSection full /></Frame>;
}

export function CalendarPage() { return <Frame title="Fight Calendar" seo={{title:'Boxing Fight Calendar 2026 | Upcoming Fights & How to Watch',description:'Track major upcoming boxing fights, dates, venues, broadcasters and fight-week coverage with the AURA Fight Club boxing calendar.',canonicalPath:'/calendar'}}><FightCalendar /><AdSlot slot="calendar" /></Frame>; }
export function RankingsPage() { return <Frame title="Belt Rankings" seo={{title:'Boxing Rankings 2026 | WBA, WBC, IBF, WBO & Pound-for-Pound',description:'Explore boxing champions, contenders, sanctioning-body rankings and AURA Fight Club pound-for-pound coverage.',canonicalPath:'/rankings'}}><div className="aura-ed-page-title"><p className="aura-ed-kicker">The title picture</p><h1>Belt rankings.</h1><p>Compare champions and contenders across the WBA, WBC, IBF and WBO.</p></div><BeltRankings /><AdSlot slot="rankings" /></Frame>; }
export function FightPage() {
 const {id}=useParams();
 const fight=fights.find(f=>f.id===id);
 if(!fight)return <Frame title="Fight not found"><div className="aura-ed-page-title"><h1>Fight not found.</h1><Link to="/calendar">Browse confirmed events →</Link></div></Frame>;
 const names=fight.fighters||fight.name.split(/\\s+vs\\.?\\s+/i).slice(0,2);
 const profiles=names.map(n=>getFighterByName(n)).filter(Boolean);
 const crumbs=[{label:'Home',to:'/'},{label:'Fight calendar',to:'/calendar'},{label:fight.name,to:`/fights/${fight.id}`}];
 const eventSchema={'@context':'https://schema.org','@graph':[
  {'@type':'SportsEvent',name:fight.name,startDate:fight.date,eventStatus:fight.status==='Completed'?'https://schema.org/EventCompleted':'https://schema.org/EventScheduled',location:{'@type':'Place',name:fight.venue},competitor:profiles.map(p=>({'@type':'Person','@id':`${SITE_URL}/fighters/${p.slug}#person`,name:p.name,url:`${SITE_URL}/fighters/${p.slug}`})),description:fight.stakes,url:`${SITE_URL}/fights/${fight.id}`},
  breadcrumbSchema(crumbs)
 ]};
 return <Frame title={fight.name} seo={{title:`${fight.name} — Fight Night, Analysis, Undercard & Viewing | AURA`,description:`${fight.name}: ${fight.stakes}. Verified event dates, watch information, fighter stats, original technical breakdowns and fight-week updates.`,canonicalPath:`/fights/${fight.id}`,schema:eventSchema}}>
  <div className="afc-fi-crumbs"><Breadcrumbs items={crumbs}/></div>
  <FightDetailExperience key={fight.id} fight={fight}/>
 </Frame>;
}
