import { liveAssets } from '../data/liveAssets.js';

const navItems = [
  { label: 'Drop 001',     href: '#drop' },
  { label: 'Apparel',      href: '#apparel' },
  { label: 'Footwear',     href: '#footwear' },
  { label: 'Equipment',    href: '#equipment' },
  { label: 'The Campaign', href: '#campaign' },
  { label: 'Fight Club',   href: '#fight-club' },
];

export default function Header() {
  return (
    <header className="header">
      <div className="header__logo">
        <img src={liveAssets.logos.wordmark} alt="AURA Fight Club" />
      </div>
      <nav className="header__nav" aria-label="Main navigation">
        {navItems.map(item => (
          <a key={item.href} href={item.href}>{item.label}</a>
        ))}
      </nav>
      <div className="header__actions">
        <a href="#fight-club">Join Waitlist</a>
      </div>
    </header>
  );
}
