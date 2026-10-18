// One-click automatic production orchestration.
// No raw broadcaster downloads and no private credentials in frontend bundles.
import {createHash,timingSafeEqual} from 'node:crypto';
import fs from 'node:fs';

const OWNER=process.env.GITHUB_OWNER||'dakande85-bit';
const REPO=process.env.GITHUB_REPO||'aura-fight-club-cinematic';
const WORKFLOW='aura-auto-film-production.yml';
const branch=process.env.GITHUB_BRANCH||'main';
const send=(res,status,body)=>{
 res.setHeader('Content-Type','application/json');
 res.setHeader('Cache-Control','no-store');
 res.status(status).end(JSON.stringify(body));
};
function projects(){
 const data=JSON.parse(fs.readFileSync(new URL('../public/news/video-production/index.json',import.meta.url),'utf8'));
 return data.projects||[];
}
function authorized(req){
 const received=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
 const secret=process.env.ARTICLE_EDITOR_PASSWORD||'';
 const a=createHash('sha256').update(received).digest();
 const b=createHash('sha256').update(secret).digest();
 return Boolean(secret&&received&&timingSafeEqual(a,b));
}
async function github(path,options={}){
 const response=await fetch('https://api.github.com/repos/'+OWNER+'/'+REPO+path,{
  ...options,headers:{Accept:'application/vnd.github+json',
    Authorization:'Bearer '+process.env.GITHUB_TOKEN,
    'Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'}
 });
 const data=await response.json().catch(()=>({}));
 if(!response.ok){
  let message='Automatic film queue could not be reached (GitHub '+response.status+').';
  if(response.status===404)message='Film production workflow is not installed on the default branch yet.';
  if(response.status===403)message='GitHub token cannot start video production workflows.';
  const err=new Error(message);err.status=502;throw err;
 }
 return data;
}
export default async function handler(req,res){
 try{
  if(req.method==='GET'){
   const credentials=Boolean(process.env.GITHUB_TOKEN&&process.env.ARTICLE_EDITOR_PASSWORD);
   let workflowInstalled=false;
   if(credentials){
    try{const workflow=await github('/actions/workflows/'+WORKFLOW);workflowInstalled=Boolean(workflow?.id);}catch{}
    // Mark ready only if GitHub actually has this workflow installed.
   }
   return send(res,200,{
    automatedProduction:true,
    ready: credentials&&workflowInstalled,
    workerConfigured:Boolean(process.env.GITHUB_TOKEN),
    workflowInstalled,
    licensedStockConfigured:Boolean(process.env.PEXELS_API_KEY),
    cloudMediaReady:Boolean(process.env.AURA_FILM_CLOUD_STORAGE_READY==='true'),
    jobsRequireLogin:true,
    fights:projects().map(({fightId,name,date,stakes,path})=>({fightId,name,date,stakes,path})),
    note:'Automated production needs real reusable video files. YouTube research links cannot be used as downloadable footage. Output remains a draft until reviewed.'
   });
  }
  if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return send(res,405,{error:'Only GET and POST are allowed.'});}
  const origin=req.headers.origin;
  if(origin&&new URL(origin).host!==req.headers.host)return send(res,403,{error:'Cross-origin requests are not permitted.'});
  if(!authorized(req))return send(res,401,{error:'Enter the editor password used for the Aura news desk.'});
  if(!process.env.GITHUB_TOKEN)return send(res,503,{error:'GitHub automation token is not configured in the project environment.'});
  let body=req.body;
  if(typeof body==='string')body=JSON.parse(body);
  if(!body||Buffer.byteLength(JSON.stringify(body))>2000)return send(res,400,{error:'Invalid production request.'});
  const item=projects().find(p=>p.fightId===body.fightId);
  if(!item)return send(res,400,{error:'Choose an existing researched fight.'});
  if(body.mode!=='prepare')return send(res,400,{error:'Only draft preparation is supported. No videos will be published.'});
  const contentType=['analysis','prediction','critique','profile'].includes(body.kind)?body.kind:'analysis';
  const runtime=[5,7,10].includes(Number(body.targetMinutes))?String(body.targetMinutes):'7';
  await github('/actions/workflows/'+WORKFLOW+'/dispatches',{
   method:'POST',body:JSON.stringify({ref:branch,inputs:{fight_id:item.fightId,content_type:contentType,target_minutes:runtime}})
  });
  return send(res,202,{queued:true,subject:item.name,branch,workflow:WORKFLOW,
   note:'Research, licensed footage downloads, automatic cutting and a silent rough-cut render were requested. Source coverage may prevent a render; the system will report the missing footage rather than manufacture a fake fight video.'});
 }catch(error){return send(res,error.status||500,{error:error.status?error.message:'Unable to start automatic footage research. No video has been produced.'});}
}
