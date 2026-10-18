// Admin-only video job status and ready-to-download artifact discovery.
// No persistent editor passwords and no raw GitHub API tokens sent to clients.
import {createHash,timingSafeEqual} from 'node:crypto';
const OWNER=process.env.GITHUB_OWNER||'dakande85-bit';
const REPO=process.env.GITHUB_REPO||'aura-fight-club-cinematic';
const WF='aura-auto-film-production.yml';
const send=(res,code,data)=>{
 res.setHeader('Cache-Control','private, no-store');
 res.setHeader('Content-Type','application/json');
 res.status(code).end(JSON.stringify(data));
};
export function isEditor(req,secret=process.env.ARTICLE_EDITOR_PASSWORD||''){
 const value=String(req.headers?.authorization||'').replace(/^Bearer\s+/i,'');
 const digest=s=>createHash('sha256').update(s).digest();
 return Boolean(secret&&value&&timingSafeEqual(digest(secret),digest(value)));
}
export async function gh(path,token=process.env.GITHUB_TOKEN){
 if(!token)throw Object.assign(Error('GitHub editor connection missing.'),{httpStatus:503});
 const r=await fetch('https://api.github.com/repos/'+OWNER+'/'+REPO+path,{
  headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',
   Authorization:'Bearer '+token}
 });
 const data=await r.json().catch(()=>({}));
 if(!r.ok)throw Object.assign(
  Error(r.status===404?'Automatic film workflow is not installed on the default branch.':'GitHub cannot retrieve automatic video jobs.'),
  {httpStatus:r.status===404?409:502});
 return data;
}
export function normaliseRun(run,artifacts=[]){
 const name=String(run.display_title||run.name||'');
 const id=Number(run.id);
 return {
  id,subject:name.replace(/^AURA film\s*[—-]\s*/,''),
  status:run.status||'unknown',conclusion:run.conclusion||null,
  createdAt:run.created_at||null,updatedAt:run.updated_at||null,
  url:run.html_url||null,
  downloadable:(artifacts||[]).filter(a=>!a.expired && /^auto-film-[a-z0-9-]+$/.test(a.name||''))
   .map(a=>({id:Number(a.id),name:a.name,sizeBytes:a.size_in_bytes||0,expiresAt:a.expires_at||null}))
 };
}
export default async function handler(req,res){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return send(res,405,{error:'Use GET to check video jobs.'});}
 if(!isEditor(req))return send(res,401,{error:'Enter the correct Aura editor password to view private video work.'});
 try{
  const query=req.query||{};
  const fight=String(query.fightId||'');
  if(!/^[a-z0-9-]{1,80}$/.test(fight))return send(res,400,{error:'Choose a valid boxing fight.'});
  const result=await gh('/actions/workflows/'+WF+'/runs?per_page=35&event=workflow_dispatch');
  const rows=(result.workflow_runs||[])
   .filter(x=>x.path?.split('@')[0]?.endsWith('/'+WF))
   .filter(x=>String(x.display_title||'').includes(fight))
   .slice(0,6);
  const jobs=await Promise.all(rows.map(async r=>{
   if(r.status!=='completed')return normaliseRun(r);
   try{
    const data=await gh('/actions/runs/'+r.id+'/artifacts?per_page=10');
    return normaliseRun(r,data.artifacts||[]);
   }catch{return normaliseRun(r);}
  }));
  return send(res,200,{fightId:fight,jobs,workflow:WF,
   note:'Draft render artifacts are only generated when usable licensed footage and sufficient narration are available.'});
 }catch(e){return send(res,e.httpStatus||500,{error:e.message||'Could not check automated video jobs.'});}
}
