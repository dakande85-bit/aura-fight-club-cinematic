/** Non-invasive source health report for the public AURA fighter form.
 * Audits result-source URL reachability, NOT the fight outcome itself.
 * A 403/429 is inconclusive and must not be confused with a removed article.
 */
import {auraTop50} from '../src/data/auraTop50.js';
import {fighterUpcoming} from '../src/data/fighterUpcoming.js';

const sources=new Map();
for(const fighter of auraTop50)for(const bout of fighter.recentBouts||[]){
 if(!sources.has(bout.sourceUrl))sources.set(bout.sourceUrl,new Set());
 sources.get(bout.sourceUrl).add(fighter.slug);
}
for(const card of fighterUpcoming){
 if(!sources.has(card.sourceUrl))sources.set(card.sourceUrl,new Set());
 sources.get(card.sourceUrl).add('UPCOMING:'+card.id);
}
const headers={'User-Agent':'Mozilla/5.0 (compatible; AuraNewsSourceAudit/1.0)','Accept':'text/html,application/xhtml+xml,*/*;q=0.7'};
async function test([url,names]){
 try{
  const r=await fetch(url,{method:'GET',redirect:'follow',headers,signal:AbortSignal.timeout(8500)});
  if(r.body)await r.body.cancel();
  return {url,status:r.status,names:[...names],state:[404,410].includes(r.status)?'MISSING':r.status>=200&&r.status<400?'OK':'UNCONFIRMED'};
 }catch(e){return {url,status:'n/a',names:[...names],state:'UNCONFIRMED',reason:e.message};}
}
const pairs=[...sources];
const report=[];
for(let i=0;i<pairs.length;i+=10)report.push(...await Promise.all(pairs.slice(i,i+10).map(test)));
const counts=Object.fromEntries(['OK','MISSING','UNCONFIRMED'].map(x=>[x,report.filter(y=>y.state===x).length]));
console.log('AURA fighter evidence link audit:',JSON.stringify(counts),'unique links tested:',pairs.length);
for(const x of report.filter(y=>y.state!=='OK'))console.log('SOURCE '+x.state+' '+x.status+' '+x.url+' ('+x.names.join(',')+') '+(x.reason||''));
if(report.some(x=>x.state==='MISSING')){console.error('Published fighter result evidence contains definitive dead links; repair before merge.');process.exitCode=1;}
console.log('Link status is not a substitute for checking accuracy of results or licensed use of photographs.');
