import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/auto-film-source.js';

function response(){
 return {statusCode:200,headers:{},body:null,
  setHeader(k,v){this.headers[k.toLowerCase()]=v;return this;},
  status(v){this.statusCode=v;return this;},
  end(v){this.body=JSON.parse(v);return this;}
 };
}
test('source register refuses unauthenticated users without any GitHub modification',async()=>{
 const prior=process.env.ARTICLE_EDITOR_PASSWORD;
 process.env.ARTICLE_EDITOR_PASSWORD='fake-editor-password';
 const original=globalThis.fetch;
 let touched=false;globalThis.fetch=()=>{touched=true;throw Error('not allowed');};
 try{
  const res=response();
  await handler({method:'POST',headers:{authorization:'Bearer wrong'},body:{fightId:'dubois-wardley-2'}},res);
  assert.equal(res.statusCode,401);assert.equal(touched,false);
 }finally{globalThis.fetch=original;if(prior===undefined)delete process.env.ARTICLE_EDITOR_PASSWORD;else process.env.ARTICLE_EDITOR_PASSWORD=prior;}
});
test('no GitHub writes without copyright and platform permission evidence',async()=>{
 const priorP=process.env.ARTICLE_EDITOR_PASSWORD,priorToken=process.env.GITHUB_TOKEN;
 const priorRef=process.env.VERCEL_GIT_COMMIT_REF;
 process.env.ARTICLE_EDITOR_PASSWORD='fake-editor-password';
 process.env.GITHUB_TOKEN='fake-token';
 process.env.VERCEL_GIT_COMMIT_REF='feature/real-footage-production-studio';
 const original=globalThis.fetch;const calls=[];
 const source={version:1,sources:[]};
 globalThis.fetch=async(url,options)=>{
  calls.push({url,method:options?.method||'GET'});
  if(options?.method==='PUT')throw Error('Forbidden repo mutation');
  return {ok:true,status:200,json:async()=>({
    sha:'fake-sha',content:Buffer.from(JSON.stringify(source)).toString('base64')
  })};
 };
 try{
  const res=response();
  await handler({method:'POST',headers:{authorization:'Bearer fake-editor-password',host:'aura.example',
   origin:'https://aura.example'},body:{fightId:'dubois-wardley-2',url:'https://www.youtube.com/watch?v=XeGvFyry-sA',
   kind:'fight',rightsEvidence:'',platformBasis:'youtube_written_approval',platformEvidence:'',namedFighterVerified:true}},res);
  assert.equal(res.statusCode,400);
  assert.equal(calls.filter(x=>x.method==='PUT').length,0);
 }finally{
  globalThis.fetch=original;
  for(const [key,value] of [['ARTICLE_EDITOR_PASSWORD',priorP],['GITHUB_TOKEN',priorToken],['VERCEL_GIT_COMMIT_REF',priorRef]]){
   if(value===undefined)delete process.env[key];else process.env[key]=value;
  }
 }
});
test('wrong origin is rejected before any source access',async()=>{
 const prior=process.env.ARTICLE_EDITOR_PASSWORD;
 process.env.ARTICLE_EDITOR_PASSWORD='fake-editor-password';
 try{
  const res=response();
  await handler({method:'POST',headers:{authorization:'Bearer fake-editor-password',
    host:'aura.example',origin:'https://unrelated.example'},body:{fightId:'dubois-wardley-2'}},res);
  assert.equal(res.statusCode,403);
 }finally{if(prior===undefined)delete process.env.ARTICLE_EDITOR_PASSWORD;else process.env.ARTICLE_EDITOR_PASSWORD=prior;}
});
