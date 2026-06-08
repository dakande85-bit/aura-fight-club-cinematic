/**
 * AURA Fight Club — Scroll Film  v7
 * ─────────────────────────────────────────────────────────────────
 * Fixes from v6 audit:
 *
 *   FIX 1 — Video stops after Scene 01
 *     - doTransition now calls video.pause() + video.currentTime=0
 *       after fade-out completes when leaving the video scene.
 *     - video only plays in Scene 01. Never loops under image scenes.
 *
 *   FIX 2 — Curated frame counts per scene
 *     - S02 shadow boxing : 10 frames (full — sequence is strong)
 *     - S03 handwraps     :  6 frames (frames 1,2,4,6,8,10)
 *     - S04 footwork      :  5 frames (frames 1,3,5,7,9)
 *     - S05 Drop 001      :  6 frames (frames 1,4,7,8,9,10)
 *     - S06 campaign mitts:  6 frames (frames 1,3,5,7,8,10)
 *     - S07 fight club    :  2 frames (all available)
 *
 *   FIX 3 — Longer crossfade after footwork → drop (1.1s vs 0.82s)
 *
 *   FIX 4 — New tighter scene ranges:
 *     0.00–0.14  rain-intro
 *     0.14–0.30  shadow-boxing
 *     0.30–0.44  the-work
 *     0.44–0.58  footwork
 *     0.58–0.74  drop-001      (longer: product reveal needs space)
 *     0.74–0.88  campaign
 *     0.88–1.00  fight-club
 *
 *   FIX 5 — Debug panel shows video active/paused state
 *
 * Architecture unchanged:
 *   - GSAP ScrollTrigger + Lenis
 *   - Two A/B image slots, GSAP crossfades, DOM-direct
 *   - Canvas ambient (rain/fog) always on
 *   - React state for overlay text + debug only
 */
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// ── CONFIG ─────────────────────────────────────────────────────────────────
const DEV_DEBUG  = false;
const BASE       = '/assets/aura-scroll';
const VIDEO_SRC  = `${BASE}/01_rain_intro_video/set01_rain_intro_video.mp4`;
const FADE_DUR       = 0.82;   // default crossfade (seconds)
const FADE_DUR_LONG  = 1.10;   // longer fade after footwork → product
const SEEK_DELTA     = 0.03;

// ── CURATED FRAME ARRAYS ───────────────────────────────────────────────────
// Each array is hand-selected for visual continuity and pacing.
// Filenames are exact from the ZIP manifest — do not rename.

const S = BASE; // shorthand

