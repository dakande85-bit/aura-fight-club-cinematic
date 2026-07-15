import { Link } from 'react-router-dom';
import { formatPriceEUR, getShopProduct, isShopProduct } from '../data/shopProducts.js';
import { applyProductOverride } from '../data/productOverrides.js';
import '../styles/launch-product-card.css';

function getDisplayCopy(product) {
  const category = String(product?.category || '').toLowerCase();
  const name = String(product?.name || '').toLowerCase();

  if (category.includes('t-shirt')) {
    return product?.shortDesc || 'A clean everyday tee for training, recovery, travel, and casual wear.';
  }

  if (category.includes('ring gown')) {
    return product?.shortDesc || 'A personalised sleeveless ring gown for entrances, competition, and corner use.';
  }

  if (category.includes('bomber')) {
    return product?.shortDesc || 'A lightweight AURA bomber for warm-ups, travel, events, and everyday wear.';
  }

  if (category.includes('glove')) {
    return product?.shortDesc || 'Custom AURA training gloves produced after your pre-order is confirmed.';
  }

  if (category.includes('fight short')) {
    return product?.shortDesc || 'Ultra-light performance shorts for striking, grappling, conditioning, and gym work.';
  }

  if (category.includes('training set')) {
    return product?.shortDesc || 'A coordinated AURA training-to-lifestyle set.';
  }

  if (category.includes('hoodie')) {
    return product?.shortDesc || 'A comfortable AURA layer for warm-ups, rest days, travel, and everyday life.';
  }

  if (category.includes('jogger')) {
    return product?.shortDesc || 'Clean joggers for training, recovery, travel, and daily movement.';
  }

  if (category.includes('tank')) {
    return product?.shortDesc || 'A training tank for gym work, warm weather, and easy layering.';
  }

  if (category.includes('water') || name.includes('bottle')) {
    return product?.shortDesc || 'An everyday training bottle for the gym bag, roadwork, and daily routine.';
  }

  return product?.shortDesc || product?.description || 'AURA training-to-lifestyle piece.';
}

export default function LaunchProductCard({ product, compact = false }) {
  if (!product) return null;
  product = applyProductOverride(product);

  const hasImage = Boolean(product.image);
  const hasHoverImage = Boolean(product.hoverImage && product.hoverImage !== product.image);
  const cardClass = compact ? 'lpc lpc--compact' : 'lpc';
  const productHref = `/product/${encodeURIComponent(product.slug)}`;
  const shopProduct = getShopProduct(product.slug);
  const canBuy = isShopProduct(product.slug);
  const isPreorder = Boolean(shopProduct?.preorder || product.status === 'preorder');
  const statusLabel = isPreorder ? 'Pre-Order' : canBuy ? 'Available to Order' : 'Coming Soon';
  const supportLabel = canBuy && shopProduct?.priceEUR
    ? isPreorder
      ? `${formatPriceEUR(shopProduct.priceEUR)} / Made to order`
      : formatPriceEUR(shopProduct.priceEUR)
    : product.category ? `${product.category} / Waitlist` : 'Waitlist';
  const cartHref = canBuy ? `/cart?add=${encodeURIComponent(product.slug)}` : '/fight-club';
  const ctaLabel = canBuy ? (isPreorder ? 'Pre-Order' : 'Add to Cart') : 'Join Waitlist';

  return (
    <article className={cardClass}>
      <Link className="lpc__media lpc__media-link" to={productHref} aria-label={`View ${product.name}`}>
        {hasImage ? (
          <>
            <img
              className="lpc__image lpc__image--primary"
              src={product.image}
              alt={product.imageAlt || product.name}
              loading="lazy"
              decoding="async"
            />
            {hasHoverImage ? (
              <img
                className="lpc__image lpc__image--hover"
                src={product.hoverImage}
                alt={product.hoverImageAlt || `${product.name} alternate view`}
                loading="lazy"
                decoding="async"
              />
            ) : null}
          </>
        ) : (
          <div className="lpc__placeholder" aria-hidden="true">
            <strong>AURA</strong>
            <span>{product.category}</span>
          </div>
        )}
      </Link>
      <div className="lpc__body">
        <div className="lpc__meta">
          <span>{product.category}</span>
          <span>{product.audience}</span>
        </div>
        <h2><Link to={productHref}>{product.name}</Link></h2>
        <p>{getDisplayCopy(product)}</p>
        <div className="lpc__status">
          <span>{statusLabel}</span>
          <small>{supportLabel}</small>
        </div>
        <div className="lpc__actions">
          <Link className="lpc__cta lpc__cta--ghost" to={productHref}>View Product</Link>
          <Link className="lpc__cta" to={cartHref}>{ctaLabel}</Link>
        </div>
      </div>
    </article>
  );
}
