import fs from 'node:fs';
const fights=JSON.parse(fs.readFileSync('public/news/fights.json','utf8')).fights;
const fighters=await import('../src/data/seoEntities.js');
let errors=[];
let warnings=[];
const validUTC=x=>typeof x==='string'&&!Number.isNaN(Date.parse(x))&&/Z$/.test(x);
const seen=new Set();
for(const f of fights){
 if(seen.has(f.id))errors.push('Duplicate event ID: '+f.id);seen.add(f.id);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(f.date)||Number.isNaN(Date.parse(f.date)))errors.push(f.id+': invalid date');
 if(!/^https:\/\//.test(f.sourceUrl||''))errors.push(f.id+': missing HTTPS event source');
 if(!f.fighters||f.fighters.length!==2)errors.push(f.id+': needs two named fighters');
 if(f.broadcastStatus==='confirmed'&&!f.broadcast)errors.push(f.id+': confirmed broadcast missing provider');
 if(f.broadcastStatus==='confirmed'&&!f.watchUrl)warnings.push(f.id+': no linked broadcaster verification');
 const sched=f.schedule||{};
 if(sched.broadcastStartUTC&&!validUTC(sched.broadcastStartUTC))errors.push(f.id+': invalid UTC card start');
 if(sched.ringWalkUTC&&!validUTC(sched.ringWalkUTC))errors.push(f.id+': invalid UTC ring walk');
 if(sched.ringWalkStatus==='confirmed'&&!sched.ringWalkUTC)errors.push(f.id+': ring walk confirmed without timestamp');
 try{new Intl.DateTimeFormat('en-GB',{timeZone:sched.timeZone||'UTC'}).format(new Date())}catch{errors.push(f.id+': invalid venue time zone')}
 if(sched.timeZone==='Europe/London'&&(/Chicago|Nevada|California|Texas|Riyadh|Düsseldorf/i.test(f.venue)))warnings.push(f.id+': venue timezone appears incorrect');
 for(const name of f.fighters||[])if(!fighters.getFighterByName(name))warnings.push(f.id+': missing fighter profile for '+name);
 if(!f.officialVideo?.sourceUrl&&f.officialVideo?.youtubeId)errors.push(f.id+': unsourced video');
}
console.log('Checked '+fights.length+' boxing events: '+errors.length+' error(s), '+warnings.length+' editorial warning(s)');
for(const w of warnings)console.warn('WARN '+w);
for(const e of errors)console.error('ERROR '+e);
if(errors.length)process.exitCode=1;
