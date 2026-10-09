import {useEffect,useState} from 'react';
import {fighterPhotography,fightPhotography} from '../data/boxingPhotography.js';

export function VerifiedPhoto({fighterSlug,fightId,className='',label=''}) {
 const [failed,setFailed]=useState(false);
 const media=fightId?fightPhotography[fightId]:fighterPhotography[fighterSlug];
 useEffect(()=>setFailed(false),[fighterSlug,fightId,media?.src]);
 const title=label||'Boxing coverage';
 return <div className={`aura-photo ${className}`}>
  {media?.src&&!failed
   ? <img key={media.src} src={media.src} alt={media.alt} style={{objectPosition:media.focus||"center 30%","--aura-zoom":media.zoom||1,transformOrigin:media.focus||"center"}} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={()=>setFailed(true)}/>
   : <div className="aura-photo__placeholder" role="img" aria-label={`${title}: verified photograph unavailable`}><span>AURA / BOXING</span><strong>{title}</strong><small>Editorial design · fighter photograph pending</small></div>}
  {media?.src&&!failed&&(media.sourceUrl?<a className="aura-photo__credit" href={media.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} title={'Photo source and license: '+(media.license||'See original')}>{media.credit}</a>:<small className="aura-photo__credit">{media.archive?'Archive photograph · ':''}{media.credit}</small>)}
 </div>;
}
