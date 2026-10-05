import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { useEffect } from 'react';
import '../styles/aura-editorial.css';
import '../styles/aura-monetization.css';
export default function Advertise(){
 useEffect(()=>{document.title='Advertise | AURA Fight Club';window.scrollTo(0,0);},[]);
 return <><Header/><main className="aura-editorial aura-ed-page"><section className="aura-advertise"><p className="aura-ed-kicker">AURA / Commercial</p><h1>Reach boxing fans.</h1><p>AURA Fight Club offers premium commercial placements around fight news, fight-week coverage, rankings, the fight calendar, lifestyle and training content.</p><div className="aura-advertise-grid">
 <article className="aura-advertise-card"><h3>Fight Night</h3><p>Own the commercial layer around one major bout: preview, build-up, how-to-watch, reaction and fight-page placement.</p></article>
 <article className="aura-advertise-card"><h3>Rankings / Calendar</h3><p>Long-running sponsorship around two high-intent utilities boxing fans return to throughout the season.</p></article>
 <article className="aura-advertise-card"><h3>Editorial / Lifestyle</h3><p>Clearly labelled branded content, equipment, training and lifestyle partnerships without compromising editorial independence.</p></article>
 </div><h2>Available inventory.</h2><p>Homepage and article placements, fight-page sponsorship, streaming and ticket CTAs, newsletter and video sponsorship, rankings and calendar partners, branded editorial and product partnerships.</p><h2>Commercial principles.</h2><p>Sponsored content is labelled. Affiliate relationships are disclosed. Advertisers do not determine AURA's editorial conclusions or rankings coverage.</p><a className="aura-advertise-cta" href="mailto:hello@aurafightclub.com?subject=AURA%20Fight%20Club%20advertising">Request media kit</a></section></main><Footer/></>;
}
