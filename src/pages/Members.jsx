import {Link} from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import {PageSEO} from '../components/SEO.jsx';
import {LifestyleSection} from '../components/EditorialSections.jsx';
import '../styles/aura-editorial.css';
import '../styles/aura-home-redesign.css';
export default function MembersPage(){
 return <div className="afc-home-shell"><PageSEO title="The Club — AURA Boxing Culture, Lifestyle & Designs" canonicalPath="/members" description="Boxing culture, gloves, fightwear and independent AURA design concepts."/><Header/>
 <main className="aura-editorial aura-ed-page aura-culture-page">
 <header className="aura-club-header"><p className="aura-ed-kicker">AURA / FIGHT CULTURE</p><h1>THE CLUB<span>.</span></h1><p>Inside and beyond the ropes. The gloves we train in, the kit we live in, and the designs we're building around boxing culture.</p><div><Link to="/news">Read fight news ↗</Link><a href="mailto:hello@aurafightclub.com?subject=AURA%20Fight%20Club%20designs">Enquire about AURA designs ↗</a></div></header>
 <LifestyleSection/>
 </main><Footer/></div>;
}