const FRAMES = {
  // Scene 02 — Shadow boxing: all 10 frames, sequence is the strongest set
  s02: [
    `${S}/02_shadow_boxing_the_standard/frame_01_shadow_01_neutral_stance.png`,
    `${S}/02_shadow_boxing_the_standard/frame_02_shadow_02_guard_raised.png`,
    `${S}/02_shadow_boxing_the_standard/frame_03_shadow_03_weight_shift.png`,
    `${S}/02_shadow_boxing_the_standard/frame_04_shadow_04_pivot_adjustment.png`,
    `${S}/02_shadow_boxing_the_standard/frame_05_shadow_05_jab_start.png`,
    `${S}/02_shadow_boxing_the_standard/frame_06_shadow_06_jab_extension.png`,
    `${S}/02_shadow_boxing_the_standard/frame_07_shadow_07_return_guard.png`,
    `${S}/02_shadow_boxing_the_standard/frame_08_shadow_08_defensive_slip.png`,
    `${S}/02_shadow_boxing_the_standard/frame_09_shadow_09_reset_stance.png`,
    `${S}/02_shadow_boxing_the_standard/frame_10_shadow_10_final_pose.png`,
  ],

  // Scene 03 — Handwraps: 6 frames — start, pull, focus, detail, guard, final
  // Skipping frames 3 (wrap_check) and 7 (wrap_settle) — too similar to neighbours
  s03: [
    `${S}/03_the_work_handwraps/frame_01_handwrap_start.png`,
    `${S}/03_the_work_handwraps/frame_02_wrap_pull.png`,
    `${S}/03_the_work_handwraps/frame_04_wrap_focus.png`,
    `${S}/03_the_work_handwraps/frame_06_wrap_detail.png`,
    `${S}/03_the_work_handwraps/frame_08_wrap_guard.png`,
    `${S}/03_the_work_handwraps/frame_10_work_final.png`,
  ],

  // Scene 04 — Footwork/Skipping: 5 frames — ready, rope low, jump midair, high, reset
  // Odd frames only — gives clean visual arc: prepare → in-motion → land
  s04: [
    `${S}/04_footwork_skipping/frame_01_skip_ready.png`,
    `${S}/04_footwork_skipping/frame_03_rope_swing_low.png`,
    `${S}/04_footwork_skipping/frame_05_jump_start.png`,
    `${S}/04_footwork_skipping/frame_08_jump_high.png`,
    `${S}/04_footwork_skipping/frame_10_skip_reset.png`,
  ],

  // Scene 05 — Drop 001: 6 frames — full outfit model → product details → hero
  // Emphasis on editorial model shots first, then product, ending on campaign hero
  s05: [
    `${S}/05_drop_001_tools_uniform/frame_01_cream_uniform_model.png`,
    `${S}/05_drop_001_tools_uniform/frame_04_back_logo_apparel_model.png`,
    `${S}/05_drop_001_tools_uniform/frame_07_black_sleeveless_hoodie_product.png`,
    `${S}/05_drop_001_tools_uniform/frame_08_cream_gloves_product.png`,
    `${S}/05_drop_001_tools_uniform/frame_09_cream_full_outfit_model.png`,
    `${S}/05_drop_001_tools_uniform/frame_10_campaign_mitts_hero.png`,
  ],

  // Scene 06 — Campaign mitts: 6 frames — spread across 10 for natural rhythm
  s06: [
    `${S}/06_campaign_mitts_sequence/frame_01_mitts_01.png`,
    `${S}/06_campaign_mitts_sequence/frame_03_mitts_03.png`,
    `${S}/06_campaign_mitts_sequence/frame_05_mitts_05.png`,
    `${S}/06_campaign_mitts_sequence/frame_07_mitts_07.png`,
    `${S}/06_campaign_mitts_sequence/frame_08_mitts_08.png`,
    `${S}/06_campaign_mitts_sequence/frame_10_mitts_10.png`,
  ],

  // Scene 07 — Fight Club close: both available frames
  s07: [
    `${S}/07_fight_club_close/frame_01_fight_club_close.png`,
    `${S}/07_fight_club_close/frame_02_alternate_fight_club_close.png`,
  ],
};

// ── SCENE CONFIG — single source of truth ─────────────────────────────────
// FIX 4: New tighter ranges. Continuous — no gaps.
// FIX 3: drop-001 uses FADE_DUR_LONG for the incoming transition.
const SCENES = [
  {
    id: 'rain-intro',
    start: 0.00, end: 0.14,
    visualType: 'video',
    src: VIDEO_SRC,
    startTime: 0, endTime: 6,
    label:    'AURA FIGHT CLUB',
    headline: ['YOUR AURA', 'IS EARNED.'],
    sub:      'The real fight is internal.\nThe opponent is just the mirror.',
    cta:      'buttons',
  },
  {
    id: 'shadow-boxing',
    start: 0.14, end: 0.30,
    visualType: 'imageSequence',
    frames: FRAMES.s02,
    label:    'THE STANDARD',
    headline: ['THE REAL', 'FIGHT IS', 'INTERNAL.'],
    sub:      'The opponent is just the mirror.',
    cta:      null,
  },
  {
    id: 'the-work',
    start: 0.30, end: 0.44,
    visualType: 'imageSequence',
    frames: FRAMES.s03,
    label:    'THE WORK',
    headline: ['SILENCE.', 'DISCIPLINE.', 'PRESENCE.'],
    sub:      'Built where nobody is watching.',
    cta:      null,
  },
  {
    id: 'footwork',
    start: 0.44, end: 0.58,
    visualType: 'imageSequence',
    frames: FRAMES.s04,
    label:    'FOOTWORK',
    headline: ['FOOTWORK.', 'TIMING.', 'CONTROL.'],
    sub:      'Built where nobody is watching.',
    cta:      null,
  },
  {
    id: 'drop-001',
    start: 0.58, end: 0.74,
    visualType: 'imageSequence',
    frames: FRAMES.s05,
    // FIX 3: longer fade in — product reveal needs breathing room after footwork
    fadeDur: FADE_DUR_LONG,
    label:    'DROP 001',
    headline: ['TOOLS FOR THE', 'WORK NOBODY', 'SEES.'],
    sub:      'The first uniform of AURA Fight Club.',
    cta:      null,
  },
  {
    id: 'campaign',
    start: 0.74, end: 0.88,
    visualType: 'imageSequence',
    frames: FRAMES.s06,
    fadeDur: FADE_DUR_LONG,
    label:    'THE CAMPAIGN',
    headline: ['EARNED WHERE', 'NOBODY', 'IS WATCHING.'],
    sub:      'Pressure, rhythm, restraint, identity.',
    cta:      null,
  },
  {
    id: 'fight-club',
    start: 0.88, end: 1.00,
    visualType: 'imageSequence',
    frames: FRAMES.s07,
    label:    'FIGHT CLUB',
    headline: ['MORE THAN', 'A BRAND.', 'A FIGHT IDENTITY.'],
    sub:      'Join the first circle of AURA Fight Club.',
    cta:      'waitlist',
  },
];

