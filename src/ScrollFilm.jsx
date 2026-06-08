/**
 * AURA Fight Club — Multi-Scene Scroll Film
 * ──────────────────────────────────────────
 * Scroll progress drives the active scene.
 * Each scene has its own visual (video segment or image).
 * Video scenes: scroll maps to video.currentTime within startTime/endTime.
 * Image scenes: image shown fullscreen with subtle scale parallax.
 * Crossfade on scene change.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// ── SOURCE VIDEO — swap by replacing this file ──────────────────────────────
const VIDEO_SRC = '/assets/aura-scroll/aura-source.mp4';

// ── SCENE CONFIG ────────────────────────────────────────────────────────────
// visualType: 'video' | 'image'
// video scenes: startTime/endTime map the scene's local progress to currentTime
// image scenes: src shown fullscreen with slow scale; use null for gradient fallback
const SCENES = [
  {
    id:        'intro',
    start:     0,
    end:       0.16,
    visualType:'video',
    src:       VIDEO_SRC,
    startTime: 0,
    endTime:   2.8,
    label:     'AURA FIGHT CLUB — DROP 001',
    headline:  ['YOUR AURA', 'IS EARNED.'],
    sub:       'The real fight is internal.\nThe opponent is just the mirror.',
    cta:       'buttons',
  },
  {
    id:        'standard',
    start:     0.18,
    end:       0.33,
    visualType:'video',
    src:       VIDEO_SRC,
    startTime: 2.8,
    endTime:   5.2,
    label:     'THE STANDARD',
    headline:  ['THE REAL', 'FIGHT IS', 'INTERNAL.'],
    sub:       'The opponent is just the mirror.',
    cta:       null,
  },
  {
    id:        'work',
    start:     0.35,
    end:       0.50,
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
    start:     0.52,
    end:       0.66,
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
    start:     0.68,
    end:       0.83,
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
    start:     0.85,
    end:       1.0,
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
  return SCENES.find(s => p >= s.start && p <= s.end) ?? null;
}
function sceneLocalProgress(scene, p) {
  if (!scene) return 0;
  const range = scene.end - scene.start;
  return range > 0 ? Math.max(0, Math.min(1, (p - scene.start) / range)) : 0;
}

// ── SCENE OVERLAY ────────────────────────────────────────────────────────────
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
                <button className="sf-btn sf-btn--solid" onClick={() => email && setDone(true)}>
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

// ── VISUAL LAYER ─────────────────────────────────────────────────────────────
// Two slots (A/B) crossfade when scene changes.
function VisualLayer({ sceneA, sceneB, activeSlot, videoRef }) {
  const renderVisual = (scene, slot) => {
    if (!scene) return null;
    const isActive = activeSlot === slot;
    if (scene.visualType === 'video') {
      return (
        <div key={scene.id + slot}
          className={`sf-visual-slot${isActive ? ' sf-visual-slot--active' : ''}`}>
          {/* Video is rendered once outside; this slot just controls opacity */}
        </div>
      );
    }
    // Image
    return (
      <div key={scene.id + slot}
        className={`sf-visual-slot${isActive ? ' sf-visual-slot--active' : ''}`}>
        {scene.src ? (
          <img
            className="sf-image"
            src={scene.src}
            alt=""
            style={{ objectPosition: scene.imgPos || 'center center' }}
            loading="lazy"
          />
        ) : (
          <div className="sf-gradient-fallback" />
        )}
      </div>
    );
  };

  return (
    <div className="sf-visual-container">
      {renderVisual(sceneA, 'A')}
      {renderVisual(sceneB, 'B')}
    </div>
  );
}

