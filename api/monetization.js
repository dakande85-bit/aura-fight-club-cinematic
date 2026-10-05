import {createHash,timingSafeEqual} from 'node:crypto';
import fs from 'node:fs';
const PATH='public/news/monetization.json';
const send=(res,status,data)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};
async function github(path,options={}) {
  const owner=process.env.GITHUB_OWNER||'dakande85-bit';const repo=process.env.GITHUB_REPO||'aura-fight-club-cinematic';
  const r=await fetch(`https://api.github.com/repos/${owner}/${repo}${path}`,{...options,headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${process.env.GITHUB_TOKEN}`,'Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'}});
  const data=await r.json();if(!r.ok){const e=new Error(r.status===409||r.status===422?'The monetisation settings changed. Reload before saving.':'Monetisation storage could not be reached.');e.status=r.status===409||r.status===422?409:502;throw e;}return data;
}
const cleanUrl=value=>{if(!value)return '';const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)throw Error('Use HTTPS links only.');return u.href;};
function validate(input){
  const out={...input,updatedAt:new Date().toISOString()};
  out.contactEmail=String(input.contactEmail||'hello@aurafightclub.com').trim().slice(0,200);
  out.disclosure=String(input.disclosure||'').trim().slice(0,600);
  out.partners=Object.fromEntries(Object.entries(input.partners||{}).map(([key,p])=>[key,{...p,name:String(p.name||key).slice(0,100),category:String(p.category||'Partner').slice(0,60),enabled:p.enabled===true,officialUrl:cleanUrl(p.officialUrl),affiliateUrl:cleanUrl(p.affiliateUrl),cta:String(p.cta||'Learn more').slice(0,100),note:String(p.note||'').slice(0,300)}]));
  out.adSlots=Object.fromEntries(Object.entries(input.adSlots||{}).map(([key,s])=>[key,{enabled:s.enabled===true,mode:['house','adsense','off'].includes(s.mode)?s.mode:'house',label:String(s.label||'Advertise with AURA').slice(0,160)}]));
  out.adsense={enabled:input.adsense?.enabled===true,client:String(input.adsense?.client||'').trim().slice(0,100),slots:input.adsense?.slots||{}};
  return out;
}
export default async function handler(req,res){
  const branch=process.env.GITHUB_BRANCH||(process.env.VERCEL_ENV==='preview'?process.env.VERCEL_GIT_COMMIT_REF:null)||'main';
  const configured=Boolean(process.env.GITHUB_TOKEN&&(process.env.MONETIZATION_EDITOR_PASSWORD||process.env.ARTICLE_EDITOR_PASSWORD));
  res.setHeader('Cache-Control','no-store');
  try{
    if(req.method==='GET'){
      if(!process.env.GITHUB_TOKEN){const data=JSON.parse(fs.readFileSync(new URL('../public/news/monetization.json',import.meta.url),'utf8'));return send(res,200,{...data,configured:false,revision:null});}
      const file=await github(`/contents/${PATH}?ref=${encodeURIComponent(branch)}`);const data=JSON.parse(Buffer.from(file.content,'base64').toString('utf8'));return send(res,200,{...data,configured,revision:file.sha});
    }
    if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return send(res,405,{error:'Method not allowed.'});}
    if(!configured)return send(res,503,{error:'Set the GitHub token and editor password before saving monetisation settings.'});
    const supplied=String(req.headers.authorization||'').replace(/^Bearer /,'');const expected=process.env.MONETIZATION_EDITOR_PASSWORD||process.env.ARTICLE_EDITOR_PASSWORD;const digest=x=>createHash('sha256').update(x).digest();
    if(!timingSafeEqual(digest(supplied),digest(expected)))return send(res,401,{error:'Incorrect editor password.'});
    let body=req.body;if(typeof body==='string')body=JSON.parse(body);const file=await github(`/contents/${PATH}?ref=${encodeURIComponent(branch)}`);
    if(body.revision!==file.sha)return send(res,409,{error:'Settings changed. Reload before saving.'});
    const next=validate(body.config||{});const saved=await github(`/contents/${PATH}`,{method:'PUT',body:JSON.stringify({message:'Update AURA monetisation settings',content:Buffer.from(JSON.stringify(next,null,2)+'\n').toString('base64'),sha:file.sha,branch})});
    return send(res,200,{...next,configured:true,revision:saved.content.sha});
  }catch(e){return send(res,e.status||400,{error:e.message||'Could not save monetisation settings.'});}
}
