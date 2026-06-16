const ROUTE_MODAL_IMAGE = [
  {
    test: path => path === '/' || path === '/launch',
    src: '/assets/aura-scroll/05_drop_001_tools_uniform/frame_09_cream_full_outfit_model.png',
  },
  {
    test: path => path.includes('fight-club'),
    src: '/assets/aura-scroll/07_fight_club_close/frame_04_fight_club_tracksuit_ring.png',
  },
  {
    test: path => path.includes('campaign') || path.includes('cinematic'),
    src: '/assets/aura-scroll/06_campaign_mitts_sequence/frame_03_mitts_real.png',
  },
  {
    test: path => path.includes('drop-001') || path.includes('apparel') || path.includes('footwear') || path.includes('equipment') || path.includes('product'),
    src: '/assets/aura-scroll/05_drop_001_tools_uniform/frame_01_cream_uniform_model.png',
  },
];

function currentModalImage() {
  const path = window.location.pathname || '/';
  return ROUTE_MODAL_IMAGE.find(item => item.test(path))?.src || ROUTE_MODAL_IMAGE[0].src;
}

function fixFooterLinks() {
  document.querySelectorAll('.aura-footer__legal a[href="#privacy"]').forEach(link => {
    link.setAttribute('href', '/fight-club');
  });
  document.querySelectorAll('.aura-footer__legal a[href="#terms"]').forEach(link => {
    link.setAttribute('href', '/fight-club');
  });
}

function addModalImage() {
  const modal = document.querySelector('.em-modal');
  if (!modal || modal.querySelector('.em-modal__media')) return;

  const media = document.createElement('div');
  media.className = 'em-modal__media';

  const img = document.createElement('img');
  img.src = currentModalImage();
  img.alt = '';
  img.loading = 'eager';

  media.appendChild(img);
  modal.insertBefore(media, modal.firstChild);
}

function applyReleaseFixes() {
  fixFooterLinks();
  addModalImage();
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', applyReleaseFixes);
  window.addEventListener('popstate', () => setTimeout(applyReleaseFixes, 50));

  const observer = new MutationObserver(applyReleaseFixes);
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
