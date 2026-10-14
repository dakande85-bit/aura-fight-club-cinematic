import fs from 'node:fs';
import {fighters} from '../src/data/seoEntities.js';
import {fighterPhotography,fightPhotography} from '../src/data/boxingPhotography.js';
const fights=JSON.parse(fs.readFileSync('public/news/fights.json','utf8')).fights;
const errors=[];
const rightsPending=[];
const missingSource=[];
const uncheckedRecords=[];
const seen=new Map();
function validSource(source) {
 if(typeof source!=='string'||!source)return false;
 if(source.startsWith('/'))return fs.existsSync('public'+source);
 try {return new URL(source).protocol==='https:'} catch{return false}
}
function audit(kind,id,photo) {
 if(!photo?.src){errors.push(kind+' '+id+': no image assigned');return;}
 if(!validSource(photo.src))errors.push(kind+' '+id+': missing local asset or invalid HTTPS image');
 if(!photo.alt?.trim())errors.push(kind+' '+id+': no descriptive image alt text');
 if(!photo.credit?.trim())errors.push(kind+' '+id+': no photo credit');
 if(photo.src.startsWith('https:')&&!photo.sourceUrl)missingSource.push(kind+' '+id);
 if(/not established|not verified|permission required|rights pending|see source/i.test(photo.license||''))rightsPending.push(kind+' '+id);
 if(kind==='fighter'){
  if(seen.has(photo.src))errors.push('Identical portrait assigned to '+seen.get(photo.src)+' and '+id);
  seen.set(photo.src,id);
 }
}
for(const f of fighters.filter(f=>!f.editorialHidden)){
 audit('fighter',f.slug,fighterPhotography[f.slug]);
 if(f.record&&!f.recordSource)uncheckedRecords.push(f.slug);
}
for(const fight of fights) audit('fight',fight.id,fightPhotography[fight.id]);
console.log('AURA image registry audit: '+fighters.filter(f=>!f.editorialHidden).length+' editorial fighters / '+fights.length+' scheduled and archived fights / '+errors.length+' errors.');
console.log('Rights review queue: '+rightsPending.length+' assets. Missing source links: '+missingSource.length+'. Record snapshots without source links: '+uncheckedRecords.length+'.');
for(const issue of errors)console.error('MEDIA ERROR '+issue);
if(errors.length)process.exitCode=1;
