import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import SectionLabel from './SectionLabel.jsx';
import { liveAssets } from '../data/liveAssets.js';

gsap.registerPlugin(ScrollTrigger);

const categories = [
  {
    id: 'apparel',
    label: 'Apparel',
    sub: 'Built for presence.',
    image: liveAssets.campaign.hoodie,
    cta: 'Explore Apparel',
    href: '#drop',
  },
  {
    id: 'footwear',
    label: 'Footwear',
    sub: 'Move with control.',
    image: null, // No LIVE footwear image — premium placeholder
    cta: 'Coming Soon',
    href: '#fight-club',
  },
  {
    id: 'equipment',
    label: 'Equipment',
    sub: 'Train the unseen rounds.',
    image: liveAssets.campaign.fighter,
    cta: 'Explore Equipment',
    href: '#drop',
  },
];

export default function CategoryPanels() {
  const gridRef = useRef(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const panels = grid.querySelectorAll('.category-panel');

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      gsap.set(panels, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(panels,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.14,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: grid,
          start: 'top 76%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => ScrollTrigger.getAll().forEach(t => {
      if (t.vars?.trigger === grid) t.kill();
    });
  }, []);

  return (
    <section className="category-panels" id="categories" aria-label="Product categories">
      <SectionLabel>The Collection</SectionLabel>
      <div className="category-panels__grid" ref={gridRef}>
        {categories.map(cat => (
          <a
            key={cat.id}
            href={cat.href}
            className={`category-panel${!cat.image ? ' category-panel--placeholder' : ''}`}
            aria-label={cat.label}
          >
            {cat.image && (
              <img src={cat.image} alt="" loading="lazy" decoding="async" />
            )}
            <div className="category-panel__content">
              <p className="category-panel__eyebrow">{cat.sub}</p>
              <h3 className="category-panel__title">{cat.label}</h3>
              <span className="category-panel__link">{cat.cta} →</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
