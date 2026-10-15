import test from 'node:test';
import assert from 'node:assert/strict';
import {articleUrl, latestArticles, storySlides, suggestedCaption, tikTokBioUrl} from '../src/lib/tiktokStudio.js';

const story = {
 slug: 'smith-puello-preview', title: 'Smith versus Puello: a real tactical test',
 summary: 'Smith must manage Puello\'s lead hand and avoid the counter.',
 body: ['## What makes it tricky', 'The southpaw stance changes the lead-foot battle and the jab.', '## The final word', 'The answer will depend on who controls range through the middle rounds.'],
 tags: ['Dalton Smith', 'WBC'],
 date: '2026-10-15'
};
test('slugs cannot inject offsite links', () => {
 assert.equal(articleUrl('https://evil.test'), '');
 assert.equal(articleUrl('../hello'), '');
 assert.match(articleUrl('smith-puello-preview'), /utm_source=tiktok/);
 assert.match(tikTokBioUrl, /\/tiktok\?/);
});
test('carousel uses article text without invented fight facts',()=>{
 const slides=storySlides(story);
 assert.equal(slides[0].kind,'cover');
 assert.ok(slides.length>=3 && slides.length<=5);
 assert.ok(slides.some(s=>s.body.includes('southpaw')));
 assert.ok(!slides.some(s=>s.body.includes('undefeated')));
});
test('caption invites readers to website without claiming a clickable post link',()=>{
 const caption=suggestedCaption(story);
 assert.match(caption,/link in bio/);
 assert.match(caption,/#BoxingNews/);
 assert.ok(!caption.includes('https://'));
});
test('latest sorts and filters',()=>{
 const x=latestArticles([story,{...story,slug:'new',date:'2026-10-16'},{title:'missing slug'}]);
 assert.equal(x[0].slug,'new');
 assert.equal(x.length,2);
});