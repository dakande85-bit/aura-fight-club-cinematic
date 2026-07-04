import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/our-story.css';
import '../styles/our-story-expanded.css';

const standards = [
  {
    title: 'Comfort',
    copy: 'The first test is how it feels on the body. AURA pieces should be easy to train in, easy to travel in, and comfortable enough to keep on after the session.',
  },
  {
    title: 'Fit',
    copy: 'The silhouette must look clean without trying too hard. The goal is a composed athletic shape that works in the gym and outside it.',
  },
  {
    title: 'Finish',
    copy: 'Print placement, logo scale, fabric feel, stitching, trims, and colour balance all matter. AURA should feel considered, not like random merch.',
  },
  {
    title: 'Use',
    copy: 'Every product needs a clear role in the daily routine: training, recovery, travel, work, errands, or everyday movement.',
  },
];

const lifestyleCards = [
  {
    title: 'Train',
    copy: 'Clothing for the warm-up, the session, and the discipline around the work.',
    image: '/assets/our-story/our-story-04-rhythm.webp',
    alt: 'AURA training rhythm visual',
  },
  {
    title: 'Recover',
    copy: 'Soft layers for rest days, post-training, travel, and the quieter hours after pressure.',
    image: '/assets/category-support/apparel-cream-jacket.webp',
    alt: 'AURA cream lifestyle layer',
  },
  {
    title: 'Move',
    copy: 'A clean everyday uniform for people moving through work, family, travel, and training.',
    image: '/assets/our-story/our-story-09-arrival.webp',
    alt: 'AURA everyday arrival visual',
  },
];

const productGallery = [
  {
    title: 'Apparel',
    copy: 'T-shirts, hoodies, joggers, and tanks built around comfort, clean fit, and daily wear.',
    image: '/assets/aura-live/campaign/campaign-tee.webp',
    alt: 'AURA t-shirt product visual',
  },
  {
    title: 'Layers',
    copy: 'Hoodies and jackets that work before training, after training, and on the road.',
    image: '/assets/category-support/apparel-black-hoodie.webp',
    alt: 'AURA black hoodie visual',
  },
  {
    title: 'Movement',
    copy: 'Future footwear and movement pieces extend the AURA uniform beyond the first clothing drop.',
    image: '/assets/products/aura-cream-fight-boots/card-product.webp',
    alt: 'AURA cream footwear preview',
  },
  {
    title: 'Accessories',
    copy: 'Bottles, bags, gloves, and carry pieces complete the training-to-lifestyle system.',
    image: '/assets/products/aura-cream-boxing-gloves/card-product.webp',
    alt: 'AURA cream accessory preview',
  },
];

const journey = [
  {
    number: '01',
    label: 'Purpose',
    title: 'Made for the everyday fighter',
    body: 'The everyday fighter is not only someone in a ring. It is the person who trains, works, handles pressure, recovers, provides, travels, learns, and still keeps moving. AURA is clothing for that rhythm.',
    micro: 'Discipline without costume.',
    image: '/assets/aura-scroll/05_drop_001_tools_uniform/frame_09_cream_full_outfit_model.webp',
    alt: 'AURA cream uniform on model',
  },
  {
    number: '02',
    label: 'Lifestyle',
    title: 'From training floor to daily life',
    body: 'AURA should not feel trapped inside the gym. The clothes need to work during training, on the way home, in the airport, on errands, and through the normal day.',
    micro: 'Train in it. Live in it.',
    image: '/assets/products/aura-sleeveless-hoodie/card-hover-model.webp',
    alt: 'AURA apparel on model',
  },
  {
    number: '03',
    label: 'Quality',
    title: 'Not throwaway merch',
    body: 'The standard is simple: better fit, better feel, better finish. The product should look premium, hold the brand identity, and still be useful enough to wear again and again.',
    micro: 'Comfort, fit, finish, use.',
    image: '/assets/category-support/apparel-training-vest.webp',
    alt: 'AURA training vest visual',
  },
];

function StoryImage({ src, alt, eager = false }) {
  function markFallback(event) {
    event.currentTarget.closest('.os-image-shell')?.classList.add('os-image-shell--fallback');
    event.currentTarget.hidden = true;
  }

  return (
    <div className="os-image-shell">
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={eager ? 'high' : 'auto'}
        onError={markFallback}
      />
    </div>
  );
}

