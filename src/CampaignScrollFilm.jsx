import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const BASE = '/assets/aura-scroll';
const FADE_DUR = 0.82;

const FRAMES = {
  hero: [
    `${BASE}/04_footwork_skipping/frame_06_jump_midair.png`,
    `${BASE}/04_footwork_skipping/frame_08_jump_high.png`,
  ],
  rhythm: [
    `${BASE}/04_footwork_skipping/frame_01_skip_ready.png`,
    `${BASE}/04_footwork_skipping/frame_03_rope_swing_low.png`,
    `${BASE}/04_footwork_skipping/frame_06_jump_midair.png`,
    `${BASE}/04_footwork_skipping/frame_08_jump_high.png`,
    `${BASE}/04_footwork_skipping/frame_10_skip_reset.png`,
  ],
  pressure: [
    `${BASE}/06_campaign_mitts_sequence/frame_01_mitts_real.png`,
    `${BASE}/06_campaign_mitts_sequence/frame_02_mitts_real.png`,
    `${BASE}/06_campaign_mitts_sequence/frame_03_mitts_real.png`,
    `${BASE}/06_campaign_mitts_sequence/frame_04_mitts_real.png`,
    `${BASE}/06_campaign_mitts_sequence/frame_05_mitts_real.png`,
  ],
  repetition: [
    `${BASE}/02_shadow_boxing_the_standard/frame_02_shadow_02_guard_raised.png`,
    `${BASE}/02_shadow_boxing_the_standard/frame_05_shadow_05_jab_start.png`,
    `${BASE}/02_shadow_boxing_the_standard/frame_06_shadow_06_jab_extension.png`,
    `${BASE}/02_shadow_boxing_the_standard/frame_07_shadow_07_return_guard.png`,
    `${BASE}/02_shadow_boxing_the_standard/frame_08_shadow_08_defensive_slip.png`,
  ],
  control: [
    `${BASE}/03_the_work_handwraps/frame_01_handwrap_start.png`,
    `${BASE}/03_the_work_handwraps/frame_03_wrap_check.png`,
    `${BASE}/03_the_work_handwraps/frame_05_wrap_tighten.png`,
    `${BASE}/03_the_work_handwraps/frame_08_wrap_guard.png`,
    `${BASE}/03_the_work_handwraps/frame_10_work_final.png`,
  ],
  close: [
    `${BASE}/07_fight_club_close/frame_01_fight_club_close.png`,
    `${BASE}/07_fight_club_close/frame_03_fight_club_ringside_black.png`,
    `${BASE}/07_fight_club_close/frame_04_fight_club_tracksuit_ring.png`,
    `${BASE}/07_fight_club_close/frame_05_fight_club_female_wraps.png`,
  ],
};

