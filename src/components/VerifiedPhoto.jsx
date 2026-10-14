import {useState} from 'react';
import {fighterPhotography,fightPhotography} from '../data/boxingPhotography.js';

/** A source-linked fighter photo, with a correctly labelled story-specific illustration if supplied. */
export function VerifiedPhoto({fighterSlug,fightId,className='',label='',creditLink=false}) {
 const media=fightId?fightPhotography[fightId]:fighterPhotography[fighterSlug];
 const primary=media?.src||'';
 const backup=media?.fallbackSrc||'';
 const [failure,setFailure]=useState({primary:'',stage:0});
 const stage=failure.primary===primary?failure.stage:0;
 const src=stage===0?primary:stage===1?backup:'';
 const shown=Boolean(src);
 const isFallback=stage===1;
 const title=label||'Boxing coverage';
 const fail=()=>setFailure({primary,stage:stage+1});
 const credit=shown
  ? isFallback
   ? <span className="aura-photo__credit">AURA original illustration · not a photograph</span>
   : creditLink&&media.sourceUrl
    ? <a className="aura-photo__credit" href={media.sourceUrl} target="_blank" rel="noopener noreferrer" title={media.license||'Photo source'}>{media.credit} ↗</a>
    : <span className="aura-photo__credit" title={media.sourceUrl?`Source: ${media.sourceUrl} · ${media.license||'Rights status unconfirmed'}`:media.license||'Photo attribution'}>{media.credit}</span>
  : null;
 return <div className={`aura-photo ${className}`}>
  {shown
   ? <img key={src} src={src} alt={isFallback?`Original AURA illustrated boxing event artwork for ${title}; not a photograph`:media.alt||title} style={{objectPosition:media.focus||'center center','--aura-zoom':media.zoom||1}} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={fail}/>
   : <div className="aura-photo__placeholder" role="img" aria-label={`${title}: fighter photograph unavailable`}><span>AURA / BOXING</span><strong>{title}</strong><small>Photograph unavailable · Identity not substituted</small></div>}
  {credit}
 </div>;
}
