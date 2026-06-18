import { useNavigate } from 'react-router-dom';
import { useProductMedia } from '../hooks/useProductMedia.js';
import '../styles/product-card.css';

function toClassKey(value) {
  return String(value || 'uncategorized')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'uncategorized';
}

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { media } = useProductMedia(product?.slug);

  if (!product || product.mediaStatus !== 'live') return null;

  // Supabase deterministic slot media (v2 hook):
  //   cardImage  = clean_product_shot (contain) or hero_product_dark (contain)
  //   hoverImage = model_full_outfit (cover) — null if slot is empty
  // Local webp fallback for legacy products if Supabase returns nothing
  const cardImage  = media?.cardImage  ?? product.image;
  const hoverImage = media?.hoverImage ?? product.hoverImage ?? null;
  // Only swap on hover if we have a confirmed model/outfit image
  const hasHover   = Boolean(hoverImage);

  const categoryKey = toClassKey(product.category);
  const collectionKey = toClassKey(product.collection);

  const statusLabel = {
    waitlist:     'Waitlist Open',
    available:    'Available Now',
    'sold-out':   'Sold Out',
    'coming-soon':'Coming Soon',
  }[product.status] ?? 'Coming Soon';

  return (
    <article
      className={`pc pc--category-${categoryKey} pc--collection-${collectionKey}${hasHover ? ' pc--has-hover' : ''}`}
      data-category={categoryKey}
      data-collection={collectionKey}
      onClick={() => navigate(`/product/${product.slug}`)}
      onKeyDown={e => e.key === 'Enter' && navigate(`/product/${product.slug}`)}
      role="button"
      tabIndex={0}
      aria-label={`${product.name} — ${statusLabel}`}
    >
      <div className="pc__media">
        {/* Primary: clean product shot — always object-fit: contain */}
        {cardImage && (
          <img
            src={cardImage}
            alt={product.name}
            className="pc__img pc__img--primary"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        )}
        {/* Hover: model/outfit shot — only rendered if slot is filled */}
        {hasHover && (
          <img
            src={hoverImage}
            alt=""
            className="pc__img pc__img--hover"
            loading="lazy"
            decoding="async"
            draggable={false}
            aria-hidden="true"
          />
        )}
        <span className="pc__collection">{product.collection}</span>
      </div>
      <div className="pc__info">
        <p className="pc__category">{product.category}</p>
        <h3 className="pc__name">{product.name}</h3>
        <p className="pc__desc">{product.shortDesc}</p>
        <div className="pc__footer">
          <span className="pc__status">{statusLabel}</span>
          <span className="pc__cta">View <span className="pc__cta-arrow">→</span></span>
        </div>
      </div>
    </article>
  );
}
