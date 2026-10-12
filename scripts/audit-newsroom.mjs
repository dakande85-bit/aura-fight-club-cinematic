import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// Grandfather old copy for reporting, but enforce editorial quality on every new/changed story.
const edition=JSON.parse(fs.readFileSync('public/news/articles.json','utf8'));
const flags=new Set(process.argv.slice(2));
const editorialSignature=a=>JSON.stringify({title:a.title,summary:a.summary,body:a.body,category:a.category,articleType:a.articleType,source:a.source,sourceUrl:a.sourceUrl,sources:a.sources});
let previous=new Map();
if(flags.has('--changed')){
 try{const before=JSON.parse(execFileSync('git',['show','HEAD^:public/news/articles.json'],{encoding:'utf8'}));previous=new Map(before.articles.map(a=>[a.slug,editorialSignature(a)]));}
 catch{console.warn('Previous edition unavailable; auditing all stories.');}
}
const words=a=>(a.body||[]).filter(x=>!String(x).startsWith('## ')).join(' ').trim().split(/\s+/).filter(Boolean).length;
const minimum=a=>/reaction|post-fight/i.test(a.category||'')||a.coverageStage==='Reaction'?550:a.articleType==='Analysis'||/deep dive|prediction|fight lab/i.test(a.category||'')?475:300;
const issues=[];let checked=0;
for(const a of edition.articles){
 if(flags.has('--changed')&&previous.get(a.slug)===editorialSignature(a))continue;
 checked++;const errors=[];const count=words(a);
 if(count<minimum(a))errors.push(count+' words; minimum '+minimum(a));
 const urls=[a.sourceUrl,...(a.sources||[]).map(x=>x.url)].filter(Boolean);
 const hosts=new Set(urls.map(u=>{try{return new URL(u).hostname.replace(/^www\./,'')}catch{return ''}}).filter(Boolean));
 if(hosts.size<2)errors.push('fewer than two independent source domains');
 if(!a.image?.src||!a.image?.alt||!a.image?.credit)errors.push('missing image, accurate alt, or credit');
 if(a.image?.src?.includes('aurafightclub.com/news/media/')){
  const asset=path.join('public/news/media',path.basename(new URL(a.image.src).pathname));
  if(!fs.existsSync(asset))errors.push('local artwork does not exist: '+asset);
 }
 if((a.body||[]).filter(x=>String(x).startsWith('## ')).length<2&&count>=475)errors.push('needs two useful subheadings');
 const body=(a.body||[]).join(' ').toLowerCase();
 if(/aura verdict:|## the aura verdict|## aura verdict/i.test(body))errors.push('template verdict ending');
 if((a.body||[]).filter(x=>!String(x).startsWith('## ')).some(x=>String(x).length<30))errors.push('filler paragraph');
 if(/\brumou?r(s|ed)?\b|\bin talks\b|\breportedly\b/i.test(a.title+' '+a.summary)&&!/rumou?r|talks|reported|not signed|not confirmed|no official/i.test(body))errors.push('rumour status absent from body');
 if(errors.length)issues.push({slug:a.slug,errors});
}
const under250=edition.articles.filter(a=>words(a)<250).length,under400=edition.articles.filter(a=>words(a)<400).length;
console.log(JSON.stringify({total:edition.articles.length,checked,under250,under400,failed:issues.length,issues},null,2));
if(flags.has('--strict')&&issues.length)process.exitCode=1;
