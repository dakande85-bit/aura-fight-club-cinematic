import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { NewsSection, WatchSection, LifestyleSection, ExternalLink, Video, StoryImage } from '../components/EditorialSections.jsx';
import ArticleBody, { articleReadingMinutes } from '../components/ArticleBody.jsx';
import { useArticles } from '../hooks/useArticles.js';
import '../styles/aura-editorial.css';
import { FightCalendar, BeltRankings, FightCoverage, fights } from '../components/FightDesk.jsx';
import { AdSlot, AffiliateLink, AffiliateDisclosure, GearCommerce, HowToWatch } from '../components/Monetization.jsx';
import { PageSEO, SITE_URL } from '../components/SEO.jsx';
import Breadcrumbs, { breadcrumbSchema } from '../components/Breadcrumbs.jsx';
import { fighters, author, getFighterByName } from '../data/seoEntities.js';
function Frame({title, children, seo}) {
 useEffect(() => { document.title = `${title} | AURA Fight Club`; window.scrollTo(0,0); }, [title]);
 return <><PageSEO title={seo?.title || `${title} | AURA Fight Club`} description={seo?.description || 'Boxing news, analysis and fight culture from AURA Fight Club.'} canonicalPath={seo?.canonicalPath} image={seo?.image} type={seo?.type} schema={seo?.schema} /><Header /><main className="aura-editorial aura-ed-page">{children}</main><Footer /></>;
}
export function NewsPage() { return <Frame title="Fight News" seo={{title:'Boxing News & Fight Analysis | AURA Fight Club',description:'Latest boxing news, in-depth fight analysis, predictions, features and original opinion from the AURA Fight Club fight desk.',canonicalPath:'/news'}}><section className="aura-news-hero" aria-labelledby="fight-desk-title"><div className="aura-news-hero__media" aria-hidden="true"><img src="/assets/fight-club/aura-app-coming-soon.webp" alt="" /></div><div className="aura-news-hero__shade" aria-hidden="true" /><div className="aura-news-hero__content"><p className="aura-ed-kicker">AURA / Boxing · The newsroom</p><h1 id="fight-desk-title">The fight<br/>desk.</h1><p>In-depth boxing features, tactical previews, breaking stories and opinion — with the reporting, context and fight intelligence behind every headline.</p><div className="aura-news-hero__rule"><span>News</span><span>Analysis</span><span>Predictions</span><span>Features</span></div></div></section><NewsSection full filters /></Frame>; }
export function WatchPage() { return <Frame title="Watch"><div className="aura-ed-page-title"><p className="aura-ed-kicker">AURA / Watch</p><h1>Closer to the fight.</h1><p>Interviews, press conferences and behind-the-scenes coverage from official boxing channels.</p><div className="aura-home-actions"><AffiliateLink partnerKey="dazn" placement="watch-page">Subscribe / watch on DAZN</AffiliateLink></div><AffiliateDisclosure /></div><WatchSection /><GearCommerce /></Frame>; }
export function LifestylePage() { return <Frame title="Lifestyle"><LifestyleSection /></Frame>; }
export function ArticlePage() {
 const {slug} = useParams(); const {articles,loading}=useArticles(); const article = articles.find(item => item.slug === slug);
 if(!article && loading) return <Frame title="Loading story"><p className="aura-ed-page-title" role="status">Loading story…</p></Frame>;
 if (!article) return <Frame title="Story not found"><div className="aura-ed-page-title"><h1>Story not found.</h1><Link to="/news">Return to Fight News</Link></div></Frame>;
 const articleImage = article.image?.src || undefined;
 const articleUrl = `${SITE_URL}/news/${article.slug}`;
 const relatedFighters=fighters.filter(f=>f.aliases.some(alias=>(article.title+' '+article.summary+' '+(article.body||[]).join(' ')).toLowerCase().includes(alias.toLowerCase()))).slice(0,6);
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
 return <Frame title={article.title} seo={{title:`${article.title} | AURA Fight Club`,description:article.summary,canonicalPath:`/news/${article.slug}`,image:articleImage,type:'article',schema:articleSchema}}><article className="aura-article"><Breadcrumbs items={crumbs}/><p className="aura-ed-kicker">{article.category} · <time dateTime={article.date}>{article.date}</time></p><h1>{article.title}</h1><p className="aura-article-deck">{article.summary}</p><p className="aura-ed-note">By <Link to={`/authors/${author.slug}`}>{author.name}</Link> · Published <time dateTime={article.date}>{article.date}</time>{article.updatedAt && article.updatedAt!==article.date ? <> · Updated <time dateTime={article.updatedAt}>{article.updatedAt}</time></> : null} · {articleReadingMinutes(article.body)} min read</p>{relatedFighters.length>0&&<div className="aura-life-links" aria-label="Fighters in this story">{relatedFighters.map(f=><Link key={f.slug} to={`/fighters/${f.slug}`}>{f.name}</Link>)}</div>}<StoryImage key={article.slug} article={article} eager /><AdSlot slot="article-top" /><ArticleBody body={article.body} monetized /><AdSlot slot="article-bottom" /><aside className="aura-article-source"><p className="aura-ed-kicker">Sources</p><h2>{article.source}</h2><ExternalLink href={article.sourceUrl}>Read the primary source</ExternalLink>{article.sources?.length > 0 && <ul>{article.sources.map(source => <li key={source.url}><ExternalLink href={source.url}>{source.name}</ExternalLink></li>)}</ul>}</aside>{article.videoUrl && <Video item={{name:'Related coverage', description:'Video linked to this story.', url:article.videoUrl, youtubeId:article.youtubeId}} />}</article><NewsSection full /></Frame>;
}

