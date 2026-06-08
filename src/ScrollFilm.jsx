/**
 * AURA Fight Club — Scroll Film  (Glitch-Free v3)
 * ─────────────────────────────────────────────────
 * All visual transitions handled via direct DOM refs + GSAP — no React state
 * races, no CSS animation resets, no slot flipping bugs.
 *
 * Architecture:
 *  - Two persistent image <div> layers (A/B) for image scenes
 *  - One persistent <video> for video scenes
 *  - GSAP crossfades directly on DOM elements (no setState for visuals)
 *  - React state used ONLY for overlay text + debug panel
 *  - Video seeking throttled: rAF-gated, 30ms minimum delta, clamped
 *  - Continuous scene ranges — no gaps, no null scene
 */
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// ── SWAP VIDEO: replace this file to change the source ──────────────────────
const VIDEO_SRC = '/assets/aura-scroll/aura-source.mp4';

// ── SCENE CONFIG ─────────────────────────────────────────────────────────────
// Ranges are CONTINUOUS — no gaps. Full 0→1 covered.
const SCENES = [
  {
    id:        'intro',
    start:     0.00, end: 0.18,
    visualType:'video',
    src:       VIDEO_SRC, startTime: 0,   endTime: 2.8,
    label:     'AURA FIGHT CLUB — DROP 001',
    headline:  ['YOUR AURA', 'IS EARNED.'],
    sub:       'The real fight is internal.\nThe opponent is just the mirror.',
    cta:       'buttons',
  },
  {
    id:        'standard',
    start:     0.18, end: 0.36,
    visualType:'video',
    src:       VIDEO_SRC, startTime: 2.8, endTime: 5.2,
    label:     'THE STANDARD',
    headline:  ['THE REAL', 'FIGHT IS', 'INTERNAL.'],
    sub:       'The opponent is just the mirror.',
    cta:       null,
  },
  {
    id:        'work',
    start:     0.36, end: 0.52,
    visualType:'image',
    src:       '/assets/aura-scroll/work.png',
    imgPos:    'center 22%',
    label:     'THE WORK',
    headline:  ['SILENCE.', 'DISCIPLINE.', 'PRESENCE.'],
    sub:       'Built where nobody is watching.',
    cta:       null,
  },
  {
    id:        'drop',
    start:     0.52, end: 0.68,
    visualType:'image',
    src:       '/assets/aura-scroll/drop-001.png',
    imgPos:    'center center',
    label:     'DROP 001',
    headline:  ['TOOLS FOR THE', 'WORK NOBODY', 'SEES.'],
    sub:       'The first uniform of AURA Fight Club.',
    cta:       null,
  },
  {
    id:        'campaign',
    start:     0.68, end: 0.84,
    visualType:'image',
    src:       '/assets/aura-scroll/campaign.png',
    imgPos:    'center top',
    label:     'THE CAMPAIGN',
    headline:  ['EARNED WHERE', 'NOBODY', 'IS WATCHING.'],
    sub:       'Pressure, rhythm, restraint, identity.',
    cta:       null,
  },
  {
    id:        'fightclub',
    start:     0.84, end: 1.00,
    visualType:'image',
    src:       '/assets/aura-scroll/fight-club.png',
    imgPos:    '58% center',
    label:     'FIGHT CLUB',
    headline:  ['MORE THAN', 'A BRAND.', 'A FIGHT IDENTITY.'],
    sub:       'Join the first circle of AURA Fight Club.',
    cta:       'waitlist',
  },
];

// ── HELPERS ──────────────────────────────────────────────────────────────────
function getScene(p) {
  // Clamp to last scene at exactly 1.0
  if (p >= 1.0) return SCENES[SCENES.length - 1];
  return SCENES.find(s => p >= s.start && p < s.end) ?? SCENES[0];
}
function localP(scene, p) {
  const range = scene.end - scene.start;
  return range > 0 ? Math.max(0, Math.min(1, (p - scene.start) / range)) : 0;
}

// Preload an image, returns a Promise
const imageCache = new Map();
function preloadImage(src) {
  if (!src) return Promise.resolve();
  if (imageCache.has(src)) return imageCache.get(src);
  const p = new Promise(res => {
    const img = new Image();
    img.onload  = () => res(true);
    img.onerror = () => res(false);
    img.src = src;
  });
  imageCache.set(src, p);
  return p;
}

