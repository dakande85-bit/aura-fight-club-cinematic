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
function Frame({title, children}) {
 useEffect(() => { document.title = `${title} | AURA Fight Club`; window.scrollTo(0,0); }, [title]);
 return <><Header /><main className="aura-editorial aura-ed-page">{children}</main><Footer /></>;
}
export function NewsPage() { return <Frame title="Fight News"><div className="aura-ed-page-title"><p className="aura-ed-kicker">AURA / Boxing</p><h1>The fight desk.</h1><p>In-depth boxing features, tactical previews and opinion, with the reporting behind every story.</p></div><NewsSection full filters /></Frame>; }
export function WatchPage() { return <Frame title="Watch"><div className="aura-ed-page-title"><p className="aura-ed-kicker">AURA / Watch</p><h1>Closer to the fight.</h1><p>Interviews, press conferences and behind-the-scenes coverage from official boxing channels.</p><div className="aura-home-actions"><AffiliateLink partnerKey="dazn" placement="watch-page">Subscribe / watch on DAZN</AffiliateLink></div><AffiliateDisclosure /></div><WatchSection /><GearCommerce /></Frame>; }
export function LifestylePage() { return <Frame title="Lifestyle"><LifestyleSection /></Frame>; }
export function ArticlePage() {
 const {slug} = useParams(); const {articles,loading}=useArticles(); const article = articles.find(item => item.slug === slug);
 if(!article && loading) return <Frame title="Loading story"><p className="aura-ed-page-title" role="status">Loading story…</p></Frame>;
 if (!article) return <Frame title="Story not found"><div className="aura-ed-page-title"><h1>Story not found.</h1><Link to="/news">Return to Fight News</Link></div></Frame>;
 return <Frame title={article.title}><article className="aura-article"><Link className="aura-ed-kicker" to="/news">Fight News</Link><p className="aura-ed-kicker">{article.category} · <time dateTime={article.date}>{article.date}</time></p><h1>{article.title}</h1><p className="aura-article-deck">{article.summary}</p><p className="aura-ed-note">AURA {article.articleType === 'Opinion' ? 'opinion' : article.articleType === 'Analysis' ? 'analysis' : 'news brief'} · Sources checked {article.date} · {articleReadingMinutes(article.body)} min read</p><StoryImage key={article.slug} article={article} eager /><AdSlot slot="article-top" /><ArticleBody body={article.body} monetized /><AdSlot slot="article-bottom" /><aside className="aura-article-source"><p className="aura-ed-kicker">Original reporting</p><h2>{article.source}</h2><ExternalLink href={article.sourceUrl}>Read the full source report</ExternalLink>{article.sources?.length > 0 && <ul>{article.sources.map(source => <li key={source.url}><ExternalLink href={source.url}>{source.name}</ExternalLink></li>)}</ul>}</aside>{article.videoUrl && <Video item={{name:'Related coverage', description:'Video linked to this story.', url:article.videoUrl, youtubeId:article.youtubeId}} />}</article><NewsSection full /></Frame>;
}

export function CalendarPage() { return <Frame title="Fight Calendar"><FightCalendar /></Frame>; }
export function RankingsPage() { return <Frame title="Belt Rankings"><div className="aura-ed-page-title"><p className="aura-ed-kicker">The title picture</p><h1>Belt rankings.</h1><p>Compare champions and contenders across the WBA, WBC, IBF and WBO.</p></div><BeltRankings /></Frame>; }
export function FightPage() {
 const {id}=useParams(); const fight=fights.find(f=>f.id===id);
 if(!fight) return <Frame title="Fight not found"><div className="aura-ed-page-title"><h1>Fight not found.</h1><Link to="/calendar">View fight calendar</Link></div></Frame>;
 return <Frame title={fight.name}><div className="aura-ed-page-title"><Link className="aura-ed-kicker" to="/calendar">Fight calendar</Link><p className="aura-ed-kicker">{fight.division} · {fight.status}</p><h1>{fight.name}</h1><p><time dateTime={fight.date}>{new Date(fight.date+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</time> · {fight.venue}</p><p>{fight.stakes}{fight.broadcast&&` · ${fight.broadcast}`}</p>{fight.result&&<p className="aura-fight-result">{fight.result}</p>}<ExternalLink href={fight.sourceUrl}>Event source</ExternalLink></div><HowToWatch fight={fight} /><AdSlot slot="fight-page" /><FightCoverage fight={fight} /><GearCommerce /></Frame>;
}
