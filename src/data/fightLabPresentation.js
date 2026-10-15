/**
 * Fight Lab presentation/data boundary.
 * No estimated bouts, inferred combat metrics, odds or round probabilities.
 * These helpers are pure for deterministic Node testing.
 */
export function getCalendarDate(now=new Date(),timeZone='Atlantic/Canary'){
 const fields=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{
  timeZone,year:'numeric',month:'2-digit',day:'2-digit'
 }).formatToParts(now).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
 return [fields.year,fields.month,fields.day].join('-');
}

export function upcomingFightCards(fights,today){
 const validDate=/^\d{4}-\d{2}-\d{2}$/;
 return (Array.isArray(fights)?fights:[]).filter(f=>
  f && f.status==='Scheduled' && validDate.test(f.date||'') &&
  f.date>=today && Array.isArray(f.fighters) && f.fighters.length===2
 ).sort((a,b)=>a.date.localeCompare(b.date));
}

export function getDocumentedResults(name,results,cutoffDate){
 const items=Array.isArray(results?.[name])?results[name]:[];
 return items.filter(x=>
  x && /^\d{4}-\d{2}-\d{2}$/.test(x.date||'') &&
  x.date<cutoffDate && ['W','L','D'].includes(x.result) &&
  /^https:\/\//.test(x.source||'') && x.opponent
 ).sort((a,b)=>b.date.localeCompare(a.date));
}

export function createDecisionBrief({
 fight, fighters, pick='', confidence='undecided', reason='',
 selectedQuestions=[], model=null
}={}){
 const headline='AURA Fight Lab | '+(fight?.name||'Matchup');
 const fighterNames=(fighters||[]).map(f=>f.name);
 const lines=[
  headline,
  'My pick: '+(fighterNames.includes(pick)?pick:'Undecided'),
  'My confidence: '+({low:'Uncertain',medium:'Somewhat confident',high:'Confident'}[confidence]||'Not selected')
 ];
 const cleanReason=String(reason||'').trim().replace(/\s+/g,' ').slice(0,240);
 if(cleanReason)lines.push('Reasoning: '+cleanReason);
 const validQuestions=(Array.isArray(selectedQuestions)?selectedQuestions:[]).filter(x=>typeof x==='string'&&x.trim()).slice(0,5);
 if(validQuestions.length)lines.push('Questions I am watching:\n'+validQuestions.map(x=>'• '+x).join('\n'));
 if(model?.rows?.length){
  lines.push('Career profile comparison: '+(model.leader||'Near level on selected metrics')+
   ' (illustrative weighting; NOT win odds)');
 }else{
  lines.push('Career profile comparison: insufficient common data to rank');
 }
 const references=[...new Set([fight?.sourceUrl,...(fighters||[]).flatMap(f=>f.sources||[])].filter(url=>typeof url==='string'&&/^https:\/\//.test(url)))].slice(0,6);
 if(references.length)lines.push('Sources to review:\n'+references.map(url=>'• '+url).join('\n'));
 lines.push('AURA commentary is not a calibrated win prediction. Verify each fighter record and source independently.');
 return lines.join('\n\n');
}
