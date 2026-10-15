import {CheckCircle2, ExternalLink, FileWarning, ShieldCheck} from 'lucide-react';

/** Evidence status, not a trust score or a prediction-confidence indicator. */
const fields=[
 {key:'record',label:'Professional record',metric:'Career result'},
 {key:'reach',label:'Reach',metric:'Physical measurements'},
 {key:'stance',label:'Stance',metric:'Physical profile'}
];
function infoFor(fighter,item){
 const source=item.key==='record'?(fighter.recordSource||fighter.statSourceUrl):(fighter.statSourceUrl||fighter.recordSource);
 const checkedAt=item.key==='record'?fighter.recordCheckedAt||fighter.statsCheckedAt:fighter.statsCheckedAt||fighter.recordCheckedAt;
 const value=item.key==='record'?fighter.record:item.key==='reach'?fighter.reach:fighter.stance;
 return {source,checkedAt,value,isPresent:Boolean(value),hasSource:Boolean(source)};
}
export default function SourceLedger({fighters}){
 return <details className="fdc-source-ledger">
  <summary><span><ShieldCheck size={17}/> DATA PROVENANCE / AUDIT THE INPUTS</span><span>Inspect sources and gaps <ExternalLink size={13}/></span></summary>
  <div className="fdc-source-ledger-inner">
   <p>A career record and a reach measurement are not equally predictive. These entries identify where the published values came from; they do not certify their accuracy, recentness or opponent-adjusted significance.</p>
   <div className="fdc-source-grid">{fighters.map(f=><section key={f.name} className="fdc-source-corner">
    <h4>{f.name}</h4>
    {fields.map(item=>{const row=infoFor(f,item);return <div className="fdc-source-row" key={item.key}>
      <div className="fdc-source-row-label">{row.isPresent?<CheckCircle2 size={14}/>:<FileWarning size={14}/>}<span>{item.label}</span><strong>{row.value||'Not published in profile'}</strong></div>
      {row.source?<a href={row.source} target="_blank" rel="noopener noreferrer">Original profile <ExternalLink size={12}/></a>:<span>Source pending</span>}
      {row.checkedAt&&<small>Editorial check: {row.checkedAt}</small>}
    </div>})}
   </section>)}</div>
  </div>
 </details>;
}
