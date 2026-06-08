import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import SectionLabel from './SectionLabel.jsx';

gsap.registerPlugin(ScrollTrigger);

const lines = [
  'Silence before\nthe fight.',
  'Discipline before\nthe spotlight.',
  'Presence before\nthe punch.',
];

export default function BrandStatementScene() {
  const sectionRef = useRef(null);
  const dividerRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      gsap.set(section.querySelectorAll('.brand-statement__line'), { opacity: 1, y: 0 });
      gsap.set(dividerRef.current, { width: '220px' });
      return;
    }

    const lineEls = section.querySelectorAll('.brand-statement__line');

    // Stagger each line in as user scrolls
    lineEls.forEach((el, i) => {
      gsap.fromTo(el,
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 82%',
            toggleActions: 'play none none reverse',
          },
          delay: i * 0.12,
        }
      );
    });

    // Divider grows
    gsap.fromTo(dividerRef.current,
      { width: 0 },
      {
        width: '220px',
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: dividerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => ScrollTrigger.getAll().forEach(t => {
      if (t.vars?.trigger && section.contains(t.vars.trigger)) t.kill();
    });
  }, []);

  return (
    <section
      className="brand-statement"
      ref={sectionRef}
      id="statement"
      aria-label="Brand statement"
    >
      <div className="brand-statement__inner">
        <SectionLabel>The Standard</SectionLabel>
        <div className="brand-statement__lines">
          {lines.map((line, i) => (
            <p
              key={i}
              className="brand-statement__line"
              dangerouslySetInnerHTML={{ __html: line.replace('\n', '<br/>') }}
            />
          ))}

          <div ref={dividerRef} className="brand-statement__divider" />

          <p className="brand-statement__line brand-statement__line--final">
            Your aura is earned.
          </p>
        </div>
      </div>
      <span className="brand-statement__bg-text" aria-hidden="true">AURA</span>
    </section>
  );
}
