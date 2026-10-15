#!/usr/bin/env node
// Download explicitly CC-licensed, source-documented boxer photos for a review-only branch.
// This is not permission to scrape fight photography from promoters or news websites.
import {createHash} from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const sources=JSON.parse(await fs.readFile('data/tiktok-photo-licences.json','utf8')).sources;
const dir='public/news/tiktok/source-media';
await fs.mkdir(dir,{recursive:true});
for(const source of sources) {
  if(!['CC BY 4.0','CC BY-SA 4.0'].includes(source.license) ||
    !source.sourcePage.startsWith('https://commons.wikimedia.org/wiki/File:'))
    throw new Error('Unapproved licensed media source: '+source.id);
  const name=source.filename;
  if(!/^[\w().-]+$/.test(name))throw new Error('Unexpected filename');
  const md5=createHash('md5').update(name).digest('hex');
  const urls=[
    'https://upload.wikimedia.org/wikipedia/commons/'+md5.slice(0,1)+'/'+md5.slice(0,2)+'/'+encodeURIComponent(name),
    'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(name)
  ];
  const target=path.join(dir,source.localFile);
  let loaded=false, lastError='';
  for(const url of urls) {
    try {
      const resp=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(20000),
       headers:{'User-Agent':'AuraFightClubEditorial/1.0 (licensed-source verification)'}});
      if(!resp.ok)throw new Error('HTTP '+resp.status);
      const data=Buffer.from(await resp.arrayBuffer());
      if(data.length<15_000 || data.length>13_000_000 || data[0]!==0xff || data[1]!==0xd8)
        throw new Error('Invalid JPEG data or size: '+data.length);
      await fs.writeFile(target,data);
      console.log('Downloaded '+source.id+' ('+data.length+' bytes), licence '+source.license);
      loaded=true;break;
    }catch(error){lastError=error.message;}
  }
  if(!loaded)throw new Error('Failed to acquire '+source.id+' from Commons: '+lastError);
}
