import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { useProductMedia } from '../hooks/useProductMedia.js';
import ProductMediaGallery from '../components/ProductMediaGallery.jsx';
import { formatPriceEUR, getShopProduct, isShopProduct } from '../data/shopProducts.js';
import '../styles/product-detail.css';

const categoryRoutes = {
  Apparel: '/apparel',
  Footwear: '/footwear',
  Equipment: '/equipment',
  'T-Shirt': '/apparel',
  Hoodie: '/apparel',
  Joggers: '/apparel',
  'Tank Top': '/apparel',
  'Steel Water Bottle': '/equipment',
};

function getStatusLabel(product, canBuy) {
  if (canBuy) return 'Available to Order';
  return {
    waitlist: 'Waitlist Open',
    available: 'Available Now',
    'sold-out': 'Sold Out',
    'coming-soon': 'Coming Soon',
  }[product?.status] ?? 'Coming Soon';
}

function getCollectionRoute(product) {
  return product?.collection === 'Drop 001' ? '/drop-001' : '/drops';
}

function getCategoryRole(category) {
  return {
    Apparel: 'A comfortable training-to-lifestyle layer for the hours before, during, and after the work.',
    'T-Shirt': 'A clean everyday tee for training, recovery, travel, and casual wear.',
    Hoodie: 'A comfortable layer for warm-ups, rest days, travel, and daily life.',
    Joggers: 'Clean joggers for training, recovery, travel, and daily movement.',
    'Tank Top': 'A training tank for gym work, warm weather, and easy layering.',
    'Steel Water Bottle': 'An everyday training bottle for the gym bag, roadwork, and daily routine.',
    Footwear: 'An upcoming movement piece for footwork, travel, and everyday styling.',
    Equipment: 'An accessory category for the daily routine: useful pieces that complete the AURA uniform.',
  }[category] || 'A piece built to sit inside the AURA training and lifestyle system.';
}

function getProductCards(product, shopProduct) {
  return [
    {
      title: 'Price',
      copy: shopProduct?.priceEUR ? formatPriceEUR(shopProduct.priceEUR) : 'Coming soon',
    },
    {
      title: 'Sizes',
      copy: shopProduct?.sizes?.join(', ') || 'To be confirmed',
    },
    {
      title: 'Use',
      copy: 'Built for training, recovery, travel, and everyday life.',
    },
    {
      title: 'Identity',
      copy: 'Clean, minimal AURA styling with a training-to-lifestyle purpose.',
    },
  ];
}

function getPublicDescription(product) {
  const category = String(product?.category || '').toLowerCase();
  const name = String(product?.name || '').toLowerCase();

  if (category.includes('t-shirt')) return 'A clean everyday tee for training, recovery, travel, and casual wear.';
  if (category.includes('hoodie')) return 'A comfortable AURA layer for warm-ups, rest days, travel, and everyday life.';
  if (category.includes('jogger')) return 'Clean joggers for training, recovery, travel, and daily movement.';
  if (category.includes('tank')) return 'A training tank for gym work, warm weather, and easy layering.';
  if (category.includes('water') || name.includes('bottle')) return 'An everyday training bottle for the gym bag, roadwork, and daily routine.';

  return product?.shortDesc || product?.description || 'AURA training-to-lifestyle piece.';
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
        {onBack && <button className="pd-back" onClick={onBack}>Back to Drops</button>}
      </div>
    );
  }

  const shopProduct = getShopProduct(product.slug);
  const canBuy = isShopProduct(product.slug);
  const gallery = product.gallery?.length
    ? product.gallery
    : media?.gallery?.length
      ? media.gallery
      : product.image
        ? [{ src: product.image, alt: product.name }]
        : [];

  const statusLabel = getStatusLabel(product, canBuy);
  const categoryPath = categoryRoutes[product.category] || '/drop-001';
  const collectionPath = getCollectionRoute(product);
  const collectionLabel = product.collection === 'Drop 001' ? 'View Drop 001' : 'View Drops';
  const detailCards = getProductCards(product, shopProduct);
  const cartHref = `/cart?add=${encodeURIComponent(product.slug)}`;

  return (
    <div className="pd">
      <Header />
      <main>
        <nav className="pd-nav" aria-label="Product navigation">
          {onBack && <button className="pd-back" onClick={onBack}>Back to Drops</button>}
          <span className="pd-nav-logo">AURA PRODUCT</span>
        </nav>

        <section className="pd-hero">
          <div className="pd__gallery-col">
            {gallery.length ? (
              <ProductMediaGallery gallery={gallery} productName={product.name} />
            ) : (
              <div className="pd__gallery-empty">
                <span>Preview coming soon</span>
                <strong>{product.name}</strong>
              </div>
            )}
          </div>

          <div className="pd__info">
            <p className="pd__crumb">{product.collection} / {product.category}</p>
            <h1 className="pd__name">{product.name}</h1>
            <div className="pd__commerce-row">
              <span className="pd__badge">{statusLabel}</span>
              {shopProduct?.priceEUR ? <span className="pd__price">{formatPriceEUR(shopProduct.priceEUR)}</span> : null}
            </div>

            {canBuy ? (
              <div className="pd__waitlist">
                <p className="pd__waitlist-label">Order / {product.collection}</p>
                <div className="pd__form">
                  <Link className="pd__submit" to={cartHref}>Add to Cart</Link>
                  <Link className="pd__email pd__email--link" to="/cart">View Cart</Link>
                </div>
              </div>
            ) : (
              <div className="pd__waitlist">
                <p className="pd__waitlist-label">Future Release / Updates</p>
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
                      Notify Me
                    </button>
                  </div>
                ) : <p className="pd__confirm">YOU'RE ON THE LIST.</p>}
              </div>
            )}

            <div className="pd__cta-row" aria-label="Related product links">
              <Link to={collectionPath}>{collectionLabel}</Link>
              <Link to={categoryPath}>{product.collection === 'Drop 001' ? 'Shop' : 'View'} {product.category}</Link>
            </div>

            <p className="pd__short">{getPublicDescription(product)}</p>
          </div>
        </section>

        <section className="pd-story" aria-labelledby="product-story-title">
          <p className="pd__section-label">Product story</p>
          <h2 id="product-story-title">Built into the AURA uniform.</h2>
          <p>{getCategoryRole(product.category)}</p>
          <p>{product.name} sits inside the AURA training-to-lifestyle system: comfort first, clean fit, and a theme that works beyond the gym.</p>
        </section>

        <section className="pd-detail-section" aria-labelledby="product-details-title">
          <div className="pd-section-head">
            <p className="pd__section-label">Product details</p>
            <h2 id="product-details-title">Clean, wearable, and easy to understand.</h2>
          </div>
          <div className="pd-detail-grid">
            {detailCards.map((card) => (
              <article className="pd-detail-card" key={card.title}>
                <span>{card.title}</span>
                <p>{card.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="pd-related" aria-label="Related navigation">
          <Link to={collectionPath}>{product.collection === 'Drop 001' ? 'Drop 001' : 'Drops'}</Link>
          <Link to={categoryPath}>{product.category === 'Equipment' ? 'Accessories' : product.category}</Link>
          <Link to="/cart">Cart</Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
