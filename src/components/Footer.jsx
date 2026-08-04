import { Link } from 'react-router-dom';
import '../styles/footer.css';

const SHOP_LINKS = [
  { label: 'Drop 001', href: '/drop-001' },
  { label: 'Apparel', href: '/apparel' },
  { label: 'Footwear', href: '/footwear' },
  { label: 'Equipment', href: '/equipment' },
];

const WORLD_LINKS = [
  { label: 'The Campaign', href: '/campaign' },
  { label: 'Fight Club', href: '/fight-club' },
];

const LEGAL_LINKS = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Shipping', href: '/shipping' },
  { label: 'Returns', href: '/returns' },
  { label: 'Contact', href: '/contact' },
];

export default function Footer() {
  return (
    <footer className="aura-footer">
      <div className="aura-footer__inner">
        <div className="aura-footer__brand">
          <Link to="/" className="aura-footer__logo" aria-label="AURA Fight Club home">
            <span>AURA</span>
            <small>FIGHT CLUB</small>
          </Link>
          <p className="aura-footer__statement">
            The real fight is internal. The opponent is just the mirror.
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
            <p className="aura-footer__heading">World</p>
            {WORLD_LINKS.map(link => (
              <Link key={link.href} to={link.href}>{link.label}</Link>
            ))}
          </div>

          <div className="aura-footer__col">
            <p className="aura-footer__heading">Join</p>
            <Link to="/fight-club">Founding Circle</Link>
            <Link to="/drop-001">Drop Access</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </nav>
      </div>

      <div className="aura-footer__legal">
        <span>&copy; {new Date().getFullYear()} AURA Fight Club</span>
        <div>
          {LEGAL_LINKS.map(link => (
            <Link key={link.href} to={link.href}>{link.label}</Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
