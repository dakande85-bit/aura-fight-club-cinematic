import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildRealFootageReel,youtubeId,iframePreviewUrl,validSegment} from '../src/lib/auraRealFootageReel.js';

const project=JSON.parse(readFileSync(new URL('../public/news/video-production/dubois-wardley-ii-postfight.json',import.meta.url)));
const reel=buildRealFootageReel(project);

test('real post-fight source reel references actual fighters and no synthetic placeholder clips',()=>{
 assert.ok(reel.length>=4);
 assert.ok(reel.some(x=>x.publisher==='DAZN Boxing'));
 assert.ok(reel.some(x=>x.publisher==='Seconds Out'));
 assert.equal(reel.find(x=>x.sourceId==='rematch-faceoff').id,'2W33Uyr3KBc');
 assert.equal(reel.find(x=>x.sourceId==='rematch-launch-press').id,'KMozMmGVII0');
 assert.equal(reel.find(x=>x.sourceId==='first-fight-weigh-in').id,'bFK4g-moKJg');
 assert.ok(reel.every(x=>!x.rightsCleared));
 assert.ok(reel.every(x=>x.title.includes('Dubois')||x.title.includes('Wardley')||x.title.includes('DUBOIS')));
});
test('preview uses safe YouTube ID and requested short sections, never a downloadable file URL',()=>{
 const url=iframePreviewUrl('2W33Uyr3KBc',12,28,'https://aurafightclub.com');
 assert.ok(url.startsWith('https://www.youtube-nocookie.com/embed/2W33Uyr3KBc?'));
 const p=new URL(url);
 assert.equal(p.searchParams.get('start'),'12');
 assert.equal(p.searchParams.get('end'),'28');
 assert.equal(p.searchParams.get('origin'),'https://aurafightclub.com');
 assert.equal(p.searchParams.get('playsinline'),'1');
 assert.throws(()=>iframePreviewUrl('notreal',0,30),/Invalid/);
});
test('source URLs never accept spoof YouTube domains or plain http',()=>{
 assert.equal(youtubeId('https://youtube.com.watch.evil.invalid/watch?v=KMozMmGVII0'),null);
 assert.equal(youtubeId('https://www.youtube.com@evil.invalid/watch?v=KMozMmGVII0'),null);
 assert.equal(youtubeId('http://www.youtube.com/watch?v=KMozMmGVII0'),null);
 assert.equal(youtubeId('https://www.youtube.com/watch?v=KMozMmGVII0'),'KMozMmGVII0');
});
test('preview excerpt edits are bounded and no timestamp is mistaken for a verified punch',()=>{
 assert.equal(validSegment(0,20),true);
 assert.equal(validSegment(0,100),false);
 assert.equal(validSegment(30,20),false);
 assert.ok(reel.every(s=>s.verification.includes('editorial review')));
 assert.ok(reel.every(s=>s.endSeconds-s.startSeconds<=90));
});
test('the default boxing video project is now a result analysis and preserves pre-fight archive',()=>{
 const queue=JSON.parse(readFileSync(new URL('../public/news/video-production/index.json',import.meta.url)));
 assert.equal(queue.projects[0].fightId,'dubois-wardley-2-postfight');
 assert.match(queue.projects[0].fightStatus,/Result confirmed/);
 assert.equal(queue.projects.find(x=>x.fightId==='dubois-wardley-2').editorialStatus,'historical_prediction_draft');
 assert.equal(project.result.winner,'Daniel Dubois');
 assert.equal(project.result.round,2);
 assert.ok(project.scripts.youtube.draft.split(/\s+/).length>=600);
 assert.equal(project.footageCoverage.realFightNightHighlights,false);
});

test('the automatic YouTube Data API feed puts genuine October fight highlights first',()=>{
 const feed=JSON.parse(readFileSync(new URL('../public/news/video-production/auto-discovery/dubois-wardley-2-postfight.json',import.meta.url)));
 assert.ok(feed.videos.length>=4);
 assert.equal(feed.videos[0].videoId,'0oAF0n0vzrE');
 assert.equal(feed.videos[0].publisher,'DAZN Boxing');
 assert.equal(feed.videos[0].kind,'fight');
 assert.ok(feed.videos.every(x=>x.embedVerifiedByYouTubeAPI===true && x.clearedForExport===false));
 const assembled=buildRealFootageReel({...project,sources:[...feed.videos,...project.sources]});
 assert.equal(assembled[0].id,'0oAF0n0vzrE');
 assert.ok(assembled.some(x=>x.id==='2W33Uyr3KBc'));
 assert.ok(assembled.every(x=>x.rightsCleared===false));
});
