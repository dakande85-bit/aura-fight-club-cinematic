import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useMonetization } from '../hooks/useMonetization.js';
import '../styles/aura-monetization.css';

export function affiliateHref(partner) {
  return partner?.affiliateUrl?.trim() || partner?.officialUrl || '#';
}
function recordClick(partner, placement) {
  try {
    navigator.sendBeacon?.('/api/affiliate-click', JSON.stringify({
      partner, placement, path: window.location.pathname, at: new Date().toISOString()
    }));
  } catch {}
}
export function AffiliateLink({partnerKey,placement='site',children,className=''}) {
  const config=useMonetization(); const partner=config.partners?.[partnerKey];
  if(!partner?.enabled) return null;
  const affiliate=Boolean(partner.affiliateUrl?.trim());
  return <a className={className} href={affiliateHref(partner)} target="_blank" rel={affiliate?'sponsored nofollow noopener noreferrer':'noopener noreferrer'} onClick={()=>recordClick(partnerKey,placement)}>{children||partner.cta}</a>;
}
export function AffiliateDisclosure() {
  const config=useMonetization();
  return <p className="aura-affiliate-disclosure">{config.disclosure}</p>;
}
function AdsenseUnit({config,slot}) {
  const pushed=useRef(false); const slotId=config.adsense?.slots?.[slot];
  useEffect(()=>{
    if(!config.adsense?.client||!slotId)return;
    const id='aura-adsense-script';
    if(!document.getElementById(id)){
      const script=document.createElement('script');script.id=id;script.async=true;script.crossOrigin='anonymous';
      script.src=`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(config.adsense.client)}`;
      document.head.appendChild(script);
    }
    const timer=setTimeout(()=>{if(!pushed.current){try{(window.adsbygoogle=window.adsbygoogle||[]).push({});pushed.current=true;}catch{}}},50);
    return()=>clearTimeout(timer);
  },[config.adsense?.client,slotId]);
  if(!slotId)return <div className="aura-ad-placeholder">AdSense ready — add slot ID for {slot} in Commercial Admin.</div>;
  return <ins className="adsbygoogle" style={{display:'block'}} data-ad-client={config.adsense.client} data-ad-slot={slotId} data-ad-format="auto" data-full-width-responsive="true"/>;
}
export function AdSlot({slot='article-mid'}) {
  const config=useMonetization();
  const item=config.adSlots?.[slot];
  if(!item?.enabled||item.mode==='off') return null;
  const partner=config.partners?.[item.partnerKey];
  const verifiedLink=item.mode==='affiliate' && partner?.enabled && Boolean(partner?.affiliateUrl?.trim());
  const activeAdsense=item.mode==='adsense' && config.adsense?.enabled && Boolean(config.adsense.client) && Boolean(config.adsense.slots?.[slot]);
  if(activeAdsense) {
    return <aside className="aura-ad-slot aura-ad-slot--adsense" aria-label="Advertisement"><span className="aura-ad-slot__eyebrow">Advertisement</span><AdsenseUnit config={config} slot={slot}/></aside>;
  }
  if(verifiedLink) {
    return <aside className="aura-ad-slot aura-ad-slot--affiliate" aria-label="Affiliate advertisement">
      <div className="aura-ad-slot__copy"><span className="aura-ad-slot__eyebrow">Affiliate advertisement · {partner.name}</span>
        <strong>{item.headline||partner.name}</strong><p>{item.body||partner.note}</p>
      </div>
      <div className="aura-ad-slot__action"><a href={partner.affiliateUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" onClick={()=>recordClick(item.partnerKey,'ad:'+slot)}>{item.cta||partner.cta||'Explore partner' } <span aria-hidden="true">↗</span></a><small>We may earn a commission at no additional cost to you.</small></div>
    </aside>;
  }
  // Never imply a brand is a paying sponsor or send untracked traffic as an affiliate ad.
  return <aside className="aura-ad-slot aura-ad-slot--house" aria-label="Available advertising placement">
    <div className="aura-ad-slot__copy"><span className="aura-ad-slot__eyebrow">AURA / Commercial opportunities</span>
      <strong>{item.label||'Own this moment in boxing.'}</strong>
      <p>Premium placements across independent boxing coverage, fight nights and culture.</p>
    </div>
    <Link className="aura-ad-slot__house-link" to="/advertise">Sponsor this space <span aria-hidden="true">↗</span></Link>
  </aside>;
}
export function HowToWatch({fight}) {
  const config=useMonetization();
  const broadcast=(fight?.broadcast||'').toLowerCase();
  const dazn=broadcast.includes('dazn');
  return <section className="aura-watch-box" aria-labelledby="how-watch-title">
    <p className="aura-ed-kicker">Fight night</p><h2 id="how-watch-title">How to watch.</h2>
    <div className="aura-watch-box__grid">
      <div><span>Broadcaster</span><strong>{fight.broadcast||'To be confirmed'}</strong></div>
      <div><span>Event date</span><strong>{fight.date}</strong></div>
      <div><span>Venue</span><strong>{fight.venue}</strong></div>
    </div>
    <div className="aura-watch-box__actions">
      {dazn && <AffiliateLink partnerKey="dazn" placement={`fight:${fight.id}`}>Watch on DAZN</AffiliateLink>}
      <AffiliateLink partnerKey="ticketmaster" placement={`fight:${fight.id}`}>Find fight tickets</AffiliateLink>
    </div>
    {dazn && <p className="aura-ed-note">{config.partners?.dazn?.note}</p>}
    <AffiliateDisclosure />
  </section>;
}
export function GearCommerce() {
  return <section className="aura-commerce-strip"><p className="aura-ed-kicker">Train / Wear / Recover</p><h2>Boxing essentials.</h2><div>
    <AffiliateLink partnerKey="rdx" placement="commerce-strip">Equipment</AffiliateLink>
    <AffiliateLink partnerKey="boxraw" placement="commerce-strip">Lifestyle</AffiliateLink>
    <AffiliateLink partnerKey="fightcamp" placement="commerce-strip">Train at home</AffiliateLink>
  </div><AffiliateDisclosure /></section>;
}
