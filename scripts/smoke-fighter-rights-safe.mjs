/** Prove that opt-in rights-strict production builds display safe placeholders
 * instead of fetching rights-unconfirmed publisher portrait URLs.
 */
import {chromium} from 'playwright';
const origin=process.env.AURA_QA_URL||'http://127.0.0.1:4174';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let failed=0;
try{
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 for(const route of ['/fighters','/es/fighters','/fighters/david-benavidez','/fighters/sebastian-fundora']){
  await page.goto(origin+route,{waitUntil:'domcontentloaded'});
  await page.locator('main.aura-editorial').waitFor({timeout:20000});
  const leaking=await page.locator('.aura-photo img[src^="https://"]').count();
  if(leaking){failed++;console.error('Rights-strict mode loaded '+leaking+' external portraits at '+route);}
  else console.log('PASS rights-strict page '+route+' (no externally hotlinked fighter photos)');
  const placeholders=await page.locator('.aura-photo__placeholder').count();
  if(!placeholders){failed++;console.error('No licensed image or named placeholder at '+route);}
 }
}finally{await browser.close();}
if(failed)process.exitCode=1;
console.log('Rights-strict mode verification: '+(failed?'FAILED':'PASS'));