export function CalendarPage() { return <Frame title="Fight Calendar" seo={{title:'Boxing Fight Calendar 2026 | Upcoming Fights & How to Watch',description:'Track major upcoming boxing fights, dates, venues, broadcasters and fight-week coverage with the AURA Fight Club boxing calendar.',canonicalPath:'/calendar'}}><FightCalendar /><AdSlot slot="calendar" /></Frame>; }
export function RankingsPage() { return <Frame title="Belt Rankings" seo={{title:'Boxing Rankings 2026 | WBA, WBC, IBF, WBO & Pound-for-Pound',description:'Explore boxing champions, contenders, sanctioning-body rankings and AURA Fight Club pound-for-pound coverage.',canonicalPath:'/rankings'}}><div className="aura-ed-page-title"><p className="aura-ed-kicker">The title picture</p><h1>Belt rankings.</h1><p>Compare champions and contenders across the WBA, WBC, IBF and WBO.</p></div><BeltRankings /><AdSlot slot="rankings" /></Frame>; }
export function FightPage() {
 const {id}=useParams(); const fight=fights.find(f=>f.id===id);
 if(!fight) return <Frame title="Fight not found"><div className="aura-ed-page-title"><h1>Fight not found.</h1><Link to="/calendar">View fight calendar</Link></div></Frame>;
 const names=fight.fighters?.length===2?fight.fighters:fight.name.split(/\s+vs\.?\s+/i).slice(0,2);
 const participantProfiles=names.map(name=>getFighterByName(name)).filter(Boolean);
 const crumbs=[{label:'Home',to:'/'},{label:'Fight Calendar',to:'/calendar'},{label:fight.name,to:`/fights/${fight.id}`}];
 const eventSchema={'@context':'https://schema.org','@graph':[
  {'@type':'SportsEvent',name:fight.name,startDate:fight.date,eventStatus:fight.status==='Completed'?'https://schema.org/EventCompleted':'https://schema.org/EventScheduled',location:{'@type':'Place',name:fight.venue},competitor:participantProfiles.map(p=>({'@type':'Person','@id':`${SITE_URL}/fighters/${p.slug}#person`,name:p.name,url:`${SITE_URL}/fighters/${p.slug}`})),description:fight.stakes,url:`${SITE_URL}/fights/${fight.id}`},
  breadcrumbSchema(crumbs)
 ]};
 return <Frame title={fight.name} seo={{title:`${fight.name} — Date, Venue, How to Watch & Coverage | AURA Fight Club`,description:`${fight.name}: ${fight.stakes}. Date, venue, broadcaster and AURA Fight Club coverage.`,canonicalPath:`/fights/${fight.id}`,schema:eventSchema}}><Breadcrumbs items={crumbs}/><div className="aura-ed-page-title"><p className="aura-ed-kicker">{fight.division} · {fight.status}</p><h1>{fight.name}</h1>{participantProfiles.length>0&&<div className="aura-life-links">{participantProfiles.map(p=><Link key={p.slug} to={`/fighters/${p.slug}`}>{p.name} profile</Link>)}</div>}<p><time dateTime={fight.date}>{new Date(fight.date+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</time> · {fight.venue}</p><p>{fight.stakes}{fight.broadcast&&` · ${fight.broadcast}`}</p>{fight.result&&<p className="aura-fight-result">{fight.result}</p>}<ExternalLink href={fight.sourceUrl}>Event source</ExternalLink></div><HowToWatch fight={fight} /><AdSlot slot="fight-page" /><FightCoverage fight={fight} /><GearCommerce /></Frame>;
}
