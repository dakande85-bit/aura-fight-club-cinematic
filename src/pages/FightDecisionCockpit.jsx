import {useEffect, useMemo, useState} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import {
  Activity, ArrowRight, ArrowUpRight, BarChart3, BookmarkCheck,
  Check, ChevronDown, CircleHelp, ClipboardCheck, Compass, Database,
  ExternalLink, Info, LockKeyhole, RotateCcw, ScanLine, ShieldCheck,
  SlidersHorizontal, Target, Zap
} from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import {PageSEO} from '../components/SEO.jsx';
import {getFighterByName} from '../data/seoEntities.js';
import {VerifiedPhoto} from '../components/VerifiedPhoto.jsx';
import TacticalBlueprint from '../components/TacticalBlueprint.jsx';
import {PinCurrentFactor, FightNotebook, OfficialVideoPanel} from '../components/FightResearchExtras.jsx';
import {fightLabScouting, verifiedRecentFights, punchDataContract} from '../data/fightLabScouting.js';
import edition from '../../public/news/fights.json';
import '../styles/fight-hub.css';
import '../styles/fight-decision-cockpit.css';
import '../styles/tactical-blueprint.css';
import '../styles/fight-research-extras.css';

const dateNow=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Atlantic/Canary',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const upcoming=edition.fights.filter(f=>f.status!=='Completed'&&f.date>=dateNow()&&f.fighters?.length===2).sort((a,b)=>a.date.localeCompare(b.date));
const featured=['dubois-wardley-2','fundora-hadribeaj','canelo-mbilli'];
const allFights=[...upcoming].sort((a,b)=>{
  const x=featured.indexOf(a.id),y=featured.indexOf(b.id);
  if(x>=0&&y>=0)return x-y;
  if(x>=0)return -1;
  if(y>=0)return 1;
  return a.date.localeCompare(b.date);
});
const curated={
  'Sebastian Fundora':{record:'24–1–1 (16 KO)',height:'6 ft 5½ in (197 cm)',reach:'80 in (203 cm)',stance:'Southpaw',slug:'sebastian-fundora',recordSource:'https://wbcboxing.com/en/boxer/sebastian-fundora/'},
  'Ermal Hadribeaj':{record:'23–0–1 (8 KO)',reach:'74 in (188 cm)',stance:'Orthodox',recordSource:'https://www.ringmagazine.com/fighters/ermal-hadribeaj-70SNbkWZvHnLYdyr7ZQktd'}
};
const simulations={
  'dubois-wardley-2':[
    {name:'Opening volatility',short:'Rounds 1–3',lead:'Wardley’s early threat',body:'Their first meeting featured two early Dubois knockdowns. Wardley needs to turn early opportunities into sustained control instead of relying on one breakthrough.',trigger:'Watch the first clean exchanges and how quickly each man recovers.'},
    {name:'Establishing the jab',short:'Rounds 4–7',lead:'Dubois’s stabilising tool',body:'A steadier jab and stronger defensive resets could prevent the bout from becoming a prolonged exchange of power shots.',trigger:'Track who can jab without immediately absorbing a return.'},
    {name:'The deep-water test',short:'Rounds 8–12',lead:'Durability under pressure',body:'The previous bout ended in round eleven. Any claim about repeat late stoppage frequency needs broader historical round data; here the question is whether Wardley can maintain his structure.',trigger:'Look for fatigue, distance control and the quality of defensive decisions.'}
  ],
  'fundora-hadribeaj':[
    {name:'Range management',short:'Outside',lead:'Fundora’s unusual reach',body:'Fundora’s published 80-inch reach creates a large entry problem. Hadribeaj will need to turn that gap into purposeful, timed attacks rather than chase at the end of punches.',trigger:'Count successful entries before Fundora resets his feet.'},
    {name:'The inside battle',short:'Pocket',lead:'Who controls exchanges?',body:'Fundora’s preference for exchanges can surrender some of his size advantage. That creates chances for the challenger, but remaining inside invites sustained counters.',trigger:'Watch who exits the pocket without taking the final punch.'},
    {name:'Maintaining output',short:'Late pace',lead:'Composure over volume',body:'A high pace matters only if punches remain effective. Officially licensed round-by-round volume data would make this a measurable contest rather than an editorial hypothesis.',trigger:'Distinguish activity from clean, effective punches.'}
  ]
};
const lensMeta={
  power:{label:'Finishing record',description:'KO wins divided by total wins — not chance of stopping this opponent.',unit:'%'},
  form:{label:'Career win share',description:'Wins divided by total bouts — unadjusted for opposition.',unit:'%'},
  range:{label:'Reach advantage',description:'Published reach — not automatically a tactical advantage.',unit:'in'}
};
const pct=v=>v==null?'—':v.toFixed(1)+'%';
const inc=s=>{const match=String(s||'').match(/(\d+(?:\.\d+)?)\s*in\b/i);return match?Number(match[1]):null};
function recordValue(record){
 const m=String(record||'').match(/^(\d+)\s*[–-]\s*(\d+)(?:\s*[–-]\s*(\d+))?\s*\(\s*(\d+)\s*KO\s*\)/i);
 if(!m)return null;
 const wins=Number(m[1]),losses=Number(m[2]),draws=Number(m[3]||0),kos=Number(m[4]);
 return kos<=wins?{wins,losses,draws,kos,total:wins+losses+draws,finish:wins?kos/wins*100:null,winshare:(wins+losses+draws)?wins/(wins+losses+draws)*100:null}:null;
}
function fighterByName(name){
 const base=getFighterByName(name)||{};
 const c=curated[name]||{};
 const f={...base,...c,name};
 const stats=recordValue(f.record);
 return {...f,stats,reachIn:inc(f.reach),sources:[...new Set([f.recordSource,f.statSourceUrl,f.bioSourceUrl].filter(Boolean))]};
}
function hasMetric(f,metric){return metric==='power'?f.stats?.finish??null:metric==='form'?f.stats?.winshare??null:f.reachIn;}
function calculateLens(fighters,weights){
 if(fighters.length!==2)return null;
 const entries=Object.entries(weights).filter(([metric,weight])=>weight>0&&fighters.every(f=>hasMetric(f,metric)!=null));
 const sum=entries.reduce((a,[,weight])=>a+weight,0);
 if(!sum)return null;
 const rows=entries.map(([metric,weight])=>{
  const a=hasMetric(fighters[0],metric),b=hasMetric(fighters[1],metric);
  const relative=(a-b)/Math.max(Math.abs(a),Math.abs(b),1);
  return {metric,weight,difference:relative,contribution:relative*weight/sum,lead:Math.abs(relative)<.012?'Neither':relative>0?fighters[0].name:fighters[1].name};
 });
 const score=rows.reduce((a,x)=>a+x.contribution,0);
 return {rows,score,leader:Math.abs(score)<.015?null:score>0?fighters[0].name:fighters[1].name};
}
function sourceCoverage(fighters,scouting){
 const checks=fighters.flatMap(f=>[Boolean(f.stats),Boolean(f.reachIn),Boolean(f.stance),Boolean(f.height)]);
 return {verified:checks.filter(Boolean).length+(scouting?1:0),total:checks.length+1};
}
function Portrait({fighter,position}){
 return <div className={'fdc-portrait fdc-portrait--'+position}>
  <div className="fdc-portrait-media"><VerifiedPhoto fighterSlug={fighter.slug} label={fighter.name}/></div>
  <div className="fdc-portrait-copy"><span>{position==='left'?'RED CORNER':'BLUE CORNER'}</span><strong>{fighter.name}</strong><small>{fighter.record||'Record not confirmed'}</small></div>
 </div>;
}
function BriefMetric({title,left,right,format,explain}){
 const both=left!=null&&right!=null;
 const l=both?left/Math.max(left,right,1):0;
 const r=both?right/Math.max(left,right,1):0;
 return <div className="fdc-mini-metric">
  <div className="fdc-mini-head"><span>{title}</span><details className="fdc-metric-help"><summary aria-label={'What does '+title+' mean?'}><CircleHelp size={14}/></summary><p>{explain}</p></details></div>
  <div className="fdc-mini-numbers"><strong>{left==null?'—':format(left)}</strong><span>{both?'VS':'DATA GAP'}</span><strong>{right==null?'—':format(right)}</strong></div>
  <div className="fdc-mini-track"><div className="fdc-mini-track-left"><b style={{width:both?Math.max(3,l*100)+'%':'0%'}}/></div><div className="fdc-mini-track-right"><b style={{width:both?Math.max(3,r*100)+'%':'0%'}}/></div></div>
 </div>;
}
function FightStage({fight,fighters,scouting,goToModel}){
 const [detail,setDetail]=useState('tactical');
 const [expanded,setExpanded]=useState(false);
 const [showStats,setShowStats]=useState(false);
 const info=sourceCoverage(fighters,scouting);
 return <div className={'fdc-stage'+(showStats?'':' fdc-stage--compact')}>
  <div className="fdc-stage-art" aria-label={fight.name}>
   <Portrait fighter={fighters[0]} position="left"/>
   <div className="fdc-vs"><span>THE MATCHUP</span><strong>VS</strong><small>{fight.division}</small></div>
   <Portrait fighter={fighters[1]} position="right"/>
  </div>
  <div className="fdc-stage-dock"><div><span className="fdc-kicker">SCOUTED EVENT</span><strong>{new Date(fight.date+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})} <span className="fdc-muted">· {fight.venue}</span></strong></div><div><span className="fdc-kicker">PROFILE COVERAGE</span><strong>{info.verified}/{info.total} available fields <button type="button" onClick={()=>setExpanded(x=>!x)} aria-expanded={expanded} aria-label="Explain evidence coverage"><Info size={13}/></button></strong></div><button type="button" className="fdc-telemetry-toggle" aria-controls="fdc-quick-stats" aria-expanded={showStats} onClick={()=>setShowStats(x=>!x)}><BarChart3 size={14}/>{showStats?'Hide career metrics':'Compare career metrics'} <ChevronDown size={14}/></button><button className="fdc-dock-action" type="button" onClick={goToModel}>Stress-test the matchup <ArrowRight size={15}/></button></div>
  {expanded&&<p className="fdc-coverage-note">Coverage counts published professional records, reach, height and stance for both fighters, plus an editorial scouting brief. It does not measure prediction accuracy or statistical confidence.</p>}
  <div className="fdc-mini-grid" id="fdc-quick-stats" hidden={!showStats}>
   <BriefMetric title="KO WIN SHARE" left={fighters[0].stats?.finish} right={fighters[1].stats?.finish} format={pct} explain={lensMeta.power.description}/>
   <BriefMetric title="REACH" left={fighters[0].reachIn} right={fighters[1].reachIn} format={n=>n+' in'} explain={lensMeta.range.description}/>
   <BriefMetric title="CAREER WIN SHARE" left={fighters[0].stats?.winshare} right={fighters[1].stats?.winshare} format={pct} explain={lensMeta.form.description}/>
   <div className="fdc-metric-sources"><span>VERIFY PROFILE DATA</span>{fighters.map((f,i)=>f.sources[0]?<a key={f.name} href={f.sources[0]} target="_blank" rel="noopener noreferrer">{i===0?'Red corner':'Blue corner'} source <ExternalLink size={12}/></a>:<span key={f.name}>{f.name}: source pending</span>)}</div>
  </div>
  <div className="fdc-stage-bottom"><div className="fdc-view-switch" role="group" aria-label="What to read first"><button type="button" className={detail==='tactical'?'active':''} onClick={()=>setDetail('tactical')}>The tactical question</button><button type="button" className={detail==='fact'?'active':''} onClick={()=>setDetail('fact')}>The data limits</button></div>{detail==='tactical'?<p>{scouting?.thesis||'This pairing is listed on the verified calendar. Our tactical verdict is withheld until its evidence has been reviewed.'}</p>:<p>These career figures are snapshots, not opponent-adjusted analytics. Punch averages, defensive efficiency and likely knockout rounds are not available from an authorised historical feed yet.</p>}</div>
 </div>;
}
function ResearchView({fight,fighters,scouting,selectedPins,onTogglePin,onNext}){
 const [selected,setSelected]=useState(0);
 const [angle,setAngle]=useState('weapon');
 const [activeFighter,setActiveFighter]=useState(0);
 const questions=scouting?.keys||[];
 const captions={weapon:'Signature weapon',opportunity:'Path to victory',danger:'Key vulnerability'};
 const secondary=simulations[fight.id]||[];
 const tactic=secondary[selected]||null;
 const chooseFactor=i=>{setSelected(i);setAngle('weapon')};
 return <div className="fdc-panel fdc-research">
  <div className="fdc-panel-title"><div><p className="fdc-kicker">01 / READ THE MATCHUP</p><h2>See the fight before it happens.</h2></div><span className="fdc-panel-side"><Compass size={16}/> INTERACTIVE SCOUTING ROOM</span></div>
  <p className="fdc-scout-mission">Select a <strong>tactical factor</strong> to explore the ring, the key exchanges and the vulnerabilities on either side. The blueprint is an illustration, not tracking data.</p>
  {scouting?<><div className="fdc-scout-lab">
    <TacticalBlueprint fighters={fighters} fightId={fight.id} scenes={secondary} active={selected} onSelect={chooseFactor}/>
    <div className="fdc-factor-list">{questions.map((q,i)=><button className={selected===i?'selected':''} aria-pressed={selected===i} type="button" key={i} onClick={()=>chooseFactor(i)}><span>0{i+1}</span><strong>{secondary[i]?.name||'Fight factor '+(i+1)}</strong><small>{q}</small><ArrowUpRight size={15}/></button>)}</div>
   </div>
   <div className="fdc-scout-story">
    <div className="fdc-scout-readout" key={selected}>
      <p className="fdc-kicker">TACTICAL READOUT / 0{selected+1}</p>
      <h3>{tactic?.lead||questions[selected]}</h3>
      <p>{tactic?.body||questions[selected]}</p>
      <div className="fdc-watchline"><Target size={17}/><span><strong>WHAT TO WATCH:</strong> {tactic?.trigger||'Watch how each fighter handles this key exchange.'}</span></div>
      <PinCurrentFactor factor={questions[selected]} selected={selected} pinned={selectedPins.includes(selected)} onToggle={onTogglePin}/>
    </div>
    <div className="fdc-scout-console">
      <div className="fdc-scout-console-header"><span>FIGHTER INTELLIGENCE</span><small>SELECT A CORNER</small></div>
      <div className="fdc-corner-switch" role="group" aria-label="Select fighter to analyse">{fighters.map((f,i)=><button key={f.name} type="button" aria-pressed={activeFighter===i} onClick={()=>setActiveFighter(i)}><strong>{f.name}</strong>{i===activeFighter&&<Check size={14}/>}</button>)}</div>
      <div className="fdc-fighter-toggle" role="group" aria-label="Technical scouting angle">{['weapon','opportunity','danger'].map(key=><button key={key} type="button" aria-pressed={angle===key} className={angle===key?'active':''} onClick={()=>setAngle(key)}>{captions[key]}</button>)}</div>
      <div className="fdc-scout-discovery" role="status" aria-live="polite" key={activeFighter+'-'+angle}>
        <span>{fighters[activeFighter]?.name} / {captions[angle].toUpperCase()}</span>
        <p>{scouting.fighters[fighters[activeFighter]?.name]?.[angle]||'This specific tactical claim is awaiting editorial verification.'}</p>
      </div>
    </div>
   </div>
   <details className="fdc-citations"><summary>Evidence behind the tactical readout <ChevronDown size={16}/></summary>{scouting.evidence.map((e,i)=><p key={i}><strong>{e.label}:</strong> {e.detail} <a href={e.url} target="_blank" rel="noopener noreferrer">Source <ExternalLink size={12}/></a></p>)}</details>
   </>:<div className="fdc-lab-empty"><Database size={25}/><h3>Technical preview awaiting source review</h3><p>We would rather leave a matchup unrated than manufacture a breakdown from a fighter’s record.</p></div>}
  <OfficialVideoPanel fight={fight}/>
  <div className="fdc-form-ribbon"><span><Activity size={15}/> VERIFIED RESULT SNAPSHOT</span>{fighters.map(f=><div key={f.name}><strong>{f.name}</strong>{verifiedRecentFights[f.name]?.length?<a href={verifiedRecentFights[f.name][0].source} target="_blank" rel="noopener noreferrer">{verifiedRecentFights[f.name][0].result} against {verifiedRecentFights[f.name][0].opponent} ↗</a>:<small>Recent results awaiting verification</small>}</div>)}</div>
  <div className="fdc-panel-bottom"><span>Explore the evidence. Then test your thesis.</span><button onClick={onNext} type="button">Stress-test the matchup <ArrowRight size={16}/></button></div>
 </div>;
}

