/**
 * Desktop + mobile browser release QA against the real Vite preview server.
 * Run with: npm install --no-save playwright && npx playwright install chromium
 *           npm run preview -- --host 127.0.0.1 --port 4173
 *           node scripts/smoke-fighter-browser.mjs
 */
import {chromium} from 'playwright';
import fs from 'node:fs/promises';

const origin=process.env.AURA_QA_URL||'http://127.0.0.1:4173';
const output='qa-artifacts/fighter-intelligence';
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const errors=[];
const observed=[];
let failures=0;

async function assert(name,test,page) {
 let passed=false;
 const deadline=Date.now()+3500;
 // React replaces server-prerendered HTML asynchronously; allow the UI to settle.
 do {
  try {passed=Boolean(await test());} catch {passed=false;}
  if(passed) break;
  await page?.waitForTimeout(100);
 } while(Date.now()<deadline);
 observed.push({name,passed});
 if(!passed){failures++;console.error('FAIL '+name+' '+(page?.url()||''));}
 else console.log('PASS '+name);
}
async function openPage(page,path) {
 await page.goto(origin+path,{waitUntil:'domcontentloaded',timeout:25000});
 // Wait for the interactive React shell, not the prerendered static <main>.
 await page.locator('main.aura-editorial, main.aura-compare-page').waitFor({timeout:25000});
 await page.waitForTimeout(100);
}
async function screenshot(page,name){
 await page.screenshot({path:`${output}/${name}.png`,animations:'disabled',timeout:30000});
}
async function layoutChecks(page,label) {
 await assert(label+' has no viewport overflow',async()=>page.evaluate(()=>{
  const surface=document.querySelector('main.aura-editorial');
  if(!surface)return false;
  return document.documentElement.scrollWidth <= window.innerWidth+3;
 }),page);
}
try{
 for(const [name,width,height]of [['desktop',1440,900],['mobile',390,844]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(name+': '+e.message));
  await openPage(page,'/fighters');
  await assert(name+' loads four directory tiers',async()=>page.locator('.aura-intelligence-group').count()===4,page);
  await assert(name+' shows 50 distinct AURA rows',async()=>page.locator('.aura-50__row').count()===50,page);
  await assert(name+' displays all 50 details',async()=>page.locator('.aura-50__row summary').count()===50,page);
  await layoutChecks(page,name+' directory');
  await screenshot(page,name+'-fighters-index');
  await page.locator('#aura-top-50').scrollIntoViewIfNeeded();
  await screenshot(page,name+'-aura-top50');
  await page.locator('.aura-50__toolbar select').first().selectOption('Heavyweight');
  await assert(name+' division filter actually works',async()=> {
   const count=await page.locator('.aura-50__row').count();
   const names=await page.locator('.aura-50__row .aura-50__division').allTextContents();
   return count>0&&count<50&&names.every(n=>n.includes('Heavyweight'));
  },page);
  await page.locator('.aura-50__toolbar select').first().selectOption('all');
  const search=page.locator('.aura-directory-controls input[type=search]');
  await search.fill('Sebastian Fundora');
  await assert(name+' searches fighter cards and rank list',async()=>page.locator('.aura-50__row').count()===1&&await page.locator('.aura-fighter-tile').count()===1,page);
  await search.fill('');
  await page.locator('.aura-50__row').first().locator('summary').click();
  await assert(name+' ranking detail opens with fighter link',async()=>page.locator('.aura-50__row').first().locator('.aura-50__profile-link').isVisible(),page);
  await page.locator('.aura-50__row').first().locator('.aura-50__profile-link').click();
  await assert(name+' fighter profile navigation works',async()=>page.url().includes('/fighters/jesse-bam-rodriguez'),page);
  await openPage(page,'/es/fighters');
  await assert(name+' Spanish route retains ranking',async()=>page.locator('.aura-50__row').count()===50,page);
  await assert(name+' Spanish route has Spanish headings',async()=>await page.locator('#aura-50-title').textContent().then(x=>x.includes('LOS 50')),page);
  await layoutChecks(page,name+' Spanish directory');
  await screenshot(page,name+'-spanish-index');
  await openPage(page,'/fighters/compare');
  await assert(name+' comparison renders',async()=>await page.locator('body').innerText().then(x=>x.length>200),page);
  await screenshot(page,name+'-comparison');
  await context.close();
 }
 const context=await browser.newContext({viewport:{width:1280,height:800}});
 const page=await context.newPage();
 for(const slug of ['david-benavidez','dmitry-bivol','devin-haney','sebastian-fundora']){
  page.on('pageerror',e=>errors.push('fighter '+slug+': '+e.message));
  await openPage(page,'/fighters/'+slug);
  await assert(slug+' fighter photo loads',async()=>{
   const img=page.locator('.aura-profile-hero .aura-photo img');
   if(!await img.count())return false;
   try {return await img.evaluate(async img=>{
    if(img.complete)return img.naturalWidth>0;
    return await new Promise(resolve=>{
     img.addEventListener('load',()=>resolve(img.naturalWidth>0),{once:true});
     img.addEventListener('error',()=>resolve(false),{once:true});
     setTimeout(()=>resolve(false),10000);
    });
   });}catch{return false}
  },page);
  await assert(slug+' includes sourced form',async()=>page.locator('.aura-profile-recent-bout').count()===5,page);
  await screenshot(page,'fighter-'+slug);
 }
 await context.close();
 await assert('no JS exceptions in tested pages',async()=>errors.length===0);
}finally{
 await browser.close();
 await fs.writeFile(output+'/report.json',JSON.stringify({observed,errors,failures},null,2));
}
console.log('AURA browser QA: '+(observed.length-failures)+' passed, '+failures+' failed; screenshots in '+output);
if(failures)process.exitCode=1;
