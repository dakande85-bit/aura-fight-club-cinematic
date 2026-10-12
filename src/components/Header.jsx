import { useEffect, useState } from 'react';
import {useLocation} from 'react-router-dom';
import {spanishArticles} from '../i18n/esArticles.js';
import { useBrandLogo } from '../hooks/usePageMedia.js';

const navItems = [
  { label: 'Fight News', href: '/news' },
  { label: 'Fight Hub', href: '/fight-hub' },
  { label: 'Rankings', href: '/rankings' },
  { label: 'Fighters', href: '/fighters' },
  { label: 'Film Room', href: '/film-room' },
  { label: 'The Verdict', href: '/verdict' },
  { label: 'The Club', href: '/members' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const {pathname} = useLocation();
  const translatedRoutes = new Set(['/','/news','/fight-hub','/calendar','/rankings','/fighters','/lifestyle','/who-we-are','/members']);
  const hasSpanish = translatedRoutes.has(pathname) || (pathname.startsWith('/news/') && Boolean(spanishArticles[pathname.split('/')[2]]));
  const spanishHref = hasSpanish ? '/es' + (pathname === '/' ? '' : pathname) : '/es';
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

        <a className="aura-language-link" href={spanishHref} lang="es" hrefLang="es" aria-label="Ver sitio en español">ES <span aria-hidden="true">↗</span></a>
        <a className="header__cta header__cta--desktop" href="/members">Join Members</a>

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
          <a className="header__mobile-cta" href="/members" onClick={closeMenu}>Join Members</a>
          <a className="header__mobile-lang" href={spanishHref} lang="es" hrefLang="es" onClick={closeMenu}>Español / ES</a>
        </nav>
      </aside>

      {open && <button className="header__backdrop" type="button" aria-label="Close menu" onClick={closeMenu} />}
    </>
  );
}
