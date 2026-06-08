/**
 * AURA Fight Club — Scroll Film  v5 (Full Asset Integration)
 * ─────────────────────────────────────────────────────────────
 * 7 scenes using real ZIP assets:
 *   01 video    — rain intro  (loops softly, ambient before scroll)
 *   02–06       — imageSequence (scroll localP → frame index)
 *   07          — imageSequence (2 frames, final close + waitlist)
 *
 * Architecture (unchanged from v4):
 *   Layer 1 — Scene:   video | imageSequence — GSAP crossfades, DOM-direct
 *   Layer 2 — Ambient: canvas rain/fog/light — always playing
 *   Layer 3 — Overlay: text/CTA — React-only, one scene at a time
 *
 * Glitch-free guarantees:
 *   - No React setState for visuals
 *   - Image preload cache, transitions wait for first frame
 *   - Continuous scene ranges, no gaps
 *   - GSAP controls all opacity transitions
 *   - Video seeking throttled (rAF, ≥30ms delta)
 */
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// ── CONFIG ────────────────────────────────────────────────────────────────
const DEV_DEBUG  = true;
const VIDEO_SRC  = '/assets/aura-scroll/01_RAIN_INTRO_VIDEO_ADD_YOUR_VIDEO_HERE/set01_rain_intro_video.mp4';
const FADE_DUR   = 0.85;
const SEEK_DELTA = 0.03;

// ── FRAME MANIFEST ────────────────────────────────────────────────────────
// Build the exact filenames confirmed from the ZIP manifest
const F = {
  shadow: [
    'frame_01_shadow_01_neutral_stance.png',
    'frame_02_shadow_02_guard_raised.png',
    'frame_03_shadow_03_weight_shift.png',
    'frame_04_shadow_04_pivot_adjustment.png',
    'frame_05_shadow_05_jab_start.png',
    'frame_06_shadow_06_jab_extension.png',
    'frame_07_shadow_07_return_guard.png',
    'frame_08_shadow_08_defensive_slip.png',
    'frame_09_shadow_09_reset_stance.png',
    'frame_10_shadow_10_final_pose.png',
  ].map(f => `/assets/aura-scroll/02_SHADOW_BOXING_THE_STANDARD/${f}`),

  work: [
    'frame_01_handwrap_start.png','frame_02_wrap_pull.png','frame_03_wrap_check.png',
    'frame_04_wrap_focus.png','frame_05_wrap_tighten.png','frame_06_wrap_detail.png',
    'frame_07_wrap_settle.png','frame_08_wrap_guard.png','frame_09_wrap_ready.png',
    'frame_10_work_final.png',
  ].map(f => `/assets/aura-scroll/03_THE_WORK_HANDWRAPS/${f}`),

  footwork: [
    'frame_01_skip_ready.png','frame_02_skip_start.png','frame_03_rope_swing_low.png',
    'frame_04_rope_rise.png','frame_05_jump_start.png','frame_06_jump_midair.png',
    'frame_07_rope_side.png','frame_08_jump_high.png','frame_09_rope_return.png',
    'frame_10_skip_reset.png',
  ].map(f => `/assets/aura-scroll/04_FOOTWORK_SKIPPING/${f}`),

  drop: [
    'frame_01_cream_uniform_model.png','frame_02_gold_skipping_rope_product.png',
    'frame_03_cream_boots_product.png','frame_04_back_logo_apparel_model.png',
    'frame_05_mouthguard_product.png','frame_06_black_boots_product.png',
    'frame_07_black_sleeveless_hoodie_product.png','frame_08_cream_gloves_product.png',
    'frame_09_cream_full_outfit_model.png','frame_10_campaign_mitts_hero.png',
  ].map(f => `/assets/aura-scroll/05_DROP_001_TOOLS_UNIFORM/${f}`),

  campaign: [
    'frame_01_mitts_01.png','frame_02_mitts_02.png','frame_03_mitts_03.png',
    'frame_04_mitts_04.png','frame_05_mitts_05.png','frame_06_mitts_06.png',
    'frame_07_mitts_07.png','frame_08_mitts_08.png','frame_09_mitts_09.png',
    'frame_10_mitts_10.png',
  ].map(f => `/assets/aura-scroll/06_CAMPAIGN_MITTS_SEQUENCE/${f}`),

  fightclub: [
    'frame_01_fight_club_close.png',
    'frame_02_alternate_fight_club_close.png',
  ].map(f => `/assets/aura-scroll/07_FIGHT_CLUB_CLOSE/${f}`),
};

