(() => {
  const LOGO_SRC = '/assets/brand/aura-fight-club-logo.svg';

  function installStyles() {
    if (document.getElementById('aura-real-logo-style')) return;
    const style = document.createElement('style');
    style.id = 'aura-real-logo-style';
    style.textContent = `
      .aura-logo-ready::before {
        display: none !important;
        content: none !important;
        background: none !important;
      }

      .sf-header-logo.aura-logo-ready,
      .header__logo.aura-logo-ready {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
        min-width: 178px !important;
        width: 178px !important;
        height: 56px !important;
        text-indent: 0 !important;
        overflow: visible !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
        z-index: 999 !important;
      }

      .aura-real-logo {
        display: block !important;
        width: 178px !important;
        max-width: 178px !important;
        height: auto !important;
        object-fit: contain !important;
        opacity: 1 !important;
        visibility: visible !important;
        filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.6)) !important;
      }

      @media (max-width: 860px) {
        .sf-header-logo.aura-logo-ready,
        .header__logo.aura-logo-ready {
          min-width: 136px !important;
          width: 136px !important;
          height: 46px !important;
        }

        .aura-real-logo {
          width: 136px !important;
          max-width: 136px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function applyLogo() {
    installStyles();

    document.querySelectorAll('.sf-header-logo, .header__logo').forEach((link) => {
      if (link.dataset.auraLogoReady === 'true') return;

      link.innerHTML = '';
      link.setAttribute('aria-label', 'AURA Fight Club');
      link.classList.add('aura-logo-ready');
      link.dataset.auraLogoReady = 'true';

      const img = document.createElement('img');
      img.src = LOGO_SRC;
      img.alt = 'AURA Fight Club';
      img.className = 'aura-real-logo';
      img.loading = 'eager';
      img.decoding = 'async';

      link.appendChild(img);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyLogo, { once: true });
  } else {
    applyLogo();
  }

  window.addEventListener('load', applyLogo, { once: true });

  const observer = new MutationObserver(applyLogo);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
