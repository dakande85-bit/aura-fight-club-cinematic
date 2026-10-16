// Deterministic, public-domain REAL boxing footage for the Film Room workflow test.
// This endpoint is intentionally NOT a general-purpose YouTube or external-video proxy.
const SOURCE='https://upload.wikimedia.org/wikipedia/commons/0/07/Men_Boxing.webm';
const LIMIT=4_000_000; // Original verified at ~2.6 MB.
export default async function handler(req,res){
 if(req.method!=='GET'&&req.method!=='HEAD'){
  res.setHeader('Allow','GET, HEAD');
  return res.status(405).json({error:'Only GET and HEAD are permitted'});
 }
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Cache-Control','public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
 res.setHeader('Content-Type','video/webm');
 res.setHeader('Content-Disposition','inline; filename="aura-public-domain-boxing-1891.webm"');
 res.setHeader('X-Aura-Demo','Public-domain 1891 boxing film; not a modern boxing match');
 if(req.method==='HEAD')return res.status(200).end();
 try{
  const abort=new AbortController();
  const timer=setTimeout(()=>abort.abort(),12000);
  let result;
  try{result=await fetch(SOURCE,{signal:abort.signal,headers:{'User-Agent':'AuraFightClub/1.0 (historical public-domain boxing preview)'}});}
  finally{clearTimeout(timer);}
  if(!result.ok)throw new Error('Source video unavailable: HTTP '+result.status);
  const declared=Number(result.headers.get('content-length')||0);
  if(declared>LIMIT)throw new Error('Source exceeds the verified demo size.');
  const data=Buffer.from(await result.arrayBuffer());
  if(data.length<50000||data.length>LIMIT)throw new Error('Invalid historical footage response.');
  res.setHeader('Content-Length',String(data.length));
  return res.status(200).end(data);
 }catch(e){
  res.setHeader('Cache-Control','no-store');
  res.removeHeader('Content-Type');
  res.removeHeader('Content-Disposition');
  return res.status(502).json({error:'Demo download is temporarily unavailable. Open the original Wikimedia file and import it manually.'});
 }
}
