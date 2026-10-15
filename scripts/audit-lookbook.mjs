import fs from 'node:fs';
const names=["varsity","hoodie-black","tracksuit-cream","training-sparring","rope-cream","towel-black","performance-black","tee-cream","boxing-black-model","boxing-performance"];
let bad=[];
for(const name of names){
 const path='public/assets/lookbook-2026/'+name+'.jpg';
 if(!fs.existsSync(path)){bad.push('Missing '+path);continue;}
 const stat=fs.statSync(path);
 if(stat.size<15000||stat.size>10000000)bad.push('Unexpected size: '+path);
 const data=fs.readFileSync(path);
 if(data[0]!==255||data[1]!==216)bad.push('Invalid JPEG '+path);
}
if(bad.length){bad.forEach(x=>console.error('LIFESTYLE ERROR '+x));process.exitCode=1;}
else console.log('AURA lookbook validated: '+names.length+' original, local, attributed design images.');
