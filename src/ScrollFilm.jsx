/**
 * AURA Fight Club — Scroll Film
 * ─────────────────────────────
 * Scroll progress controls video.currentTime directly.
 * Scroll down = forward. Scroll up = reverse.
 * One scene active at a time. Source video is swappable.
 */
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// ─── SWAP VIDEO HERE ───────────────────────────────────────────────────────
const SOURCE_VIDEO = '/assets/aura-scroll/aura-source.mp4';
// ──────────────────────────────────────────────────────────────────────────

// Scene definitions — one active at a time, chronological order
const SCENES = [
  {
    id:    'intro',
    name:  'INTRO',
    start: 0,
    end:   0.18,
    label: 'AURA FIGHT CLUB — DROP 001',
    headline: ['YOUR AURA', 'IS EARNED.'],
    sub:   'The real fight is internal.\nThe opponent is just the mirror.',
    cta:   [
      { text: 'Enter Drop 001', href: '#' },
      { text: 'Join Fight Club', href: '#', ghost: true },
    ],
  },
  {
    id:    'standard',
    name:  'THE STANDARD',
    start: 0.20,
    end:   0.38,
    label: 'THE STANDARD',
    headline: ['THE REAL', 'FIGHT IS', 'INTERNAL.'],
    sub:   'The opponent is just the mirror.',
    cta:   null,
  },
  {
    id:    'work',
    name:  'THE WORK',
    start: 0.40,
    end:   0.56,
    label: 'THE WORK',
    headline: ['SILENCE.', 'DISCIPLINE.', 'PRESENCE.'],
    sub:   'Built where nobody is watching.',
    cta:   null,
  },
  {
    id:    'drop',
    name:  'DROP 001',
    start: 0.58,
    end:   0.72,
    label: 'DROP 001',
    headline: ['TOOLS FOR THE', 'WORK NOBODY', 'SEES.'],
    sub:   'The first uniform of AURA Fight Club.',
    cta:   null,
  },
  {
    id:    'campaign',
    name:  'THE CAMPAIGN',
    start: 0.74,
    end:   0.88,
    label: 'THE CAMPAIGN',
    headline: ['YOUR AURA IS', 'EARNED WHERE', 'NOBODY WATCHES.'],
    sub:   'Pressure, rhythm, restraint, identity.',
    cta:   null,
  },
  {
    id:    'fightclub',
    name:  'FIGHT CLUB',
    start: 0.90,
    end:   1.00,
    label: 'FIGHT CLUB',
    headline: ['MORE THAN', 'A BRAND.', 'A FIGHT IDENTITY.'],
    sub:   'Join the first circle of AURA Fight Club.',
    cta:   'waitlist',
  },
];

function getActiveScene(p) {
  return SCENES.find(s => p >= s.start && p <= s.end) || null;
}

