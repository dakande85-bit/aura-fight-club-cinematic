import { useEffect, useState } from 'react';
import {useLocation} from 'react-router-dom';
import {spanishArticles} from '../i18n/esArticles.js';
import { useBrandLogo } from '../hooks/usePageMedia.js';

const navItems = [
  {label:'Fight News',href:'/news'},
  {label:'Fighter Intelligence',href:'/fighters'},
  {label:'Fight Analysis',href:'/film-room'},
  {label:'Predictions',href:'/verdict'},
  {label:'The Club',href:'/members'},
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const {pathname,search} = useLocation();
  const isSpanish = pathname === '/es' || pathname.startsWith('/es/');
  const englishPath = isSpanish ? (pathname.replace(/^\/es(?=\/|$)/, '') || '/') : pathname;
  const localNav = isSpanish ? [
    {label:'Noticias',href:'/es/news'},
    {label:'Boxeadores',href:'/es/fighters'},
    {label:'Análisis (EN)',href:'/film-room'},
    {label:'Pronósticos (EN)',href:'/verdict'},
    {label:'El Club',href:'/es/members'}
  ] : navItems;
  const translatedRoutes = new Set(['/','/news','/fight-hub','/calendar','/rankings','/fighters','/lifestyle','/who-we-are','/members']);
  const hasSpanish = translatedRoutes.has(pathname)
    || pathname==='/fighters/compare'
    || (pathname.startsWith('/fighters/') && !pathname.endsWith('/compare'))
    || (pathname.startsWith('/news/') && Boolean(spanishArticles[pathname.split('/')[2]]));
  const spanishHref = isSpanish ? englishPath + search : hasSpanish ? '/es' + (pathname === '/' ? '' : pathname) + search : '/es';
  const logoSrc = useBrandLogo();
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    document.documentElement.lang = isSpanish ? 'es' : 'en';
  }, [isSpanish]);

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
        <a className="header__logo aura-logo-lockup" href={isSpanish?"/es":"/"} aria-label="AURA home" onClick={closeMenu}>
          <img className="aura-logo-lockup__image" src={logoSrc} alt="AURA" width="1200" height="1200" decoding="async" fetchPriority="high" />
        </a>

        <nav className="header__nav" aria-label={isSpanish?"Navegación principal":"Main navigation"}>
          {localNav.map(item => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>

        <a className="aura-language-link" href={spanishHref} lang={isSpanish?'en':'es'} hrefLang={isSpanish?'en':'es'} aria-label={isSpanish?'View site in English':'Ver sitio en español'}>{isSpanish?'EN':'ES'} <span aria-hidden="true">↗</span></a>
        <a className="header__cta header__cta--desktop" href={isSpanish?'/es/members':'/members'}>{isSpanish?'Únete al club':'Join Members'}</a>

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
        <nav className="header__mobile-nav" aria-label={isSpanish?"Navegación móvil":"Mobile navigation"}>
          {localNav.map(item => (
            <a key={item.href} href={item.href} onClick={closeMenu}>{item.label}</a>
          ))}
          <a className="header__mobile-cta" href={isSpanish?'/es/members':'/members'} onClick={closeMenu}>{isSpanish?'Únete al club':'Join Members'}</a>
          <a className="header__mobile-lang" href={spanishHref} lang={isSpanish?'en':'es'} hrefLang={isSpanish?'en':'es'} onClick={closeMenu}>{isSpanish?'English / EN':'Español / ES'}</a>
        </nav>
      </aside>

      {open && <button className="header__backdrop" type="button" aria-label="Close menu" onClick={closeMenu} />}
    </>
  );
}
