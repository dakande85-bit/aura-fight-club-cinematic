import {officialMediaForArticle} from '../data/officialMedia.js';
import '../styles/official-media.css';

const httpsOnly=(url)=>{try{const parsed=new URL(url);return parsed.protocol==='https:'?parsed.href:null;}catch{return null;}};
const validYoutube=(id)=>/^[a-zA-Z0-9_-]{11}$/.test(id||'');
export function OfficialFightVideoLead({article}){
 const highlight=(officialMediaForArticle(article.slug)?.videos||[]).find(video=>video.lead===true&&validYoutube(video.youtubeId));
 if(!highlight)return null;
 return <figure className="aura-official-fight-lead">
  <div className="aura-official-fight-lead__frame">
   <iframe src={`https://www.youtube-nocookie.com/embed/${highlight.youtubeId}`} title={highlight.title} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>
  </div>
  <figcaption><strong>Official fight footage — {highlight.published}.</strong> {highlight.description} <a href={`https://www.youtube.com/watch?v=${highlight.youtubeId}`} target="_blank" rel="noopener noreferrer">Watch on DAZN Boxing ↗</a></figcaption>
 </figure>;
}
function ExternalMedia({item,icon}){
 const url=httpsOnly(item.url);
 if(!url)return null;
 return <a href={url} className="aura-media-source" target="_blank" rel="noopener noreferrer">
   <span className="aura-media-source__icon" aria-hidden="true">{icon}</span>
   <span className="aura-media-source__body">
    <span className="aura-media-source__eyebrow">{item.publisher} · {item.published}</span>
    <strong>{item.title}</strong>
    <span>{item.description}</span>
    {item.credit&&<span className="aura-media-source__credit">Image credit: {item.credit}</span>}
    <span className="aura-media-source__action">View at original publisher ↗</span>
   </span>
 </a>;
}
export default function OfficialMediaGallery({article}){
 const curated=officialMediaForArticle(article.slug);
 const photos=curated?.photos||[];
 const videos=(curated?.videos||[]).filter(video=>!video.lead);
 const footage=curated?.footage||[];
 // CMS-uploaded photography is displayable only with recorded publication rights.
 // A press credit is NOT a licence and cannot override this condition.
 const approved=(Array.isArray(article.media?.photos)?article.media.photos:[]).filter(p=>p.rightsVerified===true&&p.licenceReference?.trim()&&httpsOnly(p.src)&&p.alt?.trim()&&p.credit?.trim());
 if(!curated&&!approved.length)return null;
 return <section className="aura-real-media" aria-labelledby="aura-real-media-title">
  <div className="aura-real-media__intro"><p className="aura-ed-kicker">AURA / INSIDE THE EVENT</p><h2 id="aura-real-media-title">See the fight. Hear the reaction.</h2><p>Authentic event footage and photography from identifiable broadcasters, promoters and accredited press. Dates distinguish the October fight from archive clips.</p></div>
  {approved.length>0&&<div className="aura-media-approved-grid" aria-label="Licensed fight photography">{approved.map((photo,i)=><figure key={photo.src+'-'+i}><img src={photo.src} alt={photo.alt} loading="lazy" decoding="async"/><figcaption>{photo.caption||photo.alt} · {photo.credit}{httpsOnly(photo.sourceUrl)&&<> · <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">Original source ↗</a></>}{httpsOnly(photo.licenceReference)&&<> · <a href={photo.licenceReference} target="_blank" rel="noopener noreferrer">Usage licence ↗</a></>}</figcaption></figure>)}</div>}
  {photos.length>0&&<div className="aura-real-media__group"><div className="aura-media-heading"><h3>Fight-night &amp; press photography</h3><span>{photos.length} verified sources</span></div><div className="aura-media-link-grid">{photos.map(x=><ExternalMedia item={x} icon="↗" key={x.url}/>)}</div><p className="aura-real-media__notice">These links open actual photographic coverage at the source. Photos are not copied or republished by AURA without appropriate rights.</p></div>}
  {footage.length>0&&<div className="aura-real-media__group"><div className="aura-media-heading"><h3>Fight-night video &amp; reactions</h3><span>Original publishers</span></div><div className="aura-media-link-grid">{footage.map(x=><ExternalMedia item={x} icon="▶" key={x.url}/>)}</div></div>}
  {videos.length>0&&<div className="aura-real-media__group"><div className="aura-media-heading"><h3>Official DAZN video archive</h3><span>Earlier footage, clearly dated</span></div><div className="aura-media-player-grid">{videos.filter(x=>validYoutube(x.youtubeId)).map(video=><div className="aura-media-player" key={video.youtubeId}><div className="aura-media-player__frame"><iframe src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`} title={video.title+' — '+video.published} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/></div><p className="aura-media-source__eyebrow">{video.publisher} · {video.published}</p><h4>{video.title}</h4><p>{video.description}</p><a href={`https://www.youtube.com/watch?v=${video.youtubeId}`} target="_blank" rel="noopener noreferrer">Watch on the official channel ↗</a></div>)}</div></div>}
 </section>;
}
