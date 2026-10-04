import Header from './Header.jsx';
import Footer from './Footer.jsx';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { NewsSection, WatchSection, LifestyleSection } from './EditorialSections.jsx';
import { homepageHeroMedia } from '../data/auraMediaManifest.js';
import '../styles/aura-editorial.css';
import { FightCalendar } from './FightDesk.jsx';
export default function HomeStaticHero({ showHeader = true, headingLevel = 'h1' }) {
 const full = showHeader && headingLevel === 'h1'; const Heading = headingLevel;
 useEffect(() => { if(full) document.title = 'AURA Fight Club | Boxing News, Video & Lifestyle'; },[full]);
 return <>{showHeader && <Header />}<main className="aura-editorial"><section className="aura-home-intro"><div><p className="aura-ed-kicker">AURA Fight Club / Boxing culture</p><Heading>THE FIGHT.<br />THE LIFE.</Heading><p>Boxing news, voices from fight week, and the style that lives beyond the ring.</p><div className="aura-home-actions"><Link to="/news">Fight News</Link><Link to="/calendar">Fight Calendar</Link></div></div><img src={homepageHeroMedia.source} alt="AURA boxing lifestyle campaign" width="1122" height="1402" fetchPriority="high" /></section>{full && <><NewsSection /><FightCalendar compact /><WatchSection /><LifestyleSection /></>}</main>{full && <Footer />}</>;
}
