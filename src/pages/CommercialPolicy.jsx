import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { useEffect } from 'react';
import '../styles/aura-editorial.css';
import '../styles/aura-monetization.css';
export default function CommercialPolicy(){
 useEffect(()=>{document.title='Advertising & Affiliate Disclosure | AURA Fight Club';window.scrollTo(0,0);},[]);
 return <><Header/><main className="aura-editorial aura-ed-page"><section className="aura-advertise"><p className="aura-ed-kicker">Transparency</p><h1>Advertising & affiliate disclosure.</h1><p>AURA Fight Club may receive payment for advertising, sponsorships, branded partnerships and qualifying purchases or subscriptions made through selected links.</p><h2>Affiliate links.</h2><p>Where a link is commercial, we may earn a commission if a reader buys, subscribes or books after using it. The price paid by the reader is determined by the merchant. Availability, prices, subscriptions and PPV terms can vary by territory.</p><h2>Sponsored content.</h2><p>Paid or sponsored editorial material will be clearly identified. Commercial relationships do not buy favourable editorial conclusions, rankings positions or undisclosed coverage.</p><h2>Streaming and tickets.</h2><p>AURA does not sell fight broadcasts or tickets directly unless explicitly stated. Readers complete transactions with the named broadcaster, promoter, ticketing platform or retailer under that provider's terms.</p><h2>Contact.</h2><p>Questions about commercial relationships can be sent to <a href="mailto:partnerships@aurafightclub.com">partnerships@aurafightclub.com</a>.</p></section></main><Footer/></>;
}
