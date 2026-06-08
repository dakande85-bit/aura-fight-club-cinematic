/**
 * AURA Fight Club — Cinematic Scroll Film  v4
 * ─────────────────────────────────────────────
 * Three-layer architecture:
 *   1. AMBIENT LAYER  — canvas rain/grain/light, always playing, independent of scroll
 *   2. SCENE LAYER    — scroll-controlled video segments + image scenes, GSAP crossfades
 *   3. OVERLAY LAYER  — text/CTA, React-only, one scene at a time
 *
 * Glitch-free guarantees (from v3, kept intact):
 *   - All visual transitions via direct DOM refs + GSAP (no React setState for visuals)
 *   - Video seeking throttled: rAF-gated, ≥30ms delta, clamped to scene range
 *   - Continuous scene ranges — no gaps, no null scene ever
 *   - Image preload cache — transitions wait for image loaded before fading in
 *   - GSAP-controlled image scale (no CSS animation resets)
 *
 * New in v4:
 *   - Canvas ambient layer (rain streaks, fog pulses, light sweep) — always on
 *   - per-scene parallax motion: scale + translate via localP
 *   - imageSequence visualType stub (plays frames[] on scroll localP)
 *   - DEV_DEBUG flag hides debug panel in production
 */
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// ── CONFIG ────────────────────────────────────────────────────────────────────
const DEV_DEBUG  = true;   // set false to hide debug panel
const VIDEO_SRC  = '/assets/aura-scroll/aura-source.mp4';
const FADE_DUR   = 0.85;   // crossfade seconds
const SEEK_DELTA = 0.03;   // minimum currentTime change before seeking

