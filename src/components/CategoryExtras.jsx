import { Link } from 'react-router-dom';
import '../styles/category-extras.css';

// ─────────────────────────────────────────────────────────────────────────────
// AURA Fight Club — Category landing sections
//
// Renders the hero, story, lineup intro, use-case cards, material/fit,
// Drop 001 connection, and final waitlist CTA for a category page.
//
// Driven entirely by `category` ('apparel' | 'footwear' | 'equipment').
// Only 'apparel' has content defined for now — other categories render
// `null`, leaving /footwear and /equipment exactly as they currently are.
// This means CollectionPage.jsx can safely render
// `<CategoryExtras category={categorySlug} />` unconditionally without
// any risk to the other two pages until their content is added to
// CONTENT below.
//
// Existing product grid / ProductCard / product data are NOT touched —
// this component only wraps around them (hero above, extras below).
// ─────────────────────────────────────────────────────────────────────────────

const CONTENT = {
  apparel: {
    hero: {
      label: 'AURA APPAREL',
      headline: 'BUILT FOR THE\nUNSEEN ROUNDS',
      copy:
        'Training layers for the work nobody sees. Clean, composed, and built around presence before attention.',
      ctas: [
        { label: 'Shop Apparel', to: '#apparel-lineup', variant: 'primary', scroll: true },
        { label: 'Explore Drop 001', to: '/drop-001', variant: 'ghost' },
      ],
    },
    story: {
      eyebrow: 'The Apparel',
      title: 'Training identity, not gymwear.',
      paragraphs: [
        'AURA apparel is built around what training actually looks like: early mornings, repetition, and the quiet discipline between rounds. It is fightwear that moves like lifestyle — clean enough to wear outside the gym, composed enough to wear into it.',
        'Nothing here is loud. There are no oversized graphics, no generic "boxing merch" signals. Just considered pieces built for the version of you that shows up before anyone is watching.',
      ],
    },
    lineup: {
      eyebrow: 'Product Lineup',
      title: 'APPAREL LINEUP',
      copy:
        'Core training layers, heavyweight silhouettes, and minimal AURA branding for the unseen rounds before the lights come on.',
    },
    useCases: {
      eyebrow: 'Use Cases',
      title: 'Built for every part of the fight life.',
      cards: [
        {
          title: 'Training',
          copy: 'Built for early mornings, bag work, roadwork, and the ritual before rounds.',
        },
        {
          title: 'Street',
          copy: 'Minimal enough for daily wear. Sharp enough to carry the fight-club identity.',
        },
        {
          title: 'Recovery',
          copy: 'Comfort layers for the hours after the work is done.',
        },
      ],
    },
    fit: {
      eyebrow: 'Fit / Feel / Identity',
      title: 'Composed layers for disciplined work.',
      points: [
        {
          title: 'Heavyweight Feel',
          copy:
            'Structured, substantial silhouettes that feel intentional without becoming loud or costume-like.',
        },
        {
          title: 'Athletic Silhouette',
          copy:
            'Designed around training posture and everyday movement — clean lines, fight-ready attitude.',
        },
        {
          title: 'Minimal AURA Branding',
          copy:
            'The identity is present without shouting. AURA is earned, not announced.',
        },
      ],
    },
    dropConnection: {
      eyebrow: 'Drop 001',
      title: 'PART OF DROP 001',
      copy:
        'The first release establishes the AURA uniform: apparel, footwear, and equipment shaped around discipline, presence, and the internal fight.',
      cta: { label: 'View Drop 001', to: '/drop-001' },
    },
    finalCta: {
      title: 'ENTER THE FIRST CIRCLE',
      copy:
        'Join the waitlist for early access to AURA apparel releases, Drop 001 updates, and the first circle of the fight club.',
      cta: { label: 'Join Waitlist', href: '#waitlist' },
    },
  },
};

function getCategoryContent(category) {
  if (!category) return null;
  return CONTENT[String(category).toLowerCase()] || null;
}

