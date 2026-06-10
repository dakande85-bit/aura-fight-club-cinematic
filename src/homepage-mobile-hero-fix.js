// Emergency mobile homepage hero fix.
// Forces the first visible homepage hero visual to the training/jump-rope scene
// instead of the old intro fallback/model frame on mobile Safari/Chrome.

const MOBILE_HERO_FRAME = '/assets/aura-scroll/04_footwork_skipping/frame_08_jump_high.png';

function isMobileHome() {
  return window.location.pathname === '/' && window.matchMedia('(max-width: 768px)').matches;
}

function applyMobileHeroFix() {
  if (!isMobileHome()) return;

  const video = document.querySelector('.sf-video');
  const firstSlot = document.querySelector('.sf-image-slot');
  const firstImg = firstSlot?.querySelector('.sf-image');

  if (!firstSlot || !firstImg) return;

  // Only force the opening state while the user is still at the top.
  // Once they scroll, the ScrollFilm engine can take over normally.
  if (window.scrollY > 12) return;

  firstImg.src = MOBILE_HERO_FRAME;
  firstImg.style.objectPosition = 'center top';
  firstSlot.style.opacity = '1';

  if (video) {
    video.poster = MOBILE_HERO_FRAME;
    video.pause();
    video.style.opacity = '0';
  }
}

// Run several times because React/GSAP initializes after first paint on mobile.
function scheduleFixes() {
  if (!isMobileHome()) return;
  [0, 80, 180, 350, 700, 1200].forEach(delay => {
    window.setTimeout(applyMobileHeroFix, delay);
  });
}

window.addEventListener('pageshow', scheduleFixes);
document.addEventListener('DOMContentLoaded', scheduleFixes);
window.addEventListener('orientationchange', () => window.setTimeout(scheduleFixes, 250));

scheduleFixes();
