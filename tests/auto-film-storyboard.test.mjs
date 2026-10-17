import test from 'node:test';
import assert from 'node:assert/strict';
import {buildNarrationShots,roleForText,storyboardCoverage,minutesForShots} from '../src/lib/auraAutoFilmStoryboard.js';

test('fight analysis automatically produces scene-by-scene timing without clips IDs',()=>{
 const script=Array(40).fill("The early pressure is important. The fighter is waiting for the right hand and a jab counter.").join(' ');
 const shots=buildNarrationShots(script);
 assert.ok(shots.length>40);
 assert.ok(shots[0].start===0);
 assert.ok(shots.every(s=>s.narration&&s.end>s.start&&s.mediaReady===false));
 assert.ok(shots.some(s=>s.kind==='fight'));
});
test('weigh-in, press, training and technical exchanges are differentiated',()=>{
 assert.equal(roleForText('Weigh-in on the scales and face off'),'weighin');
 assert.equal(roleForText('The trainer spoke at the press conference'),'press');
 assert.equal(roleForText('Boxing conditioning gym camp'),'training');
 assert.equal(roleForText('The jab sets up the counter hook'),'fight');
});
test('footage references do not masquerade as licensed video',()=>{
 const shots=buildNarrationShots('Dubois puts pressure with a jab. Wardley counters in the ring.');
 const manifest=storyboardCoverage(shots,[
  {id:'youtube',kind:'fight',url:'https://youtube.com/watch?v=test',clearedForExport:false},
  {id:'owner',kind:'fight',namedFighterVerified:true,clearedForExport:true}
 ]);
 assert.equal(manifest.licensedVideoCount,1);
 assert.equal(manifest.actualFighterFootage,1);
 assert.equal(manifest.scenes,shots.length);
 assert.ok(minutesForShots(shots)>0);
});
