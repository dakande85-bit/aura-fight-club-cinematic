import { Link } from 'react-router-dom';
import PageHero from './PageHero.jsx';
import '../styles/category-extras.css';

// ─────────────────────────────────────────────────────────────────────────────
// AURA Fight Club — Category landing sections
//
// Renders the hero, story, lineup intro, use-case cards, material/fit,
// Drop 001 connection, and final waitlist CTA for a category page.
//
// Driven entirely by `category` ('apparel' | 'footwear' | 'equipment').
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
      image: '/campaign/jump-rope/jump-rope-07.webp',
      imagePosition: 'center 15%',
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
        'Nothing here is loud. There are no oversized graphics, no generic boxing merch signals. Just considered pieces built for the version of you that shows up before anyone is watching.',
      ],
    },
    visuals: [
      { src: '/assets/category-support/apparel-black-hoodie.webp', alt: 'AURA black hoodie in the ring' },
      { src: '/assets/category-support/apparel-cream-jacket.webp', alt: 'AURA cream jacket training outfit' },
      { src: '/assets/category-support/apparel-training-vest.webp', alt: 'AURA black training vest in the ring' },
    ],
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
        'Drop 001 apparel focuses on T-Shirts, Hoodies, Joggers, and Tank Tops for men and women. Supplier-built apparel remains in the next drop pipeline.',
      cta: { label: 'View Drop 001', to: '/drop-001' },
    },
    finalCta: {
      title: 'ENTER THE FIRST CIRCLE',
      copy:
        'Join the waitlist for early access to AURA apparel releases, Drop 001 updates, and the first circle of the fight club.',
      cta: { label: 'Join Waitlist', href: '/fight-club' },
    },
  },

  footwear: {
    hero: {
      label: 'AURA FOOTWEAR',
      headline: 'MOVEMENT BEFORE\nIMPACT',
      copy:
        'Footwear built around control and rhythm, held for Drop 002 until supplier samples are approved.',
      image: '/campaign/sparring/sparring-09.webp',
      imagePosition: 'center 34%',
      ctas: [
        { label: 'View Pipeline', to: '/drops', variant: 'primary' },
        { label: 'Join Waitlist', to: '/fight-club', variant: 'ghost' },
      ],
    },
    story: {
      eyebrow: 'The Footwork',
      title: 'A fight-club silhouette built from the ground up.',
      paragraphs: [
        'AURA footwear takes cues from boxing rhythm, footwork, balance, and control, then brings that energy into a wearable training-lifestyle silhouette. It is built for the way a fighter moves before impact, not just the moment the punch lands.',
        'These are not ordinary trainers and they are not costume boxing boots. The goal is a practical athletic and casual crossover: sharp enough for the street, disciplined enough for the gym, and aligned with the AURA uniform.',
      ],
    },
    visuals: [
      { src: '/assets/category-support/footwear-cream-high.webp', alt: 'AURA cream high-top fight boots' },
      { src: '/assets/category-support/footwear-cream-low.webp', alt: 'AURA cream low-top training shoes' },
      { src: '/assets/category-support/footwear-black-high.webp', alt: 'AURA black high-top fight boots' },
    ],
    lineup: {
      eyebrow: 'Drop 002 Pipeline',
      title: 'FOOTWEAR PIPELINE',
      copy:
        'Fight-inspired footwear stays upcoming, not live. Each silhouette needs supplier research, samples, fit checks, and production approval.',
    },
    useCases: {
      eyebrow: 'Use Cases',
      title: 'Built around movement before impact.',
      cards: [
        {
          title: 'Footwork',
          copy: 'Built for pivots, rhythm changes, and clean movement patterns.',
        },
        {
          title: 'Street',
          copy: 'A fight-club silhouette designed to carry outside the gym.',
        },
        {
          title: 'Travel',
          copy: 'Light, sharp, and easy to style with the AURA uniform.',
        },
      ],
    },
    fit: {
      eyebrow: 'Fit / Movement / Identity',
      title: 'Footwear for rhythm, balance, and presence.',
      points: [
        {
          title: 'Lightweight Feel',
          copy:
            'Designed to feel clean and mobile without turning into generic running-shoe language.',
        },
        {
          title: 'High-Top Fight Silhouette',
          copy:
            'A boxing-inspired profile that gives the category its fight-club identity.',
        },
        {
          title: 'Everyday Training Identity',
          copy:
            'Built to sit naturally with the AURA uniform: composed, sharp, and ready for daily movement.',
        },
      ],
    },
    dropConnection: {
      eyebrow: 'Drop 002 Candidate',
      title: 'SUPPLIER SAMPLE REQUIRED',
      copy:
        'Footwear is not part of Drop 001. These products remain in the Drop 002 pipeline until samples, fit, and production quality are approved.',
      cta: { label: 'View Drops', to: '/drops' },
    },
    finalCta: {
      title: 'ENTER THE FIRST CIRCLE',
      copy:
        'Join the waitlist for Drop 002 footwear updates when samples are approved.',
      cta: { label: 'Join Waitlist', href: '/fight-club' },
    },
  },

  equipment: {
    hero: {
      label: 'AURA EQUIPMENT',
      headline: 'TOOLS FOR\nDISCIPLINE',
      copy:
        'Steel Water Bottle belongs to the Drop 001 POD candidate list. Supplier-built fight tools remain Drop 002 candidates.',
      image: '/campaign/heavy-bag/heavy-bag-07.webp',
      imagePosition: 'center 30%',
      ctas: [
        { label: 'View Pipeline', to: '/drops', variant: 'primary' },
        { label: 'Join Waitlist', to: '/fight-club', variant: 'ghost' },
      ],
    },
    story: {
      eyebrow: 'The Equipment',
      title: 'Tools for the daily training ritual.',
      paragraphs: [
        'AURA equipment supports the quiet preparation behind the brand: repetition, control, and consistency. It is gear for the daily routine that sharpens the athlete before attention arrives.',
        'The category is clean, premium, and purposeful. Each piece should feel connected to the wider AURA uniform rather than like random accessory merchandise.',
      ],
    },
    visuals: [
      { src: '/assets/category-support/equipment-mouthguard.webp', alt: 'AURA mouthguard and case' },
      { src: '/assets/category-support/equipment-gloves-front.webp', alt: 'AURA cream training gloves front and palm' },
      { src: '/assets/category-support/equipment-gloves-grip.webp', alt: 'AURA cream grip training gloves' },
    ],
    lineup: {
      eyebrow: 'Drop 001 / Drop 002',
      title: 'EQUIPMENT PIPELINE',
      copy:
        'Steel Water Bottle is a Drop 001 POD candidate. Gloves, wraps, bags, and training tools stay upcoming until supplier approval.',
    },
    useCases: {
      eyebrow: 'Use Cases',
      title: 'Built for daily preparation.',
      cards: [
        {
          title: 'Training',
          copy: 'Built for warm-ups, conditioning, and daily training routines.',
        },
        {
          title: 'Preparation',
          copy: 'Small tools that support rhythm, discipline, and consistency.',
        },
        {
          title: 'Lifestyle',
          copy: 'Clean training gear designed to sit inside the AURA uniform.',
        },
      ],
    },
    fit: {
      eyebrow: 'Function / Ritual / Identity',
      title: 'Purposeful gear for disciplined repetition.',
      points: [
        {
          title: 'Training Utility',
          copy:
            'Practical pieces positioned around the daily rhythm of training, preparation, and consistency.',
        },
        {
          title: 'Clean AURA Aesthetic',
          copy:
            'Equipment that feels aligned with the wider AURA identity: composed, dark, and intentional.',
        },
        {
          title: 'Built Around Repetition',
          copy:
            'The category supports the repeated work that creates presence before attention arrives.',
        },
      ],
    },
    dropConnection: {
      eyebrow: 'Drop 002 Candidate',
      title: 'SUPPLIER SAMPLE REQUIRED',
      copy:
        'Supplier-built equipment is not part of Drop 001. It remains visible in the pipeline until samples and quality checks meet the AURA standard.',
      cta: { label: 'View Drops', to: '/drops' },
    },
    finalCta: {
      title: 'ENTER THE FIRST CIRCLE',
      copy:
        'Join the waitlist for Drop 001 bottle updates and Drop 002 equipment sample approvals.',
      cta: { label: 'Join Waitlist', href: '/fight-club' },
    },
  },
};

function getCategoryContent(category) {
  if (!category) return null;
  return CONTENT[String(category).toLowerCase()] || null;
}

export function CategoryHero({ category }) {
  const content = getCategoryContent(category);
  if (!content?.hero) return null;

  return <PageHero {...content.hero} />;
}

export function CategoryLineupIntro({ category }) {
  const content = getCategoryContent(category);
  if (!content?.lineup) return null;

  const { lineup } = content;
  const anchorId = `${String(category || 'category').toLowerCase()}-lineup`;

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

  const { story, visuals = [], useCases, fit, dropConnection, finalCta } = content;

  return (
    <div className="cx" data-category={String(category || '').toLowerCase()}>
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
      {visuals.length > 0 && (
        <section className="cx-section cx-visual-support" aria-label={`${category} supporting imagery`}>
          <div className="cx-visual-support__grid">
            {visuals.map((item, index) => (
              <figure className="cx-visual-card" key={item.src}>
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                  className="cx-visual-card__image"
                />
                <figcaption className="cx-visual-card__label">
                  {String(index + 1).padStart(2, '0')}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

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
