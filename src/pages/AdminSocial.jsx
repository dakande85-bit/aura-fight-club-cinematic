import {useEffect,useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/aura-social-studio.css';

const workflow='https://github.com/dakande85-bit/aura-fight-club-cinematic/actions/workflows/aura-video-exports.yml';
const emptyQueue={items:[]};

export default function AdminSocial(){
 const [queue,setQueue]=useState(emptyQueue);
 const [error,setError]=useState('');
 const [search,setSearch]=useState('');
 const [message,setMessage]=useState('');
 const [viewed,setViewed]=useState({});
 useEffect(()=>{
  const controller=new AbortController();
  fetch('/news/social-queue.json',{signal:controller.signal,cache:'no-store'})
   .then(r=>{if(!r.ok)throw Error('Could not load the social draft queue');return r.json();})
   .then(data=>{if(Array.isArray(data.items))setQueue(data);else throw Error('Queue data has an invalid format');})
   .catch(e=>{if(e.name!=='AbortError')setError(e.message);});
  try{setViewed(JSON.parse(localStorage.getItem('aura-social-reviewed-v1')||'{}'));}catch{}
  return()=>controller.abort();
 },[]);
 const items=useMemo(()=>queue.items.filter(item=>String(item.headline||'').toLowerCase().includes(search.toLowerCase())).slice(0,100),[queue,search]);
 async function copy(text,label){
  try{await navigator.clipboard.writeText(text);setMessage(label+' copied');}
  catch{setMessage('Clipboard access unavailable. Select and copy the text manually.');}
 }
 function toggle(slug){
  const updated={...viewed,[slug]:!viewed[slug]};
  setViewed(updated);
  try{localStorage.setItem('aura-social-reviewed-v1',JSON.stringify(updated));}catch{}
 }
 return <><Header/><main className="aura-social-studio">
  <header className="aura-social-studio__intro">
   <p className="aura-social-studio__eyebrow">AURA / SOCIAL NEWSROOM</p>
   <h1>Social publishing desk.</h1>
   <p>Review original portrait news artwork, copy a verified article headline and caption, and download ready-made MP4 clips. Publishing is manual: no TikTok login, no generative news API, no automatic posting.</p>
   <div className="aura-social-studio__actions">
    <a href={workflow} target="_blank" rel="noopener noreferrer">Get the latest MP4 video exports ↗</a>
    <Link to="/admin/articles">Edit articles</Link><Link to="/admin/analytics">Audience analytics</Link>
    <Link to="/news">Live Fight Desk</Link>
   </div>
  </header>
  <section className="aura-social-studio__how">
   <h2>Publish a fight story in three steps</h2>
   <ol><li>Open the video export workflow and select the latest successful run. Download the <strong>aura-vertical-news-clips</strong> ZIP from Artifacts.</li>
    <li>Review the 12-second vertical MP4 against the current article. Add approved music or voice-over in TikTok if wanted.</li>
    <li>Upload from your TikTok account or a connected scheduler. Copy the suggested caption, point your profile website link to Aura, and confirm the story is live.</li></ol>
   <p>The images below are editorial draft covers, not licensed ringside photography. Video clips carry no music or voice and still need a human accuracy check before publishing.</p>
  </section>
  <section aria-label="Prepared editorial social cards" className="aura-social-studio__queue">
   <div className="aura-social-studio__queue-head"><div><h2>Draft queue</h2><p>{queue.items.length} available covers · never auto-posted</p></div><label>Find article<input type="search" placeholder="Fighter, fight or headline" value={search} onChange={e=>setSearch(e.target.value)}/></label></div>
   {error&&<p role="alert">{error}</p>}
   {message&&<p role="status">{message}</p>}
   <div className="aura-social-studio__grid">
    {items.map(item=><article className="aura-social-studio__card" key={item.slug}>
      <img src={item.image_url} alt={'Portrait-format editorial headline artwork: '+item.headline} loading="lazy" onError={e=>{e.currentTarget.style.opacity='.16';}}/>
      <div className="aura-social-studio__card-body">
       <p className="aura-social-studio__state">{viewed[item.slug]?'REVIEWED ON THIS DEVICE':'DRAFT · NOT PUBLISHED'}</p>
       <h3>{item.headline}</h3>
       <div className="aura-social-studio__buttons">
        <button type="button" onClick={()=>copy(item.suggested_caption||'', 'Caption')}>Copy caption</button>
        <button type="button" onClick={()=>copy(item.article_url||'', 'Article link')}>Copy link</button>
        <a href={item.image_url} download={item.slug+'.jpg'}>View image</a>
        <a href={item.article_url} target="_blank" rel="noopener noreferrer">Read story ↗</a>
       </div>
       <label className="aura-social-studio__check"><input type="checkbox" checked={Boolean(viewed[item.slug])} onChange={()=>toggle(item.slug)}/> Mark reviewed locally</label>
      </div>
     </article>)}
   </div>
  </section>
 </main><Footer/></>;
}