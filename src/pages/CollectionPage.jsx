import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Footer from '../components/Footer.jsx';
import CategoryExtras, { CategoryHero, CategoryLineupIntro } from '../components/CategoryExtras.jsx';
import { useLiveProducts } from '../hooks/useLiveProducts.js';
import '../styles/collection.css';

const CATEGORY_CONTENT = {
  Apparel: {
    label: 'AURA APPAREL',
    headline: 'BUILT FOR THE UNSEEN ROUNDS',
    copy: 'Training layers for the work nobody sees. Clean, composed, and built around presence before attention.',
    story: {
      eyebrow: 'Training Identity',
      title: 'The uniform before the lights.',
      copy: 'AURA apparel sits between premium fightwear and daily lifestyle uniform. It is built around discipline, silence, and repetition: the early session, the roadwork, the ritual before rounds. Not loud gymwear. Not generic boxing merch. Clean pieces that carry the fight-club identity without shouting for attention.',
    },
    lineupIntro: 'Training layers, lifestyle staples, and fight-club essentials from the first AURA release.',
    useCases: [
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
    identity: [
      {
        title: 'Heavyweight feel',
        copy: 'A composed hand-feel across the core layers, with details guided by the current product specs.',
      },
      {
        title: 'Athletic silhouette',
        copy: 'Cut around movement, posture, and the quiet structure of fight training.',
      },
      {
        title: 'Minimal AURA branding',
        copy: 'A restrained identity system designed to feel earned, not advertised.',
      },
    ],
  },
};

export default function CollectionPage({ category, heading, subcopy }) {
  const navigate = useNavigate();
  const { products, loading } = useLiveProducts({ category });
  const content = CATEGORY_CONTENT[category];

  const metaText = loading
    ? 'Loading...'
    : products.length > 0
      ? `${products.length} ${products.length === 1 ? 'piece' : 'pieces'} / Waitlist open`
      : 'New pieces coming soon';

  return (
    <div className={`col-page${content ? ' col-page--commercial' : ''}`}>
      <Header />
      <CategoryHero category={category} />

      {content ? (
        <>
          <section className="col-hero">
            <div className="col-hero__inner">
              <button className="col-back" onClick={() => navigate('/')}>
                Back to AURA Fight Club
              </button>
              <p className="col-eyebrow">{content.label}</p>
              <h1 className="col-title">{content.headline}</h1>
              <p className="col-sub">{content.copy}</p>
              <div className="col-hero__actions">
                <a className="col-btn col-btn--solid" href="#apparel-lineup">Shop Apparel</a>
                <Link className="col-btn col-btn--ghost" to="/drop-001">Explore Drop 001</Link>
              </div>
              <div className="col-divider" />
              <p className={`col-meta${!loading && products.length === 0 ? ' col-meta--empty' : ''}`}>
                {metaText}
              </p>
            </div>
          </section>

          <section className="col-story">
            <p className="col-section-kicker">{content.story.eyebrow}</p>
            <div className="col-story__grid">
              <h2>{content.story.title}</h2>
              <p>{content.story.copy}</p>
            </div>
          </section>
        </>
      ) : (
        <div className="col-header-block">
          <button className="col-back" onClick={() => navigate('/')}>
            Back to AURA Fight Club
          </button>
          <p className="col-eyebrow">AURA Fight Club</p>
          <h1 className="col-title">{heading}</h1>
          <p className="col-sub">{subcopy}</p>
          <div className="col-divider" />
          <p className={`col-meta${!loading && products.length === 0 ? ' col-meta--empty' : ''}`}>
            {metaText}
          </p>
        </div>
      )}

      <section className="col-grid-wrap" id={content ? 'apparel-lineup' : undefined}>
        {content && (
          <div className="col-section-head">
            <p className="col-section-kicker">Product Lineup</p>
            <h2>APPAREL LINEUP</h2>
            <p>{content.lineupIntro}</p>
          </div>
        )}

        <CategoryLineupIntro category={category} />

        {loading ? (
          <div className="col-loading">Loading collection...</div>
        ) : products.length > 0 ? (
          <div className={`col-grid${products.length === 1 ? ' col-grid--single' : ''}`}>
            {products.map(p => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        ) : (
          <div className="col-empty">
            <p className="col-empty-label">More pieces coming soon.</p>
            <button className="col-empty-cta" onClick={() => navigate('/drop-001')}>
              View Drop 001
            </button>
          </div>
        )}
      </section>

      {content && (
        <>
          <section className="col-use-cases">
            {content.useCases.map(item => (
              <article className="col-info-card" key={item.title}>
                <span>{item.title}</span>
                <p>{item.copy}</p>
              </article>
            ))}
          </section>

          <section className="col-identity">
            <div className="col-section-head">
              <p className="col-section-kicker">Material / Fit / Identity</p>
              <h2>QUIET STRUCTURE. FIGHT-CLUB PRESENCE.</h2>
            </div>
            <div className="col-identity__grid">
              {content.identity.map(item => (
                <article key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="col-drop-link">
            <p className="col-section-kicker">First Release</p>
            <h2>PART OF DROP 001</h2>
            <p>
              The first release establishes the AURA uniform: apparel, footwear, and equipment
              built around discipline before attention.
            </p>
            <Link className="col-btn col-btn--solid" to="/drop-001">View Drop 001</Link>
          </section>

          <section className="col-waitlist" id="waitlist">
            <p className="col-section-kicker">Founding Access</p>
            <h2>ENTER THE FIRST CIRCLE</h2>
            <p>Early access to AURA apparel releases, restocks, and the next pieces in the uniform.</p>
            <a className="col-btn col-btn--ghost" href="#apparel-lineup">Join Waitlist</a>
          </section>
        </>
      )}

      <CategoryExtras category={category} />
      <Footer />
    </div>
  );
}
