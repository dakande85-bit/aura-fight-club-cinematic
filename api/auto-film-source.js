// Admin-only, repository-backed per-fight YouTube source approvals.
// Stores reference IDs (not private licence documents) for the automatic worker.
import {createHash,timingSafeEqual} from 'node:crypto';
import fs from 'node:fs';
const OWNER=process.env.GITHUB_OWNER||'dakande85-bit';
const REPO=process.env.GITHUB_REPO||'aura-fight-club-cinematic';
const FILE='config/aura-approved-youtube-sources.json';
const HOSTS=new Set(['youtube.com','www.youtube.com','m.youtube.com','youtu.be','www.youtu.be']);
const VALID_KIND=new Set(['fight','weighin','press','training']);
const BASIS=new Set(['youtube_written_approval','applicable_law']);
function send(res,status,data){res.setHeader('Cache-Control','private,no-store');res.setHeader('Content-Type','application/json');res.status(status).end(JSON.stringify(data));}
function verify(req){
 const received=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
 const expected=process.env.ARTICLE_EDITOR_PASSWORD||'';
 const hash=v=>createHash('sha256').update(v).digest();
 return !!(received&&expected&&timingSafeEqual(hash(received),hash(expected)));
}
function id(url){
 try{
  const parsed=new URL(url);
  if(parsed.protocol!=='https:'||!HOSTS.has(parsed.hostname)||parsed.username||parsed.password)return '';
  const parts=parsed.pathname.split('/').filter(Boolean);
  let value='';
  if(parsed.hostname==='youtu.be'||parsed.hostname==='www.youtu.be')value=parts[0]||'';
  else if(parts[0]==='watch')value=parsed.searchParams.get('v')||'';
  else if(['shorts','live','embed'].includes(parts[0]))value=parts[1]||'';
  return /^[A-Za-z0-9_-]{11}$/.test(value)?value:'';
 }catch{return '';}
}
const originOK=req=>{
 try{return !req.headers.origin||new URL(req.headers.origin).host===req.headers.host;}
 catch{return false;}
};
function projectIDs(){
 const index=JSON.parse(fs.readFileSync(new URL('../public/news/video-production/index.json',import.meta.url)));
 return new Set((index.projects||[]).map(p=>p.fightId));
}
async function gh(method,path,body){
 const token=process.env.GITHUB_TOKEN;
 if(!token)throw Error('GitHub editor connection is not configured.');
 const r=await fetch('https://api.github.com/repos/'+OWNER+'/'+REPO+path,{
  method,headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json',
   'X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},
  ...(body?{body:JSON.stringify(body)}:{})
 });
 const data=await r.json().catch(()=>({}));
 if(!r.ok){
  const err=new Error(r.status===409?'Another editor saved a video source. Reload and try again.':'GitHub could not save the approved footage register.');
  err.status=r.status===409?409:502;throw err;
 }
 return data;
}
function source(entry,fightId){
 const ident=id(entry?.url||'');
 const kind=String(entry?.kind||'');
 const rights=String(entry?.rightsEvidence||'').trim();
 const platform=String(entry?.platformEvidence||'').trim();
 if(!ident||!VALID_KIND.has(kind)||!BASIS.has(entry?.platformBasis)||
    rights.length<12||platform.length<12||rights.length>500||platform.length>500||
    entry?.namedFighterVerified!==true)throw Error(
      'Select a real boxer/source and enter valid rights-holder and YouTube/platform/legal-use evidence references.');
 return {
  fightId,id:'youtube-approved-'+ident,provider:'YouTube approved',
  url:'https://www.youtube.com/watch?v='+ident,
  title:String(entry.title||'Licensed boxing video').slice(0,200),
  publisher:String(entry.publisher||'Rights holder').slice(0,140),
  kind,platformBasis:entry.platformBasis,platformEvidence:platform,
  rightsEvidence:rights,rightsStatus:'cleared',namedFighterVerified:true,
  approvedAt:new Date().toISOString()
 };
}
export default async function handler(req,res){
 if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return send(res,405,{error:'Unsupported request.'});}
 if(!verify(req))return send(res,401,{error:'Aura editor credentials required.'});
 if(!originOK(req))return send(res,403,{error:'Request origin mismatch.'});
 const fightId=String(req.method==='GET'?req.query?.fightId:req.body?.fightId||'');
 if(!projectIDs().has(fightId))return send(res,400,{error:'Choose a known fight.'});
 const branch=process.env.VERCEL_GIT_COMMIT_REF||process.env.GITHUB_BRANCH||'main';
 try{
  const path='/contents/'+FILE+'?ref='+encodeURIComponent(branch);
  const previous=await gh('GET',path);
  const content=JSON.parse(Buffer.from(previous.content,'base64').toString('utf8'));
  const sources=Array.isArray(content.sources)?content.sources:[];
  if(req.method==='GET')return send(res,200,{
    fightId,approved:sources.filter(x=>x.fightId===fightId).map(x=>({
      id:x.id,title:x.title,kind:x.kind,url:x.url,approvedAt:x.approvedAt
    })),notes:'Only rights-permitted entries can be downloaded by the production worker.'
  });
  let candidate;
  try{candidate=source(req.body,fightId);}catch(e){return send(res,400,{error:e.message});}
  const all=[...sources.filter(x=>!(x.fightId===fightId&&x.id===candidate.id)),candidate];
  if(all.length>100)return send(res,400,{error:'The footage register has reached its limit.'});
  const next={...content,sources:all};
  const output=Buffer.from(JSON.stringify(next,null,2)+'\n','utf8').toString('base64');
  await gh('PUT','/contents/'+FILE,{
    message:'Approve licensed boxing video '+candidate.id+' for '+fightId,
    content:output,sha:previous.sha,branch
  });
  return send(res,200,{saved:true,sourceId:candidate.id,fightId,
    note:'Video source approval saved. Next automatic production run can download and cut it. This does not guarantee YouTube will serve the file.'});
 }catch(e){return send(res,e.status||502,{error:e.message||'Cannot manage footage approvals.'});}
}
