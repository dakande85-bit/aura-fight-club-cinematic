import Header from './Header.jsx';
import Footer from './Footer.jsx';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { CalendarDays, Trophy, Play, Newspaper, ArrowRight, LockKeyhole, Crown } from 'lucide-react';
import { homepageHeroMedia } from '../data/auraMediaManifest.js';
import { useArticles } from '../hooks/useArticles.js';
import { fights, todayCanary } from './FightDesk.jsx';
import '../styles/aura-home-redesign.css';

const quickLinks = [
  { label: 'Fight News', text: 'Latest headlines, analysis and long reads', href: '/news', icon: Newspaper },
  { label: 'Fight Calendar', text: 'Upcoming cards, dates and results', href: '/calendar', icon: CalendarDays },
  { label: 'Rankings', text: 'Champions, contenders and pound-for-pound', href: '/rankings', icon: Trophy },
  { label: 'Watch', text: 'Interviews, highlights and analysis', href: '/watch', icon: Play },
];

export default function HomeStaticHero({ showHeader = true, headingLevel = 'h1' }) {
  const Heading = headingLevel;
  const { articles = [] } = useArticles();
  const featured = articles.slice(0, 12);
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

        <section className="afc-content-grid">
          <div className="afc-stories">
            <div className="afc-section-head">
              <div>
                <p className="afc-eyebrow">Fight desk</p>
                <h2>THE LATEST.</h2>
              </div>
              <Link to="/news">View all news <ArrowRight size={16} /></Link>
            </div>

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
          </div>

          <aside className="afc-next-fights">
            <div className="afc-section-head">
              <div>
                <p className="afc-eyebrow">On deck</p>
                <h2>NEXT FIGHTS.</h2>
              </div>
              <Link to="/calendar">Calendar <ArrowRight size={16} /></Link>
            </div>
            <div className="afc-fight-list">
              {upcoming.map(fight => (
                <Link className="afc-fight-row" to={`/fights/${fight.id}`} key={fight.id}>
                  <time dateTime={fight.date}>
                    <b>{new Date(fight.date + 'T12:00:00Z').toLocaleDateString('en-GB', { day: '2-digit' })}</b>
                    <span>{new Date(fight.date + 'T12:00:00Z').toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}</span>
                  </time>
                  <div>
                    <strong>{fight.name}</strong>
                    <span>{fight.venue}</span>
                  </div>
                  <ArrowRight size={16} />
                </Link>
              ))}
            </div>
          </aside>
        </section>

        <section className="afc-members-strip afc-members-strip--simple"><div><p className="afc-eyebrow">AURA Fight Club membership</p><h2>BEYOND THE HEADLINES.</h2><p>Be first to hear about new coverage and exclusive AURA concepts.</p></div><Link className="afc-text-link" to="/members">Explore membership <ArrowRight size={16}/></Link></section>

        <section className="afc-rankings-tease">
          <div>
            <p className="afc-eyebrow">Champions & rankings</p>
            <h2>WHO OWNS THE DIVISIONS?</h2>
            <p>Follow the champions, mandatory challengers and the pound-for-pound conversation in one place.</p>
          </div>
          <Link className="afc-btn afc-btn--ghost" to="/rankings">View full rankings <ArrowRight size={17} /></Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
