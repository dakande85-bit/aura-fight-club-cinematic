import {Link} from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import {PageSEO} from '../components/SEO.jsx';
import {useArticles} from '../hooks/useArticles.js';
import {StoryImage} from '../components/EditorialSections.jsx';
import '../styles/fight-hub.css';
import '../styles/aura-editorial.css';
export default function FilmRoom(){
 const {articles=[]}=useArticles();
 const items=articles.filter(a=>/analysis|prediction|technique|preview|styles|fight lab|deep dive/i.test([a.articleType,a.category,a.title,...(a.tags||[])].join(' '))).slice(0,24);
 return <><PageSEO title="Fight Analysis — Tactics and Boxing Technique | AURA" description="Boxing technique, fighter style breakdowns and original fight analysis." canonicalPath="/film-room"/><Header/>
 <main className="fh-page aura-analysis-page">
 <header className="fh-intro"><p className="fh-kicker">AURA / FIGHT ANALYSIS</p><h1>BEHIND THE ROUNDS.</h1><p>How elite fighters create openings, exploit weaknesses and win exchanges. Read the full tactical breakdowns, with original video analysis added as it is produced.</p><Link className="aura-analysis-cta" to="/fighters/compare">Compare fighter profiles →</Link></header>
 <section className="aura-analysis-grid" aria-label="Boxing analysis stories">{items.map(a=><article key={a.slug} className="aura-analysis-card"><StoryImage article={a} linked/><p className="fh-kicker">{a.category} · {a.date}</p><h2><Link to={`/news/${a.slug}`}>{a.title}</Link></h2><p>{a.summary}</p><Link to={`/news/${a.slug}`}>Read analysis →</Link></article>)}</section>
 {!items.length&&<p>New tactical analysis is being prepared.</p>}
 </main><Footer/></>;
}
