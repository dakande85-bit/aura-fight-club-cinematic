import Header from './Header.jsx';
import Footer from './Footer.jsx';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CalendarDays, Trophy, Play, Newspaper, ArrowRight, LockKeyhole, Crown } from 'lucide-react';
import { homepageHeroMedia } from '../data/auraMediaManifest.js';
import { useArticles } from '../hooks/useArticles.js';
import { fights, todayCanary } from './FightDesk.jsx';
import '../styles/aura-home-redesign.css';
import {VerifiedPhoto} from './VerifiedPhoto.jsx';

const quickLinks = [
  { label: 'Fight News', text: 'Latest headlines, analysis and long reads', href: '/news', icon: Newspaper },
  { label: 'Fight Calendar', text: 'Upcoming cards, dates and results', href: '/calendar', icon: CalendarDays },
  { label: 'Rankings', text: 'Champions, contenders and pound-for-pound', href: '/rankings', icon: Trophy },
  { label: 'Watch', text: 'Interviews, highlights and analysis', href: '/watch', icon: Play },
];

export default function HomeStaticHero({ showHeader = true, headingLevel = 'h1' }) {
  const Heading = headingLevel;
  const { articles = [] } = useArticles();
  const [visibleCount,setVisibleCount]=useState(12);
  const [newsFilter,setNewsFilter]=useState('All');
  const categories=['All',...new Set(articles.map(x=>x.category).filter(Boolean))];
  const filteredArticles=newsFilter==='All'?articles:articles.filter(a=>a.category===newsFilter);
  const featured = filteredArticles.slice(0, visibleCount);
  const today = todayCanary();
  const upcoming = fights
    .filter(fight => fight.status !== 'Completed' && fight.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  useEffect(() => {
    document.title = 'AURA Fight Club | Boxing News, Analysis & Culture';
  }, []);

  return (
    <div className="afc-home-shell">
      {showHeader && <Header />}

      <main className="afc-home">
        <section className="afc-news-intro">
          <p className="afc-eyebrow">AURA / FIGHT DESK</p>
          <Heading>LATEST BOXING NEWS.</Heading>
          <p>Original analysis, champion profiles and the stories shaping boxing. Latest publications first.</p>
        </section>

        <section className="afc-fight-week"><div><p className="afc-eyebrow">AURA / FIGHT NIGHT</p><h2>KNOW BEFORE THE BELL.</h2><p>The biggest upcoming bouts, verified viewing information, fighter records and event coverage in one place.</p><Link to="/fight-hub">Explore Fight Night →</Link></div>{upcoming[0]&&<Link className="afc-next-fight" to={`/fights/${upcoming[0].id}`}><VerifiedPhoto fightId={upcoming[0].id} label={upcoming[0].name}/><span>UP NEXT · {upcoming[0].date}</span><strong>{upcoming[0].name}</strong><small>{upcoming[0].broadcastStatus==='confirmed'?upcoming[0].broadcast:'Broadcaster not confirmed'} · Fight details →</small></Link>}</section>
        <nav className="afc-discover-links" aria-label="Explore Aura boxing"><Link to="/fighters">FIGHTER INTELLIGENCE ↗</Link><Link to="/rankings">WORLD CHAMPIONS ↗</Link><Link to="/film-room">THE FILM ROOM ↗</Link><Link to="/verdict">THE VERDICT ↗</Link></nav>
        <section className="afc-content-grid">
          <div className="afc-stories">
            <div className="afc-section-head">
              <div>
                <p className="afc-eyebrow">Fight desk</p>
                <h2>THE LATEST.</h2>
              </div>
              <Link to="/news">View all news <ArrowRight size={16} /></Link>
            </div>

            <div className="afc-news-filters" aria-label="Filter boxing news">{categories.slice(0,9).map(category=><button type="button" key={category} aria-pressed={newsFilter===category} onClick={()=>{setNewsFilter(category);setVisibleCount(12)}}>{category}</button>)}</div>
            <div className="afc-story-grid">
              {featured.map((article, index) => (
                <article className="afc-story-card" key={article.slug}>
                  <Link to={`/news/${article.slug}`} className="afc-story-card__media">
                    {article.image?.src ? (
                      <img src={article.image.src} alt={article.image.alt || article.title} loading={index === 0 ? 'eager' : 'lazy'} referrerPolicy="no-referrer" />
                    ) : (
                      <div className="afc-story-card__fallback">AURA</div>
                    )}
                  </Link>
                  <div className="afc-story-card__body">
                    <p className="afc-eyebrow"><time dateTime={article.date}>{new Date(article.date + 'T12:00:00Z').toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})}</time> · {article.category || 'Feature'}</p>
                    <h3><Link to={`/news/${article.slug}`}>{article.title}</Link></h3>
                    <p>{article.summary}</p>
                  </div>
                </article>
              ))}
            </div>
            {visibleCount < filteredArticles.length && <button type="button" className="afc-load-more" onClick={()=>setVisibleCount(n=>n+12)}>Load more articles ({filteredArticles.length-visibleCount} remaining)</button>}
          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
}