// ── SCENE DEFINITIONS ─────────────────────────────────────────────────────────
// visualType: 'video' | 'image' | 'imageSequence' (stub — pass frames:[])
// Ranges CONTINUOUS: 0.00→0.18→0.36→0.52→0.68→0.84→1.00
const SCENES = [
  {
    id:        'intro',
    start: 0.00, end: 0.18,
    visualType:'video',
    src:       VIDEO_SRC,
    startTime: 0, endTime: 2.8,
    // Ambient motion params for this scene
    motion:    { scaleRange: [1.0, 1.0], tx: 0, ty: 0 }, // video handles its own motion
    label:    'AURA FIGHT CLUB — DROP 001',
    headline: ['YOUR AURA', 'IS EARNED.'],
    sub:      'The real fight is internal.\nThe opponent is just the mirror.',
    cta:      'buttons',
  },
  {
    id:        'standard',
    start: 0.18, end: 0.36,
    visualType:'video',
    src:       VIDEO_SRC,
    startTime: 2.8, endTime: 5.2,
    motion:    { scaleRange: [1.0, 1.0], tx: 0, ty: 0 },
    label:    'THE STANDARD',
    headline: ['THE REAL', 'FIGHT IS', 'INTERNAL.'],
    sub:      'The opponent is just the mirror.',
    cta:      null,
  },
  {
    id:        'work',
    start: 0.36, end: 0.52,
    visualType:'image',
    src:       '/assets/aura-scroll/work.png',
    imgPos:    'center 22%',
    // Motion: starts slightly zoomed in, drifts up and scales out as you scroll through
    motion:    { scaleRange: [1.08, 1.02], tx: 0, ty: -24 },
    label:    'THE WORK',
    headline: ['SILENCE.', 'DISCIPLINE.', 'PRESENCE.'],
    sub:      'Built where nobody is watching.',
    cta:      null,
  },
  {
    id:        'drop',
    start: 0.52, end: 0.68,
    visualType:'image',
    src:       '/assets/aura-scroll/drop-001.png',
    imgPos:    'center center',
    // Product reveal: subtle scale up + slight rightward drift
    motion:    { scaleRange: [1.0, 1.06], tx: 18, ty: -12 },
    lightSweep: true,
    label:    'DROP 001',
    headline: ['TOOLS FOR THE', 'WORK NOBODY', 'SEES.'],
    sub:      'The first uniform of AURA Fight Club.',
    cta:      null,
  },
  {
    id:        'campaign',
    start: 0.68, end: 0.84,
    visualType:'image',
    src:       '/assets/aura-scroll/campaign.png',
    imgPos:    'center top',
    // Campaign: slight zoom + upward pull (model rises through frame)
    motion:    { scaleRange: [1.04, 1.10], tx: -10, ty: -32 },
    lightSweep: true,
    label:    'THE CAMPAIGN',
    headline: ['EARNED WHERE', 'NOBODY', 'IS WATCHING.'],
    sub:      'Pressure, rhythm, restraint, identity.',
    cta:      null,
  },
  {
    id:        'fightclub',
    start: 0.84, end: 1.00,
    visualType:'image',
    src:       '/assets/aura-scroll/fight-club.png',
    imgPos:    '58% center',
    // Ring close: slow pull back
    motion:    { scaleRange: [1.06, 1.0], tx: 0, ty: -16 },
    label:    'FIGHT CLUB',
    headline: ['MORE THAN', 'A BRAND.', 'A FIGHT IDENTITY.'],
    sub:      'Join the first circle of AURA Fight Club.',
    cta:      'waitlist',
  },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
function getScene(p) {
  if (p >= 1.0) return SCENES[SCENES.length - 1];
  return SCENES.find(s => p >= s.start && p < s.end) ?? SCENES[0];
}
function localP(scene, p) {
  const r = scene.end - scene.start;
  return r > 0 ? Math.max(0, Math.min(1, (p - scene.start) / r)) : 0;
}

// Image preload cache
const imgCache = new Map();
function preload(src) {
  if (!src) return Promise.resolve();
  if (imgCache.has(src)) return imgCache.get(src);
  const p = new Promise(res => {
    const i = new Image();
    i.onload = i.onerror = () => res();
    i.src = src;
  });
  imgCache.set(src, p);
  return p;
}

// ── AMBIENT CANVAS (rain / fog / light sweep) ──────────────────────────────
function useAmbient(canvasRef, active) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = 0, H = 0, raf = null;
    let t = 0;

    // Rain drops
    const drops = Array.from({ length: 80 }, () => ({
      x: Math.random(),
      y: Math.random(),
      len: 0.04 + Math.random() * 0.06,
      speed: 0.002 + Math.random() * 0.003,
      opacity: 0.04 + Math.random() * 0.08,
      drift: (Math.random() - 0.5) * 0.0004,
    }));

    // Fog particles
    const fog = Array.from({ length: 6 }, (_, i) => ({
      x: 0.1 + i * 0.15,
      y: 0.4 + Math.random() * 0.4,
      r: 0.18 + Math.random() * 0.12,
      speed: 0.0001 + Math.random() * 0.0001,
      phase: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // ── Fog ──
      fog.forEach(f => {
        f.x += f.speed;
        if (f.x > 1.3) f.x = -0.3;
        const a = 0.03 + 0.015 * Math.sin(t * 0.4 + f.phase);
        const g = ctx.createRadialGradient(f.x*W, f.y*H, 0, f.x*W, f.y*H, f.r*W);
        g.addColorStop(0, `rgba(195,185,158,${a})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });

      // ── Rain ──
      drops.forEach(d => {
        d.y += d.speed;
        d.x += d.drift;
        if (d.y > 1) { d.y = -d.len; d.x = Math.random(); }
        if (d.x < 0 || d.x > 1) d.x = Math.random();
        ctx.save();
        ctx.globalAlpha = d.opacity * (0.6 + 0.4 * Math.sin(t * 0.8));
        ctx.strokeStyle = 'rgba(180,200,220,1)';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(d.x * W, d.y * H);
        ctx.lineTo((d.x + d.drift * 60) * W, (d.y + d.len) * H);
        ctx.stroke();
        ctx.restore();
      });

      // ── Ambient light sweep ──
      const sweepX = (Math.sin(t * 0.12) * 0.5 + 0.5) * W;
      const sg = ctx.createLinearGradient(sweepX - W * 0.3, 0, sweepX + W * 0.3, 0);
      sg.addColorStop(0, 'rgba(255,248,218,0)');
      sg.addColorStop(0.5, `rgba(255,248,218,${0.018 + 0.008 * Math.sin(t * 0.3)})`);
      sg.addColorStop(1, 'rgba(255,248,218,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(0, 0, W, H);

      t += 0.016;
      raf = requestAnimationFrame(draw);
    };

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mq.matches) raf = requestAnimationFrame(draw);

    return () => {
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [canvasRef, active]);
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
                <button className="sf-btn sf-btn--solid" onClick={() => email && setDone(true)}>
                  Join Waitlist
                </button>
              </div>
            ) : <p className="sf-confirm">You're on the list. →</p>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── SCENE LIGHT SWEEP LAYER ────────────────────────────────────────────────
// Separate animated layer for scenes with lightSweep:true
function LightSweep({ active }) {
  return (
    <div className={`sf-light-sweep${active ? ' sf-light-sweep--active' : ''}`}
      aria-hidden="true" />
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
  const wrapperRef   = useRef(null);
  const ambientRef   = useRef(null);  // canvas

  // Scene layer DOM refs
  const videoRef     = useRef(null);
  const imgSlotARef  = useRef(null);
  const imgSlotBRef  = useRef(null);
  const imgARef      = useRef(null);
  const imgBRef      = useRef(null);

  // Transition state (refs — synchronous, no React)
  const currentSlot  = useRef('A');
  const currentScId  = useRef(null);
  const transitioning= useRef(false);
  const cancelTween  = useRef(null);

  // Video seek throttle
  const lastSeek     = useRef(-1);
  const seekRaf      = useRef(null);
  const pendingSeek  = useRef(null);

  // React state — overlay text + debug only
  const [videoReady,    setVideoReady]    = useState(false);
  const [isMobile,      setMobile]        = useState(false);
  const [overlayScene,  setOverlayScene]  = useState(SCENES[0]);
  const [overlayVis,    setOverlayVis]    = useState(false);
  const [lightSweep,    setLightSweep]    = useState(false);
  const [debug, setDebug] = useState({
    total:0, sceneId:'—', localPct:0, videoTime:0, trans:false,
  });

  // Ambient canvas
  useAmbient(ambientRef, videoReady);

  useEffect(() => {
    setMobile(
      window.matchMedia('(max-width:768px)').matches ||
      /iPhone|iPad|Android/i.test(navigator.userAgent)
    );
  }, []);

  // Preload all images upfront
  useEffect(() => {
    SCENES.forEach(s => { if (s.visualType === 'image' && s.src) preload(s.src); });
  }, []);

  // Video metadata
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true; v.playsInline = true; v.preload = 'auto';
    const onMeta = () => setVideoReady(true);
    v.addEventListener('loadedmetadata', onMeta);
    if (v.readyState >= 1) onMeta();
    return () => v.removeEventListener('loadedmetadata', onMeta);
  }, []);

  // ── TRANSITION ENGINE (DOM-direct, no React for visuals) ─────────────────
  const doTransition = useRef(null);
  doTransition.current = (newScene, prevSceneId) => {
    const video = videoRef.current;
    const slotA = imgSlotARef.current;
    const slotB = imgSlotBRef.current;
    const imgA  = imgARef.current;
    const imgB  = imgBRef.current;
    if (!slotA || !slotB) return;

    if (cancelTween.current) { cancelTween.current.kill(); cancelTween.current = null; }

    const prevScene    = SCENES.find(s => s.id === prevSceneId);
    const prevIsVideo  = prevScene?.visualType === 'video';
    const nextIsVideo  = newScene.visualType === 'video';
    const sameVideoSrc = prevIsVideo && nextIsVideo && prevScene?.src === newScene.src;

    transitioning.current = true;
    const onDone = () => { transitioning.current = false; cancelTween.current = null; };

    // Video→video same source: just update time mapping, no crossfade
    if (sameVideoSrc) {
      gsap.set(video, { opacity: 1 });
      gsap.set(slotA, { opacity: 0 }); gsap.set(slotB, { opacity: 0 });
      onDone(); return;
    }

    const doSwap = () => {
      const nextSlotId = currentSlot.current === 'A' ? 'B' : 'A';
      const nextSlotEl = nextSlotId === 'A' ? slotA : slotB;
      const nextImgEl  = nextSlotId === 'A' ? imgA  : imgB;
      const currSlotEl = currentSlot.current === 'A' ? slotA : slotB;

      if (!nextIsVideo && nextImgEl) {
        nextImgEl.src = newScene.src || '';
        nextImgEl.style.objectPosition = newScene.imgPos || 'center center';
        // Set initial scale from motion params
        const initScale = newScene.motion?.scaleRange?.[0] ?? 1.0;
        gsap.set(nextImgEl, { scale: initScale, x: 0, y: 0 });
      }
      gsap.set(nextIsVideo ? video : nextSlotEl, { opacity: 0 });

      // Fade incoming in, outgoing out
      if (nextIsVideo) {
        cancelTween.current = gsap.to(video, { opacity:1, duration:FADE_DUR, ease:'power1.inOut', onComplete:onDone });
        if (prevIsVideo) {
          // Should not happen (sameVideoSrc already handled), but safety
        } else {
          gsap.to(currSlotEl, { opacity:0, duration:FADE_DUR, ease:'power1.inOut' });
        }
      } else {
        cancelTween.current = gsap.to(nextSlotEl, { opacity:1, duration:FADE_DUR, ease:'power1.inOut', onComplete:onDone });
        if (prevIsVideo) {
          gsap.to(video, { opacity:0, duration:FADE_DUR, ease:'power1.inOut' });
        } else {
          gsap.to(currSlotEl, { opacity:0, duration:FADE_DUR, ease:'power1.inOut' });
        }
        currentSlot.current = nextSlotId;
      }
    };

    if (newScene.visualType === 'image' && newScene.src) {
      preload(newScene.src).then(doSwap);
    } else {
      doSwap();
    }
  };

  // ── MAIN SCROLL ENGINE ────────────────────────────────────────────────────
  useEffect(() => {
    if (!videoReady) return;
    const video   = videoRef.current;
    const wrapper = wrapperRef.current;
    if (!video || !wrapper) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Init first scene
    const first = SCENES[0];
    currentScId.current = first.id;
    gsap.set(video,             { opacity: first.visualType === 'video' ? 1 : 0 });
    gsap.set(imgSlotARef.current, { opacity: 0 });
    gsap.set(imgSlotBRef.current, { opacity: 0 });
    setOverlayScene(first);
    setTimeout(() => setOverlayVis(true), 300);

    const lenis = new Lenis({
      duration:    mq.matches ? 0 : 1.05,
      easing:      t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !mq.matches,
    });
    const ticker = t => lenis.raf(t * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', ScrollTrigger.update);

    let debugRaf = null;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrapper,
        start:   'top top',
        end:     'bottom bottom',
        scrub:   true,
        onUpdate(self) {
          const p  = self.progress;
          const sc = getScene(p);
          const lp = localP(sc, p);

          // ── 1. VIDEO SEEK (throttled) ─────────────────
          if (sc.visualType === 'video' && video.duration && isFinite(video.duration)) {
            const target = Math.max(sc.startTime,
              Math.min(sc.endTime, sc.startTime + lp * (sc.endTime - sc.startTime)));
            if (Math.abs(target - lastSeek.current) >= SEEK_DELTA) {
              pendingSeek.current = target;
              if (!seekRaf.current) {
                seekRaf.current = requestAnimationFrame(() => {
                  seekRaf.current = null;
                  if (pendingSeek.current !== null) {
                    video.currentTime = pendingSeek.current;
                    lastSeek.current  = pendingSeek.current;
                    pendingSeek.current = null;
                  }
                });
              }
            }
          }

          // ── 2. IMAGE MOTION (GSAP, scroll-linked) ────
          if (sc.visualType === 'image' && sc.motion) {
            const activeImg = currentSlot.current === 'A' ? imgARef.current : imgBRef.current;
            if (activeImg) {
              const { scaleRange, tx, ty } = sc.motion;
              const sc2 = scaleRange[0] + lp * (scaleRange[1] - scaleRange[0]);
              const tX  = lp * (tx || 0);
              const tY  = lp * (ty || 0);
              gsap.set(activeImg, { scale: sc2, x: tX, y: tY });
            }
          }

          // ── 3. SCENE CHANGE ───────────────────────────
          if (sc.id !== currentScId.current) {
            const prev = currentScId.current;
            currentScId.current = sc.id;
            doTransition.current(sc, prev);
            setOverlayVis(false);
            setLightSweep(!!sc.lightSweep);
            setTimeout(() => { setOverlayScene(sc); setOverlayVis(true); }, 200);
          }

          // ── 4. DEBUG (rAF throttled) ──────────────────
          if (!debugRaf) {
            debugRaf = requestAnimationFrame(() => {
              debugRaf = null;
              if (DEV_DEBUG) setDebug({
                total:    p,
                sceneId:  sc.id,
                localPct: lp,
                videoTime:video.currentTime,
                trans:    transitioning.current,
              });
            });
          }
        },
      });
    });

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
      if (seekRaf.current)  cancelAnimationFrame(seekRaf.current);
      if (debugRaf)         cancelAnimationFrame(debugRaf);
    };
  }, [videoReady, isMobile]);

  return (
    <div className="sf-wrapper" ref={wrapperRef}>
      <div className="sf-fixed">

        {/* ── LAYER 1: SCENE — video ── */}
        <video ref={videoRef} className="sf-video"
          src={VIDEO_SRC} muted playsInline preload="auto"
          style={{ opacity: 0 }} aria-hidden="true" />

        {/* ── LAYER 1: SCENE — image slots A/B ── */}
        <div ref={imgSlotARef} className="sf-image-slot" style={{ opacity: 0 }}>
          <img ref={imgARef} className="sf-image" src="" alt=""
            style={{ transformOrigin: 'center center' }} />
        </div>
        <div ref={imgSlotBRef} className="sf-image-slot" style={{ opacity: 0 }}>
          <img ref={imgBRef} className="sf-image" src="" alt=""
            style={{ transformOrigin: 'center center' }} />
        </div>

        {/* ── LAYER 1.5: SCENE-SPECIFIC LIGHT SWEEP ── */}
        <LightSweep active={lightSweep} />

        {/* ── LAYER 2: AMBIENT CANVAS (always on) ── */}
        <canvas ref={ambientRef} className="sf-ambient" aria-hidden="true" />

        {/* ── LAYER 2.5: GRAIN ── */}
        <div className="sf-grain" aria-hidden="true" />

        {/* ── LAYER 3: VIGNETTE ── */}
        <div className="sf-vignette" aria-hidden="true" />

        {/* ── LOADING ── */}
        {!videoReady && (
          <div className="sf-loading" aria-live="polite">
            <span className="sf-loading-dot" />
            <span>Loading</span>
          </div>
        )}

        {/* ── LAYER 4: OVERLAY (text) ── */}
        <SceneOverlay scene={overlayScene} visible={overlayVis} />
        <Indicators activeId={overlayScene?.id} />

        {/* ── PROGRESS BAR ── */}
        <div className="sf-progress-bar" aria-hidden="true">
          <div className="sf-progress-fill"
            style={{ transform: `scaleX(${debug.total})` }} />
        </div>

        {/* ── DEBUG ── */}
        {DEV_DEBUG && (
          <div className="sf-debug">
            <span>TOTAL   <em>{(debug.total * 100).toFixed(1)}%</em></span>
            <span>SCENE   <em>{debug.sceneId}</em></span>
            <span>LOCAL   <em>{(debug.localPct * 100).toFixed(1)}%</em></span>
            <span>VID&nbsp;T <em>{debug.videoTime.toFixed(2)}s</em></span>
            <span>TRANS   <em>{debug.trans ? 'YES' : 'NO'}</em></span>
            {isMobile && <span className="sf-debug-warn">MOBILE</span>}
          </div>
        )}

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
