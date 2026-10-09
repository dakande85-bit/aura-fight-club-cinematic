import {useState} from 'react';
import {fighterPhotography,fightPhotography} from '../data/boxingPhotography.js';
export function VerifiedPhoto({fighterSlug,fightId,className='',label=''}) {
 const [failed,setFailed]=useState(false);
 const media=fightId?fightPhotography[fightId]:fighterPhotography[fighterSlug];
 const title=label||'Boxing coverage';
 return <div className={`aura-photo ${className}`}>
  {media&&!failed?<img src={media.src} alt={media.alt} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={()=>setFailed(true)} />:<div className="aura-photo__placeholder" aria-label="Photograph not yet verified"><span>AURA FIGHT CLUB</span><strong>{title}</strong><small>Photo awaiting verification</small></div>}
  {media&&!failed&&<small className="aura-photo__credit">{media.archive?'Archive photograph · ':''}{media.credit}</small>}
 </div>;
}
