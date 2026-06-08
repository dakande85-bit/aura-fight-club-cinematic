import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { liveAssets } from '../data/liveAssets.js';

export default function CinematicHero() {
  const heroRef   = useRef(null);
  const bgImgRef  = useRef(null);
  const sweepRef  = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      // Just make everything visible instantly
      gsap.set([
        '.hero__eyebrow',
        '.hero__heading',
        '.hero__sub',
        '.hero__actions',
      ], { opacity: 1, y: 0 });
      return;
    }

    const tl = gsap.timeline({ delay: 0.3 });

    // BG image scales from 1.06 → 1
    if (bgImgRef.current) {
      tl.to(bgImgRef.current, {
        scale: 1,
        duration: 2.2,
        ease: 'power2.out',
      }, 0);
    }

    // Light sweep
    if (sweepRef.current) {
      tl.fromTo(sweepRef.current,
        { x: '-100%' },
        { x: '200%', duration: 1.8, ease: 'power2.inOut' },
        0.2
      );
    }

    // Text stagger
    tl.to('.hero__eyebrow',  { opacity: 1, y: 0, duration: 0.72, ease: 'power3.out' }, 0.4)
      .to('.hero__heading',  { opacity: 1, y: 0, duration: 0.82, ease: 'power3.out' }, 0.58)
      .to('.hero__sub',      { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, 0.78)
      .to('.hero__actions',  { opacity: 1, y: 0, duration: 0.6,  ease: 'power3.out' }, 0.92);

    return () => tl.kill();
  }, []);

  return (
    <section className="hero" ref={heroRef} aria-label="AURA Fight Club hero">
      {/* Background image */}
      <div className="hero__bg">
        <img
          ref={bgImgRef}
          src={liveAssets.hero.model}
          alt=""
          loading="eager"
          fetchpriority="high"
        />
        <div className="hero__overlay" />
        <div className="hero__light-sweep" ref={sweepRef} />
      </div>

      {/* Content */}
      <div className="hero__content">
        <p className="hero__eyebrow">AURA Fight Club</p>
        <h1 className="hero__heading">
          Your aura<br />is earned.
        </h1>
        <p className="hero__sub">
          The real fight is internal.<br />
          The opponent is just the mirror.
        </p>
        <div className="hero__actions">
          <a href="#drop" className="btn btn--solid">Enter Drop 001</a>
          <a href="#fight-club" className="btn btn--ghost">Join Fight Club</a>
        </div>
      </div>

      <p className="hero__scroll-hint" aria-hidden="true">Scroll</p>
    </section>
  );
}
