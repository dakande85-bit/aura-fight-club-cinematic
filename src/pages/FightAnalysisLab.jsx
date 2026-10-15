import {useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {Activity, ArrowRight, BarChart3, CheckCircle2, ChevronDown, Database, ExternalLink, Gauge, ScanLine, ShieldAlert, SlidersHorizontal, Target, TrendingUp} from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import {PageSEO} from '../components/SEO.jsx';
import {useArticles} from '../hooks/useArticles.js';
import {VerifiedPhoto} from '../components/VerifiedPhoto.jsx';
import {getFighterByName} from '../data/seoEntities.js';
import {fightLabScouting, punchDataContract, verifiedRecentFights} from '../data/fightLabScouting.js';
import edition from '../../public/news/fights.json';
import '../styles/fight-hub.css';
import '../styles/aura-fight-lab.css';

const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Atlantic/Canary',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const curated={
  'Sebastian Fundora':{record:'24–1–1 (16 KO)',height:'6 ft 5½ in (197 cm)',reach:'80 in (203 cm)',stance:'Southpaw',statSourceUrl:'https://wbcboxing.com/boxeador/sebastian-fundora/',recordSource:'https://wbcboxing.com/boxeador/sebastian-fundora/',recordCheckedAt:'2026-10-15'},
  'Ermal Hadribeaj':{record:'23–0–1 (8 KO)',reach:'74 in (188 cm)',stance:'Orthodox',statSourceUrl:'https://www.ringmagazine.com/fighters/ermal-hadribeaj-70SNbkWZvHnLYdyr7ZQktd',recordSource:'https://www.ringmagazine.com/fighters/ermal-hadribeaj-70SNbkWZvHnLYdyr7ZQktd',recordCheckedAt:'2026-10-15'}
};
const clean=(n)=>n==null?null:Number.isFinite(n)?n:null;
const inches=(value)=>{const m=String(value||'').match(/(\d+(?:\.\d+)?)\s*in\b/i);return m?Number(m[1]):null};
const centimeters=(value)=>{const m=String(value||'').match(/(\d+(?:\.\d+)?)\s*cm\b/i);return m?Number(m[1]):null};
function recordParts(value){
 const text=String(value||''); const numbers=[...text.matchAll(/\d+/g)].map(m=>Number(m[0]));
 if(numbers.length<3)return null;
 const hasDraw=/^\d+\s*[–-]\s*\d+\s*[–-]\s*\d+/.test(text);
 const wins=numbers[0],losses=numbers[1],draws=hasDraw?numbers[2]:0,kos=hasDraw?numbers[3]:numbers[2];
 if(!Number.isFinite(kos)||wins<kos)return null;
 const total=wins+losses+draws;
 return {wins,losses,draws,kos,total,koWinRate:wins?100*kos/wins:null,winRate:total?100*wins/total:null};
}
function fighterInfo(name){
 const entity=getFighterByName(name)||{};
 const extra=curated[name]||{};
 const record=extra.record||entity.record||'';
 return {...entity,...extra,name,record,parsed:recordParts(record),
  sources:[...new Set([extra.recordSource,entity.recordSource,extra.statSourceUrl,entity.statSourceUrl,entity.bioSourceUrl].filter(Boolean))]};
}
function metricValue(f,key){
 if(key==='koWinRate'||key==='winRate')return f.parsed?.[key]??null;
 if(key==='reach')return inches(f.reach);
 if(key==='height')return centimeters(f.height);
 return null;
}
const metrics={
 koWinRate:{label:'KO wins / total wins',unit:'%',description:'How often wins ended in knockout or stoppage; NOT knockout probability against this opponent.'},
 winRate:{label:'Career win share',unit:'%',description:'Wins divided by all recorded professional bouts; opposition quality is not adjusted.'},
 reach:{label:'Reach',unit:'in',description:'Published measurements are not always identical between promoters and commissions.'},
 height:{label:'Height',unit:'cm',description:'Published height, rounded in centimetres.'}
};
const fmt=(x,d=0)=>x==null?'—':Number(x).toFixed(d);
function comparativeIndex(a,b,weights){
 const parts=[['koWinRate',weights.power],['winRate',weights.form],['reach',weights.range]]
  .filter(([key,weight])=>weight>0&&metricValue(a,key)!=null&&metricValue(b,key)!=null);
 if(parts.length<2)return null;
 const denominator=parts.reduce((sum,[,weight])=>sum+weight,0);
 const contributions=parts.map(([key,weight])=>{
  const av=metricValue(a,key),bv=metricValue(b,key);
  const delta=(av-bv)/(Math.max(Math.abs(av),Math.abs(bv),1));
  return {key,weight,delta,contribution:delta*weight/denominator};
 });
 const score=contributions.reduce((sum,x)=>sum+x.contribution,0);
 return {score,contributions,leader:Math.abs(score)<.012?null:score>0?a.name:b.name};
}
function DataLabel({present,label}){return <span className={'afl-data-label '+(present?'is-available':'is-pending')}>{present?<CheckCircle2 size={13}/>:<ShieldAlert size={13}/>} {label}</span>}
function Face({fighter,side}){
 return <div className={'afl-face afl-face--'+side}>
  <div className="afl-face__portrait"><VerifiedPhoto fighterSlug={fighter.slug||''} label={fighter.name} creditLink /></div>
  <div className="afl-face__info"><span>{side==='left'?'RED CORNER':'BLUE CORNER'}</span><h3>{fighter.name}</h3><p>{fighter.record||'Record under review'}</p><small>{fighter.stance||'Stance unverified'} · {fighter.reach||'Reach unverified'}</small></div>
 </div>;
}
function CompareBars({fighters,metric}){
 const def=metrics[metric];const values=fighters.map(f=>clean(metricValue(f,metric)));
 const max=Math.max(...values.filter(v=>v!=null),1);
 return <div className="afl-bars" aria-label={def.label}>
  <div className="afl-chart-title"><h3>{def.label}</h3><DataLabel present={values.every(v=>v!=null)} label={values.every(v=>v!=null)?'Profile data':'Incomplete coverage'}/></div>
  {fighters.map((f,i)=><div className="afl-bar-row" key={f.name}>
    <div className="afl-bar-head"><strong>{f.name}</strong><b>{fmt(values[i],metric==='reach'||metric==='height'?0:1)}{values[i]==null?'':' '+def.unit}</b></div>
    <div className="afl-track" role="img" aria-label={f.name+': '+(values[i]==null?'unavailable':fmt(values[i],1)+' '+def.unit)}><div style={{width:values[i]==null?'0%':Math.max(2,values[i]/max*100)+'%'}} className={'afl-fill afl-fill--'+i}/></div>
  </div>)}
  <p className="afl-chart-note">{def.description}</p>
 </div>;
}
function RecentForm({fighters}){
 return <section className="afl-panel afl-recent"><div className="afl-panel-heading"><div><p className="afl-eyebrow">02 / Verified form book</p><h2>Previous opponents & results</h2></div><CheckCircle2 size={21}/></div>
  <p className="afl-chart-note">Verified recent bouts only; not a complete last-five feed yet. Missing entries are not assumed wins or losses.</p>
  <div className="afl-recent-grid">{fighters.map(f=>{
   const items=verifiedRecentFights[f.name]||[];
   return <div className="afl-recent-fighter" key={f.name}><h3>{f.name}</h3>{items.length?items.map((x,i)=><a key={i} href={x.source} target="_blank" rel="noopener noreferrer" className="afl-form-fight"><b className={x.result==='W'?'won':'lost'}>{x.result}</b><span><strong>{x.opponent}</strong><small>{x.date} · {x.method}</small></span><ExternalLink size={13}/></a>):<p>No results yet reviewed for this fighter.</p>}<small>{items.length} of last 5 verified and indexed</small></div>
  })}</div>
 </section>;
}
const aggregate=(rounds,key)=>{
 if(!Array.isArray(rounds)||!rounds.length)return null;
 const vals=rounds.map(r=>r[key]);
 return vals.every(n=>Number.isFinite(n)&&n>=0)?vals.reduce((s,n)=>s+n,0)/vals.length:null;
};
function PunchTelemetry({fight,fighters}){
 const entries=punchDataContract.fights?.[fight.id]?.fighters||{};
 const safe=fighters.map(f=>entries[f.name]||null);
 const ready=Boolean(punchDataContract.licensedForDisplay&&punchDataContract.provider&&safe.every(x=>x?.sourceUrl&&Number(x.sampleFights)>0&&Array.isArray(x.rounds)&&x.rounds.length));
 const outputs=ready?safe.map(x=>({
  jabs:aggregate(x.rounds,'jabsThrown'),jabsLanded:aggregate(x.rounds,'jabsLanded'),
  power:aggregate(x.rounds,'powerLanded'),powerThrown:aggregate(x.rounds,'powerThrown'),
  total:aggregate(x.rounds,'jabsThrown')+aggregate(x.rounds,'powerThrown'),
  totalLanded:aggregate(x.rounds,'jabsLanded')+aggregate(x.rounds,'powerLanded')
 })):null;
 const valid=ready&&outputs.every(x=>Object.values(x).every(n=>n!=null&&Number.isFinite(n)&&n>=0)&&x.total>=x.totalLanded);
 const measures=[
  {title:'Jabs thrown / round',key:'jabs',unit:''},
  {title:'Jabs landed / round',key:'jabsLanded',unit:''},
  {title:'Power landed / round',key:'power',unit:''},
  {title:'Total thrown / round',key:'total',unit:''},
  {title:'Total landed / round',key:'totalLanded',unit:''},
  {title:'Total connect rate',key:'connect',unit:'%'}
 ];
 const values=valid?outputs.map(x=>({...x,connect:x.total?100*x.totalLanded/x.total:0})):null;
 return <section className="afl-panel afl-telemetry">
  <div className="afl-panel-heading"><div><p className="afl-eyebrow">03 / Licensed punch telemetry</p><h2>Punch output & efficiency</h2></div><DataLabel present={Boolean(valid)} label={valid?'Licensed feed active':'Feed awaiting licence'}/></div>
  <div className="afl-telemetry-grid">{measures.map(m=><div className="afl-telemetry-cell" key={m.title}><span>{m.title}</span><strong>{values?values.map(x=>fmt(x[m.key],1)).join(' / '):'—'}</strong><small>{values?fighters.map(f=>f.name.split(' ').at(-1)).join(' / '):'Verified data unavailable'}</small></div>)}</div>
  {valid?<><div className="afl-punch-chart"><h3>Round-averaged output (tracked rounds)</h3>{['total','totalLanded','jabs','jabsLanded'].map(key=><div key={key} className="afl-punch-row"><span>{measures.find(x=>x.key===key)?.title||key}</span><div className="afl-punch-row__bars">{values.map((v,i)=><div key={i} title={fighters[i].name+': '+fmt(v[key],1)} style={{width:Math.max(2,v[key]/Math.max(...values.map(x=>x[key]),1)*100)+'%'}} className={'afl-fill afl-fill--'+i}/>)}</div></div>)}</div><div className="afl-source-pills">{safe.map((x,i)=><a href={x.sourceUrl} key={fighters[i].name} rel="noopener noreferrer" target="_blank">{fighters[i].name}: {x.sampleFights} tracked bouts ↗</a>)}</div></>
  :<div className="afl-empty-graph"><div className="afl-empty-graph__lines" aria-hidden="true"/><div><Database size={26}/><strong>No invented punch statistics</strong><p>The live chart will populate from validated licensed round-by-round punch records. KO-round frequency and opponent-adjusted data also require sufficient verified fight histories.</p></div></div>}
  <p className="afl-fineprint">Punch statistics are observer-coded estimates, not official scoring. Commercial rights and source identity are validated before display. <a href="https://api2.compuboxdata.com/reports/79" target="_blank" rel="noopener noreferrer">Provider information <ExternalLink size={12}/></a></p>
 </section>;
}
function Scouting({fight,profiles}){
 const s=fightLabScouting[fight.id];
 return <section className="afl-panel afl-scouting">
  <div className="afl-panel-heading"><div><p className="afl-eyebrow">AURA / Tactical intelligence</p><h2>{s?.headline||'The scouting desk'}</h2></div><span className="afl-review">{s?'Reviewed '+s.checkedAt:'Source review in progress'}</span></div>
  {s?<><p className="afl-thesis">{s.thesis}</p><div className="afl-scout-grid">{profiles.map(f=>{const x=s.fighters[f.name];return <div key={f.name} className="afl-scout-fighter"><h3>{f.name}</h3>{x?<dl><dt>Best weapon</dt><dd>{x.weapon}</dd><dt>Path to success</dt><dd>{x.opportunity}</dd><dt>Risk to watch</dt><dd>{x.danger}</dd></dl>:<p>Scouting awaiting fact-check.</p>}</div>})}</div><div className="afl-keys"><h3>The three questions that decide this matchup</h3><ol>{s.keys.map(x=><li key={x}>{x}</li>)}</ol></div><div className="afl-lean"><Target size={20}/><div><small>EDITORIAL LEAN — NOT A MODEL PROBABILITY</small><strong>{s.editorialLean}</strong><span>{s.confidence}</span></div></div><details className="afl-sources"><summary>View analysis evidence and source links <ChevronDown size={16}/></summary><ul>{s.evidence.map(x=><li key={x.label}><strong>{x.label}:</strong> {x.detail} <a href={x.url} target="_blank" rel="noopener noreferrer">Verify <ExternalLink size={12}/></a></li>)}</ul></details></>:<><p className="afl-thesis">This fight is in the verified schedule. Detailed scouting will only appear after primary-source review, not as generic generated commentary.</p><div className="afl-lean"><ShieldAlert size={20}/><div><small>EDITORIAL STATUS</small><strong>Verdict withheld pending research.</strong></div></div></>}
 </section>;
}
function Scenario({profiles}){
 const [weights,setWeights]=useState({power:40,form:30,range:30});
 const outcome=useMemo(()=>comparativeIndex(profiles[0],profiles[1],weights),[profiles,weights]);
 return <section className="afl-panel afl-model">
  <div className="afl-panel-heading"><div><p className="afl-eyebrow">Interactive / Reader model</p><h2>Build your own fight thesis</h2></div><SlidersHorizontal size={22}/></div>
  <p>Change what matters most in this matchup. The comparison uses only available career and reach figures. It is an <strong>uncalibrated sensitivity tool, not a win-probability forecast.</strong></p>
  <div className="afl-model-sliders">{[['power','Knockout rate'],['form','Career win share'],['range','Reach advantage']].map(([key,label])=><label key={key}><span>{label}<b>{weights[key]}</b></span><input type="range" min="0" max="100" step="5" value={weights[key]} onChange={e=>setWeights(old=>({...old,[key]:Number(e.target.value)}))}/></label>)}</div>
  <div className="afl-model-result"><span>RELATIVE MATCHUP LEAN</span><strong>{!outcome?'Insufficient verified inputs':outcome.leader||'Too close on selected metrics'}</strong><p>{outcome?'A descriptive ranking of the selected profile metrics. It cannot infer chin, defence, opposition level, opponent-specific KO round or likelihood of an upset.':'At least two common verified metrics and non-zero weights are needed.'}</p></div>
  {outcome&&<div className="afl-factor-list">{outcome.contributions.map(c=><div key={c.key}><span>{metrics[c.key].label}</span><b>{c.delta>.002?profiles[0].name:c.delta<-.002?profiles[1].name:'Level'}</b></div>)}</div>}
  <p className="afl-fineprint">Method: weighted relative differences, normalized by the larger fighter value for each metric. No fitted historical outcome model, calibration or odds feed is claimed.</p>
 </section>;
}
export default function VerdictPage(){
 const {articles=[]}=useArticles();
 const upcoming=useMemo(()=>edition.fights.filter(f=>f.status!=='Completed'&&f.date>=today()&&f.fighters?.length===2).sort((a,b)=>a.date.localeCompare(b.date)),[]);
 const [selected,setSelected]=useState(()=>upcoming.find(f=>f.id==='dubois-wardley-2')?.id||upcoming[0]?.id||'');
 const [metric,setMetric]=useState('koWinRate');
 const [picks,setPicks]=useState(()=>{try{return JSON.parse(localStorage.getItem('aura-predictions')||'{}')}catch{return {}}});
 const fight=upcoming.find(f=>f.id===selected)||upcoming[0];
 const profiles=useMemo(()=>fight?(fight.fighters||[]).map(fighterInfo):[],[fight]);
 const pick=fight?picks[fight.id]:null;
 const choose=name=>{if(!fight)return;setPicks(old=>{const next={...old,[fight.id]:name};try{localStorage.setItem('aura-predictions',JSON.stringify(next))}catch{}return next})};
 const preview=fight?articles.find(a=>a.fightId===fight.id&&/prediction|preview|tactic|analysis/i.test([a.title,a.category,...(a.tags||[])].join(' '))):null;
 return <><PageSEO title="Fight Analysis Lab — Boxing Data, Matchups & Predictions | AURA" description="Explore sourced fighter profiles, knockout trends, physical matchups, tactical breakdowns and interactive prediction scenarios. Unavailable punch data is never fabricated." canonicalPath="/verdict"/><Header/>
 <main className="afl-root">
  <div className="afl-shell">
   <div className="afl-topline"><span className="afl-live-dot"/> AURA / INTELLIGENCE DIVISION <span className="afl-topline__right">RESEARCH-LED BOXING ANALYSIS</span></div>
   <header className="afl-hero"><div><p className="afl-eyebrow">BEYOND THE TALE OF THE TAPE</p><h1>THE FIGHT<br/><em>ANALYSIS LAB.</em></h1><p>Numbers explain the tendencies. Tactics explain the fight. Interrogate the matchup before the first bell.</p></div><div className="afl-hero__seal" aria-hidden="true"><ScanLine size={48}/><span>AURA<br/>LAB / 01</span></div></header>
   {fight?<><nav className="afl-fight-picker" aria-label="Select upcoming fight"><div><span>ACTIVE MATCHUP</span><strong>{fight.division} · {new Date(fight.date+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</strong></div><label><span className="afl-sr">Choose a matchup</span><select value={fight.id} onChange={e=>setSelected(e.target.value)}>{upcoming.map(f=><option value={f.id} key={f.id}>{f.name}</option>)}</select></label></nav>
   <section className="afl-matchup" aria-label={fight.name}><Face fighter={profiles[0]} side="left"/><div className="afl-versus"><span>HEAD TO HEAD</span><strong>VS</strong><small>{fight.stakes}</small></div><Face fighter={profiles[1]} side="right"/></section>
   <div className="afl-signal-strip"><div><Gauge size={18}/><span>{profiles.filter(x=>x.parsed).length}/2 records available</span></div><div><Activity size={18}/><span>{profiles.filter(x=>metricValue(x,'reach')!=null).length}/2 reach figures</span></div><div><Database size={18}/><span>Punch feed: {punchDataContract.licensedForDisplay?'Connected':'Not licensed'}</span></div><div><CheckCircle2 size={18}/><span>Source review {edition.checkedAt}</span></div></div>
   <div className="afl-layout"><div className="afl-main-col">
    <section className="afl-panel afl-comparison"><div className="afl-panel-heading"><div><p className="afl-eyebrow">01 / Verified metrics</p><h2>The numbers behind the matchup</h2></div><BarChart3 size={22}/></div><div className="afl-metric-tabs" role="group" aria-label="Select comparison metric">{Object.entries(metrics).map(([key,value])=><button key={key} type="button" aria-pressed={metric===key} onClick={()=>setMetric(key)}>{value.label}</button>)}</div><CompareBars fighters={profiles} metric={metric}/><div className="afl-career-grid">{profiles.map(x=><div key={x.name}><span>{x.name}</span><strong>{x.parsed?x.parsed.kos:'—'} <small>KO wins</small></strong><p>{x.parsed?x.parsed.wins+' wins · '+x.parsed.losses+' losses · '+x.parsed.draws+' draws':'Verified career breakdown unavailable'}</p>{x.sources[0]&&<a href={x.sources[0]} target="_blank" rel="noopener noreferrer">Profile source <ExternalLink size={12}/></a>}</div>)}</div></section>
    <RecentForm fighters={profiles}/>
    <Scouting fight={fight} profiles={profiles}/>
    <PunchTelemetry fight={fight} fighters={profiles}/>
   </div><aside className="afl-aside"><Scenario key={fight.id} profiles={profiles}/>
    <section className="afl-panel afl-reader"><p className="afl-eyebrow">YOUR CORNER</p><h2>Make the call.</h2><p>Who wins? Save a personal pick before fight night.</p><div className="afl-pick-buttons">{profiles.map(f=><button key={f.name} aria-pressed={pick===f.name} onClick={()=>choose(f.name)}>{f.name}</button>)}</div><small>{pick?'Your pick: '+pick+' · saved to this device':'No selection made. Reader picks are private and not presented as crowd odds.'}</small></section>
    <section className="afl-panel afl-previews"><p className="afl-eyebrow">DEEPER READING</p><h2>Beyond the dataset</h2>{preview?<><h3>{preview.title}</h3><p>{preview.summary}</p><Link to={'/news/'+preview.slug}>Read AURA analysis <ArrowRight size={15}/></Link></>:<p>Editorial preview not yet cleared for this matchup.</p>}<Link to={'/fights/'+fight.id}>Event details & broadcast <ArrowRight size={15}/></Link>{profiles.every(x=>x.slug)&&<Link to={'/fighters/compare?left='+profiles[0].slug+'&right='+profiles[1].slug}>Compare full fighter profiles <ArrowRight size={15}/></Link>}</section>
    <section className="afl-panel afl-partners"><p className="afl-eyebrow">PARTNER DESK</p><h2>Commercial partners</h2><p>Any future betting promotions will be separately labelled, age-restricted and subject to local advertising laws. No unapproved betting links or fictional bookmaker prices are shown.</p><Link to="/commercial-policy">Commercial policy <ExternalLink size={13}/></Link></section>
   </aside></div>
   <div className="afl-next-fights"><div><p className="afl-eyebrow">NEXT IN THE LAB</p><h2>Explore another matchup</h2></div><div className="afl-next-grid">{upcoming.filter(f=>f.id!==fight.id).slice(0,4).map(f=><button key={f.id} onClick={()=>{setSelected(f.id);setMetric('koWinRate');window.scrollTo({top:0,behavior:'smooth'})}}><small>{f.date} · {f.division}</small><strong>{f.name}</strong><span>OPEN ANALYSIS <ArrowRight size={14}/></span></button>)}</div></div>
   </>:<section className="afl-panel"><h2>No upcoming fight on the verified calendar.</h2><p>Check back when a bout has been confirmed and reviewed.</p><Link to="/fight-hub">Browse Fight Hub <ArrowRight size={15}/></Link></section>}
   <footer className="afl-methodology"><TrendingUp size={18}/><p><strong>Our standard:</strong> career metrics are sourced snapshots, not live feeds. Tactical interpretations are editorial judgments. CompuBox-style telemetry, opponent-adjusted trends, likely KO rounds, and calibrated win probabilities appear only after we secure appropriate underlying data and validate the methodology. Last event review: {edition.checkedAt}.</p></footer>
  </div>
 </main><Footer/></>;
}
