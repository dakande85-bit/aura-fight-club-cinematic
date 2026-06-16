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

function setNormalMenu(open) {
  const button = document.querySelector('.header__menu-btn');
  const menu = document.querySelector('#aura-mobile-menu, .header__mobile-menu');
  if (!button || !menu) return false;

  button.classList.toggle('header__menu-btn--open', open);
  button.setAttribute('aria-expanded', open ? 'true' : 'false');
  menu.classList.toggle('header__mobile-menu--open', open);
  menu.setAttribute('aria-hidden', open ? 'false' : 'true');
  document.body.classList.toggle('aura-menu-open', open);
  ensureNormalBackdrop(open);
  return true;
}

function ensureNormalBackdrop(open) {
  let backdrop = document.querySelector('.aura-release-menu-backdrop');
  if (open && !backdrop) {
    backdrop = document.createElement('button');
    backdrop.type = 'button';
    backdrop.className = 'aura-release-menu-backdrop';
    backdrop.setAttribute('aria-label', 'Close menu');
    backdrop.addEventListener('click', () => setNormalMenu(false));
    document.body.appendChild(backdrop);
  }
  if (!open && backdrop) backdrop.remove();
}

function toggleNormalMenu(event) {
  const button = event.target.closest?.('.header__menu-btn');
  if (!button) return;
  const menu = document.querySelector('#aura-mobile-menu, .header__mobile-menu');
  if (!menu) return;

  event.preventDefault();
  event.stopPropagation();
  if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();

  const open = !menu.classList.contains('header__mobile-menu--open');
  setNormalMenu(open);
}

function setCinematicMenu(open) {
  const button = document.querySelector('.sf-hamburger');
  const menu = document.querySelector('.sf-mobile-menu');
  if (!button || !menu) return false;

  button.classList.toggle('sf-hamburger--open', open);
  button.setAttribute('aria-expanded', open ? 'true' : 'false');
  menu.classList.toggle('sf-mobile-menu--open', open);
  menu.setAttribute('aria-hidden', open ? 'false' : 'true');
  document.body.classList.toggle('aura-menu-open', open);
  ensureCinematicBackdrop(open);
  return true;
}

function ensureCinematicBackdrop(open) {
  let backdrop = document.querySelector('.sf-mobile-menu-backdrop');
  if (open && !backdrop) {
    backdrop = document.createElement('button');
    backdrop.type = 'button';
    backdrop.className = 'sf-mobile-menu-backdrop';
    backdrop.setAttribute('aria-label', 'Close menu');
    backdrop.addEventListener('click', () => setCinematicMenu(false));
    document.body.appendChild(backdrop);
  }
  if (!open && backdrop) backdrop.remove();
}

function toggleCinematicMenu(event) {
  const button = event.target.closest?.('.sf-hamburger');
  if (!button) return;
  const menu = document.querySelector('.sf-mobile-menu');
  if (!menu) return;

  event.preventDefault();
  event.stopPropagation();
  if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();

  const open = !menu.classList.contains('sf-mobile-menu--open');
  setCinematicMenu(open);
}

function closeMenusOnNav(event) {
  if (event.target.closest?.('.header__mobile-menu a')) setNormalMenu(false);
  if (event.target.closest?.('.sf-mobile-menu a')) setCinematicMenu(false);
}

function applyReleaseFixes() {
  fixFooterLinks();
  addModalImage();
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', applyReleaseFixes);
  window.addEventListener('popstate', () => setTimeout(applyReleaseFixes, 50));

  document.addEventListener('click', toggleNormalMenu, true);
  document.addEventListener('touchend', toggleNormalMenu, true);
  document.addEventListener('click', toggleCinematicMenu, true);
  document.addEventListener('touchend', toggleCinematicMenu, true);
  document.addEventListener('click', closeMenusOnNav, true);

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      setNormalMenu(false);
      setCinematicMenu(false);
    }
  });

  const observer = new MutationObserver(applyReleaseFixes);
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