const SCENES = [
  { id: 'campaign-intro', start: 0.00, end: 0.12, frames: FRAMES.hero, label: 'AURA FIGHT CLUB', headline: ['THE CAMPAIGN', 'EARNED WHERE', 'NOBODY IS WATCHING.'], sub: 'Pressure. Rhythm. Restraint. Identity.', cta: 'buttons' },
  { id: 'rhythm', start: 0.12, end: 0.28, frames: FRAMES.rhythm, label: 'RHYTHM', headline: ['FOOTWORK.', 'TIMING.', 'CONTROL.'], sub: 'The round starts before the first punch.', frameCaptions: ['Balance before power.', 'Find the rhythm.', 'Stay light.', 'Create the angle.', 'Control the distance.'] },
  { id: 'pressure', start: 0.28, end: 0.44, frames: FRAMES.pressure, label: 'PRESSURE', headline: ['NOT PANIC.', 'PACE.'], sub: 'Read the room. Let him commit. Stay composed.', frameCaptions: ['Pressure.', 'Rhythm.', 'Restraint.', 'No wasted movement.', 'Earned where nobody is watching.'] },
  { id: 'repetition', start: 0.44, end: 0.60, frames: FRAMES.repetition, label: 'REPETITION', headline: ['POWER IS BUILT', 'ONE ROUND', 'AT A TIME.'], sub: 'Guard. Load. Impact. Return.', frameCaptions: ['Guard.', 'Load.', 'Impact.', 'Return.', 'Reset.'] },
  { id: 'timing', start: 0.60, end: 0.76, frames: FRAMES.pressure, label: 'TIMING', headline: ['SPEED WITHOUT', 'CONTROL', 'IS WASTED.'], sub: 'Reflex under pressure. Precision without emotion.', frameCaptions: ['Read.', 'React.', 'Slip.', 'Touch.', 'Reset.'] },
  { id: 'control', start: 0.76, end: 0.90, frames: FRAMES.control, label: 'CONTROL', headline: ['THE BODY FOLLOWS', 'WHAT THE MIND', 'CAN HOLD.'], sub: 'Discipline is built quietly.', frameCaptions: ['Quiet work.', 'No audience required.', 'Prepare the hands.', 'Prepare the mind.', 'Ready.'] },
  { id: 'manifesto', start: 0.90, end: 1.00, frames: FRAMES.close, label: 'MANIFESTO', headline: ['YOUR AURA', 'IS EARNED.'], sub: 'The real fight is internal.\nThe opponent is just the mirror.', cta: 'buttons' },
];

function getScene(p) { if (p >= 1) return SCENES[SCENES.length - 1]; return SCENES.find(s => p >= s.start && p < s.end) ?? SCENES[0]; }
function localP(scene, p) { const r = scene.end - scene.start; return r > 0 ? Math.max(0, Math.min(1, (p - scene.start) / r)) : 0; }
function calcFrame(frames, lp) { return Math.max(0, Math.min(frames.length - 1, Math.round(lp * (frames.length - 1)))); }

const imgCache = new Map();
function preload(src) {
  if (!src) return Promise.resolve();
  if (imgCache.has(src)) return imgCache.get(src);
  const p = new Promise(resolve => { const img = new Image(); img.onload = () => resolve(true); img.onerror = () => resolve(false); img.src = src; });
  imgCache.set(src, p);
  return p;
}

function useAmbient(ref) {
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, raf = null, t = 0;
    const drops = Array.from({ length: 72 }, () => ({ x: Math.random(), y: Math.random(), len: 0.04 + Math.random() * 0.06, speed: 0.0018 + Math.random() * 0.0028, opacity: 0.04 + Math.random() * 0.07, drift: (Math.random() - 0.5) * 0.0003 }));
    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    const ro = new ResizeObserver(resize); ro.observe(canvas); resize();
    const draw = () => { ctx.clearRect(0, 0, W, H); drops.forEach(d => { d.y += d.speed; d.x += d.drift; if (d.y > 1) { d.y = -d.len; d.x = Math.random(); } ctx.save(); ctx.globalAlpha = d.opacity; ctx.strokeStyle = 'rgba(180,200,220,1)'; ctx.lineWidth = 0.65; ctx.beginPath(); ctx.moveTo(d.x*W, d.y*H); ctx.lineTo((d.x+d.drift*60)*W, (d.y+d.len)*H); ctx.stroke(); ctx.restore(); }); t += 0.016; raf = requestAnimationFrame(draw); };
    if (!window.matchMedia('(prefers-reduced-motion:reduce)').matches) raf = requestAnimationFrame(draw);
    return () => { ro.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, [ref]);
}

const NAV_LINKS = [
  { label: 'Drop 001', href: '/drop-001' },
  { label: 'Apparel', href: '/apparel' },
  { label: 'Footwear', href: '/footwear' },
  { label: 'Equipment', href: '/equipment' },
  { label: 'The Campaign', href: '/campaign' },
  { label: 'Fight Club', href: '/fight-club' },
];

function CinematicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  return <>
    <header className="sf-header" role="banner">
      <a href="/" className="sf-header-logo" aria-label="AURA Fight Club" onClick={closeMenu}><span className="sf-header-logo-text">AURA</span><span className="sf-header-logo-sub">Fight Club</span></a>
      <nav className="sf-header-nav" aria-label="Main navigation">{NAV_LINKS.map(l => <a key={l.href} href={l.href} className="sf-header-nav-link">{l.label}</a>)}</nav>
      <a href="/fight-club" className="sf-header-cta sf-header-cta--desktop">Join Waitlist</a>
      <button className={`sf-hamburger${menuOpen ? ' sf-hamburger--open' : ''}`} onClick={() => setMenuOpen(v => !v)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}><span /><span /><span /></button>
    </header>
    <div className={`sf-mobile-menu${menuOpen ? ' sf-mobile-menu--open' : ''}`} aria-hidden={!menuOpen}>
      <nav className="sf-mobile-menu-nav" aria-label="Mobile navigation">{NAV_LINKS.map(l => <a key={l.href} href={l.href} className="sf-mobile-nav-link" onClick={closeMenu}>{l.label}</a>)}<a href="/fight-club" className="sf-mobile-nav-cta" onClick={closeMenu}>Join Waitlist</a></nav>
    </div>
    {menuOpen && <div className="sf-mobile-menu-backdrop" onClick={closeMenu} aria-hidden="true" />}
  </>;
}

function SceneOverlay({ scene, visible, frameIdx = 0 }) {
  if (!scene) return null;
  return <div className={`sf-overlay${visible ? ' sf-overlay--in' : ''}`}>
    <div className="sf-overlay-inner">
      <p className="sf-label">{scene.label}</p>
      <h2 className="sf-headline">{scene.headline.map((line, i) => <span key={i} className="sf-headline-line" style={{ '--i': i }}>{line}</span>)}</h2>
      {scene.sub && <p className="sf-sub">{scene.sub.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}</p>}
      {scene.frameCaptions && <p className="sf-frame-caption" key={frameIdx}>{scene.frameCaptions[Math.min(frameIdx, scene.frameCaptions.length - 1)]}</p>}
      {scene.cta === 'buttons' && <div className="sf-cta-row"><a href="/drop-001" className="sf-btn sf-btn--solid">View Drop 001</a><a href="/fight-club" className="sf-btn sf-btn--ghost">Enter Fight Club</a></div>}
    </div>
  </div>;
}

function Indicators({ activeId }) {
  return <div className="sf-indicators" aria-hidden="true">{SCENES.map(s => <div key={s.id} className={`sf-indicator${s.id === activeId ? ' sf-indicator--active' : ''}`} title={s.label} />)}</div>;
}