// ── SCENE CONFIG ──────────────────────────────────────────────────────────
// CONTINUOUS ranges: 0.00→0.16→0.32→0.48→0.64→0.78→0.90→1.00
const SCENES = [
  {
    id: 'intro',      start: 0.00, end: 0.16,
    visualType: 'video',
    src: VIDEO_SRC,
    startTime: 0, endTime: 6,    // scrub first 6 seconds; video also loops as ambient
    label:    'AURA FIGHT CLUB — DROP 001',
    headline: ['YOUR AURA', 'IS EARNED.'],
    sub:      'The real fight is internal.\nThe opponent is just the mirror.',
    cta:      'buttons',
  },
  {
    id: 'standard',   start: 0.16, end: 0.32,
    visualType: 'imageSequence',
    frames: F.shadow,
    label:    'THE STANDARD',
    headline: ['THE REAL', 'FIGHT IS', 'INTERNAL.'],
    sub:      'The opponent is just the mirror.',
    cta:      null,
  },
  {
    id: 'work',       start: 0.32, end: 0.48,
    visualType: 'imageSequence',
    frames: F.work,
    label:    'THE WORK',
    headline: ['SILENCE.', 'DISCIPLINE.', 'PRESENCE.'],
    sub:      'Built where nobody is watching.',
    cta:      null,
  },
  {
    id: 'footwork',   start: 0.48, end: 0.64,
    visualType: 'imageSequence',
    frames: F.footwork,
    label:    'FOOTWORK. TIMING. CONTROL.',
    headline: ['TIMING.', 'CONTROL.', 'FOOTWORK.'],
    sub:      'Built where nobody is watching.',
    cta:      null,
  },
  {
    id: 'drop',       start: 0.64, end: 0.78,
    visualType: 'imageSequence',
    frames: F.drop,
    label:    'DROP 001',
    headline: ['TOOLS FOR THE', 'WORK NOBODY', 'SEES.'],
    sub:      'The first uniform of AURA Fight Club.',
    cta:      null,
  },
  {
    id: 'campaign',   start: 0.78, end: 0.90,
    visualType: 'imageSequence',
    frames: F.campaign,
    label:    'THE CAMPAIGN',
    headline: ['EARNED WHERE', 'NOBODY', 'IS WATCHING.'],
    sub:      'Pressure, rhythm, restraint, identity.',
    cta:      null,
  },
  {
    id: 'fightclub',  start: 0.90, end: 1.00,
    visualType: 'imageSequence',
    frames: F.fightclub,
    label:    'FIGHT CLUB',
    headline: ['MORE THAN', 'A BRAND.', 'A FIGHT IDENTITY.'],
    sub:      'Join the first circle of AURA Fight Club.',
    cta:      'waitlist',
  },
];

// ── HELPERS ───────────────────────────────────────────────────────────────
function getScene(p) {
  if (p >= 1.0) return SCENES[SCENES.length - 1];
  return SCENES.find(s => p >= s.start && p < s.end) ?? SCENES[0];
}
function localP(scene, p) {
  const r = scene.end - scene.start;
  return r > 0 ? Math.max(0, Math.min(1, (p - scene.start) / r)) : 0;
}
function frameIdx(frames, lp) {
  return Math.round(lp * (frames.length - 1));
}

// Image preload cache
const imgCache = new Map();
function preload(src) {
  if (!src) return Promise.resolve();
  if (imgCache.has(src)) return imgCache.get(src);
  const p = new Promise(res => {
    const i = new Image(); i.onload = i.onerror = () => res(); i.src = src;
  });
  imgCache.set(src, p);
  return p;
}
async function preloadAll(frames) {
  await Promise.all(frames.map(preload));
}

