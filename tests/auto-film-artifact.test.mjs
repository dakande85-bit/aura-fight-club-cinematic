import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {inspectFilmArtifact,describeFilmReport} from '../src/lib/auraFilmArtifact.js';

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
