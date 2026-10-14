import fs from 'node:fs';
const articles=JSON.parse(fs.readFileSync('public/news/articles.json','utf8')).articles;
const fights=JSON.parse(fs.readFileSync('public/news/fights.json','utf8')).fights;
const errors=[],notes=[],slugs=new Set(),images=new Map();
const known=new Set(fights.map(f=>f.id));
const validHttps=s=>{try{const url=new URL(s);return url.protocol==='https:'}catch{return false}};
for(const article of articles){
 const id=article.slug||'(untitled)';
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))errors.push(id+': invalid slug');
 if(slugs.has(id))errors.push(id+': duplicate story slug');slugs.add(id);
 if(!article.title||!article.date||!Array.isArray(article.body)||article.body.length===0)errors.push(id+': missing title/date/body');
 if(!validHttps(article.sourceUrl))errors.push(id+': missing HTTPS reporting source');
 if(!article.image||!validHttps(article.image.src)||!article.image.alt||!article.image.credit||!validHttps(article.image.sourceUrl))errors.push(id+': missing genuine image URL, identity description, credit or source');
 if(article.image?.src){
  if(!images.has(article.image.src))images.set(article.image.src,[]);
  images.get(article.image.src).push(id);
 }
 if(article.image?.fallbackSrc?.startsWith('/')){
  const p='public'+article.image.fallbackSrc;
  if(!fs.existsSync(p))errors.push(id+': missing local fallback '+p);
 }
 if(article.fightId&&!known.has(article.fightId))notes.push(id+': fighter article refers to fight not in calendar (may be historical)');
 const words=(article.body||[]).join(' ').trim().split(/\s+/).filter(Boolean).length;
 if(words<250&&!/archive brief|news brief/i.test(article.category||''))notes.push(id+': short feature ('+words+' words)');
 if(article.title&&/^(Breaking: )?/i.test(article.title)&&article.date<'2026-10-10')notes.push(id+': verify old breaking-news relevance');
}
for(const [url,list] of images)if(list.length>1)errors.push('Duplicate lead image URL for '+list.join(' | ')+': '+url);
console.log('AURA editorial audit: '+articles.length+' articles / '+fights.length+' fights / '+errors.length+' errors / '+notes.length+' notes');
for(const n of notes)console.warn('EDITORIAL NOTE: '+n);
for(const e of errors)console.error('ERROR: '+e);
if(errors.length)process.exitCode=1;
