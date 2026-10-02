import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { NewsSection, WatchSection, LifestyleSection, ExternalLink, Video } from '../components/EditorialSections.jsx';
import { articles } from '../data/editorial.js';
import '../styles/aura-editorial.css';
function Frame({title, children}) {
 useEffect(() => { document.title = `${title} | AURA Fight Club`; window.scrollTo(0,0); }, [title]);
 return <><Header /><main className="aura-editorial aura-ed-page">{children}</main><Footer /></>;
}
export function NewsPage() { return <Frame title="Fight News"><div className="aura-ed-page-title"><p className="aura-ed-kicker">AURA / Boxing</p><h1>The fight desk.</h1><p>Fight announcements, fight-week coverage and the original reporting behind the headlines.</p></div><NewsSection full /></Frame>; }
export function WatchPage() { return <Frame title="Watch"><div className="aura-ed-page-title"><p className="aura-ed-kicker">AURA / Watch</p><h1>Closer to the fight.</h1><p>Interviews, press conferences and behind-the-scenes coverage from official boxing channels.</p></div><WatchSection /></Frame>; }
export function LifestylePage() { return <Frame title="Lifestyle"><LifestyleSection /></Frame>; }
export function ArticlePage() {
 const {slug} = useParams(); const article = articles.find(item => item.slug === slug);
 if (!article) return <Frame title="Story not found"><div className="aura-ed-page-title"><h1>Story not found.</h1><Link to="/news">Return to Fight News</Link></div></Frame>;
 return <Frame title={article.title}><article className="aura-article"><Link className="aura-ed-kicker" to="/news">Fight News</Link><p className="aura-ed-kicker">{article.category} · <time dateTime={article.date}>{article.date}</time></p><h1>{article.title}</h1><p className="aura-article-deck">{article.summary}</p><p className="aura-ed-note">AURA news brief · Based on reporting by {article.source}</p><div className="aura-article-body">{article.body.map(text => <p key={text}>{text}</p>)}</div><aside className="aura-article-source"><p className="aura-ed-kicker">Original reporting</p><h2>{article.source}</h2><ExternalLink href={article.sourceUrl}>Read the full source report</ExternalLink></aside><Video item={{name:'Fight-week coverage', description:'Visit the official channel for interviews and coverage.', url:article.videoUrl, youtubeId:article.youtubeId}} /></article><NewsSection full /></Frame>;
}