export default function CampaignScrollFilm() {
  const wrapperRef = useRef(null), ambientRef = useRef(null), slotARef = useRef(null), slotBRef = useRef(null), imgARef = useRef(null), imgBRef = useRef(null);
  const currentSlot = useRef('A'), currentScId = useRef(null), curFrameIdx = useRef(0), cancelTween = useRef(null);
  const [allReady, setAllReady] = useState(false);
  const [overlayScene, setOverlayScene] = useState(SCENES[0]);
  const [overlayVis, setOverlayVis] = useState(false);
  const [overlayFrame, setOverlayFrame] = useState(0);
  const [progress, setProgress] = useState(0);

  useAmbient(ambientRef);
  useEffect(() => { Promise.all(SCENES.flatMap(s => s.frames).map(preload)).then(() => setAllReady(true)); }, []);

  const doTransition = useRef(null);
  doTransition.current = (newScene) => {
    const slotA = slotARef.current, slotB = slotBRef.current, imgA = imgARef.current, imgB = imgBRef.current;
    if (!slotA || !slotB) return;
    if (cancelTween.current) { cancelTween.current.kill(); cancelTween.current = null; }
    const nextSlotId = currentSlot.current === 'A' ? 'B' : 'A';
    const nextSlotEl = nextSlotId === 'A' ? slotA : slotB;
    const nextImgEl = nextSlotId === 'A' ? imgA : imgB;
    const currSlotEl = currentSlot.current === 'A' ? slotA : slotB;
    nextImgEl.src = newScene.frames[0];
    gsap.set(nextSlotEl, { opacity: 0 });
    cancelTween.current = gsap.to(nextSlotEl, { opacity: 1, duration: FADE_DUR, ease: 'power1.inOut', onComplete: () => { cancelTween.current = null; } });
    gsap.to(currSlotEl, { opacity: 0, duration: FADE_DUR, ease: 'power1.inOut' });
    currentSlot.current = nextSlotId;
  };

  useEffect(() => {
    const wrapper = wrapperRef.current; if (!wrapper) return;
    const mq = window.matchMedia('(prefers-reduced-motion:reduce)');
    currentScId.current = SCENES[0].id;
    imgARef.current.src = SCENES[0].frames[0];
    gsap.set(slotARef.current, { opacity: 1 });
    gsap.set(slotBRef.current, { opacity: 0 });
    setTimeout(() => setOverlayVis(true), 250);
    const lenis = new Lenis({ duration: mq.matches ? 0 : 0.7, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: !mq.matches });
    const ticker = t => lenis.raf(t * 1000);
    gsap.ticker.add(ticker); gsap.ticker.lagSmoothing(0); lenis.on('scroll', ScrollTrigger.update);
    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: wrapper, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate(self) {
        const p = self.progress; setProgress(p);
        const scene = getScene(p); const lp = localP(scene, p);
        const frameIdx = calcFrame(scene.frames, lp);
        if (scene.id !== currentScId.current) {
          currentScId.current = scene.id; curFrameIdx.current = 0; doTransition.current(scene); setOverlayVis(false); setOverlayFrame(0); setTimeout(() => { setOverlayScene(scene); setOverlayVis(true); }, 200);
        }
        if (frameIdx !== curFrameIdx.current) {
          curFrameIdx.current = frameIdx; setOverlayFrame(frameIdx);
          const activeImg = currentSlot.current === 'A' ? imgARef.current : imgBRef.current;
          if (activeImg && scene.frames[frameIdx]) activeImg.src = scene.frames[frameIdx];
        }
      }});
    });
    setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => { ctx.revert(); lenis.destroy(); gsap.ticker.remove(ticker); ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, [allReady]);

  return <div className="sf-wrapper" ref={wrapperRef}>
    <CinematicHeader />
    <div className="sf-fixed">
      <div ref={slotARef} className="sf-image-slot" style={{ opacity: 0 }}><img ref={imgARef} className="sf-image" src="" alt="" style={{ objectPosition: 'center top' }} /></div>
      <div ref={slotBRef} className="sf-image-slot" style={{ opacity: 0 }}><img ref={imgBRef} className="sf-image" src="" alt="" style={{ objectPosition: 'center top' }} /></div>
      <canvas ref={ambientRef} className="sf-ambient" aria-hidden="true" />
      <div className="sf-grain" aria-hidden="true" />
      <div className="sf-vignette" aria-hidden="true" />
      {!allReady && <div className="sf-loading" aria-live="polite"><span className="sf-loading-dot" /><span>Preloading campaign…</span></div>}
      <SceneOverlay scene={overlayScene} visible={overlayVis} frameIdx={overlayFrame} />
      <Indicators activeId={overlayScene?.id} />
      <div className="sf-progress-bar" aria-hidden="true"><div className="sf-progress-fill" style={{ transform: `scaleX(${progress})` }} /></div>
      <div className="sf-scroll-hint" aria-hidden="true"><span>SCROLL</span><span className="sf-arrow">↓</span></div>
      <div className="sf-watermark" aria-hidden="true">AURA</div>
    </div>
    <div className="sf-scroll-space" aria-hidden="true" />
  </div>;
}
