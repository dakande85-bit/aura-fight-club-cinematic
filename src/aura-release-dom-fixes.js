function fixFooterLinks() {
  document.querySelectorAll('.aura-footer__legal a[href="#privacy"]').forEach(link => {
    link.setAttribute('href', '/fight-club');
  });
  document.querySelectorAll('.aura-footer__legal a[href="#terms"]').forEach(link => {
    link.setAttribute('href', '/fight-club');
  });
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

  setNormalMenu(!menu.classList.contains('header__mobile-menu--open'));
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

  setCinematicMenu(!menu.classList.contains('sf-mobile-menu--open'));
}

function closeMenusOnNav(event) {
  if (event.target.closest?.('.header__mobile-menu a')) setNormalMenu(false);
  if (event.target.closest?.('.sf-mobile-menu a')) setCinematicMenu(false);
}

function closeModalFromAnyCloseButton(event) {
  const close = event.target.closest?.('.em-close, .em-backdrop');
  if (!close) return;
  // Let React handle state first. This only prevents duplicate synthetic clicks behind the modal.
  event.stopPropagation();
}

function applyReleaseFixes() {
  fixFooterLinks();
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', applyReleaseFixes);
  window.addEventListener('popstate', () => setTimeout(applyReleaseFixes, 50));

  document.addEventListener('click', toggleNormalMenu, true);
  document.addEventListener('click', toggleCinematicMenu, true);
  document.addEventListener('click', closeMenusOnNav, true);
  document.addEventListener('click', closeModalFromAnyCloseButton, true);

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      setNormalMenu(false);
      setCinematicMenu(false);
    }
  });

  const observer = new MutationObserver(applyReleaseFixes);
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
