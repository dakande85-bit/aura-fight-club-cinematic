import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { useProductMedia } from '../hooks/useProductMedia.js';
import ProductMediaGallery from '../components/ProductMediaGallery.jsx';
import '../styles/product-detail.css';

const categoryRoutes = {
  Apparel: '/apparel',
  Footwear: '/footwear',
  Equipment: '/equipment',
};

function getStatusLabel(status) {
  return {
    waitlist: 'Waitlist Open',
    available: 'Available Now',
    'sold-out': 'Sold Out',
    'coming-soon': 'Coming Soon',
  }[status] ?? 'Coming Soon';
}

function getActionLabel(status) {
  return status === 'waitlist' ? 'Join Waitlist' : 'Notify Me';
}

function getCategoryRole(category) {
  return {
    Apparel: 'A training layer for the hours before, during, and after the work. It belongs in the AURA uniform because it keeps the look clean while the discipline stays loud in the routine.',
    Footwear: 'A movement piece for footwork, stance, and the quiet repetition that builds confidence before the first bell. It carries the AURA system from gym floor to street.',
    Equipment: 'A tool for the daily rounds: bag work, pads, drills, and the small rituals that make training feel intentional. It anchors the AURA uniform in the work itself.',
  }[category] || 'A piece built to sit inside the AURA training and lifestyle system: composed, intentional, and ready for the unseen rounds.';
}

function getProductCards(product) {
  return [
    {
      title: 'Fit / silhouette',
      copy: product.category === 'Footwear'
        ? 'Built around a fight-ready profile and a composed AURA stance.'
        : 'Designed to sit clean in the AURA uniform without shouting for attention.',
    },
    {
      title: 'Training use',
      copy: product.shortDesc || 'Made for the discipline, repetition, and preparation before the session becomes visible.',
    },
    {
      title: 'Lifestyle use',
      copy: 'Reserved enough to move outside the gym while still carrying the fight-club identity.',
    },
    {
      title: 'Brand identity',
      copy: `${product.collection || 'AURA'}: presence first, attention second. The aura is earned before it is seen.`,
    },
  ];
}

export default function ProductDetail({ product, onBack }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const hasLocalGallery = Boolean(product?.gallery?.length || product?.image);
  const { media } = useProductMedia(hasLocalGallery ? null : product?.slug);

  if (!product) {
    return (
      <div className="pd-empty">
        <Header />
        <p>Product not found.</p>
        {onBack && <button className="pd-back" onClick={onBack}>Back to Drop 001</button>}
      </div>
    );
  }

  const gallery = product.gallery?.length
    ? product.gallery
    : media?.gallery?.length
      ? media.gallery
      : product.image
        ? [{ src: product.image, alt: product.name }]
        : [];

  const statusLabel = getStatusLabel(product.status);
  const actionLabel = getActionLabel(product.status);
  const categoryPath = categoryRoutes[product.category] || '/drop-001';
  const relatedCategories = ['Apparel', 'Footwear', 'Equipment'].filter((category) => category !== product.category);
  const detailCards = getProductCards(product);

  return (
    <div className="pd">
      <Header />
      <main>
        <nav className="pd-nav" aria-label="Product navigation">
          {onBack && <button className="pd-back" onClick={onBack}>Back to Drop 001</button>}
          <span className="pd-nav-logo">AURA PRODUCT</span>
        </nav>

        <section className="pd-hero">
          <div className="pd__gallery-col">
            {gallery.length ? (
              <ProductMediaGallery gallery={gallery} productName={product.name} />
            ) : (
              <div className="pd__gallery-empty">
                <span>Media pending</span>
                <strong>{product.name}</strong>
              </div>
            )}
          </div>

          <div className="pd__info">
            <p className="pd__crumb">{product.collection} / {product.category}</p>
            <h1 className="pd__name">{product.name}</h1>
            <div className="pd__commerce-row">
              <span className="pd__badge">{statusLabel}</span>
              {product.price ? <span className="pd__price">{product.price}</span> : null}
            </div>

            <div className="pd__waitlist">
              <p className="pd__waitlist-label">{actionLabel} / {product.collection}</p>
              {!submitted ? (
                <div className="pd__form">
                  <input
                    className="pd__email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && email && setSubmitted(true)}
                    aria-label="Email address"
                  />
                  <button className="pd__submit" onClick={() => email && setSubmitted(true)}>
                    {actionLabel}
                  </button>
                </div>
              ) : <p className="pd__confirm">YOU'RE ON THE LIST.</p>}
            </div>

            <div className="pd__cta-row" aria-label="Related product links">
              <Link to="/drop-001">View Drop 001</Link>
              <Link to={categoryPath}>Shop {product.category}</Link>
            </div>

            {product.shortDesc ? <p className="pd__short">{product.shortDesc}</p> : null}
            {product.description ? <p className="pd__desc">{product.description}</p> : null}
          </div>
        </section>

        <section className="pd-story" aria-labelledby="product-story-title">
          <p className="pd__section-label">Product story</p>
          <h2 id="product-story-title">Built into the AURA uniform.</h2>
          <p>{getCategoryRole(product.category)}</p>
          <p>
            {product.name} is positioned as part of a premium boxing lifestyle system:
            disciplined, quiet, and intentional enough for training, recovery, and the life around the rounds.
          </p>
        </section>

        <section className="pd-detail-section" aria-labelledby="product-details-title">
          <div className="pd-section-head">
            <p className="pd__section-label">Product details</p>
            <h2 id="product-details-title">Commercial, clean, fight-club ready.</h2>
          </div>
          <div className="pd-detail-grid">
            {detailCards.map((card) => (
              <article className="pd-detail-card" key={card.title}>
                <span>{card.title}</span>
                <p>{card.copy}</p>
              </article>
            ))}
          </div>
          {product.details?.length > 0 && (
            <div className="pd-spec-list">
              <p className="pd__section-label">Available product notes</p>
              <ul className="pd__details">
                {product.details.map((detail) => <li key={detail}>{detail}</li>)}
              </ul>
            </div>
          )}
        </section>

        <section className="pd-related" aria-label="Related navigation">
          <Link to="/drop-001">Drop 001</Link>
          <Link to={categoryPath}>{product.category}</Link>
          {relatedCategories.map((category) => (
            <Link to={categoryRoutes[category]} key={category}>{category}</Link>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
