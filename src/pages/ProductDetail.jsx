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
  'Training Set': '/apparel',
  'T-Shirt': '/apparel',
  Hoodie: '/apparel',
  'Sleeveless Hoodie': '/apparel',
  'Ring Gown': '/apparel',
  'Bomber Jacket': '/apparel',
  'Fight Shorts': '/apparel',
  'Boxing Gloves': '/equipment',
  Joggers: '/apparel',
  'Tank Top': '/apparel',
  'Training Shorts': '/apparel',
  'Steel Water Bottle': '/equipment',
};

function getStatusLabel(product, canBuy, shopProduct) {
  if (shopProduct?.preorder || product?.status === 'preorder') return 'Pre-Order';
  if (canBuy) return 'Available to Order';
  return {
    waitlist: 'Waitlist Open',
    available: 'Available Now',
    'sold-out': 'Sold Out',
    'coming-soon': 'Coming Soon',
  }[product?.status] ?? 'Coming Soon';
}

function getCollectionRoute(product) {
  if (product?.collection === 'Pre-Order') {
    return product?.department === 'Equipment' ? '/equipment' : '/apparel';
  }
  return product?.collection === 'Drop 001' ? '/drop-001' : '/drops';
}

function getCategoryRole(category) {
  return {
    Apparel: 'A comfortable training-to-lifestyle layer for the hours before, during, and after the work.',
    'Training Set': 'A coordinated hoodie-and-jogger uniform for training, recovery, travel, and everyday wear.',
    'T-Shirt': 'A clean everyday tee for training, recovery, travel, and casual wear.',
    Hoodie: 'A comfortable layer for warm-ups, rest days, travel, and daily life.',
    'Sleeveless Hoodie': 'A sleeveless training layer for warm-ups, gym work, travel, and daily movement.',
    'Ring Gown': 'A personalised entrance and corner layer built for competition nights and fighter identity.',
    'Bomber Jacket': 'A lightweight outer layer for warm-ups, events, travel, and everyday wear.',
    'Fight Shorts': 'Ultra-light performance shorts for striking, grappling, conditioning, and unrestricted movement.',
    'Boxing Gloves': 'Custom training equipment produced around the fighter’s selected weight and colourway.',
    Joggers: 'Clean joggers for training, recovery, travel, and daily movement.',
    'Tank Top': 'A training tank for gym work, warm weather, and easy layering.',
    'Training Shorts': 'Custom training shorts for movement, warm weather, gym work, and the daily training uniform.',
    'Steel Water Bottle': 'An everyday training bottle for the gym bag, roadwork, and daily routine.',
    Footwear: 'An upcoming movement piece for footwork, travel, and everyday styling.',
    Equipment: 'An accessory category for the daily routine: useful pieces that complete the AURA uniform.',
  }[category] || 'A piece built to sit inside the AURA training and lifestyle system.';
}

function getProductCards(product, shopProduct) {
  const isPreorder = Boolean(shopProduct?.preorder || product?.status === 'preorder');

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
      title: isPreorder ? 'Delivery' : 'Use',
      copy: isPreorder ? (shopProduct?.leadTime || 'Estimated 5-7 weeks') : 'Built for training, recovery, travel, and everyday life.',
    },
    {
      title: isPreorder ? 'Production' : 'Identity',
      copy: isPreorder
        ? 'Made after payment and final size, colour, and personalisation details are confirmed.'
        : 'Clean, minimal AURA styling with a training-to-lifestyle purpose.',
    },
  ];
}

