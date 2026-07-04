import { useEffect, useState } from 'react';
import { useBrandLogo } from '../hooks/usePageMedia.js';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Drop 001', href: '/drop-001' },
  { label: 'Drops', href: '/drops' },
  { label: 'Apparel', href: '/apparel' },
  { label: 'Footwear', href: '/footwear' },
  { label: 'Accessories', href: '/equipment' },
  { label: 'Story', href: '/who-we-are' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const logoSrc = useBrandLogo();
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    document.body.classList.toggle('aura-menu-open', open);
    return () => document.body.classList.remove('aura-menu-open');
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const menuButtonClass = open ? 'header__menu-btn header__menu-btn--open' : 'header__menu-btn';
  const mobileMenuClass = open ? 'header__mobile-menu header__mobile-menu--open' : 'header__mobile-menu';

  return (
    <>
      <header className="header" role="banner">
        <a className="header__logo aura-logo-lockup" href="/" aria-label="AURA home" onClick={closeMenu}>
          <img className="aura-logo-lockup__image" src={logoSrc} alt="AURA" width="1200" height="1200" decoding="async" fetchPriority="high" />
        </a>

        <nav className="header__nav" aria-label="Main navigation">
          {navItems.map(item => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>

        <a className="header__cta header__cta--desktop" href="/cart">Cart</a>

        <button
          className={menuButtonClass}
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="aura-mobile-menu"
          onClick={() => setOpen(value => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <aside
        id="aura-mobile-menu"
        className={mobileMenuClass}
        aria-hidden={!open}
      >
        <nav className="header__mobile-nav" aria-label="Mobile navigation">
          {navItems.map(item => (
            <a key={item.href} href={item.href} onClick={closeMenu}>{item.label}</a>
          ))}
          <a className="header__mobile-cta" href="/cart" onClick={closeMenu}>Cart</a>
        </nav>
      </aside>

      {open && <button className="header__backdrop" type="button" aria-label="Close menu" onClick={closeMenu} />}
    </>
  );
}
