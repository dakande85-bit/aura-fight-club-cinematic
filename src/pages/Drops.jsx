import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import LaunchProductCard from '../components/LaunchProductCard.jsx';
import { dropOneCategories, dropOneProducts } from '../data/products.js';
import '../styles/drops.css';

const upcomingCandidates = [
  'Footwear',
  'Training accessories',
  'Everyday carry pieces',
  'Premium tracksuit layers',
];

const dropImages = {
  hero: '/assets/aura-scroll/05_drop_001_tools_uniform/frame_09_cream_full_outfit_model.webp',
  drop001: '/assets/aura-scroll/05_drop_001_tools_uniform/frame_01_cream_uniform_model.webp',
  drop002: '/assets/category-support/footwear-cream-high.webp',
  closing: '/assets/category-support/apparel-cream-jacket.webp',
};

function DropCard({ eyebrow, title, status, copy, items, cta, href, image, imageAlt }) {
  return (
    <article className="drops-card">
      {image && (
        <div className="drops-card__media">
          <img src={image} alt={imageAlt} loading="lazy" decoding="async" />
        </div>
      )}
      <div className="drops-card__head">
        <p>{eyebrow}</p>
        <span>{status}</span>
      </div>
      <h3>{title}</h3>
      <p className="drops-card__copy">{copy}</p>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <a className="drops-link" href={href}>{cta}</a>
    </article>
  );
}

export default function Drops() {
  return (
    <div className="drops-page">
      <Header />
      <main>
        <section className="drops-hero">
          <div className="drops-hero__content">
            <p className="drops-eyebrow">AURA FIGHT CLUB</p>
            <h1>DROPS</h1>
            <p className="drops-subtitle">TRAINING. LIFESTYLE. EVERYDAY PRESENCE.</p>
            <p className="drops-hero__copy">
              AURA releases clothing and accessories in stages. Drop 001 begins with comfortable training-to-lifestyle essentials: pieces you can wear in the gym, after training, while travelling, and through daily life.
            </p>
            <div className="drops-actions">
              <a className="drops-btn drops-btn--primary" href="/drop-001">VIEW DROP 001</a>
              <a className="drops-btn drops-btn--ghost" href="#waitlist">JOIN WAITLIST</a>
            </div>
          </div>
          <div className="drops-hero__media">
            <img
              src={dropImages.hero}
              alt="AURA Drop 001 cream training uniform"
              width="1122"
              height="1402"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </div>
        </section>

        <section className="drops-section" aria-labelledby="current-drop-title">
          <div className="drops-section__head">
            <p className="drops-eyebrow">CURRENT FOCUS</p>
            <h2 id="current-drop-title">DROP 001</h2>
          </div>
          <DropCard
            eyebrow="DROP 001"
            title="COMFORTABLE DAILY TRAINING LAYERS"
            status="WAITLIST OPENING"
            copy="Clean silhouettes, minimal branding, and comfortable pieces designed for training, recovery, travel, and everyday wear."
            items={dropOneCategories}
            cta="View Drop 001"
            href="/drop-001"
            image={dropImages.drop001}
            imageAlt="Drop 001 cream AURA uniform on model"
          />
          <div className="drops-product-preview" aria-label="Drop 001 product preview">
            {dropOneProducts.map((product) => (
              <LaunchProductCard product={product} compact key={product.slug} />
            ))}
          </div>
        </section>

        <section className="drops-section drops-section--split" aria-labelledby="upcoming-drop-title">
          <div className="drops-section__head">
            <p className="drops-eyebrow">COMING NEXT</p>
            <h2 id="upcoming-drop-title">FUTURE AURA PIECES</h2>
          </div>
          <DropCard
            eyebrow="NEXT PHASE"
            title="FOOTWEAR AND ACCESSORIES"
            status="COMING SOON"
            copy="The next phase expands the AURA uniform with footwear, accessories, carry pieces, and premium layers."
            items={upcomingCandidates}
            cta="Join Waitlist"
            href="#waitlist"
            image={dropImages.drop002}
            imageAlt="AURA footwear preview"
          />
        </section>

        <section className="drops-waitlist" id="waitlist" aria-labelledby="drops-waitlist-title">
          <div>
            <p className="drops-eyebrow">EARLY ACCESS</p>
            <h2 id="drops-waitlist-title">JOIN THE DROP LIST</h2>
            <p>
              Get early access to Drop 001 and future AURA clothing, footwear, and accessory releases.
            </p>
          </div>
          <form className="drops-form">
            <label>
              <span>Name</span>
              <input type="text" name="name" placeholder="Your name" />
            </label>
            <label>
              <span>Email</span>
              <input type="email" name="email" placeholder="you@example.com" />
            </label>
            <label>
              <span>Interested in</span>
              <select name="interest" defaultValue="All Drops">
                <option>Apparel</option>
                <option>Footwear</option>
                <option>Accessories</option>
                <option>All Drops</option>
              </select>
            </label>
            <button type="button">JOIN WAITLIST</button>
            <p>Waitlist opening soon.</p>
          </form>
        </section>

        <section className="drops-closing" aria-labelledby="drops-closing-title">
          <div className="drops-closing__media">
            <img src={dropImages.closing} alt="AURA cream apparel preview" loading="lazy" decoding="async" />
          </div>
          <div className="drops-closing__copy">
            <p className="drops-eyebrow">AURA STANDARD</p>
            <h2 id="drops-closing-title">LIFE HAS ROUNDS.</h2>
            <p>
              AURA is for people who train, work, move, recover, and keep going. Comfortable clothing first, with a theme that carries the mindset into everyday life.
            </p>
            <div className="drops-actions">
              <a className="drops-btn drops-btn--primary" href="/drop-001">View Drop 001</a>
              <a className="drops-btn drops-btn--ghost" href="/fight-club">Join Waitlist</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
