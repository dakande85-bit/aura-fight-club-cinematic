export default async function handler(req,res){
  if(req.method!=='POST'){res.statusCode=405;return res.end();}
  res.setHeader('Cache-Control','no-store');
  let body=req.body;try{if(typeof body==='string')body=JSON.parse(body);}catch{body={};}
  const safe={partner:String(body?.partner||'').slice(0,80),placement:String(body?.placement||'').slice(0,120),path:String(body?.path||'').slice(0,240),at:String(body?.at||'').slice(0,40)};
  console.log('AURA_AFFILIATE_CLICK',JSON.stringify(safe));
  res.statusCode=204;res.end();
}
