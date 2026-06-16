import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { addWaitlistEntry } from '../lib/waitlistStore.js';
import './engagement-modal.css';

const MODAL_CLOSED_PREFIX = 'aura_modal_closed_';

const modalByRoute = [
  {
    match: (path) => path === '/' || path === '/launch',
    key: 'home-waitlist',
    eyebrow: 'DROP 001 EARLY ACCESS',
    title: 'Enter before the drop.',
    copy: 'Join the first circle for early access to AURA Fight Club, product release updates, and the Drop 001 campaign.',
    cta: 'Join Waitlist',
    source: 'modal-home-waitlist',
    product: 'Drop 001',
    image: '/assets/aura-scroll/05_drop_001_tools_uniform/frame_09_cream_full_outfit_model.png',
  },
  {
    match: (path) => path.includes('fight-club'),
    key: 'fight-club-join',
    eyebrow: 'AURA FIGHT CLUB',
    title: 'Join the first circle.',
    copy: 'Get access to the Fight Club list before public launch. Discipline, identity, and early product access.',
    cta: 'Join Fight Club',
    source: 'modal-fight-club',
    product: 'AURA Fight Club',
    image: '/assets/aura-scroll/07_fight_club_close/frame_04_fight_club_tracksuit_ring.png',
  },
  {
    match: (path) => path.includes('campaign') || path.includes('cinematic'),
    key: 'campaign-newsletter',
    eyebrow: 'CAMPAIGN UPDATES',
    title: 'Follow the work behind the brand.',
    copy: 'Get campaign edits, frame drops, behind-the-scenes product updates, and launch notes.',
    cta: 'Get updates',
    source: 'modal-campaign-newsletter',
    product: 'Campaign newsletter',
    image: '/assets/aura-scroll/06_campaign_mitts_sequence/frame_03_mitts_real.png',
  },
  {
    match: (path) => path.includes('product') || path.includes('drop-001') || path.includes('apparel') || path.includes('footwear') || path.includes('equipment'),
    key: 'product-waitlist',
    eyebrow: 'PRODUCT WAITLIST',
    title: 'Be first when pieces go live.',
    copy: 'Join for launch access, stock updates, product drops, and early availability before public release.',
    cta: 'Join Product Waitlist',
    source: 'modal-product-waitlist',
    product: 'AURA products',
    image: '/assets/aura-scroll/05_drop_001_tools_uniform/frame_01_cream_uniform_model.png',
  },
];

function getModalConfig(pathname) {
  if (pathname.startsWith('/admin')) return null;
  return modalByRoute.find((item) => item.match(pathname)) || modalByRoute[0];
}

function wasClosed(key) {
  if (typeof window === 'undefined' || !key) return false;
  return window.sessionStorage.getItem(`${MODAL_CLOSED_PREFIX}${key}`) === '1';
}

function markClosed(key) {
  if (typeof window === 'undefined' || !key) return;
  window.sessionStorage.setItem(`${MODAL_CLOSED_PREFIX}${key}`, '1');
}

export default function EngagementModal() {
  const location = useLocation();
  const config = useMemo(() => getModalConfig(location.pathname), [location.pathname]);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: 'No spam. Early access and launch updates only.' });

  useEffect(() => {
    setEmail('');
    setStatus({ type: 'idle', message: 'No spam. Early access and launch updates only.' });

    if (!config || wasClosed(config.key)) {
      setOpen(false);
      return undefined;
    }

    const delay = location.pathname === '/' ? 1100 : 1600;
    const timer = window.setTimeout(() => setOpen(true), delay);
    return () => window.clearTimeout(timer);
  }, [config, location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  if (!config) return null;

  function closeModal() {
    markClosed(config.key);
    setOpen(false);
  }

  function submit(event) {
    event.preventDefault();
    const result = addWaitlistEntry({ email, source: config.source, product: config.product });

    if (!result.ok) {
      setStatus({ type: 'error', message: 'Enter a valid email address.' });
      return;
    }

    setEmail('');
    setStatus({ type: 'success', message: result.duplicate ? 'You were already on the list. Updated.' : 'You are on the list.' });
  }

  return (
    <>
      <button className="em-trigger" type="button" onClick={() => setOpen(true)}>
        {config.cta}
      </button>

      {open && (
        <div className="em-overlay" role="presentation">
          <button className="em-backdrop" type="button" aria-label="Close modal" onClick={closeModal} />
          <section className="em-modal" role="dialog" aria-modal="true" aria-labelledby="engagement-modal-title">
            <button className="em-close" type="button" aria-label="Close" onClick={closeModal}>×</button>
            <div className="em-modal__media" aria-hidden="true">
              <img src={config.image} alt="" />
            </div>
            <div className="em-modal__content">
              <p className="em-eyebrow">{config.eyebrow}</p>
              <h2 id="engagement-modal-title">{config.title}</h2>
              <p className="em-copy">{config.copy}</p>
              <form className="em-form" onSubmit={submit}>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  aria-label="Email address"
                />
                <button type="submit">{config.cta}</button>
              </form>
              <p className={`em-message em-message--${status.type}`}>{status.message}</p>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
