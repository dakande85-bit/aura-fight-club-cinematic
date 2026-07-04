import { Link } from 'react-router-dom';
import { formatPriceEUR, getShopProduct, isShopProduct } from '../data/shopProducts.js';
import '../styles/launch-product-card.css';

function getDisplayCopy(product) {
  const category = String(product?.category || '').toLowerCase();
  const name = String(product?.name || '').toLowerCase();

  if (category.includes('t-shirt')) {
    return 'A clean everyday tee for training, recovery, travel, and casual wear.';
  }

  if (category.includes('hoodie')) {
    return 'A comfortable AURA layer for warm-ups, rest days, travel, and everyday life.';
  }

  if (category.includes('jogger')) {
    return 'Clean joggers for training, recovery, travel, and daily movement.';
  }

  if (category.includes('tank')) {
    return 'A training tank for gym work, warm weather, and easy layering.';
  }

  if (category.includes('water') || name.includes('bottle')) {
    return 'An everyday training bottle for the gym bag, roadwork, and daily routine.';
  }

  return product?.shortDesc || product?.description || 'AURA training-to-lifestyle piece.';
}

export default function LaunchProductCard({ product, compact = false }) {
  if (!product) return null;

  const hasImage = Boolean(product.image);
  const cardClass = compact ? 'lpc lpc--compact' : 'lpc';
  const shopProduct = getShopProduct(product.slug);
  const canBuy = isShopProduct(product.slug);
  const statusLabel = canBuy ? 'Available to Order' : 'Coming Soon';
  const supportLabel = canBuy && shopProduct?.priceEUR
    ? formatPriceEUR(shopProduct.priceEUR)
    : product.category ? `${product.category} / Waitlist` : 'Waitlist';
  const ctaLabel = canBuy ? 'Add to Cart' : 'Join Waitlist';
  const ctaHref = canBuy ? `/cart?add=${encodeURIComponent(product.slug)}` : '/fight-club';

  return (
    <article className={cardClass}>
      <div className="lpc__media">
        {hasImage ? (
          <img src={product.image} alt={product.imageAlt || product.name} loading="lazy" decoding="async" />
        ) : (
          <div className="lpc__placeholder" aria-label={`${product.name} preview artwork pending`}>
            <strong>AURA</strong>
            <span>{product.category}</span>
          </div>
        )}
      </div>
      <div className="lpc__body">
        <div className="lpc__meta">
          <span>{product.category}</span>
          <span>{product.audience}</span>
        </div>
        <h2>{product.name}</h2>
        <p>{getDisplayCopy(product)}</p>
        <div className="lpc__status">
          <span>{statusLabel}</span>
          <small>{supportLabel}</small>
        </div>
        <Link className="lpc__cta" to={ctaHref}>{ctaLabel}</Link>
      </div>
    </article>
  );
}
