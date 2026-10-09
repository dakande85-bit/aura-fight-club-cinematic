import {Link} from 'react-router-dom';
import {useState} from 'react';
import edition from '../../public/news/fights.json';
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
 const [picks,setPicks]=useState(()=>{try{return JSON.parse(localStorage.getItem('aura-predictions')||'{}')}catch{return {}}});
 const selectPick=(id,name)=>setPicks(current=>{const next={...current,[id]:name};try{localStorage.setItem('aura-predictions',JSON.stringify(next))}catch{}return next});
 return <><PageSEO title="The Verdict — Boxing Debates and Opinions | AURA Fight Club" description="Independent boxing debate, tactical questions and editorial verdicts from Aura Fight Club." canonicalPath="/verdict"/><Header/><main className="fh-page"><header className="fh-intro"><p className="fh-kicker">AURA / The Verdict</p><h1>THE QUESTIONS BOXING FANS ASK.</h1><p>Independent opinion, arguments and the stories behind boxing's biggest debates.</p></header><section className="fh-predictions"><h2>WHO WINS?</h2><p>Make your predictions for upcoming fights. Picks are saved on this device only; no fabricated community totals.</p><div className="fh-prediction-grid">{edition.fights.filter(f=>f.status!=="Completed"&&f.date>=new Date().toISOString().slice(0,10)).slice(0,6).map(f=><article key={f.id}><p>{f.date} · {f.division}</p><h3><Link to={`/fights/${f.id}`}>{f.name}</Link></h3><div className="fh-pick-options">{f.fighters.map(name=><button type="button" key={name} aria-pressed={picks[f.id]===name} onClick={()=>selectPick(f.id,name)}>{name}</button>)}</div>{picks[f.id]&&<small>Your prediction: {picks[f.id]}</small>}</article>)}</div></section><div className="fh-list">{questions.map(q=>{const article=articles.find(a=>a.slug===q.slug);return <article className="fh-event" key={q.slug}><p className="fh-kicker">AURA debate</p><h2>{q.title}</h2><p>{article?.summary||'Explore the arguments and analysis behind the question.'}</p><Link to={`/news/${q.slug}`}>Read the analysis →</Link></article>})}</div><p className="fh-disclaimer">Predictions currently remain on the reader's device. Shared vote percentages and leaderboards require a moderated server-side voting system.</p></main><Footer/></>;
}
