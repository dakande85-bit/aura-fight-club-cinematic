import test from 'node:test';
import assert from 'node:assert/strict';
import {exportProfile,checkExport,videoFilter} from '../src/lib/auraExportProfile.js';

const video={id:'history',file:{size:2300000},title:'Real public domain boxing sample',rightsReviewed:true,duration:12};
const cuts=[{id:'1',assetId:'history',start:1,duration:3},{id:'2',assetId:'history',start:6,duration:3}];

test('iPhone uses 360x640 18fps rather than heavyweight 720x1280 blur',()=>{
 const p=checkExport(cuts,[video],'shorts','Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X)');
 assert.equal(p.width,360);assert.equal(p.height,640);assert.equal(p.fps,18);
 assert.equal(p.seconds,6);assert.ok(videoFilter(p).includes('scale=360:640'));
 assert.ok(!videoFilter(p).includes('boxblur'));
});
test('desktop does not attempt 1080p WASM for preview',()=>{
 const p=checkExport(cuts,[video],'youtube','Mozilla/5.0 (X11; Linux x86_64) Chrome/125');
 assert.equal(p.width,960);assert.equal(p.height,540);assert.equal(p.fps,24);
});
test('export gives visible feedback if footage has not passed rights review',()=>{
 assert.throws(()=>checkExport(cuts,[{...video,rightsReviewed:false}],'shorts','iPhone'),/Review the footage usage/);
});
test('source range and empty file validation are actionable',()=>{
 assert.throws(()=>checkExport([{...cuts[0],start:11,duration:5}],[video],'shorts','iPhone'),/Scene 1 extends beyond/);
 assert.throws(()=>checkExport([],[video],'shorts','iPhone'),/timeline is empty/);
});
test('long narration cuts should be blocked explicitly on phone',()=>{
 const many=Array.from({length:9},(_,i)=>({...cuts[0],id:String(i)}));
 assert.throws(()=>checkExport(many,[video],'shorts','iPhone'),/at most 8 clips/);
 const huge=[{...video,file:{size:75*1024*1024}}];
 assert.throws(()=>checkExport(cuts,huge,'shorts','iPhone'),/too large for this browser/);
});
