import { Link } from 'react-router-dom';
import { articles, videos, newsReviewedAt } from '../data/editorial.js';
import { homepageHeroMedia } from '../data/auraMediaManifest.js';
export function ExternalLink({ href, children, className = '' }) {
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}<span className="aura-external"> ↗</span></a>;
}
export function Video({ item }) {
  const validId = /^[a-zA-Z0-9_-]{11}$/.test(item.youtubeId || '');
  return <article className="aura-video-card">
    {validId && <iframe src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}`} title={item.name} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />}
    <span className="aura-ed-kicker">YouTube · Official channel</span><h3>{item.name}</h3><p>{item.description}</p><ExternalLink href={item.url}>Watch on YouTube</ExternalLink>
  </article>;
}
export function NewsSection({ full = false }) {
 return <section className="aura-ed-section" id="fight-news" aria-labelledby="fight-news-title">
   <div className="aura-ed-section-head"><div><p className="aura-ed-kicker">The fight desk</p><h2 id="fight-news-title">Fight news.</h2></div>{!full && <Link to="/news">All stories</Link>}</div>
   <p className="aura-ed-note">Curated reporting · Sources reviewed {newsReviewedAt}</p>
   <div className="aura-news-grid">{articles.map((article, i) => <article className={`aura-news-card ${i === 0 ? 'aura-news-card--lead' : ''}`} key={article.slug}>
      <p className="aura-ed-kicker">{article.category} · <time dateTime={article.date}>{new Date(article.date + 'T12:00:00Z').toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})}</time></p>
      <h3><Link to={`/news/${article.slug}`}>{article.title}</Link></h3><p>{article.summary}</p><div className="aura-news-links"><Link to={`/news/${article.slug}`}>Read story</Link><ExternalLink href={article.sourceUrl}>Original report</ExternalLink></div>
   </article>)}</div>
 </section>;
}
export function WatchSection() {
 return <section className="aura-ed-section" id="watch" aria-labelledby="watch-title"><div className="aura-ed-section-head"><div><p className="aura-ed-kicker">Inside fight week</p><h2 id="watch-title">Watch.</h2></div></div><div className="aura-watch-grid">{videos.map(item => <Video item={item} key={item.name} />)}</div></section>;
}
export function LifestyleSection() {
 return <section className="aura-ed-section aura-life" id="lifestyle" aria-labelledby="lifestyle-title"><div className="aura-life-image"><img src={homepageHeroMedia.source} alt="AURA boxing lifestyle campaign" loading="lazy" width="1122" height="1402" /></div><div className="aura-life-copy"><p className="aura-ed-kicker">AURA / Lifestyle</p><h2 id="lifestyle-title">Beyond<br />the bell.</h2><p>From the gym to the street. Apparel, footwear and accessories shaped by boxing culture.</p><div className="aura-life-links"><Link to="/apparel">Apparel</Link><Link to="/footwear">Footwear</Link><Link to="/equipment">Accessories</Link></div></div></section>;
}
