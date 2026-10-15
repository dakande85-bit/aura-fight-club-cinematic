import assert from 'node:assert/strict';
import { fighters } from '../src/data/seoEntities.js';
import { fighterPhotography } from '../src/data/boxingPhotography.js';
import { auraTop50, auraTop50CheckedAt } from '../src/data/auraTop50.js';

assert.equal(auraTop50.length, 50, 'AURA 50 must list 50 active fighters');
assert.equal(new Set(auraTop50.map(f => f.slug)).size, 50, 'Duplicated top-50 fighter');
assert.match(auraTop50CheckedAt, /^20\d{2}-\d\d-\d\d$/, 'Snapshot date missing');

let verifiedBouts = 0;
let profileCount = 0;
for (const [index, fighter] of auraTop50.entries()) {
  assert.equal(fighter.rank, index + 1, 'Unordered rankings at ' + fighter.slug);
  assert.ok(fighter.slug && fighter.name && fighter.division && fighter.reason, 'Missing editorial data at ' + fighter.rank);
  assert.ok(!/crawford/i.test(fighter.slug), 'Retired fighter in active ranking');
  const profile = fighters.find(f => f.slug === fighter.slug);
  if (profile) profileCount++;
  assert.ok(!profile?.careerStatus || profile.careerStatus !== 'Retired', 'Retired fighter: ' + fighter.slug);
  const picture = fighterPhotography[fighter.slug];
  assert.ok(picture?.src && picture?.alt && picture?.credit && picture?.sourceUrl, 'Missing image metadata: ' + fighter.slug);
  assert.ok(/^https:\/\//.test(picture.src), 'Expected HTTPS portrait: ' + fighter.slug);
  const bouts = fighter.recentBouts || [];
  assert.ok(bouts.length <= 5, 'Too many bouts: ' + fighter.slug);
  for (const [i,bout] of bouts.entries()) {
    assert.ok(bout.date && bout.opponent && bout.result && bout.method && bout.sourceUrl, 'Incomplete bout: '+fighter.slug);
    assert.ok(['W','L','D','NC'].includes(bout.result), 'Invalid result '+fighter.slug);
    assert.ok(/^https:\/\//.test(bout.sourceUrl), 'Unverifiable bout '+fighter.slug);
    assert.ok(bout.date <= auraTop50CheckedAt, 'Future bout '+fighter.slug);
    if (i) assert.ok(bouts[i-1].date >= bout.date, 'Unsorted recent form: '+fighter.slug);
    verifiedBouts++;
  }
}

console.log(`AURA 50 validated: 50 ranked / 50 portrait candidates / ${profileCount} profiles / ${verifiedBouts} sourced bout entries.`);
console.log('This structural audit does not establish image licenses, hotlink success or whether bout ledgers are complete.');
