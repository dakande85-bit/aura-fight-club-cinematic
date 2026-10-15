import {Activity, ArrowUpRight, CalendarDays, CheckCircle2, FileSearch, Info} from 'lucide-react';
import {getDocumentedResults} from '../data/fightLabPresentation.js';

/**
 * Small, source-linked result sample. A missing fight is not treated as a loss
 * or as proof of a fighter being inactive. Never infer recent form from the record.
 */
export default function VerifiedFormTimeline({fight,fighters,results}){
 return <section className="fdc-form-timeline" aria-labelledby="fdc-form-heading">
  <div className="fdc-form-timeline-head">
   <div>
    <p className="fdc-kicker"><Activity size={13}/> FIGHT HISTORY / DOCUMENTED SAMPLE</p>
    <h3 id="fdc-form-heading">Their most recent verified results</h3>
   </div>
   <span className="fdc-form-legend"><Info size={13}/> Partial public-source coverage</span>
  </div>
  <div className="fdc-form-columns">
   {fighters.map((fighter,index)=>{
    const items=getDocumentedResults(fighter.name,results,fight.date);
    return <div className={'fdc-form-corner fdc-form-corner--'+index} key={fighter.name}>
     <header><span>{index===0?'RED':'BLUE'} CORNER</span><strong>{fighter.name}</strong><small>{items.length} dated, source-linked result{items.length===1?'':'s'} in this snapshot</small></header>
     {items.length?<ol>{items.map((entry,i)=><li key={entry.date+'-'+entry.opponent+'-'+i}>
       <span className={'fdc-form-outcome '+(entry.result==='W'?'fdc-form-outcome--win':'')}>{entry.result}</span>
       <div className="fdc-form-result"><strong>{entry.opponent}</strong><span><CalendarDays size={12}/>{new Date(entry.date+'T12:00:00Z').toLocaleDateString('en-GB',{month:'short',day:'numeric',year:'numeric'})}{entry.method?' · '+entry.method:''}</span></div>
       <a href={entry.source} target="_blank" rel="noopener noreferrer" aria-label={'Read source for '+fighter.name+' versus '+entry.opponent}><ArrowUpRight size={16}/></a>
      </li>)}</ol>:<div className="fdc-form-no-source"><FileSearch size={18}/><span>No pre-fight results in the reviewed sample. This does not imply inactivity.</span></div>}
    </div>;
   })}
  </div>
  <p className="fdc-form-limit"><CheckCircle2 size={14}/> This timeline displays only dated results entered into our source-linked editorial dataset. It is not a full BoxRec history, quality-of-opposition ranking or last-five model.</p>
 </section>;
}
