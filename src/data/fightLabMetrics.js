/**
 * Pure, testable and intentionally descriptive boxing career metrics.
 * These values are not opponent-adjusted, not probabilities and not wagering odds.
 */
const FRACTIONS={'¼':.25,'½':.5,'¾':.75};
export function inchesFromText(value){
 const match=String(value||'').match(/(\d+(?:[.,]\d+)?)([¼½¾])?\s*in\b/i);
 if(!match)return null;
 const parsed=Number(match[1].replace(',','.'))+(FRACTIONS[match[2]]||0);
 return Number.isFinite(parsed)?parsed:null;
}

export function parseCareerRecord(record){
 const match=String(record||'').match(/^\s*(\d+)\s*[-–—]\s*(\d+)(?:\s*[-–—]\s*(\d+))?\s*\(\s*(\d+)\s*KOs?\s*\)/i);
 if(!match)return null;
 const wins=Number(match[1]),losses=Number(match[2]),draws=Number(match[3]||0),kos=Number(match[4]);
 if(wins+losses+draws===0||kos>wins)return null;
 return {wins,losses,draws,kos,total:wins+losses+draws,finish:wins?100*kos/wins:null,winshare:100*wins/(wins+losses+draws)};
}

export function metricValue(fighter,metric){
 if(!fighter)return null;
 const value=metric==='power'?fighter.stats?.finish:metric==='form'?fighter.stats?.winshare:metric==='range'?fighter.reachIn:null;
 return typeof value==='number'&&Number.isFinite(value)?value:null;
}

export function compareBoxingProfiles(fighters,weights){
 if(fighters?.length!==2||!weights)return null;
 const entries=Object.entries(weights).filter(([name,weight])=>Number.isFinite(weight)&&weight>0&&fighters.every(f=>metricValue(f,name)!=null));
 const totalWeight=entries.reduce((sum,[,weight])=>sum+weight,0);
 if(!totalWeight)return null;
 const rows=entries.map(([metric,weight])=>{
  const a=metricValue(fighters[0],metric),b=metricValue(fighters[1],metric);
  const difference=(a-b)/Math.max(Math.abs(a),Math.abs(b),1);
  const lead=Math.abs(difference)<.012?'Neither':difference>0?fighters[0].name:fighters[1].name;
  return {metric,weight,difference,contribution:weight*difference/totalWeight,lead};
 });
 const score=rows.reduce((sum,row)=>sum+row.contribution,0);
 return {rows,score,leader:Math.abs(score)<.015?null:score>0?fighters[0].name:fighters[1].name};
}

/** Left fighter has a positive score; left-aligned marker must move LEFT. */
export function indicatorPosition(score){
 if(!Number.isFinite(score))return 50;
 return 50-Math.max(-40,Math.min(40,score*100));
}
