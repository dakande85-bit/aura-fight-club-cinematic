import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import handler from '../api/articles.js';
import {validateArticle,orderArticles} from '../src/lib/articleSchema.js';
const edition=JSON.parse(fs.readFileSync(new URL('../public/news/articles.json',import.meta.url)));
const article=edition.articles[0];
function request(method,body,headers={}){let data;const res={statusCode:0,headers:{},setHeader(k,v){this.headers[k]=v},end(text){data=JSON.parse(text)}};return handler({method,body,headers},res).then(()=>({status:res.statusCode,data}));}
test('research edition has valid images, dates and unique story addresses',()=>{const slugs=new Set();for(const a of edition.articles){validateArticle(a);assert.ok(!slugs.has(a.slug));slugs.add(a.slug);}assert.equal(orderArticles(edition.articles)[0].slug,'will-terence-crawford-return');});
test('validation rejects active links, missing image credit and invalid date',()=>{assert.throws(()=>validateArticle({...article,sourceUrl:'javascript:alert(1)'}));assert.throws(()=>validateArticle({...article,image:{...article.image,credit:''}}));assert.throws(()=>validateArticle({...article,date:'2026-02-30'}));assert.throws(()=>validateArticle({...article,sources:[{name:'Unsafe source',url:'javascript:alert(1)'}]}));assert.throws(()=>validateArticle({...article,articleType:'Confirmed prediction'}));});
test('editor preserves analysis labels and supporting sources',()=>{const item=edition.articles.find(a=>a.slug==='dana-white-eddie-hearn-battle');const saved=validateArticle(item);assert.equal(saved.articleType,'Analysis');assert.deepEqual(saved.sources,item.sources);assert.equal(edition.articles.filter(a=>a.featured).length,6);});
test('publisher protects writes and saves against the latest revision',async()=>{
 const oldFetch=globalThis.fetch,oldToken=process.env.GITHUB_TOKEN,oldPassword=process.env.ARTICLE_EDITOR_PASSWORD;
 try{
 delete process.env.GITHUB_TOKEN;delete process.env.ARTICLE_EDITOR_PASSWORD;
 assert.equal((await request('POST',{})).status,503);
 const fallback=await request('GET');assert.equal(fallback.status,200);assert.equal(fallback.data.configured,false);
 process.env.GITHUB_TOKEN='test-token';process.env.ARTICLE_EDITOR_PASSWORD='test-editor-password';
 assert.equal((await request('POST',{}, {authorization:'Bearer wrong'})).status,401);
 assert.equal((await request('POST',{}, {authorization:'Bearer test-editor-password',origin:'https://evil.example',host:'aura.example'})).status,403);
 let writes=0;globalThis.fetch=async(url,options)=>{if(options.method==='PUT'){writes++;const payload=JSON.parse(options.body);assert.equal(payload.sha,'revision-1');const saved=JSON.parse(Buffer.from(payload.content,'base64'));assert.equal(saved.articles[0].title,'Updated headline');return {ok:true,json:async()=>({content:{sha:'revision-2'}})};}return {ok:true,json:async()=>({sha:'revision-1',content:Buffer.from(JSON.stringify(edition)).toString('base64')})};};
 const headers={authorization:'Bearer test-editor-password'};
 assert.equal((await request('POST',{article,revision:'stale',mode:'update'},headers)).status,409);assert.equal(writes,0);
 assert.equal((await request('POST',{article,revision:'revision-1',mode:'create'},headers)).status,409);
 const saved=await request('POST',{article:{...article,title:'Updated headline'},revision:'revision-1',mode:'update'},headers);assert.equal(saved.status,200);assert.equal(saved.data.revision,'revision-2');assert.equal(writes,1);
 }finally{globalThis.fetch=oldFetch;if(oldToken===undefined)delete process.env.GITHUB_TOKEN;else process.env.GITHUB_TOKEN=oldToken;if(oldPassword===undefined)delete process.env.ARTICLE_EDITOR_PASSWORD;else process.env.ARTICLE_EDITOR_PASSWORD=oldPassword;}
});
