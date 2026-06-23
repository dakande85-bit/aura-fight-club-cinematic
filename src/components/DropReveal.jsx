import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import SectionLabel from './SectionLabel.jsx';
import ProductRevealCard from './ProductRevealCard.jsx';
import { products } from '../data/products.js';

gsap.registerPlugin(ScrollTrigger);

export default function DropReveal() {
  const gridRef = useRef(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = grid.querySelectorAll('.product-card');
    if (!cards.length) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    gsap.fromTo(cards,
      { opacity: 0, y: 48 },
      {
        opacity: 1,
        y: 0,
        duration: 0.78,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: grid,
          start: 'top 78%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => ScrollTrigger.getAll().forEach(t => {
      if (t.vars?.trigger === grid) t.kill();
    });
  }, []);

  return (
    <section className="drop-reveal" id="drop" aria-label="Drop 001 products">
      <SectionLabel>Drop 001</SectionLabel>
      <div className="drop-reveal__header">
        <h2 className="drop-reveal__title">
          Training<br />To Lifestyle.
        </h2>
        <div className="drop-reveal__meta">
          <p>POD candidates</p>
          <p>Waitlist only</p>
        </div>
      </div>
      <div className="drop-reveal__grid" ref={gridRef}>
        {products.map(p => (
          <ProductRevealCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
