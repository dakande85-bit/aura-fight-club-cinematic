import fs from 'node:fs/promises';
import path from 'node:path';
const assets=JSON.parse(await fs.readFile('data/aura-lookbook-import.json','utf8'));
const base='public/assets/lookbook-2026';
await fs.mkdir(base,{recursive:true});
let completed=0;
for(const asset of assets){
 if(!/^[a-z0-9-]+$/.test(asset.name))throw new Error('Invalid image name');
 const file=path.join(base,asset.name+'.jpg');
 const resp=await fetch(asset.url,{signal:AbortSignal.timeout(25000)});
 if(!resp.ok)throw new Error('Unable to retrieve '+asset.name+': '+resp.status);
 const buffer=Buffer.from(await resp.arrayBuffer());
 if(buffer.length<15000||buffer.length>10000000||buffer[0]!==0xff||buffer[1]!==0xd8)throw new Error('Invalid JPEG '+asset.name+' '+buffer.length+' bytes');
 await fs.writeFile(file,buffer);
 completed++;
 console.log('Imported '+asset.name+' ('+Math.round(buffer.length/1024)+' KB)');
}
console.log('All '+completed+' original AURA lifestyle images saved to the repository');
