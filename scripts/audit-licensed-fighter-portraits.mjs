/** Check locally cleared boxer portraits and human-readable publication-rights metadata.
 * A manifest entry is a declaration from an editor. The signed proof of use must
 * be kept outside this public repository and reviewed before release.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fighters} from '../src/data/seoEntities.js';
import {fighterPhotography} from '../src/data/boxingPhotography.js';
import approved from '../src/data/licensedFighterPortraits.json' with {type:'json'};
const slugs=new Set(fighters.filter(f=>!f.editorialHidden).map(f=>f.slug));
const errors=[];
const approvedItems=Object.entries(approved);
const licenses=['owned','written-permission','paid-editorial','cc-by-4.0','cc-by-sa-4.0','published-media-kit'];
for(const [slug,p] of approvedItems){
 if(!slugs.has(slug))errors.push('Unpublished/unknown fighter: '+slug);
 if(!p?.src?.startsWith('/assets/fighters/licensed/')||!p.src.endsWith('.webp'))errors.push('Non-local or unoptimized photo '+slug);
 else{
  const dest=path.join('public',p.src);
  if(!fs.existsSync(dest)||!fs.statSync(dest).isFile())errors.push('Missing signed-off image file '+dest);
 }
 for(const key of ['alt','credit','sourceUrl','rightsEvidenceId','approvedAt'])if(!p[key])errors.push('Missing '+key+' for '+slug);
 if(!licenses.includes(p.rightsType))errors.push('Unknown rights type for '+slug);
 if(p.rightsStatus!=='approved')errors.push('Photo lacks explicit approval status: '+slug);
 if(fighterPhotography[slug]?.src!==p.src)errors.push('Override not active: '+slug);
}
console.log('AURA fighter portrait rights manifest: '+approvedItems.length+' approved local portraits / '+slugs.size+' public profiles. Pending external-image replacements: '+(slugs.size-approvedItems.length)+'.');
if(approvedItems.length<slugs.size)console.log('Release note: publisher-source attribution does not establish republication rights. Obtain written licensing evidence for remaining external images or show original/cleared substitutes before launch.');
for(const e of errors)console.error('RIGHTS MANIFEST ERROR '+e);
if(errors.length)process.exitCode=1;