// ── AMBIENT CANVAS ────────────────────────────────────────────────────────
function useAmbient(ref) {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, raf = null, t = 0;
    const drops = Array.from({ length: 72 }, () => ({
      x: Math.random(), y: Math.random(),
      len: 0.04 + Math.random() * 0.06,
      speed: 0.0018 + Math.random() * 0.0028,
      opacity: 0.04 + Math.random() * 0.07,
      drift: (Math.random() - 0.5) * 0.0003,
    }));
    const fog = Array.from({ length: 5 }, (_, i) => ({
      x: i * 0.22, y: 0.5 + Math.random() * 0.3,
      r: 0.2 + Math.random() * 0.12,
      speed: 0.00008 + Math.random() * 0.00008,
      phase: Math.random() * Math.PI * 2,
    }));
    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas); resize();
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      fog.forEach(f => {
        f.x += f.speed; if (f.x > 1.3) f.x = -0.3;
        const a = 0.025 + 0.012 * Math.sin(t * 0.35 + f.phase);
        const g = ctx.createRadialGradient(f.x*W, f.y*H, 0, f.x*W, f.y*H, f.r*W);
        g.addColorStop(0, `rgba(195,185,158,${a})`); g.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
      });
      drops.forEach(d => {
        d.y += d.speed; d.x += d.drift;
        if (d.y > 1) { d.y = -d.len; d.x = Math.random(); }
        if (d.x < 0 || d.x > 1) d.x = Math.random();
        ctx.save();
        ctx.globalAlpha = d.opacity * (0.55 + 0.45 * Math.sin(t * 0.7));
        ctx.strokeStyle = 'rgba(180,200,220,1)'; ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.moveTo(d.x*W, d.y*H);
        ctx.lineTo((d.x + d.drift*60)*W, (d.y + d.len)*H);
        ctx.stroke(); ctx.restore();
      });
      const sx = (Math.sin(t*0.1)*0.5+0.5)*W;
      const sg = ctx.createLinearGradient(sx-W*0.28,0,sx+W*0.28,0);
      sg.addColorStop(0,'rgba(255,248,218,0)');
      sg.addColorStop(0.5,`rgba(255,248,218,${0.016+0.007*Math.sin(t*0.28)})`);
      sg.addColorStop(1,'rgba(255,248,218,0)');
      ctx.fillStyle = sg; ctx.fillRect(0,0,W,H);
      t += 0.016;
      raf = requestAnimationFrame(draw);
    };
    const mq = window.matchMedia('(prefers-reduced-motion:reduce)');
    if (!mq.matches) raf = requestAnimationFrame(draw);
    return () => { ro.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, [ref]);
}

