import { useState } from 'react';
import { Link } from 'react-router-dom';
import fightEdition from '../../public/news/fights.json';
import rankingEdition from '../../public/news/rankings.json';
import { useArticles } from '../hooks/useArticles.js';
import { ExternalLink } from './EditorialSections.jsx';
export const fights = fightEdition.fights;
export const todayCanary = () => new Intl.DateTimeFormat('en-CA', {timeZone:'Atlantic/Canary',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const dateLabel = date => new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
export function FightCalendar({ compact = false }) {
 const Heading=compact?'h2':'h1';
 const [view,setView]=useState('Upcoming'); const [division,setDivision]=useState('All divisions');
 const today=todayCanary();
 const shown=fights.filter(f=>(view==='Recent results'?f.status==='Completed':f.status!=='Completed'&&f.date>=today)&&(division==='All divisions'||f.division===division)).sort((a,b)=>view==='Recent results'?b.date.localeCompare(a.date):a.date.localeCompare(b.date));
 return <section className="aura-ed-section" aria-labelledby="calendar-title"><div className="aura-ed-section-head"><div><p className="aura-ed-kicker">Dates for the diary</p><Heading id="calendar-title">Fight calendar.</Heading></div>{compact&&<Link to="/calendar">Full calendar</Link>}</div>
 {!compact&&<div className="aura-desk-controls"><div className="aura-desk-tabs" aria-label="Calendar view">{['Upcoming','Recent results'].map(v=><button type="button" key={v} aria-pressed={view===v} onClick={()=>setView(v)}>{v}</button>)}</div><label>Weight class<select value={division} onChange={e=>setDivision(e.target.value)}><option>All divisions</option>{[...new Set(fights.map(f=>f.division))].sort().map(d=><option key={d}>{d}</option>)}</select></label></div>}
 <p className="aura-ed-note">Selected major fights · Dates checked {fightEdition.checkedAt}. Dates follow the venue’s local calendar; ring-walk times are not yet confirmed.</p>
 <div className="aura-fight-list">{(compact?shown.slice(0,3):shown).map(f=><article className="aura-fight-row" key={f.id}><time dateTime={f.date}>{dateLabel(f.date)}</time><div><p className="aura-ed-kicker">{f.division} · {f.status}</p><h3><Link to={`/fights/${f.id}`}>{f.name}</Link></h3><p>{f.venue}</p><p>{f.stakes}{f.broadcast&&` · ${f.broadcast}`}</p>{f.result&&<p className="aura-fight-result">{f.result}</p>}</div><div className="aura-fight-actions"><Link to={`/fights/${f.id}`}>Fight coverage</Link><ExternalLink href={f.sourceUrl}>Event source</ExternalLink></div></article>)}</div>{!shown.length&&<p role="status">No fights in this selection.</p>}
 </section>;
}
export function FightCoverage({ fight }) {
 const {articles}=useArticles(); const [stage,setStage]=useState('All');
 const related=articles.filter(a=>a.fightId===fight.id&&(stage==='All'||a.coverageStage===stage));
 return <section className="aura-ed-section"><div className="aura-ed-section-head"><h2>Follow the fight.</h2></div><div className="aura-desk-tabs" aria-label="Coverage stage">{['All','Build-up','Reaction'].map(s=><button type="button" key={s} aria-pressed={stage===s} onClick={()=>setStage(s)}>{s}</button>)}</div><div className="aura-coverage-list">{related.map(a=><article key={a.slug}><p className="aura-ed-kicker">{a.coverageStage} · {dateLabel(a.date)} · {a.articleType}</p><h3><Link to={`/news/${a.slug}`}>{a.title}</Link></h3><p>{a.summary}</p><Link to={`/news/${a.slug}`}>Read article</Link></article>)}</div>{!related.length&&<p className="aura-ed-note">{stage==='Reaction'&&fight.status!=='Completed'?'Post-fight coverage will appear after the bout.':'Coverage will appear here as it is published.'}</p>}</section>;
}
export function BeltRankings() {
 const [selected,setSelected]=useState(rankingEdition.divisions[0].id); const [org,setOrg]=useState('All belts');
 const d=rankingEdition.divisions.find(d=>d.id===selected);const organizations=Object.keys(rankingEdition.organizations).filter(o=>org==='All belts'||o===org);
 return <section className="aura-ed-section"><div className="aura-desk-controls"><label>Weight class<select value={selected} onChange={e=>setSelected(e.target.value)}>{rankingEdition.divisions.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label><label>Sanctioning body<select value={org} onChange={e=>setOrg(e.target.value)}><option>All belts</option>{Object.keys(rankingEdition.organizations).map(o=><option key={o}>{o}</option>)}</select></label></div>
 <p className="aura-ed-note">Men’s champions and top five contender positions · Checked {rankingEdition.checkedAt}. Lists have different publication dates and do not automatically change after a fight.</p>
 <div className="aura-rank-table-wrap" tabIndex="0" role="region" aria-label={`${d.name} belt rankings`}><table className="aura-rank-table"><caption>{d.name} — published belt rankings</caption><thead><tr><th scope="col">Position</th>{organizations.map(o=><th scope="col" key={o}>{o}<span>{rankingEdition.organizations[o].period}</span></th>)}</tr></thead><tbody><tr className="aura-rank-champion"><th scope="row">Champion</th>{organizations.map(o=><td key={o}>{d.champions[o]}</td>)}</tr><tr><th scope="row">Interim</th>{organizations.map(o=><td key={o}>{d.interim[o]||'—'}</td>)}</tr>{d.rows.map(r=><tr key={r.rank}><th scope="row">{r.rank}</th>{organizations.map(o=><td key={o}>{r[o]}</td>)}</tr>)}</tbody></table></div>
 <div className="aura-ranking-sources"><p>Contender lists compiled by <ExternalLink href={d.sourceUrl}>Box-Rank</ExternalLink>; WBA entries and champions cross-checked against the WBA’s September list. “Vacant” preserves an unfilled position.</p><p>Complete official lists:</p><div className="aura-life-links">{Object.entries(rankingEdition.organizations).map(([o,s])=><ExternalLink key={o} href={s.url}>{o} rankings</ExternalLink>)}</div></div>
 </section>;
}
