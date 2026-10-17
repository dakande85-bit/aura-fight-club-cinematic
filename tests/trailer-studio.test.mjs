import test from 'node:test';
import assert from 'node:assert/strict';
import { makeTrailerPlan, totalDuration, checkTrailerPlan, exportManifest, safeAssetName } from '../src/lib/trailerStudio.js';

test('Fundora template is a clear hypothetical matchup, not an announced fight', () => {
 const plan = makeTrailerPlan();
 assert.equal(plan.fightStatus, 'hypothetical');
 assert.equal(plan.shots.at(-1).kind, 'reveal');
 assert.match(plan.name, /Fundora/);
 assert.equal(totalDuration(plan), 24);
});
test('breakdown template prioritises genuine fight footage', () => {
 const plan = makeTrailerPlan('commentary');
 assert.equal(totalDuration(plan), 45);
 assert.equal(plan.shots.filter(x => x.kind === 'ai_scene').length, 0);
});
test('unreviewed and missing media cannot be rendered or exported as ready', () => {
 const plan = makeTrailerPlan();
 const issues = checkTrailerPlan(plan);
 assert.ok(issues.some(x => x.includes('attach')));
 assert.ok(issues.some(x => x.includes('permission')));
 assert.ok(issues.some(x => x.includes('accuracy')));
});
test('rights approval, provenance and accurate file matching are mandatory', () => {
 const plan = makeTrailerPlan();
 const files = new Set();
 for (const scene of plan.shots) {
   scene.fileName = 'media/' + scene.id + '.mp4';
   files.add(scene.fileName);
   scene.rightsVerified = true;
   scene.approved = true;
   scene.rights = scene.kind === 'ai_scene' ? 'original_ai' : 'licensed';
   scene.sourceUrl = scene.kind === 'ai_scene' ? '' : 'rights-approval-' + scene.id;
 }
 assert.deepEqual(checkTrailerPlan(plan, files), []);
 plan.shots[0].sourceUrl = '';
 assert.match(checkTrailerPlan(plan, files).join('\n'), /source/);
 plan.shots[0].sourceUrl = 'licence 123';
 plan.shots[1].aiDisclosure = false;
 assert.match(checkTrailerPlan(plan, files).join('\n'), /illustrative/);
});
test('manifest is review-only and includes disclaimer flags for AI and proposed fights', () => {
 const plan = makeTrailerPlan();
 const manifest = exportManifest(plan);
 assert.equal(manifest.schema, 'aura-cinematic-trailer-v1');
 assert.equal(manifest.publication_status, 'DRAFT_NOT_PUBLISHED');
 assert.equal(manifest.fight_status, 'hypothetical');
 assert.ok(manifest.shots.some(x => x.ai_illustration));
});
test('asset names are filesystem-safe', () => {
 assert.equal(safeAssetName('../../evil footage?.mp4'), 'evil_footage_.mp4');
});
