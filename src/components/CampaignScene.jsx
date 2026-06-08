import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import SectionLabel from './SectionLabel.jsx';
import { liveAssets } from '../data/liveAssets.js';

gsap.registerPlugin(ScrollTrigger);

export default function CampaignScene() {
  const sectionRef  = useRef(null);
  const imgRef      = useRef(null);
  const titleRef    = useRef(null);
  const chromeLine  = useRef(null);
  const bodyRef     = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!mq.matches) {
      // Image slow scale parallax
      if (imgRef.current) {
        gsap.fromTo(imgRef.current,
          { scale: 1.1 },
          {
            scale: 1.0,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.4,
            },
          }
        );
      }

      // Title inner reveal
      if (titleRef.current) {
        gsap.to(titleRef.current,
          {
            y: 0,
            duration: 1.0,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 72%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Chrome line grows
      if (chromeLine.current) {
        gsap.fromTo(chromeLine.current,
          { width: 0 },
          {
            width: '180px',
            duration: 1.0,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 68%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Body text fades
      if (bodyRef.current) {
        gsap.to(bodyRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 64%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    } else {
      // Instant show for reduced motion
      if (titleRef.current) gsap.set(titleRef.current, { y: 0 });
      if (chromeLine.current) gsap.set(chromeLine.current, { width: '180px' });
      if (bodyRef.current) gsap.set(bodyRef.current, { opacity: 1, y: 0 });
    }

    return () => ScrollTrigger.getAll().forEach(t => {
      if (t.vars?.trigger && (t.vars.trigger === section || section.contains(t.vars.trigger))) t.kill();
    });
  }, []);

  return (
    <section
      className="campaign-scene"
      id="campaign"
      ref={sectionRef}
      aria-label="The Campaign"
    >
      <div className="campaign-scene__filmstrip">
        <div className="campaign-scene__copy">
          <SectionLabel>Campaign 001</SectionLabel>
          <h2 className="campaign-scene__title">
            <span className="campaign-scene__title-inner" ref={titleRef}>
              The Campaign
            </span>
          </h2>
          <div className="campaign-scene__chrome-line" ref={chromeLine} />
          <p className="campaign-scene__body" ref={bodyRef}>
            Your aura is earned where nobody is watching.
            <br /><br />
            Silence, pressure, uniform, earned presence.
            The emotional proof behind Drop 001.
          </p>
          <a href="#fight-club" className="btn btn--gold" style={{ marginTop: '36px' }}>
            Read Campaign →
          </a>
        </div>
        <div className="campaign-scene__img-panel">
          <img
            ref={imgRef}
            src={liveAssets.campaign.trackjacket}
            alt="AURA Fight Club Campaign"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
