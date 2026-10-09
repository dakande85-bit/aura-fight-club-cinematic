import { Link } from 'react-router-dom';
import '../styles/footer.css';

const BOXING_LINKS = [
  { label: 'Fight News', href: '/news' },
  { label: 'Fight Hub', href: '/fight-hub' },
  { label: 'Rankings', href: '/rankings' },
  { label: 'Fighters', href: '/fighters' },
  { label: 'The Verdict', href: '/verdict' },
  { label: 'Topics', href: '/topics' },
  { label: 'Guides', href: '/guides' },
];

const AURA_LINKS = [
  { label: 'Lifestyle', href: '/lifestyle' },
  { label: 'Our Story', href: '/who-we-are' },
  { label: 'Members', href: '/members' },
  { label: 'Editorial Policy', href: '/editorial-policy' },
  { label: 'Corrections', href: '/corrections' },
];

const CONNECT_LINKS = [
  { label: 'Advertise', href: '/advertise' },
  { label: 'Join Members', href: '/members' },
];

export default function Footer() {
  return (
    <footer className="aura-footer">
      <div className="aura-footer__inner">
        <div className="aura-footer__brand">
          <Link to="/" className="aura-footer__logo" aria-label="AURA home">
            <span>AURA</span>
            <small>FIGHT CLUB</small>
          </Link>
          <p className="aura-footer__statement">
            Boxing news, fight-week video, rankings, culture and life beyond the ring.
          </p>
          <Link to="/members" className="aura-footer__cta">
            Join Members
          </Link>
        </div>

        <nav className="aura-footer__nav" aria-label="Footer navigation">
          <div className="aura-footer__col">
            <p className="aura-footer__heading">Boxing</p>
            {BOXING_LINKS.map(link => (
              <Link key={link.href} to={link.href}>{link.label}</Link>
            ))}
          </div>

          <div className="aura-footer__col">
            <p className="aura-footer__heading">AURA</p>
            {AURA_LINKS.map(link => (
              <Link key={link.href} to={link.href}>{link.label}</Link>
            ))}
          </div>

          <div className="aura-footer__col">
            <p className="aura-footer__heading">Connect</p>
            {CONNECT_LINKS.map(link => (
              <Link key={link.href} to={link.href}>{link.label}</Link>
            ))}
            <a href="mailto:hello@aurafightclub.com">Contact</a>
          </div>
        </nav>
      </div>

      <div className="aura-footer__legal">
        <span>© {new Date().getFullYear()} AURA</span>
        <div>
          <Link to="/privacy">Privacy</Link>
          <Link to="/cookies">Cookies</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/commercial-policy">Advertising & Affiliates</Link>
          <a href="mailto:hello@aurafightclub.com">Contact</a>
        </div>
      </div>
    </footer>
  );
}