// ── SCENE OVERLAY ─────────────────────────────────────────────────────────
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
          {scene.headline.map((l,i) => (
            <span key={i} className="sf-headline-line" style={{'--i':i}}>{l}</span>
          ))}
        </h2>
        {scene.sub && (
          <p className="sf-sub">
            {scene.sub.split('\n').map((l,i) => <span key={i}>{l}<br/></span>)}
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
                  onClick={() => email && setDone(true)}>Join Waitlist</button>
              </div>
            ) : <p className="sf-confirm">YOU'RE ON THE LIST.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function Indicators({ activeId }) {
  return (
    <div className="sf-indicators" aria-hidden="true">
      {SCENES.map(s => (
        <div key={s.id}
          className={`sf-indicator${s.id===activeId?' sf-indicator--active':''}`}
          title={s.label} />
      ))}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────
export default function ScrollFilm() {
  const wrapperRef   = useRef(null);
  const ambientRef   = useRef(null);
  const videoRef     = useRef(null);
  // Image sequence canvas — draws current frame
  const seqCanvasRef = useRef(null);
  // Offscreen image object for current frame
  const frameImgRef  = useRef(new window.Image());

  // Transition slots for crossfade
  const slotARef     = useRef(null);   // <div> slot A
  const slotBRef     = useRef(null);   // <div> slot B
  const slotAImg     = useRef(null);   // <img> in A
  const slotBImg     = useRef(null);   // <img> in B
  const currentSlot  = useRef('A');

  // Transition tracking (refs — no React)
  const currentScId  = useRef(null);
  const cancelTween  = useRef(null);
  const transitioning= useRef(false);
  // Current frame index for imageSequence
  const curFrameIdx  = useRef(0);

  // Video seek throttle
  const lastSeek     = useRef(-1);
  const seekRaf      = useRef(null);
  const pendingSeek  = useRef(null);

  // React state — overlay + debug only
  const [videoReady,   setVideoReady]   = useState(false);
  const [isMobile,     setMobile]       = useState(false);
  const [allReady,     setAllReady]     = useState(false);
  const [overlayScene, setOverlayScene] = useState(SCENES[0]);
  const [overlayVis,   setOverlayVis]   = useState(false);
  const [debug, setDebug] = useState({ total:0, sceneId:'—', localPct:0, frame:0, type:'—' });

  useAmbient(ambientRef);

  // Mobile detect
  useEffect(() => {
    setMobile(
      window.matchMedia('(max-width:768px)').matches ||
      /iPhone|iPad|Android/i.test(navigator.userAgent)
    );
  }, []);

  // Video metadata
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true; v.playsInline = true; v.preload = 'auto'; v.loop = true;
    const onMeta = () => setVideoReady(true);
    v.addEventListener('loadedmetadata', onMeta);
    if (v.readyState >= 1) onMeta();
    return () => v.removeEventListener('loadedmetadata', onMeta);
  }, []);

  // Preload all image sequences upfront
  useEffect(() => {
    const allFrames = SCENES
      .filter(s => s.visualType === 'imageSequence')
      .flatMap(s => s.frames);
    Promise.all(allFrames.map(preload)).then(() => setAllReady(true));
  }, []);

  // ── TRANSITION ENGINE ─────────────────────────────────────────────────
  const doTransition = useRef(null);
  doTransition.current = (newScene, prevSceneId) => {
    const video = videoRef.current;
    const slotA = slotARef.current;
    const slotB = slotBRef.current;
    const imgA  = slotAImg.current;
    const imgB  = slotBImg.current;
    if (!slotA || !slotB) return;

    if (cancelTween.current) { cancelTween.current.kill(); cancelTween.current = null; }

    const prevScene   = SCENES.find(s => s.id === prevSceneId);
    const prevIsVideo = prevScene?.visualType === 'video';
    const nextIsVideo = newScene.visualType === 'video';
    const nextIsSeq   = newScene.visualType === 'imageSequence';
    const sameVideo   = prevIsVideo && nextIsVideo;

    transitioning.current = true;
    const onDone = () => { transitioning.current = false; cancelTween.current = null; };

    if (sameVideo) { onDone(); return; }

    const doSwap = () => {
      const nextSlotId = currentSlot.current === 'A' ? 'B' : 'A';
      const nextSlotEl = nextSlotId === 'A' ? slotA : slotB;
      const nextImgEl  = nextSlotId === 'A' ? imgA  : imgB;
      const currSlotEl = currentSlot.current === 'A' ? slotA : slotB;

      if (nextIsSeq && nextImgEl && newScene.frames?.[0]) {
        // Load first frame into incoming slot
        nextImgEl.src = newScene.frames[0];
        nextImgEl.style.objectPosition = 'center top';
        gsap.set(nextImgEl, { scale: 1, x: 0, y: 0 });
      } else if (nextIsVideo) {
        // Video comes in
      }
      gsap.set(nextIsVideo ? video : nextSlotEl, { opacity: 0 });

      if (nextIsVideo) {
        cancelTween.current = gsap.to(video, { opacity:1, duration:FADE_DUR, ease:'power1.inOut', onComplete:onDone });
        gsap.to(currSlotEl, { opacity:0, duration:FADE_DUR, ease:'power1.inOut' });
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

    // For imageSequence, first frame is already in cache — near-instant
    if (nextIsSeq && newScene.frames?.[0]) {
      preload(newScene.frames[0]).then(doSwap);
    } else {
      doSwap();
    }
  };

  // ── MAIN SCROLL ENGINE ────────────────────────────────────────────────
  useEffect(() => {
    if (!videoReady || !allReady) return;
    const video   = videoRef.current;
    const wrapper = wrapperRef.current;
    if (!video || !wrapper) return;

    const mq = window.matchMedia('(prefers-reduced-motion:reduce)');

    // Start ambient video loop
    video.play().catch(() => {});

    // Init first scene (video)
    const first = SCENES[0];
    currentScId.current = first.id;
    gsap.set(video,         { opacity: 1 });
    gsap.set(slotARef.current, { opacity: 0 });
    gsap.set(slotBRef.current, { opacity: 0 });
    setOverlayScene(first);
    setTimeout(() => setOverlayVis(true), 300);

    const lenis = new Lenis({
      duration:    mq.matches ? 0 : 1.05,
      easing:      t => Math.min(1, 1.001 - Math.pow(2, -10*t)),
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

          // ── 1. VIDEO SEEK ────────────────────────────
          if (sc.visualType === 'video' && video.duration && isFinite(video.duration)) {
            const target = Math.max(sc.startTime,
              Math.min(sc.endTime, sc.startTime + lp*(sc.endTime - sc.startTime)));
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

          // ── 2. IMAGE SEQUENCE FRAME ──────────────────
          if (sc.visualType === 'imageSequence' && sc.frames?.length) {
            const fi = frameIdx(sc.frames, lp);
            if (fi !== curFrameIdx.current) {
              curFrameIdx.current = fi;
              // Update the active slot's <img> src
              const activeImg = currentSlot.current === 'A'
                ? slotAImg.current : slotBImg.current;
              if (activeImg && sc.frames[fi]) {
                activeImg.src = sc.frames[fi];
              }
            }
          }

          // ── 3. SCENE CHANGE ──────────────────────────
          if (sc.id !== currentScId.current) {
            const prev = currentScId.current;
            currentScId.current = sc.id;
            curFrameIdx.current = 0;
            doTransition.current(sc, prev);
            setOverlayVis(false);
            setTimeout(() => { setOverlayScene(sc); setOverlayVis(true); }, 200);
          }

          // ── 4. DEBUG ─────────────────────────────────
          if (DEV_DEBUG && !debugRaf) {
            debugRaf = requestAnimationFrame(() => {
              debugRaf = null;
              setDebug({
                total:    p,
                sceneId:  sc.id,
                localPct: lp,
                frame:    sc.visualType === 'imageSequence' ? frameIdx(sc.frames, lp) : 0,
                type:     sc.visualType,
              });
            });
          }
        },
      });
    });

    // Mobile: don't seek video, just let it loop
    if (isMobile) { video.playbackRate = 0.6; }

    setTimeout(() => ScrollTrigger.refresh(), 400);

    return () => {
      ctx.revert(); lenis.destroy(); gsap.ticker.remove(ticker);
      ScrollTrigger.getAll().forEach(t => t.kill());
      if (seekRaf.current)  cancelAnimationFrame(seekRaf.current);
      if (debugRaf)          cancelAnimationFrame(debugRaf);
    };
  }, [videoReady, allReady, isMobile]);

  return (
    <div className="sf-wrapper" ref={wrapperRef}>
      <div className="sf-fixed">

        {/* ── SCENE: VIDEO ── */}
        <video ref={videoRef} className="sf-video"
          src={VIDEO_SRC} muted playsInline preload="auto" loop
          style={{ opacity: 0 }} aria-hidden="true" />

        {/* ── SCENE: IMAGE SLOTS A/B ── */}
        <div ref={slotARef} className="sf-image-slot" style={{ opacity: 0 }}>
          <img ref={slotAImg} className="sf-image" src="" alt=""
            style={{ objectPosition: 'center top' }} />
        </div>
        <div ref={slotBRef} className="sf-image-slot" style={{ opacity: 0 }}>
          <img ref={slotBImg} className="sf-image" src="" alt=""
            style={{ objectPosition: 'center top' }} />
        </div>

        {/* ── AMBIENT CANVAS ── */}
        <canvas ref={ambientRef} className="sf-ambient" aria-hidden="true" />

        {/* ── GRAIN ── */}
        <div className="sf-grain" aria-hidden="true" />

        {/* ── VIGNETTE ── */}
        <div className="sf-vignette" aria-hidden="true" />

        {/* ── LOADING ── */}
        {(!videoReady || !allReady) && (
          <div className="sf-loading" aria-live="polite">
            <span className="sf-loading-dot" />
            <span>{!videoReady ? 'Loading video…' : 'Preloading scenes…'}</span>
          </div>
        )}

        {/* ── OVERLAY ── */}
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
            <span>TOTAL  <em>{(debug.total*100).toFixed(1)}%</em></span>
            <span>SCENE  <em>{debug.sceneId}</em></span>
            <span>LOCAL  <em>{(debug.localPct*100).toFixed(1)}%</em></span>
            <span>FRAME  <em>{debug.frame}</em></span>
            <span>TYPE   <em>{debug.type}</em></span>
            {isMobile && <span className="sf-debug-warn">MOBILE</span>}
          </div>
        )}

        {/* ── SCROLL HINT ── */}
        {videoReady && allReady && (
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
