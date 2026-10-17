// Browser-level Film Room smoke test: real video -> editable clip -> FFmpeg/WASM export.
// Runs against Vite preview in GitHub Actions; no real broadcast sources or Lovable credits.
import {chromium,webkit,devices} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import JSZip from 'jszip';

const origin=process.env.FILMROOM_URL||'http://127.0.0.1:4173';
const fixture=process.env.FILMROOM_FIXTURE||'/tmp/aura-filmroom-browser/source.mp4';
const voice=process.env.FILMROOM_VOICE||'/tmp/aura-filmroom-browser/voice.wav';
const output=process.env.FILMROOM_OUTPUT||'/tmp/aura-filmroom-browser/outputs';
await fs.mkdir(output,{recursive:true});

const browserName=process.env.FILMROOM_BROWSER||'chromium';
const engine=browserName==='webkit'?webkit:chromium;
const browser=await engine.launch({
 headless:true,...(browserName==='chromium'?{args:['--autoplay-policy=no-user-gesture-required']}:{})
});
const page=await browser.newPage(browserName==='webkit'?
 {...devices['iPhone 13'],acceptDownloads:true}:
 {viewport:{width:1365,height:900},acceptDownloads:true}
);
console.log('Browser engine:',browserName);
const errors=[];
page.on('pageerror',e=>errors.push('Page: '+e.message));
page.on('console',message=>{if(message.type()==='error')errors.push('Console: '+message.text());});
page.setDefaultTimeout(25000);

