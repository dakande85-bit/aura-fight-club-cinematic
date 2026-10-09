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
 const [section,setSection]=useState('All');
 const [visibleCount,setVisibleCount]=useState(12);
 const editorialSections = ['All','Breaking','The Fight Lab','Beyond the Ropes','Boxing Exposed','Future Kings','The Archives','Fight Culture'];
 const classify = (a) => {
   const text = [a.articleType,a.category,...(a.tags||[])].join(' ').toLowerCase();
   if (/history|historic|classic|legend|archive|retro/.test(text)) return 'The Archives';
   if (/lifestyle|fashion|culture|streetwear|music/.test(text)) return 'Fight Culture';
   if (/prospect|rising|future|next generation/.test(text)) return 'Future Kings';
   if (/business|politic|promot|controvers|judg|sanction|money/.test(text)) return 'Boxing Exposed';
   if (/profile|feature|interview|human|deep dive|untold/.test(text) && !/analysis|preview|tactic/.test(text)) return 'Beyond the Ropes';
   if (/analysis|preview|prediction|tactic|breakdown|fight lab/.test(text)) return 'The Fight Lab';
   return 'Breaking';
 };
 const selected=articles.filter(a=>(stage==='All stories'||a.coverageStage===stage)&&(section==='All'||classify(a)===section));
 const shown=full?selected.slice(0,visibleCount):selected.slice(0,6);
 const changeSection=(value)=>{setSection(value);setVisibleCount(12);};
 return <section className="aura-ed-section" id="fight-news" aria-labelledby="fight-news-title">
   <div className="aura-ed-section-head"><div><p className="aura-ed-kicker">The fight desk</p><h2 id="fight-news-title">Fight news.</h2></div>{!full && <Link to="/news">All stories</Link>}</div>
   {filters && <div className="aura-desk-tabs aura-editorial-channels" aria-label="Editorial sections">{editorialSections.map(s=><button type="button" key={s} aria-pressed={section===s} onClick={()=>changeSection(s)}>{s}</button>)}</div>}
   {filters && <div className="aura-desk-tabs" aria-label="Story coverage">{['All stories','Build-up','Reaction'].map(s=><button type="button" key={s} aria-pressed={stage===s} onClick={()=>setStage(s)}>{s}</button>)}</div>}
   <p className="aura-ed-note">Latest boxing coverage · Newest stories first · Updated {reviewedAt}</p>
   <div className="aura-news-grid">{shown.map((article, i) => <article className={`aura-news-card ${i === 0 ? 'aura-news-card--lead' : ''}`} key={article.slug}>
      <StoryImage article={article} linked /><p className="aura-ed-kicker"><strong>Published <time dateTime={article.date}>{new Date(article.date + 'T12:00:00Z').toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})}</time></strong> · {article.category} · {articleReadingMinutes(article.body)} min read</p>
      <h3><Link to={`/news/${article.slug}`}>{article.title}</Link></h3><p>{article.summary}</p><div className="aura-news-links">{article.fightId && <Link to={`/fights/${article.fightId}`}>{article.coverageStage || 'Fight coverage'}</Link>}<Link to={`/news/${article.slug}`}>Read story</Link><ExternalLink href={article.sourceUrl}>Original report</ExternalLink></div>
   </article>)}</div>
   {selected.length===0 && <p className="aura-ed-note" role="status">No published stories in this section yet. Explore another editorial section.</p>}
   {full && shown.length<selected.length && <div className="aura-news-more"><button type="button" className="aura-life-cta" onClick={()=>setVisibleCount(n=>n+12)}>Load more stories ({selected.length-shown.length} remaining)</button></div>}
 </section>;
}
export function WatchSection() {
 return <section className="aura-ed-section" id="watch" aria-labelledby="watch-title"><div className="aura-ed-section-head"><div><p className="aura-ed-kicker">Inside fight week</p><h2 id="watch-title">Watch.</h2></div></div><div className="aura-watch-grid">{videos.map(item => <Video item={item} key={item.name} />)}</div></section>;
}
export function LifestyleSection() {
 const lifestyle = [
   { src: '/assets/category-support/apparel-cream-jacket.webp', alt: 'AURA cream lifestyle jacket concept' },
   { src: '/assets/aura-live/campaign/campaign-trackjacket.webp', alt: 'AURA black performance jacket concept' },
   { src: '/assets/products/aura-cream-boxing-gloves/card-product.webp', alt: 'AURA cream boxing gloves concept' },
   { src: '/assets/aura-live/products/shorts.webp', alt: 'AURA black fight shorts concept' },
   { src: '/assets/category-support/footwear-cream-low.webp', alt: 'AURA cream and black low-top footwear concept' },
   { src: '/assets/category-support/footwear-black-high.webp', alt: 'AURA black high-top fight footwear concept' },
   { src: '/assets/category-support/footwear-cream-high.webp', alt: 'AURA cream high-top footwear concept' },
   { src: '/assets/aura-live/products/gloves-cream.webp', alt: 'AURA cream fight glove concept' },
   { src: '/assets/category-support/equipment-gloves-grip.webp', alt: 'AURA training glove concept' }
 ];
 return <section className="aura-ed-section aura-life aura-life--lookbook" id="lifestyle" aria-labelledby="lifestyle-title">
   <header className="aura-life-intro">
     <p className="aura-ed-kicker">AURA / Lifestyle</p>
     <h1 id="lifestyle-title">Lifestyle.</h1>
     <p className="aura-life-lead">AURA Fight Club is built for disciplined training, quiet confidence, and everyday combat lifestyle.</p>
     <p>A growing design language across apparel, fight gear, travel pieces and footwear — concepts shaped by the gym, built to live beyond it.</p>
   </header>
   <div className="aura-life-grid">
     {lifestyle.map((item, index) => <figure className={`aura-life-tile aura-life-tile--${index + 1}`} key={item.src}>
       <img src={item.src} alt={item.alt} loading={index < 2 ? 'eager' : 'lazy'} decoding="async" />
     </figure>)}
   </div>
   <aside className="aura-life-private">
     <p className="aura-ed-kicker">Private access</p>
     <h2>Join the Fight Club.</h2>
     <p>Get first access to exclusive designs, limited concepts, private drops and what AURA is building next.</p>
     <Link to="/members" className="aura-life-cta">Join the Fight Club</Link>
   </aside>
 </section>;
}
