import fs from 'node:fs';
const photos=fs.readFileSync('src/data/boxingPhotography.js','utf8');
const fighters=fs.readFileSync('src/data/seoEntities.js','utf8');
const fighterBlock=photos.split('export const fighterPhotography=')[1]?.split('export const fightPhotography=')[0]||'';
const fighterEntries=[...fighterBlock.matchAll(/'([^']+)':\{src:'([^']+)',alt:'([^']+)'/g)].map(m=>({slug:m[1],src:m[2],alt:m[3]}));
const knownSlugs=[...fighters.matchAll(/slug:'([^']+)',name:/g)].map(m=>m[1]);
const map=new Map();
for(const p of fighterEntries){if(!map.has(p.src))map.set(p.src,[]);map.get(p.src).push(p.slug)}
const duplicates=[...map.values()].filter(x=>x.length>1);
const missing=knownSlugs.filter(x=>!fighterEntries.some(f=>f.slug===x));
console.log('Fighter photography coverage: '+fighterEntries.length+'/'+knownSlugs.length);
console.log('Fighters without designated photography: '+missing.join(', '));
for(const d of duplicates)console.warn('REVIEW: same photograph used in multiple boxer profiles: '+d.join(' / '));
for(const entry of fighterEntries)if(/ and | versus | vs | together | with | alongside /i.test(entry.alt))console.warn('REVIEW: image contains multiple people: '+entry.slug);
console.log('This audit flags review candidates; it does not establish licensing or visual identity.');
