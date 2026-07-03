import { Link } from 'react-router-dom';
import '../styles/category-extras.css';

const CONTENT = {
  apparel: {
    story: {
      eyebrow: 'Why apparel',
      title: 'Comfort first. AURA theme always.',
      paragraphs: [
        'AURA apparel is built for people who train, move, travel, recover, and still want to look composed after the session. The idea is simple: comfortable clothing with a strong club identity that works beyond the gym.',
        'The pieces should feel easy to wear, clean on the body, and strong enough to carry the AURA identity without becoming loud merchandise.',
      ],
    },
    visuals: [
      { src: '/assets/category-support/apparel-black-hoodie.webp', alt: 'AURA black hoodie lifestyle preview' },
      { src: '/assets/category-support/apparel-cream-jacket.webp', alt: 'AURA cream training-to-lifestyle layer' },
      { src: '/assets/category-support/apparel-training-vest.webp', alt: 'AURA training vest preview' },
    ],
    lineup: {
      eyebrow: 'Drop 001',
      title: 'APPAREL FOR EVERY ROUND',
      copy: 'T-shirts, hoodies, joggers, and tank tops for training, recovery, travel, and daily wear.',
    },
    useCases: {
      eyebrow: 'How it fits life',
      title: 'Wear it before, during, and after training.',
      cards: [
        { title: 'Training', copy: 'Comfortable enough for gym work, warm-ups, movement, and the daily routine.' },
        { title: 'Everyday', copy: 'Clean enough to keep on after training without looking like generic gym kit.' },
        { title: 'Travel', copy: 'Easy layers for moving through the day while keeping the AURA identity.' },
      ],
    },
    finalCta: {
      title: 'LIFE HAS ROUNDS. DRESS FOR THEM.',
      copy: 'Join the waitlist for the first AURA clothing release.',
      cta: { label: 'Join Waitlist', href: '/fight-club' },
    },
  },

  footwear: {
    story: {
      eyebrow: 'Upcoming footwear',
      title: 'Movement pieces for the AURA uniform.',
      paragraphs: [
        'AURA footwear is planned as the next step: training-inspired shapes that work with movement, travel, and everyday styling.',
        'This page now acts as a clean preview. The first public focus remains Drop 001 clothing, while footwear builds into a later release.',
      ],
    },
    visuals: [
      { src: '/assets/category-support/footwear-cream-high.webp', alt: 'AURA cream high-top footwear preview' },
      { src: '/assets/category-support/footwear-cream-low.webp', alt: 'AURA cream low-top footwear preview' },
      { src: '/assets/category-support/footwear-black-high.webp', alt: 'AURA black high-top footwear preview' },
    ],
    lineup: {
      eyebrow: 'Coming soon',
      title: 'FOOTWEAR PREVIEW',
      copy: 'Training-inspired silhouettes for movement, travel, and everyday styling. Join the waitlist for release updates.',
    },
    useCases: {
      eyebrow: 'How it fits life',
      title: 'For movement outside the gym too.',
      cards: [
        { title: 'Movement', copy: 'A design direction inspired by rhythm, balance, and footwork.' },
        { title: 'Street', copy: 'A sharper everyday option to pair with AURA apparel.' },
        { title: 'Travel', copy: 'Clean footwear concepts for daily movement and relaxed styling.' },
      ],
    },
    finalCta: {
      title: 'FOOTWEAR COMES NEXT.',
      copy: 'Join the list for footwear updates after Drop 001.',
      cta: { label: 'Join Waitlist', href: '/fight-club' },
    },
  },

  equipment: {
    story: {
      eyebrow: 'Accessories',
      title: 'Small pieces that carry the theme.',
      paragraphs: [
        'AURA accessories are the supporting pieces around the clothing: bottles, bags, training add-ons, and daily carry items that keep the brand useful beyond one outfit.',
        'The goal is not random merch. Accessories should feel practical, clean, and connected to the AURA identity.',
      ],
    },
    visuals: [
      { src: '/assets/category-support/equipment-mouthguard.webp', alt: 'AURA accessory preview' },
      { src: '/assets/category-support/equipment-gloves-front.webp', alt: 'AURA training accessory preview' },
      { src: '/assets/category-support/equipment-gloves-grip.webp', alt: 'AURA accessory detail preview' },
    ],
    lineup: {
      eyebrow: 'Coming soon',
      title: 'ACCESSORIES PREVIEW',
      copy: 'Bottles, bags, and training accessories designed to complete the AURA uniform.',
    },
    useCases: {
      eyebrow: 'How it fits life',
      title: 'Useful pieces around the daily routine.',
      cards: [
        { title: 'Training', copy: 'Pieces that support the session before, during, and after.' },
        { title: 'Carry', copy: 'Everyday items that keep the AURA look connected.' },
        { title: 'Lifestyle', copy: 'Accessories with the same clean, composed identity as the clothing.' },
      ],
    },
    finalCta: {
      title: 'ACCESSORIES COMPLETE THE UNIFORM.',
      copy: 'Join the waitlist for product updates and future AURA accessories.',
      cta: { label: 'Join Waitlist', href: '/fight-club' },
    },
  },
};

function getCategoryContent(category) {
  if (!category) return null;
  return CONTENT[String(category).toLowerCase()] || null;
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

  const { story, visuals = [], useCases, finalCta } = content;

  return (
    <div className="cx" data-category={String(category || '').toLowerCase()}>
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
          {useCases.cards.map((card, index) => (
            <article className="cx-usecase-card" key={card.title}>
              <span className="cx-usecase-card__number">0{index + 1}</span>
              <h3>{card.title}</h3>
              <p>{card.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cx-section cx-final-cta">
        <h2 className="cx-final-cta__title">{finalCta.title}</h2>
        <p className="cx-body cx-final-cta__copy">{finalCta.copy}</p>
        <Link to={finalCta.cta.href} className="cx-btn cx-btn--primary">
          {finalCta.cta.label}
        </Link>
      </section>
    </div>
  );
}
