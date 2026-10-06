import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import fightEdition from '../../public/news/fights.json';
import rankingEdition from '../../public/news/rankings.json';
import { useArticles } from '../hooks/useArticles.js';
import { ExternalLink } from './EditorialSections.jsx';
export const fights = fightEdition.fights;
export const todayCanary = () => new Intl.DateTimeFormat('en-CA', {timeZone:'Atlantic/Canary',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());

const ringPoundForPound = [
 { rank: 1, name: 'Naoya Inoue', record: '33–0 (27 KO)', division: 'Junior featherweight' },
 { rank: 2, name: 'Oleksandr Usyk', record: '25–0 (16 KO)', division: 'Heavyweight' },
 { rank: 3, name: 'Shakur Stevenson', record: '25–0 (11 KO)', division: 'Junior welterweight' },
 { rank: 4, name: 'Jesse “Bam” Rodriguez', record: '24–0 (17 KO)', division: 'Bantamweight' },
 { rank: 5, name: 'David Benavidez', record: '32–0 (26 KO)', division: 'Cruiserweight' },
 { rank: 6, name: 'Dmitry Bivol', record: '25–1 (12 KO)', division: 'Light heavyweight' },
 { rank: 7, name: 'Junto Nakatani', record: '32–1 (24 KO)', division: 'Junior featherweight' },
 { rank: 8, name: 'Devin Haney', record: '33–0 (15 KO)', division: 'Welterweight' },
 { rank: 9, name: 'Jaron “Boots” Ennis', record: '36–0 (32 KO)', division: 'Junior middleweight' },
 { rank: 10, name: 'Oscar Collazo', record: '15–0 (12 KO)', division: 'Minimumweight' },
];

const portraitOverrides = {
 'Jesse Bam Rodriguez': 'https://wbaboxing.com/photos/boxers/jesse-rodriguez.jpg',
 'Junto Nakatani': 'https://u3ntmi187s.user-space.cdn.idcfcloud.net/contents/main_content2_00001_1.jpg',
 'Oscar Collazo': 'https://wbaboxing.com/photos/boxers/oscar-collazo.png',
 'Moses Itauma': 'https://queensberry.co.uk/cdn/shop/files/Moses_Itauma_1_25d630fc-05db-4e3d-9a7c-02d1455e78b3.png?v=1757674749',
 'Nelson Hysa': 'https://queensberry.co.uk/cdn/shop/files/Nelson_Hysa.png?v=1749635058',
 'Fabio Wardley': 'https://wbaboxing.com/photos/boxers/fabio-wardley.png',
};

const portraitCache = new Map();
const portraitSearchName = name => name
 .replace(/\s*\([^)]*\)\s*/g, ' ')
 .replace(/[“”"]/g, '')
 .replace(/\s+/g, ' ')
 .trim();

function initialsFor(name) {
 return portraitSearchName(name).split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
}

function FighterPortrait({ name, className = '', eager = false }) {
 const isVacant = !name || name === '—' || /^vacant$/i.test(name);
 const cleanName = portraitSearchName(name || '');
 const [src, setSrc] = useState(() => portraitOverrides[cleanName] || portraitCache.get(cleanName)?.url || '');

 useEffect(() => {
  if (isVacant || !cleanName) return;
  const override = portraitOverrides[cleanName];
  if (override) {
   portraitCache.set(cleanName, { status: 'ready', url: override });
   setSrc(override);
   return;
  }
  if (portraitCache.get(cleanName)?.status === 'missing') return;
  const cached = portraitCache.get(cleanName);
  if (cached?.url) { setSrc(cached.url); return; }

  const query = encodeURIComponent(`${cleanName} boxer`);
  const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=420&format=json&origin=*`;
  let cancelled = false;
  fetch(url)
   .then(response => response.ok ? response.json() : Promise.reject(new Error('portrait lookup failed')))
   .then(data => {
    const page = Object.values(data?.query?.pages || {})[0];
    const imageUrl = page?.thumbnail?.source || '';
    portraitCache.set(cleanName, imageUrl ? { status: 'ready', url: imageUrl } : { status: 'missing' });
    if (!cancelled && imageUrl) setSrc(imageUrl);
   })
   .catch(() => {
    portraitCache.set(cleanName, { status: 'missing' });
   });
  return () => { cancelled = true; };
 }, [cleanName, isVacant]);

 return <span className={`aura-fighter-portrait ${className} ${isVacant ? 'aura-fighter-portrait--vacant' : ''}`} aria-hidden="true">
  {src
   ? <img src={src} alt="" loading={eager ? 'eager' : 'lazy'} referrerPolicy="no-referrer" onError={() => { portraitCache.set(cleanName, { status: 'missing' }); setSrc(''); }} />
   : <span>{isVacant ? '—' : initialsFor(name)}</span>}
 </span>;
}

function FighterCell({ name, champion = false }) {
 return <div className={`aura-ranked-fighter ${champion ? 'aura-ranked-fighter--champion' : ''}`}>
  <FighterPortrait name={name} />
  <span>{name || '—'}</span>
 </div>;
}

const beltPalette = {
 WBA: { strap: '#151719', plate: '#d9b04c', accent: '#2d69a5' },
 WBC: { strap: '#1f6a46', plate: '#dfbf58', accent: '#f2e3aa' },
 IBF: { strap: '#8c1d26', plate: '#d7ad44', accent: '#f2df9b' },
 WBO: { strap: '#6f2833', plate: '#dab34d', accent: '#214a83' },
};

function BeltMark({ org }) {
 const palette = beltPalette[org] || beltPalette.WBA;
 return <span className="aura-belt-mark" role="img" aria-label={`${org} championship belt`}>
  <svg viewBox="0 0 150 54" aria-hidden="true">
   <path d="M2 18 31 12h18l8-8h36l8 8h18l29 6v18l-29 6h-18l-8 8H57l-8-8H31L2 36Z" fill={palette.strap}/>
   <ellipse cx="75" cy="27" rx="30" ry="23" fill={palette.plate} stroke="#f5df92" strokeWidth="2"/>
   <circle cx="75" cy="27" r="16" fill={palette.accent} opacity=".9"/>
   <circle cx="34" cy="27" r="8" fill={palette.plate}/>
   <circle cx="116" cy="27" r="8" fill={palette.plate}/>
   <text x="75" y="31" textAnchor="middle" fontSize="12" fontWeight="900" fill="#111">{org}</text>
  </svg>
 </span>;
}

export function RingPoundForPound() {
 return <div className="aura-p4p" aria-labelledby="ring-p4p-title">
  <div className="aura-p4p-head">
   <div>
    <p className="aura-ed-kicker">The Ring Magazine</p>
    <h2 id="ring-p4p-title">Pound for pound.</h2>
    <p>Boxing’s elite, ranked regardless of weight class.</p>
   </div>
   <ExternalLink href="https://www.ringmagazine.com/?lang=en">Official Ring rankings</ExternalLink>
  </div>
  <div className="aura-p4p-grid">
   {ringPoundForPound.map(fighter => <article className={`aura-p4p-card ${fighter.rank <= 3 ? 'aura-p4p-card--podium' : ''}`} key={fighter.rank}>
    <div className="aura-p4p-image">
     <FighterPortrait name={fighter.name} className="aura-fighter-portrait--p4p" eager={fighter.rank <= 2} />
     <span className="aura-p4p-rank" aria-hidden="true">{String(fighter.rank).padStart(2,'0')}</span>
    </div>
    <div className="aura-p4p-copy">
     <p className="aura-ed-kicker">#{fighter.rank} · {fighter.division}</p>
     <h3>{fighter.name}</h3>
     <p>{fighter.record}</p>
    </div>
   </article>)}
  </div>
  <p className="aura-ed-note aura-p4p-note">The Ring men’s pound-for-pound top ten · checked 6 Oct 2026. Rankings can move after major fights and editorial updates.</p>
 </div>;
}
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
 return <section className="aura-ed-section"><RingPoundForPound /><div className="aura-belt-rankings-head"><p className="aura-ed-kicker">Sanctioning bodies</p><h2>World title rankings.</h2><p className="aura-belt-intro">Recognise the belt first, then see who holds it and who is next in line.</p></div>
 <div className="aura-belt-key" aria-label="World championship sanctioning bodies">{Object.keys(rankingEdition.organizations).map(body=><button type="button" className={org===body?'is-active':''} key={body} onClick={()=>setOrg(org===body?'All belts':body)} aria-pressed={org===body}><BeltMark org={body}/><span><strong>{body}</strong><small>{rankingEdition.organizations[body].period}</small></span></button>)}</div>
 <div className="aura-desk-controls"><label>Weight class<select value={selected} onChange={e=>setSelected(e.target.value)}>{rankingEdition.divisions.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label><label>Sanctioning body<select value={org} onChange={e=>setOrg(e.target.value)}><option>All belts</option>{Object.keys(rankingEdition.organizations).map(o=><option key={o}>{o}</option>)}</select></label></div>
 <p className="aura-ed-note">Men’s champions and top five contender positions · Checked {rankingEdition.checkedAt}. Lists have different publication dates and do not automatically change after a fight.</p>
 <div className="aura-rank-table-wrap" tabIndex="0" role="region" aria-label={`${d.name} belt rankings`}><table className="aura-rank-table"><caption>{d.name} — published belt rankings</caption><thead><tr><th scope="col">Position</th>{organizations.map(o=><th scope="col" key={o}><div className="aura-rank-belt-head"><BeltMark org={o}/><strong>{o}</strong><span>{rankingEdition.organizations[o].period}</span></div></th>)}</tr></thead><tbody><tr className="aura-rank-champion"><th scope="row">Champion</th>{organizations.map(o=><td key={o}><FighterCell name={d.champions[o]} champion /></td>)}</tr><tr><th scope="row">Interim</th>{organizations.map(o=><td key={o}><FighterCell name={d.interim[o]||'—'} /></td>)}</tr>{d.rows.map(r=><tr key={r.rank}><th scope="row">{r.rank}</th>{organizations.map(o=><td key={o}><FighterCell name={r[o]} /></td>)}</tr>)}</tbody></table></div>
 <div className="aura-ranking-sources"><p>Contender lists compiled by <ExternalLink href={d.sourceUrl}>Box-Rank</ExternalLink>; WBA entries and champions cross-checked against the WBA’s September list. “Vacant” preserves an unfilled position.</p><p>Complete official lists:</p><div className="aura-life-links">{Object.entries(rankingEdition.organizations).map(([o,s])=><ExternalLink key={o} href={s.url}>{o} rankings</ExternalLink>)}</div></div>
 </section>;
}