// ── INDICATORS ───────────────────────────────────────────────────────────────
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

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function ScrollFilm() {
  const videoRef    = useRef(null);
  const wrapperRef  = useRef(null);
  const rafRef      = useRef(null);

  const [videoReady, setVideoReady] = useState(false);
  const [isMobile,   setMobile]     = useState(false);

  // Two-slot crossfade state
  const [slotA,       setSlotA]       = useState(SCENES[0]);
  const [slotB,       setSlotB]       = useState(null);
  const [activeSlot,  setActiveSlot]  = useState('A');
  const [sceneVisible,setSceneVisible]= useState(false);
  const [activeScene, setActiveScene] = useState(SCENES[0]);

  const [debug, setDebug] = useState({
    total: 0, sceneId: 'intro', localProg: 0, videoTime: 0,
  });

  const lastSceneId = useRef(null);
  const swapTimer   = useRef(null);

  // Mobile detect
  useEffect(() => {
    setMobile(
      window.matchMedia('(max-width: 768px)').matches ||
      /iPhone|iPad|Android/i.test(navigator.userAgent)
    );
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

  // Scene crossfade logic
  const switchScene = useCallback((newScene) => {
    if (!newScene || newScene.id === lastSceneId.current) return;
    lastSceneId.current = newScene.id;
    clearTimeout(swapTimer.current);

    const incoming = activeSlot === 'A' ? 'B' : 'A';
    if (incoming === 'A') setSlotA(newScene);
    else                  setSlotB(newScene);

    // Brief fade: hide overlay, flip slot, show overlay
    setSceneVisible(false);
    swapTimer.current = setTimeout(() => {
      setActiveSlot(incoming);
      setActiveScene(newScene);
      setSceneVisible(true);
    }, 180);
  }, [activeSlot]);

  // Main scroll engine
  useEffect(() => {
    if (!videoReady) return;
    const video   = videoRef.current;
    const wrapper = wrapperRef.current;
    if (!video || !wrapper) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const lenis = new Lenis({
      duration:    mq.matches ? 0 : 1.05,
      easing:      t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !mq.matches,
    });
    const ticker = t => lenis.raf(t * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', ScrollTrigger.update);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrapper,
        start:   'top top',
        end:     'bottom bottom',
        scrub:   true,
        onUpdate(self) {
          const p     = self.progress;
          const scene = getScene(p);
          const localP = sceneLocalProgress(scene, p);

          // ── Video scrub ──────────────────────────────
          if (scene?.visualType === 'video' && video.duration) {
            const { startTime, endTime } = scene;
            const targetTime = startTime + localP * (endTime - startTime);
            if (isFinite(targetTime)) video.currentTime = targetTime;
          }

          // ── Scene switch ─────────────────────────────
          if (scene?.id !== lastSceneId.current) {
            switchScene(scene);
          }

          // ── Debug (via rAF to avoid layout thrash) ───
          if (!rafRef.current) {
            rafRef.current = requestAnimationFrame(() => {
              rafRef.current = null;
              setDebug({
                total:    p,
                sceneId:  scene?.id ?? '—',
                localProg:localP,
                videoTime:video.currentTime,
              });
            });
          }
        },
      });
    });

    // Mobile: slow autoplay fallback
    if (isMobile) {
      video.playbackRate = 0.35;
      video.loop = true;
      video.play().catch(() => {});
    }

    // Show first scene
    lastSceneId.current = SCENES[0].id;
    setSceneVisible(true);

    setTimeout(() => ScrollTrigger.refresh(), 400);

    return () => {
      ctx.revert();
      lenis.destroy();
      gsap.ticker.remove(ticker);
      ScrollTrigger.getAll().forEach(t => t.kill());
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(swapTimer.current);
    };
  }, [videoReady, isMobile, switchScene]);

  // Is active visual a video?
  const activeIsVideo = (activeSlot === 'A' ? slotA : slotB)?.visualType === 'video';

  return (
    <div className="sf-wrapper" ref={wrapperRef}>
      <div className="sf-fixed">

        {/* ── VIDEO (always mounted, opacity toggled) ── */}
        <video
          ref={videoRef}
          className={`sf-video${activeIsVideo ? ' sf-video--active' : ''}`}
          src={VIDEO_SRC}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />

        {/* ── IMAGE SLOTS ── */}
        <div className={`sf-image-slot sf-image-slot--A${activeSlot === 'A' && slotA?.visualType === 'image' ? ' sf-image-slot--active' : ''}`}>
          {slotA?.visualType === 'image' && slotA.src ? (
            <img className="sf-image" src={slotA.src} alt=""
              style={{ objectPosition: slotA.imgPos || 'center center' }} />
          ) : slotA?.visualType === 'image' ? (
            <div className="sf-gradient-fallback" />
          ) : null}
        </div>
        <div className={`sf-image-slot sf-image-slot--B${activeSlot === 'B' && slotB?.visualType === 'image' ? ' sf-image-slot--active' : ''}`}>
          {slotB?.visualType === 'image' && slotB.src ? (
            <img className="sf-image" src={slotB.src} alt=""
              style={{ objectPosition: slotB.imgPos || 'center center' }} />
          ) : slotB?.visualType === 'image' ? (
            <div className="sf-gradient-fallback" />
          ) : null}
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

        {/* ── OVERLAY ── */}
        <SceneOverlay scene={activeScene} visible={sceneVisible} />

        {/* ── INDICATORS ── */}
        <Indicators activeId={activeScene?.id} />

        {/* ── PROGRESS BAR ── */}
        <div className="sf-progress-bar" aria-hidden="true">
          <div className="sf-progress-fill"
            style={{ transform: `scaleX(${debug.total})` }} />
        </div>

        {/* ── DEBUG ── */}
        <div className="sf-debug">
          <span>TOTAL<em>{(debug.total * 100).toFixed(1)}%</em></span>
          <span>SCENE<em>{debug.sceneId}</em></span>
          <span>LOCAL<em>{(debug.localProg * 100).toFixed(1)}%</em></span>
          <span>VID T<em>{debug.videoTime.toFixed(2)}s</em></span>
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
