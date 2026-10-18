import test from 'node:test';
import assert from 'node:assert/strict';
import {splitNarration,planCuts,chooseAsset} from '../src/lib/auraAutoCut.js';

const fight={id:'fight-1',kind:'fight',title:'Real fight MP4',file:{name:'fight.mp4'},duration:240,rightsReviewed:false,peaks:[{time:12,score:30},{time:28,score:25},{time:80,score:20}]};
const press={id:'press-1',kind:'press',title:'Real interview',file:{name:'press.mp4'},duration:90,peaks:[{time:20,score:10}]};

test('narration is broken into readable scenes, not technical clip IDs',()=>{
 const parts=splitNarration('Wardley scored a knockdown. Dubois recovered and established his jab. The press conference suggested both wanted a quicker fight.','shorts');
 assert.ok(parts.length>0);
 assert.ok(parts.every(p=>p.narration.length>0&&p.duration>=3&&p.duration<=11));
});

test('an approved video file is required for an actual source selection',()=>{
 const cuts=planCuts({script:'Dubois uses his jab to close distance. Wardley counters with the right hand.',format:'shorts',assets:[]});
 assert.ok(cuts.length>0);
 assert.ok(cuts.every(c=>c.assetId===null&&c.usedFallback===true));
});

test('real fight footage yields cut windows in file bounds',()=>{
 const script='Wardley scored a knockdown. Dubois landed his jab and countered. The face-off involved a heated exchange. The fighter discussed it at the press conference.';
 const cuts=planCuts({script,format:'shorts',assets:[fight,press]});
 assert.ok(cuts.length>=2);
 assert.ok(cuts.some(c=>c.assetId==='fight-1'));
 for(const c of cuts){const a=[fight,press].find(x=>x.id===c.assetId);assert.ok(c.start>=0&&c.start+c.duration<=a.duration+.2);}
 assert.ok(cuts.reduce((s,c)=>s+c.duration,0)<=60.01);
});

test('long-form and short-form have separate runtimes',()=>{
 const longScript=Array(60).fill('The fighter established the range with the jab and created an opening before retreating.').join(' ');
 const long=planCuts({script:longScript,format:'youtube',assets:[fight]});
 const short=planCuts({script:longScript,format:'shorts',assets:[fight]});
 assert.ok(long.length>short.length);
 assert.ok(short.reduce((t,c)=>t+c.duration,0)<=60.01);
 assert.ok(long.reduce((t,c)=>t+c.duration,0)<=480.01);
});

test('studio prefers genuine press footage when narration references an interview',()=>{
 assert.equal(chooseAsset([fight,press],'press',0).id,'press-1');
 assert.equal(chooseAsset([fight,press],'fight',0).id,'fight-1');
});
