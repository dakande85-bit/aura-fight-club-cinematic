import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {inspectFilmArtifact,describeFilmReport,extractEditableFilmClips} from '../src/lib/auraFilmArtifact.js';

async function pack(fields){
 const zip=new JSZip();
 for(const [name,data] of Object.entries(fields))zip.file('auto-film-dubois-wardley-2/'+name,data);
 return zip.generateAsync({type:'arraybuffer',compression:'DEFLATE'});
}
test('production with no rights-cleared sources exposes honest blocker report, not fake video',async()=>{
 const report={status:'needs_licensed_footage',notes:['No cleared highlights files'],shots:[]};
 const result=await inspectFilmArtifact(await pack({'production.json':JSON.stringify(report)}));
 assert.equal(result.video,null);
 assert.equal(result.report.status,'needs_licensed_footage');
 assert.match(result.description,/No usable licensed footage/);
});
test('completed roughcut MP4 is extracted and can be previewed inside the editor',async()=>{
 const bytes=new Uint8Array(14000);
 bytes.set(new TextEncoder().encode('ftyp'),4);
 const report={status:'rough_cut_generated',shots:[{id:'beat-1'}]};
 const result=await inspectFilmArtifact(await pack({
  'production.json':JSON.stringify(report),'roughcut-youtube.mp4':bytes
 }));
 assert.equal(result.video.type,'video/mp4');
 assert.equal(result.video.size,14000);
 assert.equal(result.report.shots.length,1);
});
test('cannot open a video pack with no editorial provenance report',async()=>{
 await assert.rejects(inspectFilmArtifact(await pack({'roughcut-youtube.mp4':new Uint8Array(18000)})),/missing its editorial report/);
});
test('the UI clearly differentiates failed rendering and missing script',()=>{
 assert.match(describeFilmReport({status:'render_failed'}),/error/i);
 assert.match(describeFilmReport({status:'needs_script'}),/Narration/);
});

test('automatically rendered scene files are imported as editable MP4 assets without auto-approving publication',async()=>{
 const bytes=new Uint8Array(2200);
 bytes.set(new TextEncoder().encode('ftyp'),4);
 const manifest={format:'AURA-FILMROOM-EDIT-V1',scenes:[
  {id:'scene-1',role:'fight',narration:'Check the jab',shotSeconds:5,
   illustrative:true,localClip:'editable-clips/scene-001.mp4'},
  {id:'scene-2',role:'weighin',narration:'At the scales',shotSeconds:4,
   illustrative:false,localClip:'editable-clips/scene-002.mp4'}
 ]};
 const zip=await pack({
  'production.json':JSON.stringify({status:'rough_cut_generated',shots:manifest.scenes,testFixture:true}),
  'editable-timeline.json':JSON.stringify(manifest),
  'editable-clips/scene-001.mp4':bytes,
  'editable-clips/scene-002.mp4':bytes
 });
 const result=await extractEditableFilmClips(zip);
 assert.equal(result.clips.length,2);
 assert.equal(result.clips[0].kind,'fight');
 assert.equal(result.clips[1].kind,'faceoff');
 assert.equal(result.clips[1].narration,'At the scales');
 assert.equal(result.clips[0].blob.type,'video/mp4');
 assert.ok(result.clips.every(x=>x.rightsReviewed===false));
});
test('film pack refuses invalid embedded scene path and will not import arbitrary ZIP files',async()=>{
 const bytes=new Uint8Array(2200);bytes.set(new TextEncoder().encode('ftyp'),4);
 const zip=await pack({
  'production.json':JSON.stringify({status:'rough_cut_generated'}),
  'editable-timeline.json':JSON.stringify({format:'AURA-FILMROOM-EDIT-V1',
    scenes:[{localClip:'../outside.mp4',shotSeconds:5}]}),
  'editable-clips/scene-001.mp4':bytes
 });
 await assert.rejects(extractEditableFilmClips(zip),/invalid editable scene path/);
});