export function WhoWeAreSections({ title = 'WHO WE ARE' }) {
  return (
    <main id="who-we-are">
      <section className="os-hero" aria-labelledby="our-story-title">
        <div className="os-hero__content">
          <p className="os-eyebrow">AURA / BRAND STORY</p>
          <h1 id="our-story-title">{title}</h1>
          <p className="os-hero__subtitle">THE EVERYDAY FIGHTER LIFESTYLE.</p>
          <p className="os-hero__copy">
            AURA was created for people who want training clothes that feel comfortable, fit clean, and still work outside the gym. It is a uniform for the everyday fighter: the person who trains, works, travels, recovers, handles pressure, and keeps going.
          </p>
          <p className="os-hero__micro">Comfort first. Strong identity always.</p>
        </div>
        <StoryImage
          src="/assets/aura-scroll/05_drop_001_tools_uniform/frame_09_cream_full_outfit_model.webp"
          alt="AURA cream training-to-lifestyle outfit on model"
          eager
        />
      </section>

      <section className="os-origin" aria-labelledby="origin-title">
        <div className="os-section-head">
          <p className="os-eyebrow">ORIGIN</p>
          <h2 id="origin-title">WHY AURA EXISTS</h2>
        </div>
        <div className="os-origin__copy">
          <p>Most training clothing falls into two weak places: it is either plain gym kit with no identity, or loud merchandise that does not feel premium enough for real daily wear.</p>
          <p>AURA sits between training and lifestyle. The brand is built around comfortable pieces, clean silhouettes, minimal branding, and a fight-inspired mindset that can carry through the whole day.</p>
          <p>The idea is not to dress like a fighter for attention. The idea is to dress with the discipline, confidence, and composure of someone who is always preparing for the next round of life.</p>
        </div>
      </section>

      <section className="os-lifestyle" aria-labelledby="lifestyle-title">
        <div className="os-lifestyle__intro">
          <p className="os-eyebrow">LIFESTYLE</p>
          <h2 id="lifestyle-title">EVERYDAY FIGHTER</h2>
          <p>
            The everyday fighter lifestyle is about training, recovery, travel, work, family, and pressure. AURA should feel natural in each setting, not like costume clothing that only works for one photo.
          </p>
        </div>
        <div className="os-lifestyle-grid">
          {lifestyleCards.map((card) => (
            <article className="os-lifestyle-card" key={card.title}>
              <img src={card.image} alt={card.alt} loading="lazy" decoding="async" />
              <div>
                <h3>{card.title}</h3>
                <p>{card.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="os-quality" aria-labelledby="quality-title">
        <div className="os-quality__grid">
          <div>
            <p className="os-eyebrow">PRODUCT STANDARD</p>
            <h2 id="quality-title">QUALITY IS THE BRAND</h2>
          </div>
          <div className="os-quality__copy">
            <p>AURA cannot just be a logo on clothing. The product has to earn the brand. That means the blank, fabric feel, print finish, sizing, shape, colour, and daily comfort all matter.</p>
            <p>Every release should be judged by whether someone would actually wear it through a full day: training, recovery, travel, errands, and normal life. If the product is not comfortable, useful, and visually strong, it should not carry the AURA name.</p>
          </div>
        </div>

        <div className="os-standard-grid">
          {standards.map((item, index) => (
            <article className="os-standard-card" key={item.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="os-journey" aria-labelledby="journey-title">
        <div className="os-journey__intro">
          <p className="os-eyebrow">THE SYSTEM</p>
          <h2 id="journey-title">TRAINING TO LIFESTYLE</h2>
          <p>
            AURA begins with clothing but builds toward a full uniform: apparel, footwear, accessories, carry pieces, and training products that all share the same standard of comfort, fit, and composed identity.
          </p>
        </div>

        <div className="os-stage-list">
          {journey.map((scene) => (
            <article className="os-stage" key={scene.number}>
              <StoryImage src={scene.image} alt={scene.alt} />
              <div className="os-stage__copy">
                <div className="os-stage__meta">
                  <span>{scene.number}</span>
                  <p>{scene.label}</p>
                </div>
                <h3>{scene.title}</h3>
                <p>{scene.body}</p>
                <strong>{scene.micro}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="os-product-gallery" aria-labelledby="gallery-title">
        <div className="os-product-gallery__intro">
          <p className="os-eyebrow">THE UNIFORM</p>
          <h2 id="gallery-title">PRODUCTS WITH PURPOSE</h2>
          <p>
            Every category has to support the same lifestyle: pieces that help someone feel comfortable, prepared, and put together before training, after training, and throughout the day.
          </p>
        </div>
        <div className="os-gallery-grid">
          {productGallery.map((item) => (
            <article className="os-gallery-card" key={item.title}>
              <div className="os-gallery-card__media">
                <img src={item.image} alt={item.alt} loading="lazy" decoding="async" />
              </div>
              <div className="os-gallery-card__copy">
                <span>{item.title}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="os-manifesto" aria-labelledby="manifesto-title">
        <p className="os-eyebrow">DESIGN STANDARD</p>
        <h2 id="manifesto-title">A UNIFORM FOR THE DAY</h2>
        <div className="os-manifesto__copy">
          <p>AURA is not built to be loud. It is built to feel composed.</p>
          <p>The clothing should be comfortable enough to train in, clean enough to travel in, and strong enough to carry identity without shouting.</p>
          <p>Comfortable movement.</p>
          <p>Clean silhouettes.</p>
          <p>Premium finish.</p>
          <p>Training-to-lifestyle versatility.</p>
          <p>Accessories that complete the look.</p>
        </div>
      </section>

      <section className="os-closing" aria-labelledby="closing-title">
        <p className="os-eyebrow">AURA</p>
        <h2 id="closing-title">BUILT FOR THE WHOLE DAY.</h2>
        <p>
          AURA is for people who train, work, recover, travel, and keep going. Comfortable clothing first. Product quality always. Strong identity without noise.
        </p>
        <div className="os-actions" aria-label="Story actions">
          <a className="os-btn os-btn--shop" href="/drop-001">SHOP DROP 001</a>
          <a className="os-btn os-btn--ghost" href="/apparel">VIEW APPAREL</a>
        </div>
      </section>
    </main>
  );
}

export default function OurStory() {
  return (
    <div className="os-page">
      <Header />
      <WhoWeAreSections />
      <Footer />
    </div>
  );
}
