import {Link} from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import {PageSEO} from '../components/SEO.jsx';
import {useArticles} from '../hooks/useArticles.js';
import '../styles/fight-hub.css';

const questions=[
 {title:'Can Anthony Joshua rewrite his legacy against Tyson Fury?',slug:'anthony-joshua-redemption-fury-legacy'},
 {title:'Could Ben Whittaker handle an elite light-heavyweight?',slug:'whittaker-wallace-reaction-late-scare'},
 {title:'Does boxing need a new championship structure?',slug:'gassiev-wba-championship-fury-joshua-confusion'},
 {title:'Which fighting style rules boxing today?',slug:'current-boxing-champions-fighting-styles'}
];
export default function VerdictPage(){
 const {articles}=useArticles();
 return <><PageSEO title="The Verdict — Boxing Debates and Opinions | AURA Fight Club" description="Independent boxing debate, tactical questions and editorial verdicts from Aura Fight Club." canonicalPath="/verdict"/><Header/><main className="fh-page"><header className="fh-intro"><p className="fh-kicker">AURA / The Verdict</p><h1>THE QUESTIONS BOXING FANS ASK.</h1><p>Independent opinion, arguments and the stories behind boxing's biggest debates.</p></header><div className="fh-list">{questions.map(q=>{const article=articles.find(a=>a.slug===q.slug);return <article className="fh-event" key={q.slug}><p className="fh-kicker">AURA debate</p><h2>{q.title}</h2><p>{article?.summary||'Explore the arguments and analysis behind the question.'}</p><Link to={`/news/${q.slug}`}>Read the analysis →</Link></article>})}</div><p className="fh-disclaimer">Public polling and account-based votes will be introduced only when a persistent vote-counting service is available. No simulated voting totals are shown.</p></main><Footer/></>;
}
