/**
 * AURA Fight Club — Scroll Film
 * Scroll progress directly controls video.currentTime.
 * Scrolling down = forward. Scrolling up = backward.
 */
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// Text overlay moments: [startPct, endPct, lines[]]
const MOMENTS = [
  [0,   0.18, ['AURA FIGHT CLUB', 'YOUR AURA IS EARNED.']],
  [0.20, 0.42, ['THE REAL FIGHT', 'IS INTERNAL.', 'THE OPPONENT IS', 'JUST THE MIRROR.']],
  [0.44, 0.65, ['SILENCE.', 'DISCIPLINE.', 'PRESENCE.']],
  [0.67, 0.82, ['DROP 001', 'TOOLS FOR THE WORK', 'NOBODY SEES.']],
  [0.84, 1.00, ['MORE THAN A BRAND.', 'A FIGHT IDENTITY.', 'JOIN THE WAITLIST.']],
];

export default function ScrollFilm() {
  const videoRef   = useRef(null);
  const wrapperRef = useRef(null);
  const rafRef     = useRef(null);

  const [debug, setDebug]     = useState({ progress: 0, time: 0, duration: 0 });
  const [moment, setMoment]   = useState(null);
  const [ready, setReady]     = useState(false);
  const [isMobile, setMobile] = useState(false);
  const progressRef = useRef(0);

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 768px)').matches ||
                   /iPhone|iPad|Android/i.test(navigator.userAgent);
    setMobile(mobile);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure video is silent and inline
    video.muted     = true;
    video.playsInline = true;
    video.preload   = 'auto';

    const onMeta = () => {
      setReady(true);
      setDebug(d => ({ ...d, duration: video.duration }));
    };

    video.addEventListener('loadedmetadata', onMeta);
    if (video.readyState >= 1) onMeta();

    return () => video.removeEventListener('loadedmetadata', onMeta);
  }, []);

  useEffect(() => {
    if (!ready) return;

    const video   = videoRef.current;
    const wrapper = wrapperRef.current;
    if (!video || !wrapper) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    // ── Lenis smooth scroll ──────────────────────
    const lenis = new Lenis({
      duration: mq.matches ? 0 : 1.0,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !mq.matches,
    });

    // Ticker: connect Lenis → GSAP → ScrollTrigger
    const ticker = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', ScrollTrigger.update);

    // ── ScrollTrigger: scrub progress → video.currentTime ──
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrapper,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          progressRef.current = p;

          // CRITICAL: set video currentTime from scroll progress
          if (video.duration && isFinite(video.duration)) {
            const targetTime = p * video.duration;
            video.currentTime = targetTime;
          }

          // Update debug display (throttled via rAF)
          if (!rafRef.current) {
            rafRef.current = requestAnimationFrame(() => {
              rafRef.current = null;
              setDebug({
                progress: p,
                time: video.currentTime,
                duration: video.duration,
              });
              // Active text moment
              const active = MOMENTS.find(([s, e]) => p >= s && p <= e);
              setMoment(active ? active[2] : null);
            });
          }
        },
      });
    });

    // Mobile fallback: slow autoplay if scrubbing unreliable
    if (isMobile) {
      video.playbackRate = 0.5;
      video.play().catch(() => {});
    }

    setTimeout(() => ScrollTrigger.refresh(), 400);

    return () => {
      ctx.revert();
      lenis.destroy();
      gsap.ticker.remove(ticker);
      ScrollTrigger.getAll().forEach(t => t.kill());
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ready, isMobile]);

  return (
    <div className="sf-wrapper" ref={wrapperRef}>

      {/* Fixed video layer */}
      <div className="sf-fixed">
        <video
          ref={videoRef}
          className="sf-video"
          src="/assets/aura-scroll/aura-source.mp4"
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />

        {/* Atmospheric overlays */}
        <div className="sf-vignette"   aria-hidden="true" />
        <div className="sf-grain"      aria-hidden="true" />
        <div className="sf-sweep"      aria-hidden="true" />

        {/* Text moment overlay */}
        <div className={`sf-moment${moment ? ' sf-moment--visible' : ''}`} aria-live="polite">
          {moment && moment.map((line, i) => (
            <span key={i} className={`sf-line sf-line--${i}`}>{line}</span>
          ))}
        </div>

        {/* Scroll progress bar */}
        <div className="sf-progress-bar">
          <div
            className="sf-progress-fill"
            style={{ transform: `scaleX(${debug.progress})` }}
          />
        </div>

        {/* Debug display */}
        <div className="sf-debug">
          <span>PROGRESS: {(debug.progress * 100).toFixed(1)}%</span>
          <span>TIME: {debug.time.toFixed(2)}s</span>
          <span>DURATION: {debug.duration.toFixed(2)}s</span>
          {!ready && <span style={{ color: '#c8a96e' }}>Loading video…</span>}
          {isMobile && <span style={{ color: '#c8a96e' }}>Mobile: autoplay mode</span>}
        </div>

        {/* Scroll hint */}
        <div className={`sf-scroll-hint${ready ? ' sf-scroll-hint--visible' : ''}`}>
          <span>SCROLL TO PROGRESS</span>
          <span className="sf-arrow">↓</span>
        </div>

        {/* AURA watermark */}
        <div className="sf-watermark" aria-hidden="true">AURA</div>
      </div>

      {/* Tall scroll spacer — this is what ScrollTrigger measures */}
      <div className="sf-scroll-space" aria-hidden="true" />
    </div>
  );
}