// ─── SCENE OVERLAY ─────────────────────────────────────────────────────────
function SceneOverlay({ scene, visible }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!scene) return null;

  return (
    <div className={`sf-overlay${visible ? ' sf-overlay--in' : ''}`}>
      <div className="sf-overlay-inner">
        <p className="sf-label">{scene.label}</p>

        <h2 className="sf-headline">
          {scene.headline.map((line, i) => (
            <span key={i} className="sf-headline-line"
              style={{ '--i': i }}>
              {line}
            </span>
          ))}
        </h2>

        {scene.sub && (
          <p className="sf-sub">
            {scene.sub.split('\n').map((l, i) => (
              <span key={i}>{l}<br /></span>
            ))}
          </p>
        )}

        {/* Standard CTA buttons */}
        {Array.isArray(scene.cta) && (
          <div className="sf-cta-row">
            {scene.cta.map((c, i) => (
              <a
                key={i}
                href={c.href}
                className={`sf-btn${c.ghost ? ' sf-btn--ghost' : ' sf-btn--solid'}`}
              >
                {c.text}
              </a>
            ))}
          </div>
        )}

        {/* Waitlist form (last scene) */}
        {scene.cta === 'waitlist' && (
          <div className="sf-waitlist">
            {!submitted ? (
              <div className="sf-form-row">
                <input
                  className="sf-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  aria-label="Email address"
                />
                <button
                  className="sf-btn sf-btn--solid"
                  onClick={() => email && setSubmitted(true)}
                >
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

// ─── SCENE INDICATORS ─────────────────────────────────────────────────────
function SceneIndicators({ activeId, progress }) {
  return (
    <div className="sf-indicators" aria-hidden="true">
      {SCENES.map(s => (
        <div
          key={s.id}
          className={`sf-indicator${activeId === s.id ? ' sf-indicator--active' : ''}`}
          title={s.name}
        />
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function ScrollFilm() {
  const videoRef   = useRef(null);
  const wrapperRef = useRef(null);
  const rafRef     = useRef(null);
  const [ready, setReady]       = useState(false);
  const [isMobile, setMobile]   = useState(false);
  const [activeScene, setActiveScene] = useState(SCENES[0]);
  const [sceneVisible, setSceneVisible] = useState(false);
  const [debug, setDebug] = useState({
    progress: 0, time: 0, duration: 0, scene: 'INTRO',
  });

  // Detect mobile once
  useEffect(() => {
    const mobile =
      window.matchMedia('(max-width: 768px)').matches ||
      /iPhone|iPad|Android/i.test(navigator.userAgent);
    setMobile(mobile);
  }, []);

  // Wait for video metadata
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    const onMeta = () => setReady(true);
    video.addEventListener('loadedmetadata', onMeta);
    if (video.readyState >= 1) onMeta();
    return () => video.removeEventListener('loadedmetadata', onMeta);
  }, []);

  // Main scroll → video sync
  useEffect(() => {
    if (!ready) return;
    const video   = videoRef.current;
    const wrapper = wrapperRef.current;
    if (!video || !wrapper) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Lenis smooth scroll
    const lenis = new Lenis({
      duration:    mq.matches ? 0 : 1.05,
      easing:      t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !mq.matches,
    });

    const ticker = time => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', ScrollTrigger.update);

    // Scene transition state
    let lastSceneId = null;
    let visibleTimer = null;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrapper,
        start:   'top top',
        end:     'bottom bottom',
        scrub:   true,
        onUpdate(self) {
          const p = self.progress;

          // ── Core mechanic ──────────────────────────
          if (video.duration && isFinite(video.duration)) {
            video.currentTime = p * video.duration;
          }

          // ── Scene detection ──────────────────────
          const scene = getActiveScene(p);

          // Throttle React state updates via rAF
          if (rafRef.current) return;
          rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;

            setDebug({
              progress: p,
              time:     video.currentTime,
              duration: video.duration,
              scene:    scene ? scene.name : '—',
            });

            if (scene?.id !== lastSceneId) {
              lastSceneId = scene?.id ?? null;
              clearTimeout(visibleTimer);
              // Brief fade-out before new scene fades in
              setSceneVisible(false);
              visibleTimer = setTimeout(() => {
                setActiveScene(scene);
                setSceneVisible(!!scene);
              }, scene ? 120 : 0);
            }
          });
        },
      });
    });

    // Mobile: slow autoplay fallback
    if (isMobile) {
      video.playbackRate = 0.4;
      video.loop = true;
      video.play().catch(() => {});
      // On mobile, drive overlay from timeupdate instead
      const onTime = () => {
        if (!video.duration) return;
        const p = video.currentTime / video.duration;
        const scene = getActiveScene(p);
        if (scene?.id !== lastSceneId) {
          lastSceneId = scene?.id ?? null;
          setSceneVisible(false);
          setTimeout(() => {
            setActiveScene(scene);
            setSceneVisible(!!scene);
          }, scene ? 120 : 0);
        }
        setDebug(d => ({
          ...d,
          progress: p,
          time: video.currentTime,
          duration: video.duration,
          scene: scene ? scene.name : '—',
        }));
      };
      video.addEventListener('timeupdate', onTime);
    }

    // Show first scene immediately
    setActiveScene(SCENES[0]);
    setSceneVisible(true);
    lastSceneId = SCENES[0].id;

    setTimeout(() => ScrollTrigger.refresh(), 400);

    return () => {
      ctx.revert();
      lenis.destroy();
      gsap.ticker.remove(ticker);
      ScrollTrigger.getAll().forEach(t => t.kill());
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(visibleTimer);
    };
  }, [ready, isMobile]);

  return (
    <div className="sf-wrapper" ref={wrapperRef}>

      {/* ── FIXED LAYER ──────────────────────────── */}
      <div className="sf-fixed">

        {/* Video */}
        <video
          ref={videoRef}
          className="sf-video"
          src={SOURCE_VIDEO}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />

        {/* Atmospherics */}
        <div className="sf-vignette" aria-hidden="true" />
        <div className="sf-grain"    aria-hidden="true" />
        <div className="sf-sweep"    aria-hidden="true" />

        {/* Loading state */}
        {!ready && (
          <div className="sf-loading" aria-live="polite">
            <span className="sf-loading-dot" />
            <span>Loading</span>
          </div>
        )}

        {/* Scene overlay — one at a time */}
        <SceneOverlay scene={activeScene} visible={sceneVisible} />

        {/* Scene indicators */}
        <SceneIndicators
          activeId={activeScene?.id}
          progress={debug.progress}
        />

        {/* Progress bar */}
        <div className="sf-progress-bar" aria-hidden="true">
          <div
            className="sf-progress-fill"
            style={{ transform: `scaleX(${debug.progress})` }}
          />
        </div>

        {/* Debug panel */}
        <div className="sf-debug" aria-label="Debug info">
          <span>PROGRESS<em>{(debug.progress * 100).toFixed(1)}%</em></span>
          <span>TIME<em>{debug.time.toFixed(2)}s</em></span>
          <span>DURATION<em>{debug.duration > 0 ? debug.duration.toFixed(2) + 's' : '—'}</em></span>
          <span>SCENE<em>{debug.scene}</em></span>
          {isMobile && <span className="sf-debug-warn">MOBILE MODE</span>}
        </div>

        {/* Scroll hint */}
        {ready && (
          <div className="sf-scroll-hint" aria-hidden="true">
            <span>SCROLL</span>
            <span className="sf-arrow">↓</span>
          </div>
        )}

        {/* AURA watermark */}
        <div className="sf-watermark" aria-hidden="true">AURA</div>
      </div>

      {/* Scroll spacer — 600vh gives enough room */}
      <div className="sf-scroll-space" aria-hidden="true" />
    </div>
  );
}
