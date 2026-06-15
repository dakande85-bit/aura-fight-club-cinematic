import { useEffect, useState } from 'react';

const navItems = [
  { label: 'Drop 001',     href: '/drop-001' },
  { label: 'Apparel',      href: '/apparel' },
  { label: 'Footwear',     href: '/footwear' },
  { label: 'Equipment',    href: '/equipment' },
  { label: 'The Campaign', href: '/campaign' },
  { label: 'Fight Club',   href: '/fight-club' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    document.body.classList.toggle('aura-menu-open', open);
    return () => document.body.classList.remove('aura-menu-open');
  }, [open]);

  return (
    <>
      <header className="header" role="banner">
        <a className="header__logo aura-logo-lockup" href="/" aria-label="AURA Fight Club home" onClick={closeMenu}>
          <span className="aura-logo-lockup__main">AURA</span>
          <span className="aura-logo-lockup__sub">FIGHT CLUB</span>
        </a>

        <nav className="header__nav" aria-label="Main navigation">
          {navItems.map(item => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>

        <a className="header__cta header__cta--desktop" href="/fight-club">Join Waitlist</a>

        <button
          className={`header__menu-btn${open ? ' header__menu-btn--open' : ''}`}
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="aura-mobile-menu"
          onClick={() => setOpen(v => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <aside
        id="aura-mobile-menu"
        className={`header__mobile-menu${open ? ' header__mobile-menu--open' : ''}`}
        aria-hidden={!open}
      >
        <nav className="header__mobile-nav" aria-label="Mobile navigation">
          {navItems.map(item => (
            <a key={item.href} href={item.href} onClick={closeMenu}>{item.label}</a>
          ))}
          <a className="header__mobile-cta" href="/fight-club" onClick={closeMenu}>Join Waitlist</a>
        </nav>
      </aside>

      {open && <button className="header__backdrop" type="button" aria-label="Close menu" onClick={closeMenu} />}
    </>
  );
}