// ── HELPERS ────────────────────────────────────────────────────────────────
function getScene(p) {
  if (p >= 1.0) return SCENES[SCENES.length - 1];
  return SCENES.find(s => p >= s.start && p < s.end) ?? SCENES[0];
}
function localP(scene, p) {
  const r = scene.end - scene.start;
  return r > 0 ? Math.max(0, Math.min(1, (p - scene.start) / r)) : 0;
}
function calcFrame(frames, lp) {
  return Math.max(0, Math.min(frames.length - 1, Math.round(lp * (frames.length - 1))));
}

const imgCache = new Map();
function preload(src) {
  if (!src) return Promise.resolve();
  if (imgCache.has(src)) return imgCache.get(src);
  const p = new Promise(res => {
    const img = new Image();
    img.onload  = () => res(true);
    img.onerror = () => { console.warn('[AURA] Frame failed:', src); res(false); };
    img.src = src;
  });
  imgCache.set(src, p);
  return p;
}

// ── AMBIENT CANVAS ─────────────────────────────────────────────────────────
function useAmbient(ref) {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, raf = null, t = 0;
    const drops = Array.from({ length: 72 }, () => ({
      x: Math.random(), y: Math.random(),
      len:   0.04 + Math.random() * 0.06,
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
        g.addColorStop(0, `rgba(195,185,158,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
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
      const sg = ctx.createLinearGradient(sx-W*0.28, 0, sx+W*0.28, 0);
      sg.addColorStop(0, 'rgba(255,248,218,0)');
      sg.addColorStop(0.5, `rgba(255,248,218,${0.016+0.007*Math.sin(t*0.28)})`);
      sg.addColorStop(1, 'rgba(255,248,218,0)');
      ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
      t += 0.016; raf = requestAnimationFrame(draw);
    };
    const mq = window.matchMedia('(prefers-reduced-motion:reduce)');
    if (!mq.matches) raf = requestAnimationFrame(draw);
    return () => { ro.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, [ref]);
}

// ── SCENE OVERLAY ──────────────────────────────────────────────────────────
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
                <input className="sf-email" type="email"
                  placeholder="Enter your email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  aria-label="Email address" />
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
          className={`sf-indicator${s.id === activeId ? ' sf-indicator--active' : ''}`}
          title={s.label} />
      ))}
    </div>
  );
}

// ── MAIN ───────────────────────────────────────────────────────────────────
export default function ScrollFilm() {
  const wrapperRef = useRef(null);
  const ambientRef = useRef(null);
  const videoRef   = useRef(null);
  const slotARef   = useRef(null);
  const slotBRef   = useRef(null);
  const imgARef    = useRef(null);
  const imgBRef    = useRef(null);

  const currentSlot   = useRef('A');
  const currentScId   = useRef(null);
  const curFrameIdx   = useRef(0);
  const cancelTween   = useRef(null);
  const transitioning = useRef(false);

  const lastSeek    = useRef(-1);
  const seekRaf     = useRef(null);
  const pendingSeek = useRef(null);

  const [videoReady,   setVideoReady]   = useState(false);
  const [allReady,     setAllReady]     = useState(false);
  const [isMobile,     setMobile]       = useState(false);
  const [overlayScene, setOverlayScene] = useState(SCENES[0]);
  const [overlayVis,   setOverlayVis]   = useState(false);
  const [debug, setDebug] = useState({
    total:0, sceneId:'—', localPct:0, frame:0, totalFrames:0, type:'—', videoPaused:false,
  });

  useAmbient(ambientRef);

  useEffect(() => {
    setMobile(
      window.matchMedia('(max-width:768px)').matches ||
      /iPhone|iPad|Android/i.test(navigator.userAgent)
    );
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true; v.playsInline = true; v.preload = 'auto'; v.loop = true;
    const onMeta = () => setVideoReady(true);
    v.addEventListener('loadedmetadata', onMeta);
    if (v.readyState >= 1) onMeta();
    return () => v.removeEventListener('loadedmetadata', onMeta);
  }, []);

  useEffect(() => {
    const allFrames = SCENES
      .filter(s => s.visualType === 'imageSequence')
      .flatMap(s => s.frames);
    Promise.all(allFrames.map(preload)).then(() => setAllReady(true));
  }, []);

  // ── TRANSITION ENGINE ─────────────────────────────────────────────────────
  const doTransition = useRef(null);
  doTransition.current = (newScene, prevSceneId) => {
    const video = videoRef.current;
    const slotA = slotARef.current;
    const slotB = slotBRef.current;
    const imgA  = imgARef.current;
    const imgB  = imgBRef.current;
    if (!slotA || !slotB || !video) return;

    if (cancelTween.current) { cancelTween.current.kill(); cancelTween.current = null; }

    const prevScene   = SCENES.find(s => s.id === prevSceneId);
    const prevIsVideo = prevScene?.visualType === 'video';
    const nextIsVideo = newScene.visualType === 'video';
    const nextIsSeq   = newScene.visualType === 'imageSequence';
    const sameVideo   = prevIsVideo && nextIsVideo;
    const fade        = newScene.fadeDur ?? FADE_DUR;

    transitioning.current = true;
    const onDone = () => { transitioning.current = false; cancelTween.current = null; };

    if (sameVideo) { onDone(); return; }

    const performSwap = () => {
      const nextSlotId = currentSlot.current === 'A' ? 'B' : 'A';
      const nextSlotEl = nextSlotId === 'A' ? slotA : slotB;
      const nextImgEl  = nextSlotId === 'A' ? imgA  : imgB;
      const currSlotEl = currentSlot.current === 'A' ? slotA : slotB;

      if (nextIsSeq && nextImgEl && newScene.frames?.[0]) {
        nextImgEl.src = newScene.frames[0];
        nextImgEl.style.objectPosition = 'center top';
      }
      gsap.set(nextIsVideo ? video : nextSlotEl, { opacity: 0 });

      if (nextIsVideo) {
        // Coming back to video (shouldn't happen in this film, but handle it)
        video.play().catch(() => {});
        cancelTween.current = gsap.to(video, {
          opacity: 1, duration: fade, ease: 'power1.inOut', onComplete: onDone,
        });
        gsap.to(currSlotEl, { opacity: 0, duration: fade, ease: 'power1.inOut' });
      } else {
        // ── FIX 1: Leaving video → pause video after it fades out ──────────
        cancelTween.current = gsap.to(nextSlotEl, {
          opacity: 1, duration: fade, ease: 'power1.inOut', onComplete: onDone,
        });
        if (prevIsVideo) {
          gsap.to(video, {
            opacity: 0, duration: fade, ease: 'power1.inOut',
            onComplete: () => {
              // Video fully faded — pause it and reset so it's truly off
              video.pause();
              video.currentTime = 0;
            },
          });
        } else {
          gsap.to(currSlotEl, { opacity: 0, duration: fade, ease: 'power1.inOut' });
        }
        currentSlot.current = nextSlotId;
      }
    };

    if (nextIsSeq && newScene.frames?.[0]) {
      preload(newScene.frames[0]).then(performSwap);
    } else {
      performSwap();
    }
  };

  // ── MAIN SCROLL ENGINE ────────────────────────────────────────────────────
  useEffect(() => {
    if (!videoReady || !allReady) return;
    const video   = videoRef.current;
    const wrapper = wrapperRef.current;
    if (!video || !wrapper) return;

    const mq = window.matchMedia('(prefers-reduced-motion:reduce)');

    // Start video for Scene 01
    video.play().catch(() => {});

    // Init
    const first = SCENES[0];
    currentScId.current = first.id;
    gsap.set(video,            { opacity: 1 });
    gsap.set(slotARef.current, { opacity: 0 });
    gsap.set(slotBRef.current, { opacity: 0 });
    setOverlayScene(first);
    setTimeout(() => setOverlayVis(true), 350);

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

          // ── 1. VIDEO SEEK ─────────────────────────────
          if (sc.visualType === 'video' && video.duration && isFinite(video.duration)) {
            // FIX 1: also restart video if it was paused (user scrolls back)
            if (video.paused) video.play().catch(() => {});
            const t2 = Math.max(sc.startTime,
              Math.min(sc.endTime, sc.startTime + lp * (sc.endTime - sc.startTime)));
            if (Math.abs(t2 - lastSeek.current) >= SEEK_DELTA) {
              pendingSeek.current = t2;
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

          // ── 2. IMAGE SEQUENCE FRAME ───────────────────
          if (sc.visualType === 'imageSequence' && sc.frames?.length) {
            const fi = calcFrame(sc.frames, lp);
            if (fi !== curFrameIdx.current) {
              curFrameIdx.current = fi;
              const activeImg = currentSlot.current === 'A'
                ? imgARef.current : imgBRef.current;
              const src = sc.frames[fi];
              if (activeImg && src && imgCache.get(src) !== undefined) {
                activeImg.src = src;
              }
            }
          }

          // ── 3. SCENE CHANGE ───────────────────────────
          if (sc.id !== currentScId.current) {
            const prev = currentScId.current;
            currentScId.current = sc.id;
            curFrameIdx.current = 0;
            doTransition.current(sc, prev);
            setOverlayVis(false);
            setTimeout(() => { setOverlayScene(sc); setOverlayVis(true); }, 200);
          }

          // ── 4. DEBUG ──────────────────────────────────
          if (DEV_DEBUG && !debugRaf) {
            const fi = sc.visualType === 'imageSequence'
              ? calcFrame(sc.frames, lp) : 0;
            debugRaf = requestAnimationFrame(() => {
              debugRaf = null;
              setDebug({
                total:       p,
                sceneId:     sc.id,
                localPct:    lp,
                frame:       fi,
                totalFrames: sc.frames?.length ?? 0,
                type:        sc.visualType,
                videoPaused: video.paused,
              });
            });
          }
        },
      });
    });

    if (isMobile) video.playbackRate = 0.6;
    setTimeout(() => ScrollTrigger.refresh(), 400);

    return () => {
      ctx.revert(); lenis.destroy(); gsap.ticker.remove(ticker);
      ScrollTrigger.getAll().forEach(t => t.kill());
      if (seekRaf.current) cancelAnimationFrame(seekRaf.current);
    };
  }, [videoReady, allReady, isMobile]);

  const isReady = videoReady && allReady;

  return (
    <div className="sf-wrapper" ref={wrapperRef}>
      <div className="sf-fixed">

        <video ref={videoRef} className="sf-video"
          src={VIDEO_SRC} muted playsInline preload="auto" loop
          style={{ opacity: 0 }} aria-hidden="true" />

        <div ref={slotARef} className="sf-image-slot" style={{ opacity: 0 }}>
          <img ref={imgARef} className="sf-image" src="" alt=""
            style={{ objectPosition: 'center top' }} />
        </div>
        <div ref={slotBRef} className="sf-image-slot" style={{ opacity: 0 }}>
          <img ref={imgBRef} className="sf-image" src="" alt=""
            style={{ objectPosition: 'center top' }} />
        </div>

        <canvas ref={ambientRef} className="sf-ambient" aria-hidden="true" />
        <div className="sf-grain"    aria-hidden="true" />
        <div className="sf-vignette" aria-hidden="true" />

        {!isReady && (
          <div className="sf-loading" aria-live="polite">
            <span className="sf-loading-dot" />
            <span>{!videoReady ? 'Loading video…' : 'Preloading scenes…'}</span>
          </div>
        )}

        <SceneOverlay scene={overlayScene} visible={overlayVis} />
        <Indicators activeId={overlayScene?.id} />

        <div className="sf-progress-bar" aria-hidden="true">
          <div className="sf-progress-fill"
            style={{ transform: `scaleX(${debug.total})` }} />
        </div>

        {DEV_DEBUG && (
          <div className="sf-debug">
            <span>TOTAL   <em>{(debug.total*100).toFixed(1)}%</em></span>
            <span>SCENE   <em>{debug.sceneId}</em></span>
            <span>LOCAL   <em>{(debug.localPct*100).toFixed(1)}%</em></span>
            <span>FRAME   <em>{debug.frame} / {debug.totalFrames}</em></span>
            <span>TYPE    <em>{debug.type}</em></span>
            <span>VIDEO   <em>{debug.videoPaused ? 'PAUSED ✓' : 'PLAYING'}</em></span>
            {isMobile && <span className="sf-debug-warn">MOBILE</span>}
          </div>
        )}

        {isReady && (
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
