import {createHash,timingSafeEqual} from 'node:crypto';
import fs from 'node:fs';
import {validateArticle} from '../src/lib/articleSchema.js';
const PATH='public/news/articles.json';
const send=(res,status,data)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};
async function github(path,options={}) {
 const owner=process.env.GITHUB_OWNER||'dakande85-bit';const repo=process.env.GITHUB_REPO||'aura-fight-club-cinematic';
 const r=await fetch(`https://api.github.com/repos/${owner}/${repo}${path}`,{...options,headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${process.env.GITHUB_TOKEN}`,'Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'}});
 const data=await r.json();if(!r.ok){const e=new Error(r.status===409||r.status===422?'The edition changed. Reload before publishing.':'Article storage could not be reached.');e.status=r.status===409||r.status===422?409:502;throw e;}return data;
}
export default async function handler(req,res) {
 const branch=process.env.GITHUB_BRANCH||(process.env.VERCEL_ENV==='preview'?process.env.VERCEL_GIT_COMMIT_REF:null)||'main';const configured=Boolean(process.env.GITHUB_TOKEN&&process.env.ARTICLE_EDITOR_PASSWORD);
 res.setHeader('Cache-Control','no-store');
 try {
 if(req.method==='GET') {
   if(!process.env.GITHUB_TOKEN){const edition=JSON.parse(fs.readFileSync(new URL('../public/news/articles.json',import.meta.url),'utf8'));return send(res,200,{...edition,configured:false,revision:null});}
   const file=await github(`/contents/${PATH}?ref=${encodeURIComponent(branch)}`);const edition=JSON.parse(Buffer.from(file.content,'base64').toString('utf8'));
   return send(res,200,{...edition,configured,revision:file.sha});
 }
 if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return send(res,405,{error:'Method not allowed.'});}
 if(!configured)return send(res,503,{error:'Publishing needs the editor password and article storage connection set up.'});
 const origin=req.headers.origin; if(origin && new URL(origin).host!==req.headers.host)return send(res,403,{error:'Request not allowed.'});
 const supplied=String(req.headers.authorization||'').replace(/^Bearer /,'');
 const digest=x=>createHash('sha256').update(x).digest();
 if(!timingSafeEqual(digest(supplied),digest(process.env.ARTICLE_EDITOR_PASSWORD)))return send(res,401,{error:'Incorrect editor password.'});
 let body=req.body;if(typeof body==='string')body=JSON.parse(body);
 if(Buffer.byteLength(JSON.stringify(body||{}))>100000)return send(res,413,{error:'Article is too large.'});
 let article;try{article=validateArticle(body?.article||{});}catch(e){return send(res,400,{error:e.message});}
 const file=await github(`/contents/${PATH}?ref=${encodeURIComponent(branch)}`);
 if(body.revision!==file.sha)return send(res,409,{error:'Another edit was published. Reload the edition before trying again.'});
 const edition=JSON.parse(Buffer.from(file.content,'base64').toString('utf8'));
 const existing=edition.articles.some(a=>a.slug===article.slug);
 if(existing && body.mode!=='update')return send(res,409,{error:'That article address already exists. Choose it from Published articles to edit.'});
 if(!existing && body.mode==='update')return send(res,409,{error:'The original article no longer exists. Reload the edition.'});
 if(existing) article={...article,updatedAt:new Intl.DateTimeFormat('en-CA',{timeZone:'Atlantic/Canary',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())};
 const articles=existing?edition.articles.map(a=>a.slug===article.slug?article:a):[article,...edition.articles];
 const next={reviewedAt:edition.reviewedAt,updatedAt:new Date().toISOString(),articles};
 const saved=await github(`/contents/${PATH}`,{method:'PUT',body:JSON.stringify({message:`${existing?'Update':'Publish'} boxing story: ${article.title}`,content:Buffer.from(JSON.stringify(next,null,2)+'\n').toString('base64'),sha:file.sha,branch})});
 return send(res,200,{...next,configured:true,revision:saved.content.sha,articleUrl:`/news/${article.slug}`});
 }catch(error){return send(res,error.status||500,{error:error.status?error.message:'Could not load or save the edition. Your draft has been kept.'});}
}