function ModelView({fight,fighters,scouting,selectedPins,onNext}){
 const [weights,setWeights]=useState({power:40,form:25,range:35});
 const [selectedScenario,setSelectedScenario]=useState(0);
 const [showMethod,setShowMethod]=useState(false);
 const model=useMemo(()=>calculateLens(fighters,weights),[fighters,weights]);
 const profile=simulations[fight.id]?.[selectedScenario];
 const tilt=model?model.score:0;
 const tiltLocation=50-Math.max(-40,Math.min(40,tilt*100));
 return <div className="fdc-panel fdc-model">
  <div className="fdc-panel-title"><div><p className="fdc-kicker">02 / INTERACTIVE STRATEGY</p><h2>Test the fight, not your bias.</h2></div><span className="fdc-panel-side"><SlidersHorizontal size={16}/> YOU CONTROL THE LENS</span></div>
  <div className="fdc-sim-layout">
   <div className="fdc-controls"><div className="fdc-control-title"><h3>Which facts matter most?</h3><button type="button" onClick={()=>setWeights({power:40,form:25,range:35})}><RotateCcw size={13}/> Reset</button></div><p>Move each slider. This reweights career metrics, not a trained prediction.</p>{Object.entries(lensMeta).map(([key,m])=><label className="fdc-slider" key={key}><span><strong>{m.label}</strong><b>{weights[key]}</b></span><input type="range" min="0" max="100" step="5" value={weights[key]} onChange={e=>setWeights(w=>({...w,[key]:Number(e.target.value)}))} aria-label={m.label+' weight'}/><small>{m.description}</small></label>)}</div>
   <div className="fdc-readout"><p className="fdc-kicker">RELATIVE PROFILE TILT <span>NOT WIN ODDS</span></p>{model?<><strong>{model.leader||'Too close on selected figures'}</strong><p>Which fighter leads on your weighted, available metrics.</p><div className="fdc-tilt-track"><span className="fdc-tilt-center"/><i style={{left:tiltLocation+'%'}}/></div><div className="fdc-tilt-label"><span>{fighters[0].name}</span><span>{fighters[1].name}</span></div><div className="fdc-model-factors"><div className="fdc-factor-axis"><span>{fighters[0].name.split(' ').at(-1)}</span><span>RELATIVE ADVANTAGE</span><span>{fighters[1].name.split(' ').at(-1)}</span></div>{model.rows.map(row=><div className="fdc-factor-magnitude" key={row.metric}><div className="fdc-factor-head"><span>{lensMeta[row.metric].label}</span><b>{row.lead==='Neither'?'LEVEL':row.lead}</b></div><div className="fdc-factor-scale" role="img" aria-label={lensMeta[row.metric].label+': '+(row.lead==='Neither'?'roughly level':'leans '+row.lead)+' on the selected input'}><span className="fdc-factor-zero"/><i style={{left:(50-Math.max(-45,Math.min(45,row.difference*45)))+'%'}}/></div></div>)}</div></>:<p className="fdc-unavailable">Insufficient common data. Raise the weights on documented metrics to compare.</p>}<button type="button" onClick={()=>setShowMethod(x=>!x)} aria-expanded={showMethod} className="fdc-method-link">How is this calculated? <ChevronDown size={14}/></button>{showMethod&&<p className="fdc-method-note">For each available metric, (fighter A − fighter B) / max(A, B, 1), multiplied by its selected weight and divided by the total active weight. This is a descriptive comparison, not a calibrated probability, and does not consider opponent quality, injury, age or fighting style.</p>}</div>
  </div>
  {selectedPins.length>0&&scouting&&<aside className="fdc-review-strip"><BookmarkCheck size={19}/><div><strong>YOUR SCOUTING QUESTIONS</strong><p>{selectedPins.filter(i=>scouting.keys[i]).map(i=>scouting.keys[i]).join('  ·  ')}</p></div></aside>}
  <div className="fdc-what-if"><p className="fdc-kicker">FIGHT SCRIPT / WHAT COULD CHANGE THE OUTCOME?</p><div className="fdc-what-tabs">{['Early pressure','Distance control','Late exchanges'].map((name,i)=><button type="button" className={i===selectedScenario?'active':''} onClick={()=>setSelectedScenario(i)} key={name}>{simulations[fight.id]?.[i]?.short||name}</button>)}</div><div className="fdc-what-body"><Zap size={22}/><div><strong>{profile?.lead||'No reviewed scenario yet'}</strong><p>{profile?.body||'We will only model tactical scenarios after a named-source review of this fight.'}</p></div></div></div>
  <div className="fdc-feed-status"><Database size={19}/><div><strong>PUNCH TELEMETRY IS NOT CONNECTED</strong><p>Rounds, accurate jab frequency and stoppage-round likelihood need a licensed, validated historical feed. They are never inferred from win-loss records.</p></div><span>DATA PIPELINE / PENDING</span></div>
  <div className="fdc-panel-bottom"><span>Explore the data. Record your view.</span><button onClick={onNext} type="button">Next: make your call <ArrowRight size={16}/></button></div>
 </div>;
}
function DecisionView({fight,fighters,scouting,selectedPins,onRemovePin,onReset}){
 const key='aura-fight-lab-decisions';
 const [saved,setSaved]=useState(()=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}});
 const savedPick=saved[fight.id]||{};
 const [pick,setPick]=useState(savedPick.pick||'');
 const [confidence,setConfidence]=useState(savedPick.confidence||'undecided');
 const [why,setWhy]=useState(savedPick.why||'');
 const [copied,setCopied]=useState(false);
 const choose=name=>setPick(name);
 const store=()=>{if(!pick)return;const next={...saved,[fight.id]:{pick,confidence,why,updatedAt:new Date().toISOString()}};try{localStorage.setItem(key,JSON.stringify(next))}catch{}setSaved(next)};
 const share=()=>{const text='AURA Fight Lab: '+fight.name+' — my pick: '+(pick||'undecided')+'. '+(why||'What is your read?')+' https://www.aurafightclub.com/verdict?fight='+fight.id;if(navigator.share){navigator.share({title:'My AURA Fight Lab pick',text}).catch(()=>{})}else if(navigator.clipboard?.writeText){navigator.clipboard.writeText(text).then(()=>setCopied(true)).catch(()=>setCopied(false))}};
 return <div className="fdc-panel fdc-decision">
  <div className="fdc-panel-title"><div><p className="fdc-kicker">03 / THE VERDICT</p><h2>Make an informed call.</h2></div><span className="fdc-panel-side"><Target size={16}/> YOUR PERSONAL CORNER</span></div>
  <FightNotebook fight={fight} scouting={scouting} selected={selectedPins} onRemove={onRemovePin} onBack={onReset}/>
  <div className="fdc-decision-layout"><div className="fdc-pick-box"><p>WHO DO YOU THINK WINS?</p><div className="fdc-pick-options">{fighters.map(f=><button className={pick===f.name?'selected':''} onClick={()=>choose(f.name)} type="button" key={f.name}><span>{f.name}</span>{pick===f.name?<Check size={18}/>:<ArrowUpRight size={17}/>}</button>)}</div><div className="fdc-confidence"><p>YOUR PERSONAL CONFIDENCE</p><div>{[['low','Uncertain'],['medium','Somewhat'],['high','Confident']].map(([id,text])=><button type="button" key={id} className={confidence===id?'active':''} onClick={()=>setConfidence(id)}>{text}</button>)}</div></div><label className="fdc-reason">WHAT CONVINCED YOU?<textarea value={why} onChange={e=>setWhy(e.target.value.slice(0,240))} maxLength={240} rows={3} placeholder="e.g. The jab, pressure in the middle rounds, or a matchup weakness…"/><small>{why.length}/240 · Stored only on your device</small></label><button className="fdc-save" type="button" disabled={!pick} onClick={store}>{savedPick.pick===pick&&pick?'Update my selection':'Save my selection'} <BookmarkCheck size={17}/></button>{savedPick.pick&&<p className="fdc-saved"><CheckCircle2 size={16}/> Saved: {savedPick.pick}</p>}</div>
   <div className="fdc-aura-call"><span className="fdc-kicker">AURA EDITORIAL VIEW</span><h3>{scouting?'Our technical reading':'Analysis not ready'}</h3><p className="fdc-editorial-lean">{scouting?.editorialLean||'AURA is not publishing a verdict until the underlying bout research is complete.'}</p><p>{scouting?.confidence||'We have not run a calibrated probability model for this matchup.'}</p><div className="fdc-decision-why"><strong>What the evidence cannot yet tell us</strong><ul><li>Reliable opponent-adjusted punch efficiency</li><li>Calibrated win probability or most likely KO round</li><li>Live bookmaker odds or market value</li></ul></div><div className="fdc-share-actions"><button type="button" onClick={share}>Share my read <ArrowUpRight size={15}/></button>{copied&&<span>Copied</span>}<Link to={'/fights/'+fight.id}>Fight details <ArrowRight size={15}/></Link></div></div></div>
   <section className="fdc-partners"><div><span className="fdc-kicker">18+ / SEPARATE COMMERCIAL INFORMATION</span><h3>Market watch & partner offers</h3><p>Compare licensed bookmakers and their verified markets here once partner approval, territorial checks, current odds and age safeguards are in place. Editorial analysis and betting promotions remain separate.</p></div><div className="fdc-partners-ready"><span><LockKeyhole size={17}/> OFFERS NOT ACTIVATED</span><p>No bookmaker affiliation or live prices connected. No affiliate relationships implied.</p><Link to="/commercial-policy">Affiliate disclosures <ArrowUpRight size={13}/></Link></div></section>
  <div className="fdc-panel-bottom"><span>Analysis is not a guarantee. No pressure to place a bet.</span><button type="button" onClick={onReset}>Revisit the evidence <ArrowRight size={16}/></button></div>
 </div>;
}
function PunchStatusBar(){const active=punchDataContract.licensedForDisplay&&punchDataContract.provider;return <span className={'fdc-status '+(active?'active':'')}><span/> {active?'Licensed data connected':'Punch feed / pending licence'}</span>}
export default function FightDecisionCockpit(){
 const [params,setParams]=useSearchParams();
 const routeFight=params.get('fight');
 const fight=allFights.find(f=>f.id===routeFight)||allFights[0];
 const [stage,setStage]=useState('scout');
 const [pinsByFight,setPinsByFight]=useState(()=>{try{const item=JSON.parse(localStorage.getItem('aura-fight-evidence-pins-v1')||'{}');return item&&typeof item==='object'&&!Array.isArray(item)?item:{}}catch{return {}}});
 useEffect(()=>{try{localStorage.setItem('aura-fight-evidence-pins-v1',JSON.stringify(pinsByFight))}catch{}},[pinsByFight]);
 const fighters=useMemo(()=>fight?fight.fighters.map(fighterByName):[],[fight]);
 const scouting=fight?fightLabScouting[fight.id]:null;
 const selectedPins=fight&&Array.isArray(pinsByFight[fight.id])?pinsByFight[fight.id]:[];
 const togglePin=index=>{if(!fight||!scouting?.keys?.[index])return;setPinsByFight(previous=>{const values=Array.isArray(previous[fight.id])?previous[fight.id]:[];const next=values.includes(index)?values.filter(value=>value!==index):[...values,index].sort((a,b)=>a-b);return {...previous,[fight.id]:next}})};
 const navigateFight=id=>{setParams({fight:id});setStage('scout')};
 const setScreen=(screen,scroll=false)=>{setStage(screen);if(scroll&&typeof window!=='undefined')window.requestAnimationFrame(()=>document.getElementById('fdc-analysis-steps')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}))};
 const stages=[{id:'scout',number:'01',label:'Decode the matchup',icon:ScanLine},{id:'model',number:'02',label:'Test your assumptions',icon:SlidersHorizontal},{id:'decision',number:'03',label:'Make your call',icon:ClipboardCheck}];
 return <><PageSEO title="AURA Fight Lab | Interactive Boxing Matchup Intelligence" description="An interactive boxing research cockpit: evidence-backed technical scouting, fighter comparisons, tactical scenarios and your personal decision. No fabricated punch data or predictions." canonicalPath="/verdict"/><Header/><main className="fdc-page">
  <div className="fdc-shell">
   <div className="fdc-topbar"><div className="fdc-topbar-brand"><span className="fdc-brand-mark"><Target size={17}/></span><span>FIGHT <strong>INTELLIGENCE</strong></span><i>/</i><span>THE DECISION LAB</span></div><PunchStatusBar/></div>
   <div className="fdc-intro"><div><p className="fdc-kicker">BEYOND PREDICTIONS / INSIDE THE MATCHUP</p><h1>READ THE FIGHT.<br/><em>OWN THE CALL.</em></h1><p>Explore the evidence, challenge the matchup and form your own verdict. No invented punch numbers. No black-box picks.</p><div className="fdc-intro-actions"><button type="button" onClick={()=>setScreen('scout',true)}>Explore the ring blueprint <ArrowRight size={15}/></button><button type="button" onClick={()=>setScreen('decision',true)}>Make your call <ArrowUpRight size={15}/></button></div></div><span className="fdc-intro-tag">ANALYSIS DESK<br/>EDITION 001 <span>↗</span></span></div>
   {fight?<><div className="fdc-selector-head"><span>SELECT YOUR MATCHUP</span><small>{allFights.length} scheduled fights · editorially reviewed event dates</small></div><div className="fdc-fight-rail" role="group" aria-label="Choose an upcoming boxing fight">{allFights.map((f,i)=><button type="button" aria-pressed={fight.id===f.id} onClick={()=>navigateFight(f.id)} key={f.id}><span className="fdc-rail-id">{String(i+1).padStart(2,'0')} / {new Date(f.date+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span><strong>{f.fighters[0]} <span>vs</span> {f.fighters[1]}</strong><small>{f.division} · {fightLabScouting[f.id]?'SCOUTING READY':'PROFILE DATA'}</small></button>)}</div>
   <FightStage key={fight.id} fight={fight} fighters={fighters} scouting={scouting} goToModel={()=>setScreen('model',true)}/>
   <nav className="fdc-workflow" id="fdc-analysis-steps" aria-label="Analysis workflow">{stages.map((item,i)=>{const Icon=item.icon;return <button type="button" key={item.id} aria-current={stage===item.id?'step':undefined} className={stage===item.id?'active':''} onClick={()=>setScreen(item.id)}><span>{item.number}</span><Icon size={18}/><strong>{item.label}</strong><ArrowRight className="fdc-step-arrow" size={16}/></button>})}</nav>
   {stage==='scout'?<ResearchView key={fight.id} fight={fight} fighters={fighters} scouting={scouting} selectedPins={selectedPins} onTogglePin={togglePin} onNext={()=>setScreen('model',true)}/>:stage==='model'?<ModelView key={fight.id} fight={fight} fighters={fighters} scouting={scouting} selectedPins={selectedPins} onNext={()=>setScreen('decision',true)}/>:<DecisionView key={fight.id} fight={fight} fighters={fighters} scouting={scouting} selectedPins={selectedPins} onRemovePin={togglePin} onReset={()=>setScreen('scout',true)}/>}
   </>:<div className="fdc-empty"><h2>No upcoming verified matchups</h2><p>The decision lab opens when a new card has been added to the verified calendar.</p><Link to="/fight-hub">Explore Fight Hub <ArrowRight size={16}/></Link></div>}
   <div className="fdc-bottomline"><span><ShieldCheck size={17}/> Every metric should have a provenance trail. Data gaps remain visible.</span><span>Event list checked {edition.checkedAt} · <Link to="/editorial-policy">How we work ↗</Link></span></div>
  </div>
 </main><Footer/></>;
}
