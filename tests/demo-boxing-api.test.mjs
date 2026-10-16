import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/demo-boxing.js';
function mockRes(){
 return {
  statusCode:200,headers:{},finished:false,body:null,
  setHeader(k,v){this.headers[k.toLowerCase()]=v;return this;},
  removeHeader(k){delete this.headers[k.toLowerCase()];return this;},
  status(code){this.statusCode=code;return this;},
  json(body){this.body=body;this.finished=true;return this;},
  end(body){this.body=body;this.finished=true;return this;}
 };
}
test('demo endpoint allows only GET and HEAD, rejects arbitrary POST requests',async()=>{
 const res=mockRes();await handler({method:'POST'},res);
 assert.equal(res.statusCode,405);assert.equal(res.headers.allow,'GET, HEAD');
});
test('demo source is a fixed real 1891 film, not a proxy accepting any user URL',async()=>{
 const res=mockRes();await handler({method:'HEAD',query:{url:'https://private.example/secret'}},res);
 assert.equal(res.statusCode,200);
 assert.equal(res.headers['content-type'],'video/webm');
 assert.match(res.headers['x-aura-demo'],/1891/);
});
test('GET returns real video bytes only if a bounded verified upstream file was retrieved',async()=>{
 const original=globalThis.fetch;
 let captured='';
 try{
  globalThis.fetch=async (url)=>{
   captured=url;
   return {ok:true,headers:new Headers({'content-type':'video/webm','content-length':'100000'}),arrayBuffer:async()=>new Uint8Array(100000).buffer};
  };
  const res=mockRes();await handler({method:'GET',query:{url:'https://attacker.example/movie.webm'}},res);
  assert.equal(res.statusCode,200);
  assert.ok(Buffer.isBuffer(res.body));
  assert.equal(res.body.length,100000);
  assert.match(captured,/upload\.wikimedia\.org\/wikipedia\/commons\/0\/07\/Men_Boxing\.webm/);
 }finally{globalThis.fetch=original;}
});
test('refuses unexpectedly oversized upstream media',async()=>{
 const original=globalThis.fetch;
 try{
  globalThis.fetch=async()=>({ok:true,headers:new Headers({'content-length':'9000000'}),arrayBuffer:async()=>new Uint8Array(9000000).buffer});
  const res=mockRes();await handler({method:'GET'},res);
  assert.equal(res.statusCode,502);
  assert.match(res.body.error,/temporarily unavailable/);
 }finally{globalThis.fetch=original;}
});
