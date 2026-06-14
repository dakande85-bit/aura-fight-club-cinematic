import React from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './AppRouter.jsx';
import './styles/global.css';
import './styles/scroll-film.css';
import './styles/aura-public-visual-pass.css';
import './styles/aura-launch-polish.css';
import './homepage-scroll-sync.js';

function forceAuraLogo() {
  const logoSrc = '/assets/brand/aura-fight-club-logo.svg';

  if (!document.getElementById('aura-real-logo-style')) {
    const style = document.createElement('style');
    style.id = 'aura-real-logo-style';
    style.textContent = `
      .aura-logo-ready::before { display: none !important; content: none !important; }
      .sf-header-logo.aura-logo-ready,
      .header__logo.aura-logo-ready {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
        width: 178px !important;
        min-width: 178px !important;
        height: 56px !important;
        opacity: 1 !important;
        visibility: visible !important;
        overflow: visible !important;
        z-index: 9999 !important;
      }
      .aura-real-logo {
        display: block !important;
        width: 178px !important;
        max-width: 178px !important;
        height: auto !important;
        opacity: 1 !important;
        visibility: visible !important;
        object-fit: contain !important;
        filter: drop-shadow(0 8px 18px rgba(0,0,0,.65)) !important;
      }
      @media (max-width: 860px) {
        .sf-header-logo.aura-logo-ready,
        .header__logo.aura-logo-ready { width: 136px !important; min-width: 136px !important; height: 46px !important; }
        .aura-real-logo { width: 136px !important; max-width: 136px !important; }
      }
    `;
    document.head.appendChild(style);
  }

  document.querySelectorAll('.sf-header-logo, .header__logo').forEach((link) => {
    if (link.dataset.auraLogoReady === 'true') return;
    link.innerHTML = '';
    link.setAttribute('aria-label', 'AURA Fight Club');
    link.classList.add('aura-logo-ready');
    link.dataset.auraLogoReady = 'true';

    const img = document.createElement('img');
    img.src = logoSrc;
    img.alt = 'AURA Fight Club';
    img.className = 'aura-real-logo';
    img.loading = 'eager';
    img.decoding = 'async';
    link.appendChild(img);
  });
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);

forceAuraLogo();
window.addEventListener('load', forceAuraLogo, { once: true });
new MutationObserver(forceAuraLogo).observe(document.documentElement, { childList: true, subtree: true });