// ── SCENE OVERLAY (React — text only) ────────────────────────────────────────
function SceneOverlay({ scene, visible }) {
  const [email, setEmail] = useState('');
  const [done, setDone]   = useState(false);
  useEffect(() => { setDone(false); setEmail(''); }, [scene?.id]);
  if (!scene) return null;
  return (
    <div className={`sf-overlay${visible ? ' sf-overlay--in' : ''}`}>
      <div className="sf-overlay-inner">
        <p className="sf-label">{scene.label}</p>
        <h2 className="sf-headline">
          {scene.headline.map((l, i) => (
            <span key={i} className="sf-headline-line" style={{ '--i': i }}>{l}</span>
          ))}
        </h2>
        {scene.sub && (
          <p className="sf-sub">
            {scene.sub.split('\n').map((l, i) => <span key={i}>{l}<br /></span>)}
          </p>
        )}
        {scene.cta === 'buttons' && (
          <div className="sf-cta-row">
            <a href="#" className="sf-btn sf-btn--solid">Enter Drop 001</a>
            <a href="#" className="sf-btn sf-btn--ghost">Join Fight Club</a>
          </div>
        )}
        {scene.cta === 'waitlist' && (
          <div className="sf-waitlist">
            {!done ? (
              <div className="sf-form-row">
                <input className="sf-email" type="email" placeholder="Enter your email"
                  value={email} onChange={e => setEmail(e.target.value)} />
                <button className="sf-btn sf-btn--solid"
                  onClick={() => email && setDone(true)}>
                  Join Waitlist
                </button>
              </div>
            ) : (
              <p className="sf-confirm">You're on the list. →</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── INDICATORS ────────────────────────────────────────────────────────────────
function Indicators({ activeId }) {
  return (
    <div className="sf-indicators" aria-hidden="true">
      {SCENES.map(s => (
        <div key={s.id}
          className={`sf-indicator${s.id === activeId ? ' sf-indicator--active' : ''}`}
          title={s.label} />
      ))}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function ScrollFilm() {
  const wrapperRef  = useRef(null);

  // DOM refs — manipulated directly, no React re-render for visuals
  const videoRef    = useRef(null);
  const imgSlotARef = useRef(null);
  const imgSlotBRef = useRef(null);
  const imgARef     = useRef(null);  // <img> inside slot A
  const imgBRef     = useRef(null);  // <img> inside slot B

  // Transition state (plain refs, not state — avoid async setState)
  const currentSlot    = useRef('A');   // which img slot is "current"
  const currentSceneId = useRef(null);
  const transitioning  = useRef(false);
  const cancelTransRef = useRef(null);  // cancel in-flight GSAP tween

  // Video seek throttle
  const lastSeekTime   = useRef(-1);
  const seekRafRef     = useRef(null);
  const pendingSeek    = useRef(null);

  // React state — overlay text + debug only
  const [videoReady, setVideoReady] = useState(false);
  const [isMobile,   setMobile]     = useState(false);
  const [overlayScene, setOverlayScene] = useState(SCENES[0]);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [debugState, setDebugState] = useState({
    total: 0, sceneId: '—', localPct: 0,
    videoTime: 0, imgLoaded: true, transitioning: false, prevScene: '—',
  });

  // Mobile detect
  useEffect(() => {
    setMobile(
      window.matchMedia('(max-width: 768px)').matches ||
      /iPhone|iPad|Android/i.test(navigator.userAgent)
    );
  }, []);

  // Preload all image assets upfront
  useEffect(() => {
    SCENES.forEach(s => {
      if (s.visualType === 'image' && s.src) preloadImage(s.src);
    });
  }, []);

  // Video metadata
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    const onMeta = () => setVideoReady(true);
    v.addEventListener('loadedmetadata', onMeta);
    if (v.readyState >= 1) onMeta();
    return () => v.removeEventListener('loadedmetadata', onMeta);
  }, []);

  // ── SCENE TRANSITION ENGINE (DOM-direct, no React state) ─────────────────
  const doTransition = useRef(null);
  doTransition.current = (newScene, prevSceneId) => {
    const video = videoRef.current;
    const slotA = imgSlotARef.current;
    const slotB = imgSlotBRef.current;
    const imgA  = imgARef.current;
    const imgB  = imgBRef.current;
    if (!slotA || !slotB) return;

    // Kill any in-flight tween
    if (cancelTransRef.current) {
      cancelTransRef.current.kill();
      cancelTransRef.current = null;
    }

    const prevIsVideo = SCENES.find(s => s.id === prevSceneId)?.visualType === 'video';
    const nextIsVideo = newScene.visualType === 'video';
    const sameVideo   = prevIsVideo && nextIsVideo; // video→video: no fade needed

    transitioning.current = true;

    const onComplete = () => {
      transitioning.current = false;
      cancelTransRef.current = null;
    };

    if (sameVideo) {
      // Video→video: just keep video visible, no crossfade
      gsap.set(video, { opacity: 1 });
      gsap.set(slotA, { opacity: 0 });
      gsap.set(slotB, { opacity: 0 });
      onComplete();
      return;
    }

    const performSwitch = () => {
      // Determine which image slot is "next"
      const nextSlot = currentSlot.current === 'A' ? 'B' : 'A';
      const nextSlotEl  = nextSlot === 'A' ? slotA : slotB;
      const nextImgEl   = nextSlot === 'A' ? imgA  : imgB;
      const currSlotEl  = currentSlot.current === 'A' ? slotA : slotB;

      // Load image into next slot (if image scene)
      if (nextIsVideo) {
        nextSlotEl.style.opacity = '0';
      } else {
        if (nextImgEl) {
          nextImgEl.src = newScene.src || '';
          nextImgEl.style.objectPosition = newScene.imgPos || 'center center';
          // Reset transform so scale starts from 1.0, not mid-animation
          gsap.set(nextImgEl, { scale: 1 });
        }
        gsap.set(nextSlotEl, { opacity: 0 });
      }

      const FADE = 0.75; // crossfade duration (s)

      // Bring next layer in
      if (nextIsVideo) {
        cancelTransRef.current = gsap.to(video, {
          opacity: 1, duration: FADE, ease: 'power1.inOut',
          onComplete,
        });
        gsap.to(currSlotEl, { opacity: 0, duration: FADE, ease: 'power1.inOut' });
      } else {
        cancelTransRef.current = gsap.to(nextSlotEl, {
          opacity: 1, duration: FADE, ease: 'power1.inOut',
          onComplete,
        });
        // Fade out video or previous image slot
        if (prevIsVideo) {
          gsap.to(video, { opacity: 0, duration: FADE, ease: 'power1.inOut' });
        } else {
          gsap.to(currSlotEl, { opacity: 0, duration: FADE, ease: 'power1.inOut' });
        }
      }

      currentSlot.current = nextIsVideo ? currentSlot.current : nextSlot;
    };

    if (newScene.visualType === 'image' && newScene.src) {
      // Wait for preload (likely already cached — near-instant)
      preloadImage(newScene.src).then(performSwitch);
    } else {
      performSwitch();
    }
  };

  // ── MAIN SCROLL ENGINE ────────────────────────────────────────────────────
  useEffect(() => {
    if (!videoReady) return;
    const video   = videoRef.current;
    const wrapper = wrapperRef.current;
    if (!video || !wrapper) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Initialise first scene visually
    const firstScene = SCENES[0];
    currentSceneId.current = firstScene.id;
    if (firstScene.visualType === 'video') {
      gsap.set(video, { opacity: 1 });
      gsap.set(imgSlotARef.current, { opacity: 0 });
      gsap.set(imgSlotBRef.current, { opacity: 0 });
    }
    setOverlayScene(firstScene);
    setTimeout(() => setOverlayVisible(true), 300);

    // Lenis
    const lenis = new Lenis({
      duration:    mq.matches ? 0 : 1.05,
      easing:      t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !mq.matches,
    });
    const ticker = t => lenis.raf(t * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', ScrollTrigger.update);

    // Debug rAF ref
    let debugRaf = null;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrapper,
        start:   'top top',
        end:     'bottom bottom',
        scrub:   true,
        onUpdate(self) {
          const p     = self.progress;
          const scene = getScene(p);
          const lp    = localP(scene, p);

          // ── 1. VIDEO SCRUB (throttled) ────────────────
          if (scene.visualType === 'video' && video.duration && isFinite(video.duration)) {
            const target = Math.max(
              scene.startTime,
              Math.min(scene.endTime, scene.startTime + lp * (scene.endTime - scene.startTime))
            );
            const delta = Math.abs(target - lastSeekTime.current);
            if (delta >= 0.03) {
              pendingSeek.current = target;
              if (!seekRafRef.current) {
                seekRafRef.current = requestAnimationFrame(() => {
                  seekRafRef.current = null;
                  if (pendingSeek.current !== null) {
                    video.currentTime  = pendingSeek.current;
                    lastSeekTime.current = pendingSeek.current;
                    pendingSeek.current  = null;
                  }
                });
              }
            }
          }

          // ── 2. IMAGE SCALE (GSAP, no CSS animation) ───
          if (scene.visualType === 'image') {
            const sc   = 1 + lp * 0.04;
            const slot = currentSlot.current === 'A' ? imgARef.current : imgBRef.current;
            if (slot) gsap.set(slot, { scale: sc });
          }

          // ── 3. SCENE CHANGE ───────────────────────────
          if (scene.id !== currentSceneId.current) {
            const prevId = currentSceneId.current;
            currentSceneId.current = scene.id;

            // Overlay: fade out → update → fade in
            setOverlayVisible(false);
            setTimeout(() => {
              setOverlayScene(scene);
              setOverlayVisible(true);
            }, 200);

            // Visual crossfade
            doTransition.current(scene, prevId);
          }

          // ── 4. DEBUG (rAF throttled) ──────────────────
          if (!debugRaf) {
            debugRaf = requestAnimationFrame(() => {
              debugRaf = null;
              setDebugState({
                total:        p,
                sceneId:      scene.id,
                localPct:     lp,
                videoTime:    video.currentTime,
                imgLoaded:    imageCache.has(scene.src) ? true : (scene.visualType !== 'image'),
                transitioning:transitioning.current,
                prevScene:    currentSceneId.current,
              });
            });
          }
        },
      });
    });

    // Mobile fallback
    if (isMobile) {
      video.playbackRate = 0.35;
      video.loop = true;
      video.play().catch(() => {});
    }

    setTimeout(() => ScrollTrigger.refresh(), 400);

    return () => {
      ctx.revert();
      lenis.destroy();
      gsap.ticker.remove(ticker);
      ScrollTrigger.getAll().forEach(t => t.kill());
      if (seekRafRef.current) cancelAnimationFrame(seekRafRef.current);
      if (debugRaf)            cancelAnimationFrame(debugRaf);
    };
  }, [videoReady, isMobile]);

  return (
    <div className="sf-wrapper" ref={wrapperRef}>
      <div className="sf-fixed">

        {/* ── VIDEO — always mounted, opacity via GSAP ── */}
        <video
          ref={videoRef}
          className="sf-video"
          src={VIDEO_SRC}
          muted playsInline preload="auto"
          style={{ opacity: 0 }}
          aria-hidden="true"
        />

        {/* ── IMAGE SLOT A ── */}
        <div ref={imgSlotARef} className="sf-image-slot" style={{ opacity: 0 }}>
          <img ref={imgARef} className="sf-image" src="" alt=""
            style={{ transformOrigin: 'center center' }} />
        </div>

        {/* ── IMAGE SLOT B ── */}
        <div ref={imgSlotBRef} className="sf-image-slot" style={{ opacity: 0 }}>
          <img ref={imgBRef} className="sf-image" src="" alt=""
            style={{ transformOrigin: 'center center' }} />
        </div>

        {/* ── ATMOSPHERICS ── */}
        <div className="sf-vignette" aria-hidden="true" />
        <div className="sf-grain"    aria-hidden="true" />
        <div className="sf-sweep"    aria-hidden="true" />

        {/* ── LOADING ── */}
        {!videoReady && (
          <div className="sf-loading" aria-live="polite">
            <span className="sf-loading-dot" />
            <span>Loading</span>
          </div>
        )}

        {/* ── OVERLAY (text only — React) ── */}
        <SceneOverlay scene={overlayScene} visible={overlayVisible} />

        {/* ── SCENE INDICATORS ── */}
        <Indicators activeId={overlayScene?.id} />

        {/* ── PROGRESS BAR ── */}
        <div className="sf-progress-bar" aria-hidden="true">
          <div className="sf-progress-fill"
            style={{ transform: `scaleX(${debugState.total})` }} />
        </div>

        {/* ── DEBUG PANEL ── */}
        <div className="sf-debug">
          <span>TOTAL    <em>{(debugState.total * 100).toFixed(1)}%</em></span>
          <span>SCENE    <em>{debugState.sceneId}</em></span>
          <span>LOCAL    <em>{(debugState.localPct * 100).toFixed(1)}%</em></span>
          <span>VID&nbsp;T  <em>{debugState.videoTime.toFixed(2)}s</em></span>
          <span>IMG OK   <em>{debugState.imgLoaded ? 'YES' : 'WAIT'}</em></span>
          <span>TRANS    <em>{debugState.transitioning ? 'YES' : 'NO'}</em></span>
          {isMobile && <span className="sf-debug-warn">MOBILE</span>}
        </div>

        {/* ── SCROLL HINT ── */}
        {videoReady && (
          <div className="sf-scroll-hint" aria-hidden="true">
            <span>SCROLL</span>
            <span className="sf-arrow">↓</span>
          </div>
        )}

        <div className="sf-watermark" aria-hidden="true">AURA</div>
      </div>

      <div className="sf-scroll-space" aria-hidden="true" />
    </div>
  );
}
