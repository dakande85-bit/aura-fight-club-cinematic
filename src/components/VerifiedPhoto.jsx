import {useState} from 'react';
import {fighterPhotography,fightPhotography} from '../data/boxingPhotography.js';

/** A photo caption defaults to plain text so cards can safely be wrapped in links. */
export function VerifiedPhoto({fighterSlug,fightId,className='',label='',creditLink=false}) {
 const media=fightId?fightPhotography[fightId]:fighterPhotography[fighterSlug];
 const [failedSrc,setFailedSrc]=useState('');
 const hasPhoto=Boolean(media?.src&&failedSrc!==media.src);
 const title=label||'Boxing coverage';
 const credit=media?.credit&&hasPhoto
   ? creditLink&&media.sourceUrl
     ? <a className="aura-photo__credit" href={media.sourceUrl} target="_blank" rel="noopener noreferrer" title={media.license||'Photo source'}>{media.credit} ↗</a>
     : <span className="aura-photo__credit" title={media.sourceUrl?`Source: ${media.sourceUrl} · ${media.license||'Rights status unconfirmed'}`:media.license||'Photo attribution'}>{media.credit}</span>
   : null;
 return <div className={`aura-photo ${className}`}>
  {hasPhoto
   ? <img key={media.src} src={media.src} alt={media.alt||title} style={{objectPosition:media.focus||'center center','--aura-zoom':media.zoom||1}} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={()=>setFailedSrc(media.src)}/>
   : <div className="aura-photo__placeholder" role="img" aria-label={`${title}: fighter photograph unavailable`}><span>AURA / BOXING</span><strong>{title}</strong><small>Photograph unavailable · Identity not substituted</small></div>}
  {credit}
 </div>;
}
