import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import SectionLabel from './SectionLabel.jsx';

gsap.registerPlugin(ScrollTrigger);

export default function FightClubCTA() {
  const sectionRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      gsap.set([
        '.fight-club-cta__pretitle',
        '.fight-club-cta__heading',
        '.fight-club-cta__sub',
        '.fight-club-cta__form',
      ], { opacity: 1, y: 0 });
      return;
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 72%',
        toggleActions: 'play none none reverse',
      },
    });

    tl.to('.fight-club-cta__pretitle', { opacity: 1, duration: 0.6, ease: 'power3.out' }, 0)
      .to('.fight-club-cta__heading',  { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' }, 0.14)
      .to('.fight-club-cta__sub',      { opacity: 1, duration: 0.7, ease: 'power3.out' }, 0.34)
      .to('.fight-club-cta__form',     { opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.52);

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section
      className="fight-club-cta"
      id="fight-club"
      ref={sectionRef}
      aria-label="Join AURA Fight Club"
    >
      <div className="fight-club-cta__bg" />
      <div className="fight-club-cta__content">
        <SectionLabel>Fight Club</SectionLabel>
        <p className="fight-club-cta__pretitle">More than a brand.</p>
        <h2 className="fight-club-cta__heading">
          A Fight<br />Identity.
        </h2>
        <p className="fight-club-cta__sub">
          Join the first circle of AURA Fight Club.
          Drop access, training culture, and campaign releases
          before public launch.
        </p>

        {!submitted ? (
          <form className="fight-club-cta__form" onSubmit={handleSubmit}>
            <input
              type="email"
              className="fight-club-cta__input"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              aria-label="Email address"
            />
            <button type="submit" className="fight-club-cta__submit">
              Join Waitlist
            </button>
          </form>
        ) : (
          <p className="fight-club-cta__confirm visible">
            You're on the list. →
          </p>
        )}
      </div>
    </section>
  );
}
