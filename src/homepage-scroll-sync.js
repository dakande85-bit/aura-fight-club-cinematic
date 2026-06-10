// Emergency homepage mobile initial-scroll sync.
// The homepage ScrollFilm renders correctly after the user scrolls down/back up.
// This file only nudges the page by 1px at the very top so ScrollTrigger/Lenis
// receive an initial scroll update. It does not change images, video, z-index,
// frame arrays, product pages, or campaign pages.

function isMobileHome() {
  return window.location.pathname === '/' && window.matchMedia('(max-width: 768px)').matches;
}

function syncHomepageScrollFilm() {
  if (!isMobileHome()) return;
  if (window.scrollY > 4) return;

  const originalBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = 'auto';

  window.dispatchEvent(new Event('resize'));
  window.dispatchEvent(new Event('scroll'));

  window.scrollTo(0, 1);
  window.dispatchEvent(new Event('scroll'));

  window.requestAnimationFrame(() => {
    window.scrollTo(0, 0);
    window.dispatchEvent(new Event('scroll'));
    document.documentElement.style.scrollBehavior = originalBehavior;
  });
}

function scheduleSync() {
  if (!isMobileHome()) return;
  [120, 350, 700].forEach(delay => {
    window.setTimeout(syncHomepageScrollFilm, delay);
  });
}

window.addEventListener('pageshow', scheduleSync);
document.addEventListener('DOMContentLoaded', scheduleSync);
window.addEventListener('orientationchange', () => window.setTimeout(scheduleSync, 300));

scheduleSync();
