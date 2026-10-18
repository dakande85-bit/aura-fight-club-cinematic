import test from 'node:test';
import assert from 'node:assert/strict';
import {youtubeId,watchUrl,embedUrl,directVideoUrl,researchQueries,youtubeSearchUrl} from '../src/lib/auraFootageSources.js';

test('imports known YouTube watch and short links into a watchable reference',()=>{
 const id='5HReUSh22bY';
 for(const url of [
  'https://www.youtube.com/watch?v='+id+'&t=30',
  'https://m.youtube.com/watch?v='+id,
  'https://youtu.be/'+id,
  'https://youtube.com/shorts/'+id,
  'https://www.youtube.com/embed/'+id,
  'https://www.youtube.com/live/'+id
 ])assert.equal(youtubeId(url),id);
 assert.equal(watchUrl(id),'https://www.youtube.com/watch?v='+id);
 assert.ok(embedUrl(id).includes('/embed/'+id));
});
test('rejects spoofed video hosts, mixed schemes and other web links',()=>{
 for(const link of [
  'https://youtube.com.evil.test/watch?v=5HReUSh22bY',
  'https://evil-youtube.com/watch?v=5HReUSh22bY',
  'http://youtube.com/watch?v=5HReUSh22bY',
  'javascript:alert(1)',
  'https://www.youtube.com/watch?v=short',
  'https://www.youtube.com/watch?v=5HReUSh22bYabc'
 ])assert.equal(youtubeId(link),null);
});
test('direct video import accepts explicit HTTPS files, not watch pages',()=>{
 assert.equal(directVideoUrl('https://example.org/boxing.mp4'),'https://example.org/boxing.mp4');
 assert.equal(directVideoUrl('https://example.org/boxing.webm?token=abc'),'https://example.org/boxing.webm?token=abc');
 assert.equal(directVideoUrl('https://youtu.be/5HReUSh22bY'),'');
 assert.equal(directVideoUrl('https://r1.googlevideo.com/video.mp4'),'');
 assert.equal(directVideoUrl('http://example.org/boxing.mp4'),'');
 assert.equal(directVideoUrl('https://example.org/other.zip'),'');
});
test('search queries are based on chosen fight instead of hardcoded Dubois topic',()=>{
 const q=researchQueries({title:'Canelo Alvarez vs Christian Mbilli — AURA Film Room'});
 assert.equal(q.length,4);
 assert.ok(q.every(s=>s.q.includes('Canelo Alvarez')));
 assert.ok(youtubeSearchUrl(q[0].q).startsWith('https://www.youtube.com/results?search_query='));
});
