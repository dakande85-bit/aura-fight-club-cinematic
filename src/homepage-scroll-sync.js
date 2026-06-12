// Emergency homepage mobile initial-scroll sync.
// Also applies a cache-busting query string to cinematic assets so replaced
// frames do not stay stuck behind browser/CDN cache after admin publishing.

const VERSIONABLE_ASSET_PATTERNS = ['/assets/aura-scroll/', '/campaign/'];
const VERSION_PARAM = 'v';

function isMobileHome() {
  return window.location.pathname === '/' && window.matchMedia('(max-width: 768px)').matches;
}

function isVersionableAsset(value = '') {
  return VERSIONABLE_ASSET_PATTERNS.some(pattern => value.includes(pattern));
}

function setAssetVersion(version) {
  if (!version) return;
  window.__AURA_ASSET_VERSION__ = String(version);
  applyCinematicAssetVersion();
}

function fallbackAssetVersion() {
  // Minute bucket keeps the site usable while still forcing fresh bytes after a publish.
  return `runtime-${Math.floor(Date.now() / 60000)}`;
}

function addVersionToAssetUrl(value) {
  const version = window.__AURA_ASSET_VERSION__;
  if (!version || !value || !isVersionableAsset(value)) return value;

  try {
    const url = new URL(value, window.location.origin);
    if (!isVersionableAsset(url.pathname)) return value;
    if (url.searchParams.get(VERSION_PARAM) === version) return value;
    url.searchParams.set(VERSION_PARAM, version);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return value;
  }
}

function applyCinematicAssetVersion(root = document) {
  const nodes = root.querySelectorAll?.('img[src], video[src], source[src]') || [];
  nodes.forEach(node => {
    const current = node.getAttribute('src');
    const next = addVersionToAssetUrl(current);
    if (next && next !== current) node.setAttribute('src', next);
  });
}

function injectCinematicRuntimeFixes() {
  if (document.getElementById('aura-cinematic-runtime-fixes')) return;

  const style = document.createElement('style');
  style.id = 'aura-cinematic-runtime-fixes';
  style.textContent = `
    /*
      Frame 09 is a portrait/editorial product model image. Using cover on a
      16:9 scroll-film stage zooms into the torso and cuts the head/legs. Keep
      this frame contained and biased right so the full outfit remains visible
      while the left headline area stays readable.
    */
    img[src*="frame_09_cream_full_outfit_model"] {
      object-fit: contain !important;
      object-position: 78% center !important;
      background: #050505 !important;
    }

    @media (max-width: 768px) {
      img[src*="frame_09_cream_full_outfit_model"] {
        object-fit: contain !important;
        object-position: center center !important;
      }
    }

    .scb-inspector-img,
    .scb-frame-card__img,
    .scb-replacement-preview img,
    .scb-current-frame-preview img,
    .scb-preview-img,
    .scb-preview img,
    [class*="preview"] img {
      object-fit: contain !important;
      background: #000 !important;
    }
  `;
  document.head.appendChild(style);
}

function installAssetVersionObserver() {
  let scheduled = false;
  const run = () => {
    scheduled = false;
    applyCinematicAssetVersion();
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(run);
  };

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src'],
  });

  schedule();
}

async function loadAssetVersion() {
  try {
    const response = await fetch('/asset-version.json', { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      if (data?.version) {
        setAssetVersion(data.version);
        return;
      }
    }
  } catch {
    // Missing asset-version.json must never break the site.
  }

  setAssetVersion(fallbackAssetVersion());
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

injectCinematicRuntimeFixes();
installAssetVersionObserver();
loadAssetVersion();

window.addEventListener('pageshow', () => {
  loadAssetVersion();
  scheduleSync();
});
document.addEventListener('DOMContentLoaded', () => {
  loadAssetVersion();
  scheduleSync();
});
window.addEventListener('orientationchange', () => window.setTimeout(scheduleSync, 300));

scheduleSync();
