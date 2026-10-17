import test from 'node:test';
import assert from 'node:assert/strict';
import {isEditor,normaliseRun} from '../api/auto-film-jobs.js';
import statusHandler from '../api/auto-film-jobs.js';
import downloadHandler from '../api/auto-film-download.js';

function res(){
 return {headers:{},statusCode:200,body:null,
  setHeader(k,v){this.headers[k.toLowerCase()]=v;return this;},
  status(v){this.statusCode=v;return this;},
  end(v){this.body=JSON.parse(v);return this;}
 };
}
test('private production jobs reject anonymous readers and wrong passwords',async()=>{
 assert.equal(isEditor({headers:{authorization:'Bearer correct'}},'correct'),true);
 assert.equal(isEditor({headers:{authorization:'Bearer wrong'}},'correct'),false);
 assert.equal(isEditor({headers:{}},'correct'),false);
 const before=process.env.ARTICLE_EDITOR_PASSWORD;
 process.env.ARTICLE_EDITOR_PASSWORD='integration-fixture-secret';
 try{
  const response=res();
  await statusHandler({method:'GET',headers:{},query:{fightId:'dubois-wardley-2'}},response);
  assert.equal(response.statusCode,401);
 }finally{if(before===undefined)delete process.env.ARTICLE_EDITOR_PASSWORD;else process.env.ARTICLE_EDITOR_PASSWORD=before;}
});
test('completed GitHub runs expose only non-expired automatic draft artifacts',()=>{
 const run={id:117,path:'.github/workflows/aura-auto-film-production.yml@refs/heads/main',
  display_title:'AURA film — dubois-wardley-2',status:'completed',conclusion:'success',created_at:'2026-10-17T10:00:00Z'};
 const result=normaliseRun(run,[
  {id:8,name:'auto-film-dubois-wardley-2',expired:false,size_in_bytes:50000},
  {id:9,name:'other-project-private',expired:false},
  {id:10,name:'auto-film-old',expired:true}]);
 assert.equal(result.downloadable.length,1);
 assert.equal(result.downloadable[0].id,8);
 assert.equal(result.subject,'dubois-wardley-2');
});
test('artifact downloader cannot be used as a public GitHub zip proxy',async()=>{
 const prev=process.env.ARTICLE_EDITOR_PASSWORD;
 process.env.ARTICLE_EDITOR_PASSWORD='fixture';
 try{
  let response=res();
  await downloadHandler({method:'POST',headers:{host:'aura.example',origin:'https://attacker.example',
   authorization:'Bearer fixture'},body:{fightId:'dubois-wardley-2',artifactId:123}},response);
  assert.equal(response.statusCode,403);
  response=res();
  await downloadHandler({method:'POST',headers:{host:'aura.example'},body:{fightId:'dubois-wardley-2',artifactId:123}},response);
  assert.equal(response.statusCode,401);
 }finally{if(prev===undefined)delete process.env.ARTICLE_EDITOR_PASSWORD;else process.env.ARTICLE_EDITOR_PASSWORD=prev;}
});