function getPublicDescription(product) {
  const category = String(product?.category || '').toLowerCase();
  const name = String(product?.name || '').toLowerCase();

  if (category.includes('training set')) return product?.shortDesc || 'A coordinated AURA training-to-lifestyle set.';
  if (category.includes('t-shirt')) return product?.shortDesc || 'A clean everyday tee for training, recovery, travel, and casual wear.';
  if (category.includes('ring gown')) return product?.shortDesc || 'A personalised sleeveless ring gown for entrances, competition, and corner use.';
  if (category.includes('bomber')) return product?.shortDesc || 'A lightweight AURA bomber for warm-ups, travel, events, and everyday wear.';
  if (category.includes('glove')) return product?.shortDesc || 'Custom AURA training gloves produced after your pre-order is confirmed.';
  if (category.includes('fight short')) return product?.shortDesc || 'Ultra-light performance shorts for striking, grappling, conditioning, and gym work.';
  if (category.includes('sleeveless')) return product?.shortDesc || 'A sleeveless AURA layer for warm-ups, gym work, travel, and daily movement.';
  if (category.includes('hoodie')) return product?.shortDesc || 'A comfortable AURA layer for warm-ups, rest days, travel, and everyday life.';
  if (category.includes('jogger')) return product?.shortDesc || 'Clean joggers for training, recovery, travel, and daily movement.';
  if (category.includes('tank')) return product?.shortDesc || 'A training tank for gym work, warm weather, and easy layering.';
  if (category.includes('short')) return product?.shortDesc || 'Custom training shorts for movement, warm weather, and gym work.';
  if (category.includes('water') || name.includes('bottle')) return product?.shortDesc || 'An everyday training bottle for the gym bag, roadwork, and daily routine.';

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
  const isPreorder = Boolean(shopProduct?.preorder || product.status === 'preorder');
  const gallery = product.gallery?.length
    ? product.gallery
    : media?.gallery?.length
      ? media.gallery
      : product.image
        ? [{ src: product.image, alt: product.name }]
        : [];

  const statusLabel = getStatusLabel(product, canBuy, shopProduct);
  const categoryPath = categoryRoutes[product.category] || (product.department === 'Equipment' ? '/equipment' : '/apparel');
  const collectionPath = getCollectionRoute(product);
  const collectionLabel = product.collection === 'Drop 001'
    ? 'View Drop 001'
    : product.collection === 'Pre-Order' ? 'View Pre-Orders' : 'View Drops';
  const detailCards = getProductCards(product, shopProduct);
  const cartHref = `/cart?add=${encodeURIComponent(product.slug)}`;
  const purchaseOptions = Array.isArray(product.purchaseOptions) ? product.purchaseOptions : [];

  return (
    <div className="pd">
      <Header />
      <main>
        <nav className="pd-nav" aria-label="Product navigation">
          {onBack && <button className="pd-back" onClick={onBack}>Back</button>}
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
              <div className="pd__purchase">
                <p className="pd__waitlist-label">
                  {isPreorder ? 'Pre-Order / Made to Order' : `Order / ${product.collection}`}
                </p>
                {isPreorder ? (
                  <p className="pd__short">
                    Production begins after payment and final specifications are confirmed. {shopProduct?.leadTime || 'Estimated delivery: 5-7 weeks.'}
                  </p>
                ) : null}
                <div className="pd__buy-actions">
                  <Link className="pd__buy-btn pd__buy-btn--primary" to={cartHref}>{isPreorder ? 'Pre-Order Now' : 'Add to Cart'}</Link>
                  <Link className="pd__buy-btn pd__buy-btn--ghost" to="/cart">View Cart</Link>
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

            {purchaseOptions.length > 0 ? (
              <div className="pd__purchase">
                <p className="pd__waitlist-label">Buy as a set or separately</p>
                <p className="pd__short">Choose the complete coordinated set, the hoodie only, or the joggers only.</p>
                <div className="pd__buy-actions">
                  {purchaseOptions.map((option) => (
                    <Link
                      key={option.slug}
                      className={`pd__buy-btn ${option.slug === product.slug ? 'pd__buy-btn--primary' : 'pd__buy-btn--ghost'}`}
                      to={`/cart?add=${encodeURIComponent(option.slug)}`}
                    >
                      {option.label} · {formatPriceEUR(option.priceEUR)}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="pd__cta-row" aria-label="Related product links">
              <Link to={collectionPath}>{collectionLabel}</Link>
              <Link to={categoryPath}>{product.collection === 'Drop 001' ? 'Shop' : 'View'} {product.department || product.category}</Link>
            </div>

            <p className="pd__short">{getPublicDescription(product)}</p>
          </div>
        </section>

        <section className="pd-story" aria-labelledby="product-story-title">
          <p className="pd__section-label">Product story</p>
          <h2 id="product-story-title">Built into the AURA uniform.</h2>
          <p>{getCategoryRole(product.category)}</p>
          <p>{product.name} sits inside the AURA training-to-lifestyle system: purposeful construction, clean identity, and a role beyond the gym.</p>
          {product.materialNote ? <p>{product.materialNote}</p> : null}
        </section>

        <section className="pd-detail-section" aria-labelledby="product-details-title">
          <div className="pd-section-head">
            <p className="pd__section-label">Product details</p>
            <h2 id="product-details-title">Clear specifications before production.</h2>
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
          <Link to={collectionPath}>{product.collection === 'Drop 001' ? 'Drop 001' : product.collection}</Link>
          <Link to={categoryPath}>{product.department === 'Equipment' ? 'Equipment' : 'Apparel'}</Link>
          <Link to="/cart">Cart</Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
