import fs from 'node:fs';
import path from 'node:path';
import {validateArticle} from '../src/lib/articleSchema.js';

// Runs in GitHub Actions. Requires OPENAI_API_KEY in Actions secrets.
const dry=process.argv.includes('--dry-run');
const now=new Intl.DateTimeFormat('en-CA',{timeZone:'Atlantic/Canary',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const earliest=new Date(Date.parse(now+'T12:00:00Z')-5*86400000).toISOString().slice(0,10);
const edition=JSON.parse(fs.readFileSync('public/news/articles.json','utf8'));
const calendar=JSON.parse(fs.readFileSync('public/news/fights.json','utf8'));
const slug=s=>String(s).normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const surname=s=>String(s).trim().split(/\s+/).at(-1);
const normal=s=>String(s).toLowerCase().replace(/[^a-z]/g,'');
const samePair=(a,b,c,d)=>[normal(a),normal(b)].sort().join('|')===[normal(c),normal(d)].sort().join('|');
const goodUrl=s=>{try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password&&!u.hostname.includes('google.')&&!u.hostname.includes('aurafightclub.com')}catch{return false}};
const host=s=>{try{return new URL(s).hostname.replace(/^www\./,'')}catch{return ''}};
const urlKey=s=>{try{const u=new URL(s);return (u.hostname+u.pathname.replace(/\/$/,'')).toLowerCase()}catch{return ''}};
const extract=r=>r.output_text||(r.output||[]).filter(x=>x.type==='message').flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('');
const parse=r=>{const s=extract(r);return JSON.parse(s.slice(s.indexOf('{'),s.lastIndexOf('}')+1))};
const citations=r=>{const links=[];for(const x of r.output||[]){if(x.type==='web_search_call')for(const s of x.action?.sources||[])links.push(s.url);for(const c of x.content||[])for(const a of c.annotations||[])if(a.url)links.push(a.url)}return new Set(links.map(urlKey).filter(Boolean))};
async function ask(prompt,web=false){
 if(!process.env.OPENAI_API_KEY)throw Error('Missing OPENAI_API_KEY in GitHub Actions secrets; publishing is disabled.');
 const body={model:process.env.AURA_AI_MODEL||'gpt-5-mini',input:[{role:'system',content:'AURA Fight Club editorial fact-checker. Do not invent any boxing results, statistics, quotes, image rights, schedules or future fights. Respond with JSON only.'},{role:'user',content:prompt}],max_output_tokens:6000};
 if(web){body.tools=[{type:'web_search',search_context_size:'high'}];body.include=['web_search_call.action.sources'];}
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),115000);
 try{const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal});
 const data=await response.json();if(!response.ok)throw Error('Model API error '+response.status+': '+JSON.stringify(data.error).slice(0,250));return data;
 }finally{clearTimeout(timer)}
}
function eventFor(f){return calendar.fights.find(e=>samePair(...(e.fighters||[]),f.fighterA,f.fighterB))}
function covered(f){
 const e=eventFor(f),last=[surname(f.fighterA).toLowerCase(),surname(f.fighterB).toLowerCase()];
 return edition.articles.some(a=>a.coverageStage==='Reaction'&&(e&&a.fightId===e.id||last.every(n=>(a.title+' '+a.slug).toLowerCase().includes(n))));
}
function check(f,seen){
 if(f.confirmed!==true||f.worldTitle!==true)return 'unconfirmed or not a full world title';
 if(!f.fighterA||!f.fighterB||!f.winner||!f.loser||!samePair(f.fighterA,f.fighterB,f.winner,f.loser)||normal(f.winner)===normal(f.loser))return 'invalid competitors or winner';
 if(!f.date||f.date<earliest||f.date>now)return 'outside last five days';
 if(!/^(UD|SD|MD|PTS|KO|TKO|RTD|DQ)$/i.test(f.method||''))return 'missing finishing method';
 if(!Array.isArray(f.belts)||!f.belts.some(x=>/WBA|WBC|IBF|WBO/i.test(x)))return 'not a major championship';
 if(!Array.isArray(f.facts)||f.facts.length<4)return 'insufficient verified fight-specific details';
 const sources=(f.sources||[]).filter(s=>s.name&&goodUrl(s.url)&&seen.has(urlKey(s.url)));
 if(new Set(sources.map(s=>host(s.url))).size<2)return 'two independent web-search sources required';
 if(covered(f))return 'already covered';
 return '';
}
function xml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function artwork(f){
 const a=xml(f.winner.toUpperCase()),b=xml(f.loser.toUpperCase()),belts=xml(f.belts.join(' / '));
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" role="img" aria-label="Original boxer result graphic, not a photograph">'+
 '<defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#1a2836"/><stop offset="1" stop-color="#06090c"/></linearGradient><pattern id="p" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" stroke="#ffffff" stroke-opacity=".07" fill="none"/></pattern></defs>'+
 '<rect width="1280" height="720" fill="url(#g)"/><rect width="1280" height="720" fill="url(#p)"/><path d="M930 0 1250 0 900 720 580 720Z" fill="#d6b16b" opacity=".12"/>'+
 '<path d="M0 0H1280" stroke="#d6b16b" stroke-width="12"/>'+
 '<g font-family="Arial,Helvetica,sans-serif" font-weight="900"><text x="65" y="98" fill="#fff" font-size="31" letter-spacing="9">AURA / FIGHT CLUB</text>'+
 '<text x="65" y="170" fill="#d6b16b" font-size="25" letter-spacing="3">POST-FIGHT REACTION</text>'+
 '<text x="65" y="235" fill="#abb2be" font-size="23">'+belts+' CHAMPIONSHIP</text>'+
 '<text x="65" y="340" fill="#fff" font-size="67">'+a+'</text><text x="65" y="400" fill="#d6b16b" font-size="26" letter-spacing="5">DEFEATS</text>'+
 '<text x="65" y="495" fill="#fff" font-size="67">'+b+'</text>'+
 '<text x="65" y="580" fill="#c0cbd2" font-size="27">'+xml(f.method+' · '+(f.round||'?')+' ROUNDS')+'</text>'+
 '<text x="65" y="680" fill="#d6b16b" font-size="21" letter-spacing="5">'+xml(f.date)+' · VERIFIED RESULT</text></g></svg>\n';
}
async function writeStory(f,id,filename){
 const facts={fighterA:f.fighterA,fighterB:f.fighterB,winner:f.winner,loser:f.loser,method:f.method,round:f.round,date:f.date,belts:f.belts,facts:f.facts};
 const prompt='You are AURA Fight Club, an exacting UK boxing ringside analyst. This article must sound knowledgeable, not like generic AI filler. Use ONLY these verified facts: '+JSON.stringify(facts)+'. Return JSON {"title":"Both fighters surnames and a distinctive reported angle", "summary":"max 240 chars", "body":["opening with a concrete fight-specific observation", "## Technical section", "substantial paragraph", ...]}. Write 650 to 850 words in 10 to 16 paragraphs with at least two informative ## subheadings. Include at least three specific fight details provided in facts, explain how a boxer won rounds or created the reported stoppage only if the evidence supports it, describe technical mechanisms as interpretation, compare each fighter\'s options and identify future tactical questions. End with a distinct argument, never a templated AURA verdict. Do not manufacture punch stats, scorecards, round-by-round actions, boxer quotes, opponents, broadcast times, source interviews, or predictions. If the evidence does not contain enough observed details, return {"error":"insufficient fight-specific detail"} instead of an article.';
 const drafted=parse(await ask(prompt));
 if(typeof drafted.title!=='string'||!Array.isArray(drafted.body)||drafted.body.length<11)throw Error('Incomplete generated article');
 const draftedWords=drafted.body.filter(t=>!String(t).startsWith('## ')).join(' ').trim().split(/\s+/).filter(Boolean).length;
 if(draftedWords<550||drafted.body.filter(t=>String(t).startsWith('## ')).length<2)throw Error('Thin or unstructured fight analysis: '+draftedWords+' words');
 const title=drafted.title.slice(0,180),summary=String(drafted.summary||'').slice(0,450);
 if(![surname(f.fighterA),surname(f.fighterB)].every(n=>normal(title).includes(normal(n))))throw Error('Headline does not identify both boxers');
 const source=f.sources[0],fightSlug=id+'-reaction-'+f.date;
 return validateArticle({slug:slug(fightSlug),title,summary,date:now,updatedAt:now,category:'Post-fight reaction',articleType:'Analysis',featured:false,priority:91,coverageStage:'Reaction',fightId:id,source:source.name,sourceUrl:source.url,sources:f.sources.slice(1,8),image:{src:'https://aurafightclub.com/news/media/'+filename,alt:'Original AURA boxing result graphic depicting the names '+f.winner+' and '+f.loser+'; not a photograph.',credit:'AURA Fight Club · original editorial design',caption:'Original post-fight results illustration, not a ringside photograph.',sourceUrl:source.url},body:drafted.body,seoTitle:title.slice(0,70),metaDescription:summary.slice(0,170),tags:['boxing','reaction',f.winner,f.loser,...f.belts].slice(0,12)});
}
function markComplete(f,id){
 const existing=eventFor(f);
 const result={winner:f.winner,loser:f.loser,method:f.method,round:f.round||null,titleOutcome:f.winner+' won the '+f.belts.join(' and ')+' world titles',sources:f.sources.map(s=>s.url),verifiedAt:now};
 if(existing){existing.status='Completed';existing.result=result;existing.updatedAt=now;return}
 calendar.fights.push({id,name:f.fighterA+' vs '+f.fighterB,fighters:[f.fighterA,f.fighterB],date:f.date,venue:f.venue||'Venue not verified',division:f.division||'Unconfirmed',status:'Completed',stakes:f.belts.join(' / ')+' championship',source:f.sources[0].name,sourceUrl:f.sources[0].url,broadcast:'Broadcast unavailable',broadcastStatus:'unverified',updatedAt:now,schedule:{timeZone:'UTC',ringWalkStatus:'unconfirmed',timingNote:'Completed contest. Start time not independently confirmed.'},result});
}
async function main(){
 const candidates=calendar.fights.filter(f=>f.date>=earliest&&f.date<=now).map(f=>({name:f.name,date:f.date,stakes:f.stakes,status:f.status}));
 const search='Today is '+now+' in Atlantic/Canary. Search the web for RESULTS of all professional FULL WBA/WBC/IBF/WBO boxing world championship fights held between '+earliest+' and '+now+' including undercard title bouts. Also verify results of calendar candidates: '+JSON.stringify(candidates)+'. No future fights. Confirm the RESULT in two independent credible reporting outlets per fight, and use URLs genuinely visited through web search. Respond in JSON {"fights":[{"fighterA":"...","fighterB":"...","winner":"...","loser":"...","date":"YYYY-MM-DD","method":"UD|SD|MD|PTS|KO|TKO|RTD|DQ","round":12,"belts":["WBA"],"worldTitle":true,"confirmed":true,"facts":["reported moment/round one","reported punch/style observation","reported tactical pattern","reported sequence supported by sources"],"sources":[{"name":"source one","url":"https://..."},{"name":"source two","url":"https://..."}],"venue":"...","division":"..."}]}. If uncertain omit the bout. Up to 12 fights.';
 const research=await ask(search,true),data=parse(research),seen=citations(research);
 if(!Array.isArray(data.fights))throw Error('Research response lacked fights[]');
 console.log('Discovered '+data.fights.length+' candidate fights; '+seen.size+' referenced URLs.');
 let count=0;
 for(const f of data.fights.slice(0,15)){
  const why=check(f,seen);if(why){console.log('SKIP '+(f.fighterA||'?')+' vs '+(f.fighterB||'?')+': '+why);continue;}
  if(count>=Math.max(1,Math.min(6,Number(process.env.AURA_MAX_ARTICLES||4))))break;
  try{
   const id=eventFor(f)?.id||slug(surname(f.fighterA)+'-'+surname(f.fighterB));
   const filename=slug(id+'-'+f.date)+'.svg';
   if(dry){console.log('DRY RUN '+f.winner+' defeats '+f.loser);count++;continue;}
   const article=await writeStory(f,id,filename);
   fs.mkdirSync('public/news/media',{recursive:true});
   fs.writeFileSync(path.join('public/news/media',filename),artwork(f));
   markComplete(f,id);edition.articles.unshift(article);count++;
   console.log('PUBLISH /news/'+article.slug);
  }catch(error){console.error('SKIP draft: '+error.message);}
 }
 if(count&&!dry){
  edition.reviewedAt=now;edition.updatedAt=new Date().toISOString();calendar.checkedAt=now;
  fs.writeFileSync('public/news/articles.json',JSON.stringify(edition,null,2)+'\n');
  fs.writeFileSync('public/news/fights.json',JSON.stringify(calendar,null,2)+'\n');
 }
 console.log('Prepared '+count+' independently sourced post-fight reactions.'+(dry?' DRY RUN':''));
}
main().catch(err=>{console.error(err);process.exitCode=1});
