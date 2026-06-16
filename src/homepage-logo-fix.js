import { resolveBrandLogo } from './data/pageMedia.js';

const STYLE_ID = 'aura-homepage-logo-fix';
const LOGO_SELECTOR = '.sf-header-logo';

function getLogoSrc() {
  try {
    return resolveBrandLogo();
  } catch {
    return '';
  }
}

function injectHomepageLogoStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .sf-header {
      height: 76px !important;
    }

    .sf-header-logo {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: flex-start !important;
      width: clamp(230px, 15vw, 320px) !important;
      min-width: clamp(230px, 15vw, 320px) !important;
      height: 74px !important;
      min-height: 74px !important;
      padding: 0 !important;
      overflow: visible !important;
      text-decoration: none !important;
      background: transparent !important;
      line-height: 1 !important;
    }

    .sf-header-logo-image {
      display: block !important;
      width: 100% !important;
      height: auto !important;
      max-width: 100% !important;
      max-height: 68px !important;
      object-fit: contain !important;
      object-position: left center !important;
      opacity: 1 !important;
      visibility: visible !important;
      filter: none !important;
      transform: none !important;
    }

    .sf-header-logo .sf-header-logo-text,
    .sf-header-logo .sf-header-logo-sub {
      display: none !important;
    }

    @media (max-width: 1100px) {
      .sf-header-logo {
        width: 210px !important;
        min-width: 210px !important;
        height: 64px !important;
        min-height: 64px !important;
      }

      .sf-header-logo-image {
        max-height: 60px !important;
      }
    }

    @media (max-width: 860px) {
      .sf-header-logo {
        width: 190px !important;
        min-width: 190px !important;
        height: 58px !important;
        min-height: 58px !important;
      }

      .sf-header-logo-image {
        max-height: 54px !important;
      }
    }

    @media (max-width: 420px) {
      .sf-header-logo {
        width: 166px !important;
        min-width: 166px !important;
      }

      .sf-header-logo-image {
        max-height: 48px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function hydrateHomepageLogo(root = document) {
  if (typeof document === 'undefined') return false;

  const logo = root.querySelector?.(LOGO_SELECTOR) || document.querySelector(LOGO_SELECTOR);
  if (!logo) return false;

  const src = getLogoSrc();
  if (!src) return false;

  let image = logo.querySelector('.sf-header-logo-image');
  if (!image) {
    image = document.createElement('img');
    image.className = 'sf-header-logo-image';
    image.alt = 'AURA Fight Club';
    image.decoding = 'async';
    logo.textContent = '';
    logo.appendChild(image);
  }

  if (image.getAttribute('src') !== src) {
    image.setAttribute('src', src);
  }

  logo.setAttribute('aria-label', 'AURA Fight Club home');
  logo.dataset.auraLogoHydrated = 'true';
  return true;
}

function installHomepageLogoObserver() {
  if (typeof MutationObserver === 'undefined') return;

  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'childList') {
        hydrateHomepageLogo(document);
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

function runHomepageLogoFix() {
  injectHomepageLogoStyles();
  hydrateHomepageLogo();
}

runHomepageLogoFix();
installHomepageLogoObserver();

window.addEventListener('pageshow', runHomepageLogoFix);
document.addEventListener('DOMContentLoaded', runHomepageLogoFix);
window.addEventListener('aura-page-media-updated', runHomepageLogoFix);
window.setTimeout(runHomepageLogoFix, 120);
window.setTimeout(runHomepageLogoFix, 500);
