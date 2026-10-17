// Exchange an authorised GitHub Actions artifact for a short-lived signed download.
// The browser receives a temporary ZIP URL, never a GitHub access token.
import {isEditor,gh} from './auto-film-jobs.js';
const WORKFLOW='aura-auto-film-production.yml';
const send=(res,status,body)=>{
 res.setHeader('Cache-Control','private,no-store');
 res.setHeader('Content-Type','application/json');
 res.status(status).end(JSON.stringify(body));
};
export default async function handler(req,res){
 if(req.method!=='POST'){res.setHeader('Allow','POST');return send(res,405,{error:'Use POST to request a video draft download.'});}
 if(!isEditor(req))return send(res,401,{error:'Editor password required.'});
 const origin=req.headers.origin;
 if(origin){
  try{if(new URL(origin).host!==req.headers.host)return send(res,403,{error:'Origin mismatch.'});}
  catch{return send(res,403,{error:'Invalid request origin.'});}
 }
 let input=req.body;
 try{if(typeof input==='string')input=JSON.parse(input);}catch{return send(res,400,{error:'Invalid request.'});}
 const id=Number(input?.artifactId),fightId=String(input?.fightId||'');
 if(!Number.isSafeInteger(id)||id<=0||!/^[a-z0-9-]{1,80}$/.test(fightId))
  return send(res,400,{error:'Choose an existing draft artifact.'});
 try{
  const artifact=await gh('/actions/artifacts/'+id);
  if(artifact.expired || artifact.name!=='auto-film-'+fightId)
   return send(res,404,{error:'That video draft is unavailable or expired.'});
  const runId=Number(artifact.workflow_run?.id);
  if(!Number.isSafeInteger(runId))return send(res,403,{error:'The video job could not be verified.'});
  const run=await gh('/actions/runs/'+runId);
  if(!String(run.path||'').split('@')[0].endsWith('/'+WORKFLOW)||
     !String(run.display_title||'').includes(fightId)||
     run.status!=='completed')
   return send(res,403,{error:'This artifact is not a completed Aura video production for that fight.'});
  const owner=process.env.GITHUB_OWNER||'dakande85-bit';
  const repo=process.env.GITHUB_REPO||'aura-fight-club-cinematic';
  const apiUrl='https://api.github.com/repos/'+owner+'/'+repo+'/actions/artifacts/'+id+'/zip';
  const response=await fetch(apiUrl,{redirect:'manual',headers:{
   Accept:'application/vnd.github+json',
   Authorization:'Bearer '+process.env.GITHUB_TOKEN,
   'X-GitHub-Api-Version':'2022-11-28'
  }});
  if(response.status!==302 && response.status!==301)
   return send(res,502,{error:'GitHub has not issued a download for this video draft.'});
  const location=response.headers.get('location');
  let url;
  try{url=new URL(location);}catch{return send(res,502,{error:'Invalid artifact download URL.'});}
  if(url.protocol!=='https:'||url.username||url.password)
   return send(res,502,{error:'Unsafe artifact download link returned.'});
  const host=url.hostname.toLowerCase();
  if(!(host==='pipelines.actions.githubusercontent.com'||host.endsWith('.blob.core.windows.net')||
       host==='objects.githubusercontent.com'))
   return send(res,502,{error:'Unexpected artifact download provider.'});
  return send(res,200,{url:url.toString(),filename:artifact.name+'.zip',
   expiresSoon:true,subject:fightId,
   note:'This ZIP may contain a rendered MP4, narration transcript, attribution, or a blocked-source report. It is not automatically published.'});
 }catch(e){return send(res,e.httpStatus||500,{error:e.message||'Video draft could not be downloaded.'});}
}
