import {useState} from 'react';
import {Link} from 'react-router-dom';
import {PageSEO} from '../components/SEO.jsx';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import {useArticles} from '../hooks/useArticles.js';
import '../styles/fight-hub.css';

const filters=['All','Technique','Champions','Prospects'];
const collections={
 Technique:['shakur-stevenson-devin-haney-advanced-talks','current-boxing-champions-fighting-styles','dubois-wardley-rematch-technical-preview'],
 Champions:['boxing-belts-dont-tell-you-best-fighter','why-japan-keeps-producing-elite-boxers','osleys-iglesias-champion-profile'],
 Prospects:['moses-itauma-hype-job-what-next','who-is-the-future-of-boxing','filip-hrgovic-croatian-heavyweight-king-next']
};
export default function FilmRoom(){
 const [filter,setFilter]=useState('All');
 const {articles=[]}=useArticles();
 const selected=filter==='All'?Object.values(collections).flat():collections[filter];
 const items=[...new Set(selected)].map(slug=>articles.find(a=>a.slug===slug)).filter(Boolean);
 return <><PageSEO title="The Film Room | Boxing Tactical Analysis | AURA" description="Technical boxing analysis, styles, strengths and weaknesses of the world's best fighters." canonicalPath="/film-room"/><Header/><main className="fh-page"><header className="fh-intro"><p className="fh-kicker">AURA / The Film Room</p><h1>THE SCIENCE OF FIGHTING.</h1><p>Beyond the headlines. Breakdowns of the strategies, styles and skills that decide fights.</p></header><div className="fh-tabs fh-film-tabs">{filters.map(x=><button key={x} type="button" className={filter===x?'selected':''} onClick={()=>setFilter(x)}>{x}</button>)}</div><div className="fh-list">{items.map(article=><article key={article.slug} className="fh-event fh-film-card">{article.image?.src&&<Link to={`/news/${article.slug}`} className="fh-film-cover"><img loading="lazy" src={article.image.src} alt={article.image.alt||article.title} referrerPolicy="no-referrer" onError={e=>e.currentTarget.style.display='none'}/></Link>}<p className="fh-kicker">{article.category||'Boxing analysis'}</p><h2><Link to={`/news/${article.slug}`}>{article.title}</Link></h2><p>{article.summary}</p><Link to={`/news/${article.slug}`}>Read breakdown →</Link></article>)}</div>{!items.length&&<p>New technical features are being prepared.</p>}</main><Footer/></>;
}
