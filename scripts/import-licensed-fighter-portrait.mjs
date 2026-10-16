/**
 * Ingest a fighter portrait whose reuse rights have been documented.
 * Usage:
 * npm run fighters:portrait:add -- --slug sebastian-fundora --file ./approved/fundora.jpg
 *   --credit "Photographer / Agency" --source-url https://photographer.example/photo
 *   --license-type written-permission --rights-ref CONTRACT-2026-001
 * Store the actual signed permission / proof outside the public repository.
 * This is an asset processing workflow, NOT a license procurement service.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {fighters} from '../src/data/seoEntities.js';
const root=process.cwd();
const args=process.argv.slice(2);
const opt={};
for(let i=0;i<args.length;i+=2){
 if(!/^--[a-z-]+$/.test(args[i]||'')||!args[i+1])throw Error('Expected --key value pairs');
 opt[args[i].slice(2)]=args[i+1];
}
const required=['slug','file','credit','source-url','license-type','rights-ref'];
for(const k of required)if(!opt[k])throw Error('Required option missing: --'+k);
if(!/^[a-z0-9-]+$/.test(opt.slug))throw Error('Invalid fighter slug');
const fighter=fighters.find(f=>f.slug===opt.slug&&!f.editorialHidden);
if(!fighter)throw Error('Unknown or unpublished fighter slug: '+opt.slug);
const allowed=['owned','written-permission','paid-editorial','cc-by-4.0','cc-by-sa-4.0','published-media-kit'];
if(!allowed.includes(opt['license-type']))throw Error('Unsupported license; choose '+allowed.join(', '));
if(!/^[A-Za-z0-9_.:-]{6,100}$/.test(opt['rights-ref']))throw Error('Use a 6-100 character internal rights proof reference, not a signed document or private URL');
const url=new URL(opt['source-url']);
if(url.protocol!=='https:')throw Error('A direct HTTPS publisher or rights owner source URL is required');
const input=path.resolve(opt.file);
if(!fs.existsSync(input)||!fs.statSync(input).isFile())throw Error('Source photo not found');
if(!/\.(jpe?g|png|webp|avif|tiff?)$/i.test(input))throw Error('Unsupported photograph file format');
const metadata=await sharp(input).metadata();
if(!metadata.width||!metadata.height||metadata.width<400||metadata.height<400)throw Error('Portrait must be >= 400px on both axes');
const folder=path.join(root,'public/assets/fighters/licensed');
fs.mkdirSync(folder,{recursive:true});
const publicPath='/assets/fighters/licensed/'+opt.slug+'.webp';
const destination=path.join(root,'public'+publicPath);
await sharp(input).rotate().resize({width:1200,withoutEnlargement:true}).webp({quality:82,effort:5}).toFile(destination);
const manifestPath=path.join(root,'src/data/licensedFighterPortraits.json');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
manifest[opt.slug]={
 src:publicPath,
 alt:opt.alt||('Portrait of professional boxer '+fighter.name),
 credit:opt.credit,
 sourceUrl:opt['source-url'],
 assetKind:'licensed fighter portrait',
 focus:opt.focus||'center 24%',
 license:'Rights cleared: '+opt['license-type']+' (proof ref '+opt['rights-ref']+')',
 rightsStatus:'approved',
 rightsType:opt['license-type'],
 rightsEvidenceId:opt['rights-ref'],
 approvedAt:new Date().toISOString().slice(0,10)
};
fs.writeFileSync(manifestPath,JSON.stringify(Object.fromEntries(Object.entries(manifest).sort(([a],[b])=>a.localeCompare(b))),null,2)+'\n');
console.log('Imported approved portrait:',opt.slug,'=>',publicPath,'('+Math.round(fs.statSync(destination).size/1024)+' KiB)');
console.log('Commit the optimized image and manifest entry. Keep license evidence in your private rights archive.');
