import test from 'node:test';
import assert from 'node:assert/strict';
import {stageAutomaticEdit,consumeAutomaticEdit} from '../src/lib/auraTransientFilmEdits.js';

test('automated video scenes can survive single-page route change when iPhone storage rejects File blobs',()=>{
 const assets=[{id:'scene-1',file:{size:2048}}],cuts=[{assetId:'scene-1',duration:5}];
 stageAutomaticEdit({slug:'dubois-wardley-ii-pre-fight',assets,cuts,
  script:'Commentary follows the original video.',storageFailed:true});
 assert.equal(consumeAutomaticEdit('other-fight'),null);
 const restored=consumeAutomaticEdit('dubois-wardley-ii-pre-fight');
 assert.equal(restored.assets.length,1);
 assert.equal(restored.cuts.length,1);
 assert.equal(restored.storageFailed,true);
 assert.equal(consumeAutomaticEdit('dubois-wardley-ii-pre-fight'),null);
});
test('transient video cannot exceed iPhone edit memory budget',()=>{
 assert.throws(()=>stageAutomaticEdit({slug:'fight',assets:[{file:{size:190*1024*1024}}],cuts:[],script:''}),/too large/);
});
