/** Editorial image availability smoke test.
 * HTTP reachability ≠ permission to publish. No image is downloaded or stored.
 * Some CDNs reject automation despite rendering in browsers: distinguish blocked from absent.
 */
import {fighters} from '../src/data/seoEntities.js';
import {fighterPhotography} from '../src/data/boxingPhotography.js';

const critical=new Set(['david-benavidez','dmitry-bivol','devin-haney','sebastian-fundora']);
const targets=fighters.filter(f=>!f.editorialHidden&&fighterPhotography[f.slug]?.src).map(f=>({slug:f.slug,src:fighterPhotography[f.slug].src}));
const timeout=7000;
async function probe({slug,src}){
 const headers={'User-Agent':'Mozilla/5.0 (compatible; AURAFighterPhotoAudit/1.0)','Accept':'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8'};
 try{
  let response=await fetch(src,{method:'HEAD',redirect:'follow',headers,signal:AbortSignal.timeout(timeout)});
  if([403,405,406,501].includes(response.status)) {
    // Some CDNs disallow HEAD but accept bounded GET.
    response=await fetch(src,{method:'GET',redirect:'follow',headers:{...headers,Range:'bytes=0-127'},signal:AbortSignal.timeout(timeout)});
    if(response.body)await response.body.cancel();
  }
  const type=response.headers.get('content-type')||'';
  const definiteMissing=[404,410].includes(response.status)||(response.ok&&!!type&&!type.toLowerCase().startsWith('image/'));
  const state=definiteMissing?'MISSING':response.ok?'AVAILABLE':[401,403,406,429].includes(response.status)?'BLOCKED':'UNCONFIRMED';
  return {slug,state,status:response.status,contentType:type||'unspecified',critical:critical.has(slug)};
 }catch(e){return {slug,state:'UNCONFIRMED',reason:e.message,critical:critical.has(slug)};}
}
const results=[];const concurrency=8;
for(let i=0;i<targets.length;i+=concurrency)results.push(...await Promise.all(targets.slice(i,i+concurrency).map(probe)));
const tallies=Object.fromEntries(['AVAILABLE','MISSING','BLOCKED','UNCONFIRMED'].map(x=>[x,results.filter(r=>r.state===x).length]));
console.log('AURA editorial photo CDN probe (no downloads and no rights implied):',JSON.stringify(tallies));
for(const r of results.filter(x=>x.critical||x.state!=='AVAILABLE'))console.log((r.critical?'CRITICAL ':'')+r.slug+': '+r.state+' HTTP '+(r.status||'n/a')+' '+(r.contentType||r.reason||''));
const hard=results.filter(r=>r.critical&&r.state==='MISSING');
if(hard.length){console.error('Fighter photo URL(s) definitively missing:',hard.map(f=>f.slug));process.exitCode=1;}
if(results.some(r=>r.state==='BLOCKED'||r.state==='UNCONFIRMED'))console.log('Some images could not be checked from the CI network; verify in a browser before publication.');
console.log('Rights and licensing require separate human clearance; a reachable image is not a licensed image.');
