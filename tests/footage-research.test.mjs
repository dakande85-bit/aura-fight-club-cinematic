import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';

const data=JSON.parse(readFileSync(new URL('../creator/footage-research.json',import.meta.url),'utf8'));

test('real fight references are research-only by default',()=>{
 assert.equal(data.storyId,'dubois-wardley-ii');
 assert.ok(data.sources.length>=3);
 for(const source of data.sources){
  assert.equal(source.rightsStatus,'reference_only',source.id);
  assert.match(source.url,/^https:\/\//);
  assert.ok(source.rightsHolder?.length>4,source.id);
  assert.ok(source.topics?.length>0);
  assert.ok(source.usageNotes?.length>10);
 }
});

test('official fight action source is distinct from media licence',()=>{
 const fight=data.sources.find(s=>s.id==='dazn-first-fight-highlights');
 assert.equal(fight.sourceType,'authentic_fight_footage');
 assert.ok(fight.url.includes('youtube.com/watch?'));
 assert.match(fight.usageNotes,/no download or reuse clearance/i);
});

test('licensing contacts are explicitly included for original footage',()=>{
 const rights=data.licensingContacts.find(c=>c.organisation.includes('IMG'));
 assert.ok(rights);
 assert.equal(rights.url,'https://imgvideoarchive.com/client/frank_warren_boxing');
 assert.ok(rights.contact?.endsWith('@img.com'));
});
