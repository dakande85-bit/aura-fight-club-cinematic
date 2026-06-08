import { liveAssets } from '../data/liveAssets.js';

const links = [
  { label: 'Drop 001',     href: '#drop' },
  { label: 'Campaign',     href: '#campaign' },
  { label: 'Fight Club',   href: '#fight-club' },
  { label: 'Instagram',    href: '#' },
  { label: 'TikTok',       href: '#' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__logo">
        <img src={liveAssets.logos.wordmark} alt="AURA Fight Club" loading="lazy" />
      </div>
      <nav className="footer__links" aria-label="Footer navigation">
        {links.map(l => <a key={l.href + l.label} href={l.href}>{l.label}</a>)}
      </nav>
      <p className="footer__copy">© 2026 AURA Fight Club</p>
    </footer>
  );
}
