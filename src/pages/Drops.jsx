import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import LaunchProductCard from '../components/LaunchProductCard.jsx';
import DropCountdown from '../components/DropCountdown.jsx';
import { dropOneCategories, dropOneProducts } from '../data/products.js';
import { auraSets, dropTwoItems, dropTwoTargetDate } from '../data/dropRoadmap.js';
import '../styles/drops.css';
import '../styles/drops-roadmap.css';

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

function SetCard({ set }) {
  return (
    <article className="sets-card">
      <div className="sets-card__media">
        <img src={set.image} alt={`${set.title} concept`} loading="lazy" decoding="async" />
      </div>
      <div className="sets-card__body">
        <div className="sets-card__meta">
          <span>{set.status}</span>
          <small>{set.items.length} pieces</small>
        </div>
        <h3>{set.title}</h3>
        <p>{set.copy}</p>
        <ul>
          {set.items.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <a href="#waitlist">Join Set Waitlist</a>
      </div>
    </article>
  );
}

function FutureItemCard({ item }) {
  return (
    <article className="future-card">
      <div className="future-card__media">
        <img src={item.image} alt={item.title} loading="lazy" decoding="async" />
      </div>
      <div className="future-card__body">
        <span>{item.status}</span>
        <h3>{item.title}</h3>
        <p>{item.copy}</p>
        <a href="#waitlist">Join Waitlist</a>
      </div>
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
            <p className="drops-subtitle">CURRENT DROP. FUTURE RELEASES. SETS.</p>
            <p className="drops-hero__copy">
              This is the AURA release hub: shop Drop 001, watch the Drop 002 countdown, join future product waitlists, and preview Sets — complete product combinations built around training, recovery, travel, and everyday life.
            </p>
            <div className="drops-actions">
              <a className="drops-btn drops-btn--primary" href="/drop-001">SHOP DROP 001</a>
              <a className="drops-btn drops-btn--ghost" href="#drop-002">DROP 002 COUNTDOWN</a>
              <a className="drops-btn drops-btn--ghost" href="#sets">VIEW SETS</a>
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
            <p>Available now as the first AURA training-to-lifestyle release.</p>
          </div>
          <DropCard
            eyebrow="DROP 001"
            title="COMFORTABLE DAILY TRAINING LAYERS"
            status="AVAILABLE TO ORDER"
            copy="Clean silhouettes, minimal branding, and comfortable pieces designed for training, recovery, travel, and everyday wear."
            items={dropOneCategories}
            cta="Shop Drop 001"
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

        <section className="drop002-section" id="drop-002" aria-labelledby="drop002-title">
          <div className="drop002-section__copy">
            <p className="drops-eyebrow">COMING NEXT</p>
            <h2 id="drop002-title">DROP 002</h2>
            <p>
              Drop 002 expands AURA beyond the first clothing release. The countdown is live and updates every second. This section becomes the place to build demand before products go live.
            </p>
            <div className="drops-actions">
              <a className="drops-btn drops-btn--primary" href="#waitlist">Join Drop 002 Waitlist</a>
              <a className="drops-btn drops-btn--ghost" href="#future-items">View Future Items</a>
            </div>
          </div>
          <DropCountdown target={dropTwoTargetDate} />
        </section>

        <section className="sets-section" id="sets" aria-labelledby="sets-title">
          <div className="sets-section__head">
            <p className="drops-eyebrow">NEW CONCEPT</p>
            <h2 id="sets-title">SETS</h2>
            <p>
              Sets are curated AURA combinations customers can buy together. They make the brand easier to understand: not just single products, but complete outfits for training, recovery, travel, and everyday movement.
            </p>
          </div>
          <div className="sets-grid">
            {auraSets.map((set) => <SetCard set={set} key={set.title} />)}
          </div>
        </section>

        <section className="future-section" id="future-items" aria-labelledby="future-items-title">
          <div className="future-section__head">
            <p className="drops-eyebrow">WAITLIST ITEMS</p>
            <h2 id="future-items-title">FUTURE DROPS</h2>
            <p>
              Use this area to show products that are not ready to sell yet but should collect interest: Drop 002 candidates, future accessories, footwear, tracksuits, and bigger AURA releases.
            </p>
          </div>
          <div className="future-grid">
            {dropTwoItems.map((item) => <FutureItemCard item={item} key={item.title} />)}
          </div>
        </section>

        <section className="drops-waitlist" id="waitlist" aria-labelledby="drops-waitlist-title">
          <div>
            <p className="drops-eyebrow">EARLY ACCESS</p>
            <h2 id="drops-waitlist-title">JOIN THE DROP LIST</h2>
            <p>
              Join for Drop 002, Sets, future footwear, accessories, tracksuit layers, and limited AURA product combinations.
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
              <select name="interest" defaultValue="Drop 002">
                <option>Drop 002</option>
                <option>Sets</option>
                <option>Footwear</option>
                <option>Accessories</option>
                <option>Tracksuit layers</option>
                <option>All future drops</option>
              </select>
            </label>
            <button type="button">JOIN WAITLIST</button>
            <p>Connected checkout/email capture can be added later. This page now has the structure ready.</p>
          </form>
        </section>

        <section className="drops-closing" aria-labelledby="drops-closing-title">
          <div className="drops-closing__media">
            <img src={dropImages.closing} alt="AURA cream apparel preview" loading="lazy" decoding="async" />
          </div>
          <div className="drops-closing__copy">
            <p className="drops-eyebrow">AURA STANDARD</p>
            <h2 id="drops-closing-title">BUILD THE UNIFORM.</h2>
            <p>
              Drop 001 sells the first pieces. Drop 002 builds the next phase. Sets make AURA easier to buy as a complete lifestyle uniform.
            </p>
            <div className="drops-actions">
              <a className="drops-btn drops-btn--primary" href="/drop-001">Shop Drop 001</a>
              <a className="drops-btn drops-btn--ghost" href="#sets">View Sets</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
