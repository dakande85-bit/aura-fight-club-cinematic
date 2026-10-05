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
export function AdSlot({slot='article-mid'}) {
  const config=useMonetization(); const item=config.adSlots?.[slot];
  if(!item?.enabled) return null;
  if(item.mode==='adsense' && config.adsense?.enabled && config.adsense.client) {
    return <aside className="aura-ad-slot" aria-label="Advertisement"><span>Advertisement</span><div className="aura-ad-placeholder">Ad network slot: {slot}</div></aside>;
  }
  return <aside className="aura-ad-slot aura-ad-slot--house" aria-label="AURA commercial partnership"><span>Partner</span><strong>{item.label}</strong><Link to="/advertise">Advertising & sponsorship</Link></aside>;
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
