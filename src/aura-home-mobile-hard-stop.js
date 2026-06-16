import './home-frame-runtime.js';

const HOME_MOBILE_IMAGE = '/assets/aura-scroll/05_drop_001_tools_uniform/frame_09_cream_full_outfit_model.png';

function isHomePath() {
  const path = window.location.pathname || '/';
  return path === '/' || path === '/launch';
}

function getMobileHeroImage() {
  try {
    const key = window.AURA_HOME_FRAME_STORAGE_KEY || 'aura:home-frame-overrides:v1';
    const parsed = JSON.parse(window.localStorage.getItem(key) || '{}');
    return parsed.mobileHero || HOME_MOBILE_IMAGE;
  } catch {
    return HOME_MOBILE_IMAGE;
  }
}

function injectHomeMobileStyle() {
  if (document.getElementById('aura-home-mobile-hard-stop-style')) return;
  const style = document.createElement('style');
  style.id = 'aura-home-mobile-hard-stop-style';
  style.textContent = `
    @media (max-width: 640px) {
      body.aura-home-mobile-static .sf-fixed {
        background: #050505 !important;
        overflow: hidden !important;
      }
      body.aura-home-mobile-static .sf-video,
      body.aura-home-mobile-static .sf-image-slot,
      body.aura-home-mobile-static .sf-ambient,
      body.aura-home-mobile-static .sf-grain,
      body.aura-home-mobile-static .sf-progress-bar,
      body.aura-home-mobile-static .sf-indicators,
      body.aura-home-mobile-static .sf-watermark {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
      }
      body.aura-home-mobile-static .aura-home-mobile-hero-img {
        position: absolute !important;
        top: 76px !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        height: 43svh !important;
        min-height: 300px !important;
        object-fit: contain !important;
        object-position: center center !important;
        background: #050505 !important;
        z-index: 2 !important;
      }
      body.aura-home-mobile-static .sf-vignette {
        z-index: 4 !important;
        background: linear-gradient(180deg, rgba(5,5,5,0) 0%, rgba(5,5,5,0.1) 38%, rgba(5,5,5,0.9) 55%, #050505 100%) !important;
      }
      body.aura-home-mobile-static .sf-overlay {
        position: absolute !important;
        top: calc(76px + 43svh) !important;
        bottom: auto !important;
        left: 0 !important;
        right: 0 !important;
        z-index: 20 !important;
        padding: 22px 20px 0 !important;
        opacity: 1 !important;
        transform: none !important;
        pointer-events: auto !important;
      }
      body.aura-home-mobile-static .sf-overlay-inner {
        max-width: 100% !important;
      }
      body.aura-home-mobile-static .sf-headline-line,
      body.aura-home-mobile-static .sf-sub,
      body.aura-home-mobile-static .sf-cta-row,
      body.aura-home-mobile-static .sf-waitlist {
        opacity: 1 !important;
        transform: none !important;
      }
      body.aura-home-mobile-static .sf-scroll-space {
        height: 145vh !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function applyHomeMobileHardStop() {
  if (!isHomePath()) {
    document.body.classList.remove('aura-home-mobile-static');
    document.querySelector('.aura-home-mobile-hero-img')?.remove();
    return;
  }

  if (!window.matchMedia('(max-width: 640px)').matches) {
    document.body.classList.remove('aura-home-mobile-static');
    document.querySelector('.aura-home-mobile-hero-img')?.remove();
    return;
  }

  injectHomeMobileStyle();
  document.body.classList.add('aura-home-mobile-static');

  const fixed = document.querySelector('.sf-fixed');
  if (!fixed) return;

  let img = fixed.querySelector('.aura-home-mobile-hero-img');
  if (!img) {
    img = document.createElement('img');
    img.className = 'aura-home-mobile-hero-img';
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    fixed.insertBefore(img, fixed.firstChild);
  }
  img.src = getMobileHeroImage();

  ['.sf-video', '.sf-image-slot', '.sf-ambient', '.sf-grain', '.sf-progress-bar', '.sf-indicators', '.sf-watermark'].forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.style.setProperty('display', 'none', 'important');
      el.style.setProperty('opacity', '0', 'important');
      el.style.setProperty('visibility', 'hidden', 'important');
    });
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', applyHomeMobileHardStop);
  window.addEventListener('resize', applyHomeMobileHardStop);
  window.addEventListener('aura-home-frames-updated', applyHomeMobileHardStop);
  window.addEventListener('popstate', () => setTimeout(applyHomeMobileHardStop, 80));
  setTimeout(applyHomeMobileHardStop, 200);
  setTimeout(applyHomeMobileHardStop, 1000);

  const observer = new MutationObserver(applyHomeMobileHardStop);
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
