import { Link } from 'react-router-dom';
import '../styles/footer.css';

const SHOP_LINKS = [
  { label: 'Drop 001', href: '/drop-001' },
  { label: 'Apparel', href: '/apparel' },
  { label: 'Footwear', href: '/footwear' },
  { label: 'Accessories', href: '/equipment' },
];

const WORLD_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Story', href: '/who-we-are' },
  { label: 'Drops', href: '/drops' },
  { label: 'Waitlist', href: '/fight-club' },
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
            Comfortable training-to-lifestyle clothing for every part of the day.
          </p>
          <Link to="/fight-club" className="aura-footer__cta">
            Join Waitlist
          </Link>
        </div>

        <nav className="aura-footer__nav" aria-label="Footer navigation">
          <div className="aura-footer__col">
            <p className="aura-footer__heading">Shop</p>
            {SHOP_LINKS.map(link => (
              <Link key={link.href} to={link.href}>{link.label}</Link>
            ))}
          </div>

          <div className="aura-footer__col">
            <p className="aura-footer__heading">Brand</p>
            {WORLD_LINKS.map(link => (
              <Link key={link.href} to={link.href}>{link.label}</Link>
            ))}
          </div>

          <div className="aura-footer__col">
            <p className="aura-footer__heading">Join</p>
            <Link to="/fight-club">Waitlist</Link>
            <Link to="/drop-001">Drop Access</Link>
            <a href="mailto:hello@aurafightclub.com">Contact</a>
          </div>
        </nav>
      </div>

      <div className="aura-footer__legal">
        <span>© {new Date().getFullYear()} AURA</span>
        <div>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="mailto:hello@aurafightclub.com">Contact</a>
        </div>
      </div>
    </footer>
  );
}
