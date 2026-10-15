import {useEffect,useMemo,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import JSZip from 'jszip';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import {articles as bundledArticles} from '../data/editorial.js';
import {articleUrl, latestArticles, suggestedCaption, storySlides, tikTokBioUrl} from '../lib/tiktokStudio.js';
import {canvasPng, drawTikTokSlide} from '../lib/tiktokCardCanvas.js';
import '../styles/aura-social-studio.css';

const workflow='https://github.com/dakande85-bit/aura-fight-club-cinematic/actions/workflows/aura-video-exports.yml';
const tiktokUpload='https://www.tiktok.com/upload';
function downloadBlob(blob,filename) {
 const url=URL.createObjectURL(blob), link=document.createElement('a');
 link.href=url;link.download=filename;document.body.appendChild(link);link.click();link.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),3000);
}
function getReviews() {
 try{return JSON.parse(localStorage.getItem('aura-social-reviewed-v1')||'{}');}catch{return {};}
}
export default function AdminSocial(){
 const [stories,setStories]=useState(()=>latestArticles(bundledArticles,200));
 const [queue,setQueue]=useState({items:[]});
 const [slug,setSlug]=useState('');
 const [search,setSearch]=useState('');
 const [angle,setAngle]=useState('question');
 const [captionDraft,setCaptionDraft]=useState('');
 const [slideNumber,setSlideNumber]=useState(0);
 const [imageFile,setImageFile]=useState(null);
 const [clearedRights,setClearedRights]=useState(false);
 const [photo,setPhoto]=useState(null);
 const [reviewed,setReviewed]=useState(getReviews);
 const [status,setStatus]=useState('');
 const [exporting,setExporting]=useState(false);
 const [queueError,setQueueError]=useState('');
 const canvasRef=useRef(null);

 useEffect(()=>{
  const controller=new AbortController();
  fetch('/api/articles',{cache:'no-store',signal:controller.signal}).then(r=>{
   if(!r.ok)throw Error('Live article endpoint unavailable');
   return r.json();
  }).then(data=>{
   if(Array.isArray(data.articles)&&data.articles.length)setStories(latestArticles(data.articles,200));
  }).catch(()=>{}); // The bundled, published edition remains available offline.
  fetch('/news/social-queue.json',{cache:'no-store',signal:controller.signal}).then(r=>{
   if(!r.ok)throw Error('Prepared cover queue unavailable');
   return r.json();
  }).then(data=>{if(Array.isArray(data.items))setQueue(data);})
   .catch(e=>{if(e.name!=='AbortError')setQueueError('Existing cover queue is unavailable; image-pack creation still works.');});
  return()=>controller.abort();
 },[]);
 const items=useMemo(()=>stories.filter(a=>[a.title,a.category,...(a.tags||[])].join(' ').toLowerCase().includes(search.toLowerCase())),[stories,search]);
 const active=useMemo(()=>stories.find(a=>a.slug===slug)||stories[0]||null,[stories,slug]);
 const slides=useMemo(()=>storySlides(active),[active]);
 const caption=useMemo(()=>suggestedCaption(active,angle),[active,angle]);
 const tracked=useMemo(()=>active?articleUrl(active.slug,'tiktok_'+active.slug):'',[active]);
 useEffect(()=>setCaptionDraft(caption),[caption]);
 const prepared=useMemo(()=>queue.items.find(x=>x.slug===active?.slug),[queue.items,active]);

 useEffect(()=>setSlideNumber(0),[active?.slug]);
 useEffect(()=>{
  if(!imageFile){return undefined;}
  if(!imageFile.type.startsWith('image/')){setStatus('Choose a JPG, PNG or WebP image.');return undefined;}
  const url=URL.createObjectURL(imageFile);
  const img=new Image();
  img.onload=()=>setPhoto(img);
  img.onerror=()=>{setPhoto(null);setStatus('Could not load that image.');};
  img.src=url;
  return()=>{URL.revokeObjectURL(url);setPhoto(null);};
 },[imageFile]);
 useEffect(()=>{
  if(!canvasRef.current || !slides.length)return;
  drawTikTokSlide(canvasRef.current,slides[Math.min(slideNumber,slides.length-1)],Math.min(slideNumber,slides.length-1),slides.length,clearedRights?photo:null);
 },[slides,slideNumber,photo,clearedRights]);

 async function copy(value,label){
  try{await navigator.clipboard.writeText(value);setStatus(label+' copied.');}
  catch{setStatus('Copy unavailable in this browser. Select the text in the caption box and copy manually.');}
 }
 function markReviewed(){
  if(!active)return;
  const updated={...reviewed,[active.slug]:!reviewed[active.slug]};
  setReviewed(updated);
  try{localStorage.setItem('aura-social-reviewed-v1',JSON.stringify(updated));}catch{}
  setStatus('Review state saved on this device only. No content was published.');
 }
 function renderCanvas(index){
  const el=document.createElement('canvas');
  drawTikTokSlide(el,slides[index],index,slides.length,clearedRights?photo:null);
  return el;
 }
 async function exportOne(){
  if(!active || !slides.length)return;
  setExporting(true);setStatus('');
  try{
   const blob=await canvasPng(renderCanvas(slideNumber));
   downloadBlob(blob,active.slug+'-slide-'+String(slideNumber+1).padStart(2,'0')+'.png');
   setStatus('Portrait image downloaded. It has not been posted.');
  }catch(e){setStatus(e.message);}finally{setExporting(false);}
 }
 async function exportPack(){
  if(!active || !slides.length)return;
  setExporting(true);setStatus('');
  try{
   const zip=new JSZip();
   for(let i=0;i<slides.length;i++){
    zip.file(String(i+1).padStart(2,'0')+'-'+active.slug+'.png',await canvasPng(renderCanvas(i)));
   }
   zip.file('caption.txt',captionDraft+'\n\nTracked article: '+tracked+'\nProfile link: '+tikTokBioUrl+'\n');
   zip.file('PUBLISHING-CHECKLIST.txt','AURA Fight Club — TikTok photo post\n\n1. Confirm the source article is up to date and all claims are accurate.\n2. Verify the rights to any user-uploaded photo.\n3. Upload the numbered PNGs as a TikTok photo carousel.\n4. Review caption, choose native music, select post settings and publish manually.\n5. Point your eligible TikTok profile website link to the AURA TikTok landing page.\n6. Record the TikTok post URL and review GA4 traffic by utm_source=tiktok.\n\nThis export does not connect to or post on TikTok.\n');
   downloadBlob(await zip.generateAsync({type:'blob'}),'aura-tiktok-'+active.slug+'.zip');
   setStatus('Photo carousel downloaded as a ZIP. Review and upload in TikTok.');
  }catch(e){setStatus('Unable to generate carousel: '+e.message);}finally{setExporting(false);}
 }

 return <><Header/><main className="aura-social-studio">
  <header className="aura-social-studio__intro">
   <p className="aura-social-studio__eyebrow">AURA / FIGHT DESK / DISTRIBUTION</p>
   <h1>TikTok News Studio</h1>
   <p>Turn a verified Aura article into a 9:16, multi-image TikTok story. Preview every slide, export a complete image pack, copy a caption and drive readers back to the original journalism. No TikTok credentials or paid AI credits required.</p>
   <div className="aura-social-studio__actions">
    <Link to="/admin/articles">Manage news articles</Link>
    <Link to="/tiktok">Preview TikTok traffic page</Link>
    <a href={workflow} target="_blank" rel="noopener noreferrer">Export short MP4 clips ↗</a>
   </div>
  </header>
  <section className="aura-social-studio__workspace" aria-label="TikTok carousel editor">
   <div className="aura-social-studio__controls">
    <p className="aura-social-studio__state">01 / SELECT A VERIFIED STORY</p>
    <label className="aura-social-studio__field">Search articles
     <input type="search" placeholder="Fighter, fight, or headline" value={search} onChange={e=>setSearch(e.target.value)}/>
    </label>
    <label className="aura-social-studio__field">Article to promote
     <select value={active?.slug||''} onChange={e=>setSlug(e.target.value)}>
      {items.length===0?<option value="">No matching stories</option>:items.map(a=><option key={a.slug} value={a.slug}>{a.title}</option>)}
     </select>
    </label>
    {active&&<div className="aura-social-studio__story">
     <span>{active.date} · {active.category}</span>
     <strong>{active.title}</strong>
     <p>{active.summary}</p>
     <Link to={'/news/'+active.slug}>Check published article ↗</Link>
    </div>}
    <p className="aura-social-studio__state">02 / PERSONALISE THE POST</p>
    <label className="aura-social-studio__field">Caption opening
     <select value={angle} onChange={e=>setAngle(e.target.value)}>
      <option value="question">Discussion / ask the fans</option>
      <option value="analysis">Analysis</option>
      <option value="breaking">Straight news</option>
     </select>
    </label>
    <label className="aura-social-studio__rights"><input type="checkbox" checked={clearedRights} onChange={e=>setClearedRights(e.target.checked)}/>
      I own or have verified permission to reuse any photo I upload.
    </label>
    <label className="aura-social-studio__field">Optional licensed fight photograph for cover
     <input type="file" accept="image/png,image/jpeg,image/webp" disabled={!clearedRights} onChange={e=>{
      const f=e.target.files?.[0]||null;
      if(f && f.size>8*1024*1024){setStatus('Image must be smaller than 8 MB.');setImageFile(null);}else{setImageFile(f);}
     }}/>
    </label>
    <p className="aura-social-studio__hint">The default slides are original typography artwork. Uploaded photographs stay in this browser and are never sent to our servers.</p>
    <p className="aura-social-studio__state">03 / DOWNLOAD & PUBLISH MANUALLY</p>
    <div className="aura-social-studio__main-buttons">
     <button type="button" disabled={exporting||!active} onClick={exportPack}>{exporting?'Preparing…':'Download all portrait slides (ZIP)'}</button>
     <button type="button" disabled={exporting||!active} onClick={exportOne}>Download selected PNG</button>
    </div>
    <a className="aura-social-studio__upload-link" href={tiktokUpload} target="_blank" rel="noopener noreferrer">Open TikTok upload ↗</a>
    <label className="aura-social-studio__field">Editable caption for TikTok
     <textarea rows="8" value={captionDraft} onChange={e=>setCaptionDraft(e.target.value)} aria-label="TikTok caption text"/>
    </label>
    <button type="button" className="aura-social-studio__minor-btn" onClick={()=>copy(captionDraft,'Caption')}>Copy TikTok caption</button>
    <div className="aura-social-studio__links">
     <label className="aura-social-studio__field">Tracked article link
      <input readOnly value={tracked}/>
     </label>
     <button type="button" onClick={()=>copy(tracked,'Tracked article link')}>Copy link</button>
     <label className="aura-social-studio__field">TikTok profile website link (set once)
      <input readOnly value={tikTokBioUrl}/>
     </label>
     <button type="button" onClick={()=>copy(tikTokBioUrl,'Profile link')}>Copy bio link</button>
    </div>
    <label className="aura-social-studio__check"><input type="checkbox" checked={Boolean(reviewed[active?.slug])} onChange={markReviewed}/>Mark article and image pack reviewed on this device</label>
    <p className="aura-social-studio__hint">TikTok caption URLs are not normally clickable. Use an eligible account’s profile website link to send followers to <Link to="/tiktok">Aura's TikTok landing page</Link>. Track clicks in GA4 using the TikTok UTM tags.</p>
    {status&&<p role="status" className="aura-social-studio__feedback">{status}</p>}
   </div>
   <div className="aura-social-studio__preview">
    <div className="aura-social-studio__preview-head"><div><p className="aura-social-studio__state">LIVE ARTWORK PREVIEW</p><h2>{slides.length} slides · 1080 × 1920</h2></div><span>{String(slideNumber+1).padStart(2,'0')} / {String(slides.length).padStart(2,'0')}</span></div>
    <canvas ref={canvasRef} width="1080" height="1920" aria-label="Portrait preview of the currently selected TikTok news slide"/>
    <div className="aura-social-studio__slide-nav">
     <button type="button" disabled={slideNumber===0} onClick={()=>setSlideNumber(n=>Math.max(0,n-1))}>← Previous</button>
     <div aria-label="Select slide">{slides.map((s,i)=><button key={i} type="button" className={i===slideNumber?'active':''} aria-label={'Show slide '+(i+1)} aria-current={i===slideNumber?'true':undefined} onClick={()=>setSlideNumber(i)}>{i+1}</button>)}</div>
     <button type="button" disabled={slideNumber>=slides.length-1} onClick={()=>setSlideNumber(n=>Math.min(slides.length-1,n+1))}>Next →</button>
    </div>
    <p className="aura-social-studio__hint">Slides are built from the article text, not generated boxing claims. If a story changes, select its latest published revision before exporting.</p>
    {prepared&&<div className="aura-social-studio__existing">
      <h3>Existing artwork for this story</h3>
      <img src={prepared.image_url} alt={'Previously prepared portrait card for '+prepared.headline} loading="lazy"/>
      <a href={prepared.image_url} target="_blank" rel="noopener noreferrer">View existing cover ↗</a>
     </div>}
   </div>
  </section>
  <section className="aura-social-studio__how">
   <h2>Publish an Aura headline in four steps</h2>
   <ol>
    <li>Confirm the news article, date and original sources are accurate and current.</li>
    <li>Download the image ZIP, or the existing 12-second vertical MP4 export from GitHub Actions.</li>
    <li>Upload to TikTok, add approved music and review settings before pressing Post yourself.</li>
    <li>Place the TikTok landing-page URL in your profile where eligible, and monitor GA4 traffic from TikTok.</li>
   </ol>
   <p><strong>No account access is requested.</strong> Automatic public photo posting can be added only after TikTok developer approval, creator authorisation, compliant consent controls and an audit. Neither this studio nor a downloaded ZIP publishes anything.</p>
  </section>
  {queueError&&<p role="status">{queueError}</p>}
  <section className="aura-social-studio__queue" aria-label="Previously generated photo covers">
   <div className="aura-social-studio__queue-head"><div><p className="aura-social-studio__state">ORIGINAL SOCIAL ASSETS</p><h2>Prepared cover archive</h2><p>{queue.items.length} existing editorial covers. All are drafts, not posted automatically.</p></div></div>
   <div className="aura-social-studio__grid">
    {queue.items.slice(0,8).map(item=><article className="aura-social-studio__card" key={item.slug}>
     <img src={item.image_url} loading="lazy" alt={'Social cover: '+item.headline}/>
     <div className="aura-social-studio__card-body"><h3>{item.headline}</h3><button type="button" onClick={()=>{setSlug(item.slug);window.scrollTo({top:0,behavior:'smooth'});}}>Make new carousel</button><a href={item.image_url} target="_blank" rel="noopener noreferrer">View cover ↗</a></div>
    </article>)}
   </div>
  </section>
 </main><Footer/></>;
}
