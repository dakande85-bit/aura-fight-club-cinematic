import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { dropOneCategories, dropOnePipeline, dropTwoPipeline } from '../data/products.js';
import '../styles/drops.css';

const upcomingCandidates = [
  'AURA boxing-style casual shoes',
  'AURA wrestling high-top trainer',
  'AURA sauna suit',
  'AURA boxing gloves',
  'AURA hand wraps',
  'AURA fight bag',
  'AURA premium tracksuit',
  'AURA compression/performance wear',
];

const pipeline = [...dropOnePipeline, ...dropTwoPipeline];

const dropImages = {
  hero: '/assets/aura-scroll/05_drop_001_tools_uniform/frame_09_cream_full_outfit_model.webp',
  drop001: '/assets/aura-scroll/05_drop_001_tools_uniform/frame_01_cream_uniform_model.webp',
  drop002: '/assets/category-support/equipment-gloves-grip.webp',
  closing: '/assets/category-support/footwear-cream-high.webp',
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
            <p className="drops-subtitle">CURRENT RELEASES. UPCOMING GEAR. WAITLIST ACCESS.</p>
            <p className="drops-hero__copy">
              AURA drops are released in stages. Drop 001 begins with launch-ready essentials for Men & Women. Drop 002 moves into supplier-built fight lifestyle gear only after samples, materials, fit, and production quality meet the AURA standard.
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
            <p className="drops-eyebrow">RELEASE STATUS</p>
            <h2 id="current-drop-title">CURRENT DROP</h2>
          </div>
          <DropCard
            eyebrow="DROP 001"
            title="DROP 001 - MEN & WOMEN"
            status="POD LAUNCH / WAITLIST"
            copy="Drop 001 starts with clean, launch-ready AURA essentials for men and women. These pieces are built around the core Fight Club identity and prepared for POD fulfilment through Gelato or Printful where available."
            items={dropOneCategories}
            cta="View Drop 001"
            href="/drop-001"
            image={dropImages.drop001}
            imageAlt="Drop 001 cream AURA uniform on model"
          />
        </section>

        <section className="drops-section drops-section--split" aria-labelledby="upcoming-drop-title">
          <div className="drops-section__head">
            <p className="drops-eyebrow">SUPPLIER BUILT</p>
            <h2 id="upcoming-drop-title">UPCOMING DROP</h2>
          </div>
          <DropCard
            eyebrow="DROP 002"
            title="DROP 002 - SUPPLIER-BUILT GEAR"
            status="IN DEVELOPMENT"
            copy="Drop 002 moves into supplier-built gear. These pieces stay in development until samples, materials, fit, and production quality meet the AURA standard."
            items={upcomingCandidates}
            cta="Join Drop 002 Waitlist"
            href="#waitlist"
            image={dropImages.drop002}
            imageAlt="AURA supplier-built equipment preview"
          />
        </section>

        <section className="drops-section drops-pipeline" aria-labelledby="pipeline-title">
          <div className="drops-section__head">
            <p className="drops-eyebrow">ROADMAP</p>
            <h2 id="pipeline-title">PRODUCT PIPELINE</h2>
            <p>
              The pipeline shows what is ready for POD waitlist launch, what needs supplier approval, and what is being prepared for future drops.
            </p>
          </div>
          <div className="drops-pipeline__grid">
            {pipeline.map((item) => (
              <article className="drops-pipeline__item" key={`${item.product}-${item.drop}`}>
                <span>{item.drop}</span>
                <h3>{item.product}</h3>
                <dl>
                  <div>
                    <dt>Stage</dt>
                    <dd>{item.stage}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{item.status}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="drops-waitlist" id="waitlist" aria-labelledby="drops-waitlist-title">
          <div>
            <p className="drops-eyebrow">EARLY ACCESS</p>
            <h2 id="drops-waitlist-title">JOIN THE DROP LIST</h2>
            <p>
              Join the AURA Drop List for early access to Drop 001 and updates when Drop 002 samples are approved.
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
                <option>Equipment</option>
                <option>All Drops</option>
              </select>
            </label>
            <button type="button">JOIN WAITLIST</button>
            <p>Waitlist opening soon.</p>
          </form>
        </section>

        <section className="drops-closing" aria-labelledby="drops-closing-title">
          <div className="drops-closing__media">
            <img src={dropImages.closing} alt="AURA cream high-top footwear preview" loading="lazy" decoding="async" />
          </div>
          <div className="drops-closing__copy">
            <p className="drops-eyebrow">DROP 001 STARTS THE STANDARD</p>
            <h2 id="drops-closing-title">DROP 001 STARTS THE STANDARD</h2>
            <p>
              AURA launches with what can be delivered cleanly first. The supplier-built gear follows only after samples, suppliers, and quality checks are ready.
            </p>
            <div className="drops-actions">
              <a className="drops-btn drops-btn--primary" href="/drop-001">View Drop 001</a>
              <a className="drops-btn drops-btn--ghost" href="/fight-club">Enter Fight Club</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
