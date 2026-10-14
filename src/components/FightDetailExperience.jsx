import {useState} from 'react';
import {Link} from 'react-router-dom';
import {VerifiedPhoto} from './VerifiedPhoto.jsx';
import {StoryThumbnail} from './EditorialSections.jsx';
import {useArticles} from '../hooks/useArticles.js';
import {fighters,getFighterByName} from '../data/seoEntities.js';
import fightEdition from '../../public/news/fights.json';
import '../styles/fight-detail-experience.css';

const editorial={
 'dubois-wardley-2':{
  strap:'THE REMATCH / CHAPTER TWO',
  headline:'The first fight was chaos. The rematch demands answers.',
  intro:'Daniel Dubois survived two knockdowns before breaking down Fabio Wardley to win the WBO heavyweight championship in Manchester. Five months later, Wardley wants his belt back — and both heavyweights insist they have learned from a brutal first meeting.',
  verdict:'This rematch is decided by adjustment, not courage. Wardley proved that Dubois can be hurt immediately; Dubois proved that he could reset, take over behind heavy pressure and finish a wounded opponent. Their opening-round discipline may tell us more than the pre-fight bravado.',
  lastFight:{title:'MANCHESTER, 9 MAY 2026',label:'How the first fight unfolded',items:[
   {number:'01',title:'Ten-second shock',text:'Wardley dropped Dubois inside the opening seconds, proving he could get through the champion-to-be before either man had established rhythm.'},
   {number:'03',title:'A second warning',text:'Another knockdown put Dubois behind early and appeared to give Wardley control of the fight.'},
   {number:'MID',title:'Dubois turns the tide',text:'Dubois progressively found more success as Wardley absorbed sustained punishment. The referee and ringside team increasingly had to assess whether Wardley could defend himself.'},
   {number:'11',title:'The stoppage',text:'Referee Howard Foster stopped the contest 28 seconds into round 11, with Wardley still standing. Dubois left with the WBO world title.'}
  ],source:'https://www.reuters.com/sports/dubois-stops-wardley-11-rounds-take-wbo-heavyweight-title-2026-05-09/'},
  keys:[
   {index:'01',title:'Wardley cannot chase the same finish',text:'The early knockdowns encouraged Wardley to search for another decisive shot. He must keep his feet under him, reset behind the jab and avoid spending long exchanges exposed to Dubois’s heavier combinations.'},
   {index:'02',title:'Dubois must survive the opening storm',text:'The first fight showed that Wardley can find Dubois before he is fully settled. A tighter guard, shorter counters and a more disciplined first three rounds would deny the challenger the same head start.'},
   {index:'03',title:'Watch the jab and the inside exchanges',text:'Dubois is most dangerous when he can walk forward behind a heavy lead hand and hold his position. Wardley has to interrupt that rhythm with quick entries and exits rather than trading blow for blow.'},
   {index:'04',title:'Damage and stamina are real variables',text:'Wardley sustained substantial facial damage in May. Only ringside doctors can assess his medical fitness; tactically, both corners must recognise when attritional exchanges are no longer productive.'}
  ],
  facts:[['First fight','Dubois TKO 11'],['World title','WBO heavyweight'],['Promoter','Queensberry Promotions'],['Venue','The O2, London']],
  sources:[
   {label:'Queensberry — official rematch announcement',url:'https://queensberry.co.uk/blogs/queensberry-promotions-blog/run-it-back-dubois-wardley-sequel-set-for-october-17'},
   {label:'The O2 — venue and doors',url:'https://www.theo2.co.uk/events/detail/dubois-vs-wardley-2'},
   {label:'Reuters — May fight result',url:'https://www.reuters.com/sports/dubois-stops-wardley-11-rounds-take-wbo-heavyweight-title-2026-05-09/'},
   {label:'Queensberry — Dubois record',url:'https://queensberry.co.uk/pages/daniel-dubois'},
   {label:'Queensberry — Wardley record',url:'https://queensberry.co.uk/pages/fabio-wardley'}
  ]
 },
 'foster-navarrete':{
  strap:'THE UNIFICATION',headline:'Structure against disorder at 130 pounds.',
  intro:'Emanuel Navarrete attacks from unusual angles and throws in bursts. O’Shaquie Foster prefers distance, positioning and precise counters. Three championships are at stake in an intriguing tactical clash.',
  keys:[{index:'01',title:'The broken rhythm',text:'Navarrete’s shifting entries can disrupt a conventional defence.'},{index:'02',title:'The counterpunching test',text:'Foster has to turn unusual attacks into opportunities without being overwhelmed by volume.'}]
 },
 'fundora-hadribeaj':{
  strap:'WORLD TITLE DEFENCE',headline:'An unusual champion meets a challenger with nothing to lose.',
  intro:'Sebastian Fundora’s extraordinary height does not make him a typical long-range boxer. He often chooses to fight inside. The unanswered question is whether Ermal Hadribeaj can force the champion into unfamiliar exchanges.',
  keys:[{index:'01',title:'Inside the tall man',text:'Fundora’s comfort at close range changes the normal battle for distance.'},{index:'02',title:'Do not look past the challenger',text:'Talk of bigger future opponents means nothing unless Fundora clears the mandatory assignment first.'}]
 },
 'smith-puello':{
  strap:'CHAMPIONSHIP NIGHT',headline:'Home advantage, world-title pressure.',
  intro:'Dalton Smith returns before a home crowd, but the experienced Alberto Puello is no ceremonial opponent. The tactical story centres on who dictates range and rhythm.',
  keys:[{index:'01',title:'Set the range',text:'Each man needs to establish his ideal punching distance without surrendering the centre of the ring.'},{index:'02',title:'Discipline under pressure',text:'Title fights are settled over twelve rounds; both fighters must resist the urge to force an early finish.'}]
 },
 'bivol-callum-smith':{
  strap:'LIGHT-HEAVYWEIGHT CHAMPIONSHIP',headline:'Distance is everything.',
  intro:'Dmitry Bivol has built an elite career controlling distance through timing, angles and repeatable combinations. Callum Smith brings size and power, but must establish his punches without letting Bivol reset.',
  keys:[{index:'01',title:'The jab war',text:'Smith must use his longer frame with purpose rather than merely follow the champion.'},{index:'02',title:'Work between Bivol’s bursts',text:'Bivol’s combinations are most effective when opponents wait. Smith needs to interrupt the rhythm.'}]
 },
 'canelo-mbilli':{
  strap:'SUPER-MIDDLEWEIGHT CHAMPIONSHIP',headline:'Craft meets sustained pressure.',
  intro:'The defining question is whether Canelo Alvarez’s experience and counterpunching can slow the high-output aggression of Christian Mbilli.',
  keys:[{index:'01',title:'Mbilli’s tempo',text:'The challenger must sustain purposeful pressure rather than offer predictable entries.'},{index:'02',title:'Canelo’s counters',text:'Experience counts most when the veteran has time to read and punish incoming attacks.'}]
 }
};
const dateString=d=>new Date(d+'T12:00:00Z').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
const canary=iso=>iso?new Intl.DateTimeFormat('en-GB',{timeZone:'Atlantic/Canary',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(iso)):null;
const matches=(a,fight,names)=>{
 if(a.fightId===fight.id) return true;
 const hay=(a.title+' '+(a.tags||[]).join(' ')).toLowerCase();
 return names.length===2&&names.some(n=>n.split(' ').filter(p=>p.length>4).some(part=>hay.includes(part.toLowerCase())));
};
function Figure({slug,fightId,label,className=''}){return <VerifiedPhoto fighterSlug={slug} fightId={fightId} label={label} className={className}/>;}
function External({href,children}){return href?<a href={href} target="_blank" rel="noopener noreferrer">{children} ↗</a>:null;}
function SavedPick({fight,names}){
 const key='aura-pick-'+fight.id;
 const [pick,setPick]=useState(()=>{try{return window.localStorage.getItem(key)||''}catch{return ''}});
 const change=name=>{setPick(name);try{window.localStorage.setItem(key,name)}catch{}};
 if(fight.status==='Completed')return null;
 return <section className="afc-fi-pick"><span className="afc-fi-eyebrow">AURA / YOUR CALL</span><h3>Who wins this fight?</h3><p>Choose your winner. Your pick stays on this device; there are no manufactured public poll percentages.</p>
  <div>{names.map(name=><button type="button" aria-pressed={pick===name} key={name} onClick={()=>change(name)}>{name}</button>)}</div>
  {pick&&<small role="status">Your pick: {pick}</small>}
 </section>;
}
export default function FightDetailExperience({fight}){
 const {articles=[]}=useArticles();
 const names=fight.fighters||fight.name.split(/\\s+vs\\.?\\s+/i).slice(0,2);
 const boxers=names.map(name=>getFighterByName(name));
 const data=editorial[fight.id]||{};
 const status=fight.status==='Completed';
 const linked=articles.filter(a=>matches(a,fight,names)).slice(0,7);
 const others=fightEdition.fights.filter(f=>f.id!==fight.id&&f.status!=='Completed').sort((a,b)=>a.date.localeCompare(b.date)).slice(0,3);
 const time=canary(fight.schedule?.broadcastStartUTC);
 const officialRing= fight.schedule?.ringWalkStatus==='confirmed'&&fight.schedule?.ringWalkUTC?canary(fight.schedule.ringWalkUTC):null;
 const fightDate=dateString(fight.date);
 return <div className="afc-fi" id="fight-detail">
  <section className="afc-fi-hero" aria-labelledby="afc-fi-title">
   <div className="afc-fi-hero__art" aria-hidden="true"><Figure fightId={fight.id} label={fight.name}/></div>
   <div className="afc-fi-hero__inner">
    <p className="afc-fi-eyebrow">AURA / FIGHT INTELLIGENCE <span>•</span> {fight.division.toUpperCase()} <span>•</span> {status?'RESULT':'FIGHT NIGHT'}</p>
    <div className="afc-fi-hero__badge">{fight.stakes}</div>
    <h1 id="afc-fi-title"><span>{names[0]}</span><em>VS</em><span>{names[1]}</span></h1>
    <p className="afc-fi-hero__dek">{data.headline||fight.blurb||'Everything to know about this boxing event.'}</p>
    <div className="afc-fi-hero__meta"><span>{fightDate}</span><span>{fight.venue}</span><span>{fight.broadcastStatus==='confirmed'?fight.broadcast:'Viewing details pending'}</span></div>
    <div className="afc-fi-hero__actions"><a href="#afc-fi-watch" className="afc-fi-btn afc-fi-btn--gold">{status?'Event archive ↓':'How to watch ↓'}</a><a href="#afc-fi-preview" className="afc-fi-btn afc-fi-btn--outline">Fight breakdown ↓</a></div>
   </div>
   <div className="afc-fi-hero__credit">{fight.id==='dubois-wardley-2'?'In-ring archive from the first bout, May 2026. Not a photograph of the rematch.':'Event image; archive photographs may depict an earlier fight.'}</div>
  </section>
  {status&&fight.result&&<section className="afc-fi-result" aria-label="Confirmed fight result"><span>OFFICIAL RESULT</span><strong>{fight.result.winner} defeats {fight.result.loser}</strong><p>{fight.result.method}{fight.result.round?' · Round '+fight.result.round:''}{fight.result.time?' · '+fight.result.time:''}{fight.result.titleOutcome?' · '+fight.result.titleOutcome:''}</p></section>}
  <section className="afc-fi-factstrip" aria-label="At a glance">
   <div><span>THE DATE</span><strong>{new Date(fight.date+'T12:00:00Z').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</strong></div>
   <div><span>THE VENUE</span><strong>{fight.venue.split(',')[0]}</strong></div>
   <div><span>WHAT'S AT STAKE</span><strong>{fight.stakes}</strong></div>
   <div><span>VIEWING</span><strong>{fight.broadcastStatus==='confirmed'?fight.broadcast:'Confirmation pending'}</strong></div>
  </section>
  <div className="afc-fi-layout">
   <div className="afc-fi-main">
    <section className="afc-fi-section" id="afc-fi-preview"><span className="afc-fi-eyebrow">{data.strap||'THE BIG FIGHT'}</span><h2>{data.headline||'The fight in focus.'}</h2><p className="afc-fi-lead">{data.intro||fight.blurb||'Read the confirmed facts, the latest AURA reporting and the tactical questions surrounding this contest.'}</p>
     {data.verdict&&<p className="afc-fi-editorial">{data.verdict}</p>}
    </section>
    <section className="afc-fi-section" aria-labelledby="afc-fi-comparison"><div className="afc-fi-heading"><span className="afc-fi-eyebrow">THE MATCHUP</span><h2 id="afc-fi-comparison">Head to head.</h2></div>
     <div className="afc-fi-faceoff">{boxers.map((p,i)=><article className="afc-fi-boxer" key={names[i]}>
       <div className="afc-fi-boxer__image"><Figure slug={p?.slug} label={names[i]}/></div>
       <div className="afc-fi-boxer__name"><span>{i===0?'RED CORNER / BOXER ONE':'BLUE CORNER / BOXER TWO'}</span><h3>{names[i]}</h3><small>{p?.record||'Record under verification'}</small></div>
      </article>)}</div>
     <div className="afc-fi-tale" role="table" aria-label="Fighter tale of the tape">
     {[['Professional record','record'],['Stance','stance'],['Height','height'],['Reach','reach'],['Weight class','division'],['Nationality','nationality']].map(([label,key])=><div className="afc-fi-tale__row" role="row" key={key}><strong role="cell">{boxers[0]?.[key]||'—'}</strong><span role="rowheader">{label}</span><strong role="cell">{boxers[1]?.[key]||'—'}</strong></div>)}</div>
     <div className="afc-fi-tale-links">{boxers.map((p,i)=>p&&<Link key={p.slug} to={`/fighters/${p.slug}`}>{names[i]} fighter profile ↗</Link>)}{boxers[0]&&boxers[1]&&<Link to={`/fighters/compare?left=${boxers[0].slug}&right=${boxers[1].slug}`}>Full side-by-side comparison ↗</Link>}</div>
     <p className="afc-fi-caption">Career records reflect the last independently checked profiles; unverified measurements are not guessed.</p>
    </section>
    {data.lastFight&&<section className="afc-fi-section afc-fi-history"><span className="afc-fi-eyebrow">{data.lastFight.title}</span><h2>{data.lastFight.label}</h2><p>Their first meeting changed hands more than once. The chronology below follows the recorded result, not a prediction for Saturday.</p>
     <div className="afc-fi-timeline">{data.lastFight.items.map(item=><article key={item.number}><span>{item.number}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div>
     <External href={data.lastFight.source}>See original result reporting</External>
    </section>}
    <section className="afc-fi-section"><span className="afc-fi-eyebrow">THE FIGHT LAB</span><h2>What decides the fight?</h2>
     {data.keys?.length?<div className="afc-fi-keys">{data.keys.map(k=><article key={k.index}><span>{k.index}</span><div><h3>{k.title}</h3><p>{k.text}</p></div></article>)}</div>:<div className="afc-fi-keys"><article><span>01</span><div><h3>Who controls the range?</h3><p>The first adjustment to watch is where the boxers choose to exchange. Distance management matters more than the pre-fight headlines.</p></div></article><article><span>02</span><div><h3>Who adapts first?</h3><p>The early rounds should reveal whether each fighter can impose his preferred pace and adjust when the original plan fails.</p></div></article></div>}
     <p className="afc-fi-caption">This section is original tactical interpretation, not a confirmed future result.</p>
    </section>
    <section className="afc-fi-section" id="afc-fi-undercard"><span className="afc-fi-eyebrow">THE FULL FIGHT NIGHT</span><h2>Undercard spotlight.</h2>
     {fight.undercard?.length?<><div className="afc-fi-card-list">{fight.undercard.map((b,i)=><div key={b.name||b} className="afc-fi-card-list__row"><span>{String(i+1).padStart(2,'0')}</span><div><strong>{b.name||b}</strong>{b.division&&<small>{b.division}{b.stakes?' · '+b.stakes:''}</small>}</div></div>)}</div><p className="afc-fi-caption">Announced undercard; bouts and running order can change.</p></>:<p>Only the main event has been entered into our verified listing so far. We will add undercard bouts when a reliable promoter or broadcaster confirms them.</p>}
    </section>
    {fight.officialVideo?.youtubeId&&<section className="afc-fi-section"><span className="afc-fi-eyebrow">ON FILM</span><h2>Hear it from the fighters.</h2><div className="afc-fi-video"><iframe title={fight.officialVideo.title||'Official fight preview'} src={`https://www.youtube-nocookie.com/embed/${fight.officialVideo.youtubeId}`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; encrypted-media; picture-in-picture; web-share" allowFullScreen/></div><p className="afc-fi-caption">Published by {fight.officialVideo.publisher||'a verified boxing broadcaster'}. <External href={fight.officialVideo.sourceUrl}>Watch at source</External></p></section>}
    <section className="afc-fi-section"><span className="afc-fi-eyebrow">EDITORIAL COVERAGE</span><h2>More than the headline.</h2>
     {linked.length?<div className="afc-fi-story-grid">{linked.map(a=><article key={a.slug}><Link to={`/news/${a.slug}`} className="afc-fi-story-cover"><StoryThumbnail article={a}/></Link><div><span className="afc-fi-eyebrow">{a.category}</span><h3><Link to={`/news/${a.slug}`}>{a.title}</Link></h3><p>{a.summary}</p><Link to={`/news/${a.slug}`}>Read the analysis ↗</Link></div></article>)}</div>:<p>Our editorial desk will link independently researched pre-fight and post-fight coverage here as it is published.</p>}
    </section>
   </div>
   <aside className="afc-fi-sidebar" aria-label="Fight-night information">
    <section className="afc-fi-watch" id="afc-fi-watch"><span className="afc-fi-eyebrow">FIGHT NIGHT GUIDE</span><h2>Where to watch.</h2>
     <dl><div><dt>Fight night</dt><dd>{fightDate}</dd></div><div><dt>Venue</dt><dd>{fight.venue}</dd></div><div><dt>Broadcaster</dt><dd>{fight.broadcastStatus==='confirmed'?fight.broadcast:'Not confirmed'}</dd></div><div><dt>Coverage starts · Tenerife</dt><dd>{time?time+' (local)':'Not confirmed'}</dd></div>{fight.id==='dubois-wardley-2'&&<div><dt>Arena doors · London</dt><dd>16:00 BST · confirmed by The O2</dd></div>}<div><dt>Main-event ring walks</dt><dd>{officialRing?officialRing+' (confirmed)':fight.id==='dubois-wardley-2'?'Around 22:30 BST · estimate only':'Not confirmed'}</dd></div><div><dt>Viewing territories</dt><dd>{fight.broadcastTerritory||'Regional rights may vary'}</dd></div></dl>
     {fight.watchUrl&&fight.broadcastStatus==='confirmed'&&<a className="afc-fi-btn afc-fi-btn--gold" href={fight.watchUrl} target="_blank" rel="noopener noreferrer">Official broadcaster / how to watch ↗</a>}
     <p>Broadcast prices and availability depend on your country and subscription. The estimated main-event time may change with the undercard.</p>
    </section>
    <SavedPick fight={fight} names={names}/>
    <section className="afc-fi-sources"><span className="afc-fi-eyebrow">THE SOURCES</span><h3>Verified, not guessed.</h3><p>Event information last reviewed {fight.updatedAt||'14 October 2026'}.</p><ul>{(data.sources||[{label:fight.source||'Event announcement',url:fight.sourceUrl}]).map(s=><li key={s.url}><External href={s.url}>{s.label}</External></li>)}</ul></section>
   </aside>
  </div>
  {others.length>0&&<section className="afc-fi-next"><div className="afc-fi-heading"><span className="afc-fi-eyebrow">KEEP WATCHING</span><h2>Other fights on our radar.</h2></div><div>{others.map(o=><Link key={o.id} to={`/fights/${o.id}`} className="afc-fi-next__card"><Figure fightId={o.id} label={o.name}/><span>{o.date} / {o.division}</span><strong>{o.name}</strong><small>Fight intelligence ↗</small></Link>)}</div></section>}
 </div>;
}
