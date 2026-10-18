import test from 'node:test';
import assert from 'node:assert/strict';
import { makeTrailerPlan, totalDuration, checkTrailerPlan, checkDraftRenderPlan, exportManifest, safeAssetName } from '../src/lib/trailerStudio.js';

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

import { parseFootageUrl, parseTime, youtubeEmbedLink, validFootageRange } from '../src/lib/footageLinks.js';
test('YouTube watch, short and shorts links can be previewed without API keys', () => {
 assert.equal(parseFootageUrl('https://youtu.be/M7lc1UVf-VE?t=1m12s').start,72);
 assert.equal(parseFootageUrl('https://youtube.com/shorts/M7lc1UVf-VE').videoId,'M7lc1UVf-VE');
 assert.equal(parseFootageUrl('https://www.youtube.com/watch?v=M7lc1UVf-VE&t=45').kind,'youtube');
 assert.equal(parseFootageUrl('https://notyoutube.com/watch?v=M7lc1UVf-VE').kind,'invalid');
 assert.match(youtubeEmbedLink('M7lc1UVf-VE',22,27),/start=22.*end=27/);
});
test('clip ranges support timestamps and reject bad ranges', () => {
 assert.equal(parseTime('01:23'),83);
 assert.equal(parseTime('1h2m3s'),3723);
 assert.equal(validFootageRange(23,29),true);
 assert.equal(validFootageRange(29,23),false);
});
test('rough-cut export depends on local media, not public rights approval', () => {
 const p=makeTrailerPlan(), f=new Set();
 p.shots.forEach((s,i)=>{s.fileName='media/scene-'+i+'.mp4';f.add(s.fileName)});
 assert.deepEqual(checkDraftRenderPlan(p,f),[]);
 assert.ok(checkTrailerPlan(p,f).length>0);
 p.shots[0].fileName='';
 assert.ok(checkDraftRenderPlan(p,f).length>0);
});
test('footage link references and trim offsets survive JSON storyboard export',()=>{
 const p=makeTrailerPlan();
 p.shots[2].referenceUrl='https://www.youtube.com/watch?v=M7lc1UVf-VE';
 p.shots[2].referenceStartSeconds=14;
 p.shots[2].referenceEndSeconds=18;
 p.shots[2].trimStartSeconds=14;
 const m=exportManifest(p);
 assert.equal(m.shots[2].reference_start,14);
 assert.equal(m.shots[2].trim_start,14);
});
