// Emergency mobile homepage hero fix.
// Ensures the first visible homepage visual is the actual intro video on mobile,
// not a static fallback/image-sequence frame.

function isMobileHome() {
  return window.location.pathname === '/' && window.matchMedia('(max-width: 768px)').matches;
}

function applyMobileVideoFix() {
  if (!isMobileHome()) return;

  const video = document.querySelector('.sf-video');
  const slots = document.querySelectorAll('.sf-image-slot');

  if (!video) return;
  if (window.scrollY > 12) return;

  // Keep image sequence layers hidden while the homepage is still at the intro.
  slots.forEach(slot => {
    slot.style.opacity = '0';
    slot.style.pointerEvents = 'none';
  });

  // Force the real intro video to be the visible top layer.
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.setAttribute('autoplay', '');
  video.style.opacity = '1';
  video.style.zIndex = '3';

  // Try to play immediately. Muted inline video is allowed on modern mobile browsers.
  const playPromise = video.play();
  if (playPromise?.catch) playPromise.catch(() => {});
}

function scheduleFixes() {
  if (!isMobileHome()) return;
  [0, 60, 150, 300, 600, 1000, 1600].forEach(delay => {
    window.setTimeout(applyMobileVideoFix, delay);
  });
}

window.addEventListener('pageshow', scheduleFixes);
document.addEventListener('DOMContentLoaded', scheduleFixes);
window.addEventListener('orientationchange', () => window.setTimeout(scheduleFixes, 250));
window.addEventListener('scroll', () => {
  // Let ScrollFilm take over after the user leaves the intro.
  if (window.scrollY <= 12) applyMobileVideoFix();
}, { passive: true });

scheduleFixes();
