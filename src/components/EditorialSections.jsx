import { useState } from 'react';
import { Link } from 'react-router-dom';
import { articleReadingMinutes } from './ArticleBody.jsx';
import { videos } from '../data/editorial.js';
import { useArticles } from '../hooks/useArticles.js';
export function ExternalLink({ href, children, className = '' }) {
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}<span className="aura-external"> ↗</span></a>;
}
export function StoryImage({ article, linked = false, eager = false }) {
  const [failed, setFailed] = useState(false);
  const fallback = {
    src: '/assets/aura-live/hero/hero-fighter-stance.png',
    alt: 'AURA Fight Club boxing editorial image',
    credit: 'AURA Fight Club'
  };
  const hasSource = Boolean(article.image?.src);
  const image = hasSource && !failed ? article.image : fallback;
  const photo = <img src={image.src} alt={image.alt || fallback.alt} loading={eager ? 'eager' : 'lazy'} decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />;
  return <figure className="aura-story-image">
    {linked ? <Link to={`/news/${article.slug}`} aria-label={`Read: ${article.title}`}>{photo}</Link> : photo}
    <figcaption>
      {hasSource && !failed
        ? <>{article.image.caption && <span>{article.image.caption} </span>}<ExternalLink href={article.image.sourceUrl || article.sourceUrl}>Credit: {article.image.credit}</ExternalLink></>
        : <span>Editorial image · Credit: AURA Fight Club</span>}
    </figcaption>
  </figure>;
}
export function Video({ item }) {
  const validId = /^[a-zA-Z0-9_-]{11}$/.test(item.youtubeId || '');
  return <article className="aura-video-card">
    {validId && <iframe src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}`} title={item.name} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />}
    <span className="aura-ed-kicker">YouTube · Official channel</span><h3>{item.name}</h3><p>{item.description}</p><ExternalLink href={item.url}>Watch on YouTube</ExternalLink>
  </article>;
}
export function NewsSection({ full = false, filters = false }) {
 const {articles,reviewedAt}=useArticles();
 const [stage,setStage]=useState('All stories');
 const selected=articles.filter(a=>stage==='All stories'||a.coverageStage===stage);
 const shown=full?selected:selected.filter(a=>a.featured).slice(0,6);
 return <section className="aura-ed-section" id="fight-news" aria-labelledby="fight-news-title">
   <div className="aura-ed-section-head"><div><p className="aura-ed-kicker">The fight desk</p><h2 id="fight-news-title">Fight news.</h2></div>{!full && <Link to="/news">All stories</Link>}</div>
   {filters && <div className="aura-desk-tabs" aria-label="Story coverage">{['All stories','Build-up','Reaction'].map(s=><button type="button" key={s} aria-pressed={stage===s} onClick={()=>setStage(s)}>{s}</button>)}</div>}
   <p className="aura-ed-note">Curated reporting · Research edition {reviewedAt} · Featured stories selected by AURA</p>
   <div className="aura-news-grid">{shown.map((article, i) => <article className={`aura-news-card ${i === 0 ? 'aura-news-card--lead' : ''}`} key={article.slug}>
      <StoryImage article={article} linked /><p className="aura-ed-kicker">{article.category} · <time dateTime={article.date}>{new Date(article.date + 'T12:00:00Z').toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})}</time> · {articleReadingMinutes(article.body)} min read</p>
      <h3><Link to={`/news/${article.slug}`}>{article.title}</Link></h3><p>{article.summary}</p><div className="aura-news-links">{article.fightId && <Link to={`/fights/${article.fightId}`}>{article.coverageStage || 'Fight coverage'}</Link>}<Link to={`/news/${article.slug}`}>Read story</Link><ExternalLink href={article.sourceUrl}>Original report</ExternalLink></div>
   </article>)}</div>
 </section>;
}
export function WatchSection() {
 return <section className="aura-ed-section" id="watch" aria-labelledby="watch-title"><div className="aura-ed-section-head"><div><p className="aura-ed-kicker">Inside fight week</p><h2 id="watch-title">Watch.</h2></div></div><div className="aura-watch-grid">{videos.map(item => <Video item={item} key={item.name} />)}</div></section>;
}
export function LifestyleSection() {
 const [imageFailed, setImageFailed] = useState(false);
 return <section className="aura-ed-section aura-life" id="lifestyle" aria-labelledby="lifestyle-title">
   <div className="aura-life-image">{!imageFailed && <img src="/assets/category-support/footwear-cream-high.webp" alt="AURA cream high-top footwear concept with black trim" loading="lazy" decoding="async" width="1254" height="1254" onError={() => setImageFailed(true)} />}</div>
   <div className="aura-life-copy"><p className="aura-ed-kicker">AURA / Lifestyle</p><h2 id="lifestyle-title">Footwear.</h2><p>Boxing-inspired footwear concepts for movement and everyday style.</p><div className="aura-life-links"><Link to="/footwear">Explore footwear</Link></div></div>
 </section>;
}