function CtaLink({ item }) {
  if (!item) return null;

  const className = `cx-btn cx-btn--${item.variant || 'ghost'}`;

  if (item.to?.startsWith('#')) {
    return (
      <a href={item.to} className={className}>
        {item.label}
      </a>
    );
  }

  return (
    <Link to={item.to} className={className}>
      {item.label}
    </Link>
  );
}

export function CategoryHero({ category }) {
  const content = getCategoryContent(category);
  if (!content?.hero) return null;

  const { hero } = content;

  return (
    <section className="cx-hero" data-category={category}>
      <div className="cx-hero__inner">
        <p className="cx-eyebrow">{hero.label}</p>
        <h1 className="cx-hero__title">
          {hero.headline.split('\n').map(line => (
            <span key={line}>{line}</span>
          ))}
        </h1>
        <p className="cx-hero__copy">{hero.copy}</p>
        <div className="cx-hero__ctas">
          {hero.ctas.map(item => (
            <CtaLink key={item.label} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CategoryLineupIntro({ category }) {
  const content = getCategoryContent(category);
  if (!content?.lineup) return null;

  const { lineup } = content;
  const anchorId = category === 'apparel' ? 'apparel-lineup' : `${category || 'category'}-lineup`;

  return (
    <section className="cx-lineup-intro" id={anchorId}>
      <p className="cx-eyebrow cx-eyebrow--center">{lineup.eyebrow}</p>
      <h2 className="cx-lineup-intro__title">{lineup.title}</h2>
      <p className="cx-body cx-lineup-intro__copy">{lineup.copy}</p>
    </section>
  );
}

export default function CategoryExtras({ category }) {
  const content = getCategoryContent(category);
  if (!content) return null;

  const { story, useCases, fit, dropConnection, finalCta } = content;

  return (
    <div className="cx" data-category={category}>
      {/* ── STORY ─────────────────────────────────────────────── */}
      <section className="cx-section cx-story">
        <div className="cx-story__grid">
          <div>
            <p className="cx-eyebrow">{story.eyebrow}</p>
            <h2 className="cx-story__title">{story.title}</h2>
          </div>
          <div>
            {story.paragraphs.map(paragraph => (
              <p className="cx-body" key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASES ─────────────────────────────────────────── */}
      <section className="cx-section cx-usecases">
        <p className="cx-eyebrow cx-eyebrow--center">{useCases.eyebrow}</p>
        <h2 className="cx-section-title cx-section-title--center">{useCases.title}</h2>
        <div className="cx-usecases__grid">
          {useCases.cards.map(card => (
            <article className="cx-usecase-card" key={card.title}>
              <span className="cx-usecase-card__number">0{useCases.cards.indexOf(card) + 1}</span>
              <h3>{card.title}</h3>
              <p>{card.copy}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── FIT / FEEL / IDENTITY ─────────────────────────────── */}
      <section className="cx-section cx-fit">
        <div className="cx-fit__intro">
          <p className="cx-eyebrow">{fit.eyebrow}</p>
          <h2 className="cx-section-title">{fit.title}</h2>
        </div>
        <div className="cx-fit__grid">
          {fit.points.map(point => (
            <div className="cx-fit-point" key={point.title}>
              <h3>{point.title}</h3>
              <p>{point.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DROP 001 CONNECTION ──────────────────────────────── */}
      <section className="cx-section cx-drop">
        <div className="cx-drop__inner">
          <p className="cx-eyebrow">{dropConnection.eyebrow}</p>
          <h2 className="cx-drop__title">{dropConnection.title}</h2>
          <p className="cx-body">{dropConnection.copy}</p>
          <Link to={dropConnection.cta.to} className="cx-btn cx-btn--ghost">
            {dropConnection.cta.label}
          </Link>
        </div>
      </section>

      {/* ── FINAL WAITLIST CTA ───────────────────────────────── */}
      <section className="cx-section cx-final-cta">
        <h2 className="cx-final-cta__title">{finalCta.title}</h2>
        <p className="cx-body cx-final-cta__copy">{finalCta.copy}</p>
        <a href={finalCta.cta.href} className="cx-btn cx-btn--primary">
          {finalCta.cta.label}
        </a>
      </section>

    </div>
  );
}
