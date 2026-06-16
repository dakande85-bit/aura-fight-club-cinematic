function fixFooterLinks() {
  document.querySelectorAll('.aura-footer__legal a[href="#privacy"]').forEach(link => {
    link.setAttribute('href', '/fight-club');
  });
  document.querySelectorAll('.aura-footer__legal a[href="#terms"]').forEach(link => {
    link.setAttribute('href', '/fight-club');
  });
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

function closeCinematicMenuOnNav(event) {
  if (event.target.closest?.('.sf-mobile-menu a')) setCinematicMenu(false);
}

function markModalClosedThisVisit() {
  try {
    window.sessionStorage.setItem('aura_modal_closed_this_visit', '1');
  } catch (error) {
    // Ignore storage errors in private/locked contexts.
  }
}

function closeModalHard() {
  markModalClosedThisVisit();
  const modalOverlay = document.querySelector('.em-overlay');
  if (!modalOverlay) return;
  modalOverlay.remove();
  document.querySelectorAll('.em-trigger').forEach(trigger => {
    trigger.style.display = 'none';
  });
}

function closeModalFromAnyCloseButton(event) {
  const close = event.target.closest?.('.em-close, .em-backdrop');
  if (!close) return;

  event.preventDefault();
  event.stopPropagation();
  if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();

  closeModalHard();
}

function applyReleaseFixes() {
  fixFooterLinks();
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', applyReleaseFixes);
  window.addEventListener('popstate', () => setTimeout(applyReleaseFixes, 50));

  document.addEventListener('click', toggleCinematicMenu, true);
  document.addEventListener('click', closeCinematicMenuOnNav, true);
  document.addEventListener('pointerdown', closeModalFromAnyCloseButton, true);
  document.addEventListener('click', closeModalFromAnyCloseButton, true);

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      setCinematicMenu(false);
      closeModalHard();
    }
  });

  const observer = new MutationObserver(applyReleaseFixes);
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