async function saveScreenshot(name){
 try{await page.screenshot({path:path.join(output,name+'.png'),fullPage:true});}catch{}
}
async function readResult(label){
 const result=page.locator('.aura-edit-rendered video');
 await result.waitFor({state:'visible',timeout:300000});
 const info=await page.evaluate(async()=>{
  const video=document.querySelector('.aura-edit-rendered video');
  const blob=await (await fetch(video.src)).blob();
  const header=new TextDecoder().decode((await blob.arrayBuffer()).slice(4,8));
  return {size:blob.size,type:blob.type,header};
 });
 if(info.size<8000||info.header!=='ftyp')throw new Error(label+' did not produce a valid MP4 file: '+JSON.stringify(info));
 const [download]=await Promise.all([
  page.waitForEvent('download',{timeout:45000}),
  page.getByRole('button',{name:/Download MP4/}).click()
 ]);
 await download.saveAs(path.join(output,label+'.mp4'));
 console.log(label+' export PASS',info);
}
try{
 console.log('Navigating',origin+'/admin/video-production');
 await page.goto(origin+'/admin/video-production',{waitUntil:'domcontentloaded',timeout:60000});
 await page.getByText('One subject. One prepared video.').waitFor({state:'visible'});
 await page.getByText('Automatically prepared narration').waitFor({state:'visible'});
 await page.getByText('Script-aligned video timeline').waitFor({state:'visible'});
 await page.getByText('Produced drafts and job status').waitFor({state:'visible'});
 await page.getByRole('button',{name:'Check job results'}).waitFor({state:'visible'});
 console.log('Automatic film dashboard displays production status, narration shots and draft delivery controls.');
 console.log('Automatic producer dashboard loads and script timeline renders.');
 // Real multi-scene ZIP -> automatic producer -> IndexedDB -> manual editor.
 // Separate browser context keeps this technical demo separate from the existing
 // iPhone real-video/audio export test and avoids contaminating its source rights.
 const importPage=await browser.newPage(browserName==='webkit'?
  {...devices['iPhone 13'],acceptDownloads:true}:
  {viewport:{width:1365,height:900},acceptDownloads:true});
 importPage.on('pageerror',e=>errors.push('Import UI: '+e.message));
 await importPage.goto(origin+'/admin/video-production',{waitUntil:'domcontentloaded'});
 await importPage.waitForFunction(()=>{
  return (document.querySelector('.aura-producer-script')?.textContent?.length||0)>150;
 });
 const sourceFile=await fs.readFile(fixture);
 const timelineScenes=[1,2].map(i=>({
  id:'acceptance-'+i,role:i===1?'fight':'training',
  shotSeconds:4,narration:i===1?'A historical boxing demonstration.':'Synthetic test: do not publish.',
  illustrative:true,localClip:'editable-clips/scene-'+String(i).padStart(3,'0')+'.mp4'
 }));
 const zip=new JSZip();
 zip.file('production.json',JSON.stringify({
  status:'rough_cut_generated',testFixture:true,publishable:false,
  shots:timelineScenes,notes:['Historic sample only: no real modern fighter footage']
 }));
 zip.file('roughcut-youtube.mp4',sourceFile);
 zip.file('editable-timeline.json',JSON.stringify({
  format:'AURA-FILMROOM-EDIT-V1',
  scenes:timelineScenes,sceneCount:2,estimatedDurationSeconds:8
 }));
 for(const scene of timelineScenes)zip.file(scene.localClip,sourceFile);
 const editPack=await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'});
 await importPage.locator('.aura-producer-local-zip input[type=file]').setInputFiles({
  name:'aura-browser-editor-regression.zip',mimeType:'application/zip',buffer:editPack
 });
 await importPage.getByRole('button',{name:/Open all automatic cuts in the editor/}).waitFor({state:'visible',timeout:45000});
 await importPage.getByRole('button',{name:/Open all automatic cuts in the editor/}).click();
 try{
  await importPage.waitForURL(/\/admin\/video-production\/editor\?fightId=/,{timeout:30000});
 }catch(error){
  console.error('Import navigation URL:',importPage.url());
  console.error('Import status details:',await importPage.locator('.aura-producer-status').allTextContents().catch(()=>[]));
  console.error('Visible editor button:',await importPage.getByRole('button',{name:/Open all automatic cuts/}).allTextContents().catch(()=>[]));
  await importPage.screenshot({path:path.join(output,'automatic-import-failure.png'),fullPage:true}).catch(()=>{});
  throw error;
 }
 await importPage.getByText('Film Room Studio').first().waitFor({state:'visible',timeout:25000});
 await importPage.locator('.aura-edit-asset').first().waitFor({state:'visible',timeout:45000});
 const restoredCount=await importPage.locator('.aura-edit-asset').count();
 if(restoredCount<2)throw new Error('Automatic scene ZIP did not restore both editable MP4 clips: '+restoredCount);
 await importPage.waitForFunction(()=>document.querySelector('.aura-edit-screen video')?.videoWidth>0,null,{timeout:45000});
 await importPage.close();
 console.log('Automatic ZIP-to-editable-timeline browser import PASS: 2 actual MP4 scene assets on '+browserName);

 await page.goto(origin+'/admin/video-production/editor',{waitUntil:'domcontentloaded',timeout:60000});
 await page.getByText('Film Room Studio').first().waitFor({state:'visible'});
 await page.locator('textarea[aria-label="Narration script"]').waitFor({state:'visible',timeout:35000});
 await saveScreenshot('initial-editor');
 // Important regression: simulate real user tapping the one-click demo.
 await page.getByRole('button',{name:/Load test boxing footage/}).click();
 await page.locator('.aura-edit-asset').first().waitFor({state:'visible',timeout:65000});
 await page.waitForFunction(()=>{
  const el=document.querySelector('.aura-edit-screen video');
  return Boolean(el && el.readyState>=1 && el.videoWidth>0);
 },null,{timeout:45000});
 await page.locator('.aura-edit-screen video').first().evaluate(async video=>{
  // Browser autoplay can remain pending on iOS even though metadata and frames decode correctly.
  // Loaded frame data, not programmatic autoplay, is the compatibility signal.
  if(video.readyState<2)await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(new Error('iPhone video preview never reached HAVE_CURRENT_DATA')),10000);
   video.addEventListener('loadeddata',()=>{clearTimeout(timer);resolve();},{once:true});
  });
  if(video.videoWidth<100)throw new Error('The test MP4 has no playable video dimensions.');
 });
 await saveScreenshot('real-demo-footage-visible');
 console.log('One-click static real-footage playback PASS');
 await page.locator('.aura-edit-asset-actions button').filter({hasText:/Remove/}).first().click();
 await page.getByRole('tab',{name:/Bring in footage/}).click();
 await page.locator('.aura-finder-drop input[type=file]').setInputFiles(fixture);
 await page.locator('.aura-edit-asset').first().waitFor({state:'visible',timeout:55000});
 await page.locator('.aura-edit-asset input[type=checkbox]').first().check();
 await page.locator('textarea[aria-label="Narration script"]').fill('This is genuine historic boxing footage. Watch the action.');
 const test=page.getByRole('button',{name:/Test export first/});
 await test.waitFor({state:'visible'});
 await page.waitForFunction(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Test export first'));return Boolean(b&&!b.disabled);},null,{timeout:45000});
 await saveScreenshot('edited-real-footage');
 console.log('Starting silent real video FFmpeg/WASM export');
 await test.click();
 await page.locator('.aura-edit-rendered video').waitFor({state:'visible',timeout:300000});
 await readResult('silent');
 await saveScreenshot('silent-export-success');

 console.log('Testing recorded-audio file mixing in browser');
 await page.locator('.aura-edit-audio-upload input[type=file]').setInputFiles(voice);
 await page.getByRole('button',{name:/Export MP4 with my narration/}).waitFor({state:'visible'});
 await page.getByRole('button',{name:/Export MP4 with my narration/}).click();
 await page.locator('.aura-edit-rendered video').waitFor({state:'visible',timeout:300000});
 await readResult('narrated');
 await saveScreenshot('narrated-export-success');
 console.log('Film Room browser demo PASS; no copyright-restricted footage used.');
}catch(error){
 console.error('Browser smoke test failed:',error.message);
 console.error('App status:',await page.locator('.aura-edit-status,.aura-edit-render-error').allTextContents().catch(()=>[]));
 console.error('Browser errors:',errors.slice(-15));
 await saveScreenshot('filmroom-test-failure');
 await fs.writeFile(path.join(output,'diagnostics.json'),JSON.stringify({
  error:error.stack,errors:errors.slice(-30),
  url:page.url(),status:await page.locator('.aura-edit-status,.aura-edit-render-error').allTextContents().catch(()=>[])
 },null,2));
 process.exitCode=1;
}finally{await browser.close();}
