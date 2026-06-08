import { useNavigate } from 'react-router-dom';
import '../styles/product-card.css';

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  if (!product || product.mediaStatus !== 'live') return null;

  const statusLabel = {
    waitlist:  'Waitlist Open',
    available: 'Available Now',
    'sold-out': 'Sold Out',
  }[product.status] ?? 'Coming Soon';

  return (
    <article
      className="pc"
      onClick={() => navigate(`/product/${product.slug}`)}
      onKeyDown={e => e.key === 'Enter' && navigate(`/product/${product.slug}`)}
      role="button"
      tabIndex={0}
      aria-label={`${product.name} — ${statusLabel}`}
    >
      {/* Image area — 3:4 ratio, no layout shift */}
      <div className="pc__media">
        <img
          src={product.image}
          alt={product.name}
          className="pc__img pc__img--primary"
          loading="lazy"
          draggable={false}
        />
        {product.hoverImage && (
          <img
            src={product.hoverImage}
            alt=""
            className="pc__img pc__img--hover"
            loading="lazy"
            draggable={false}
            aria-hidden="true"
          />
        )}
        <span className="pc__collection">{product.collection}</span>
      </div>

      {/* Info */}
      <div className="pc__info">
        <p className="pc__category">{product.category}</p>
        <h3 className="pc__name">{product.name}</h3>
        <p className="pc__desc">{product.shortDesc}</p>
        <div className="pc__footer">
          <span className="pc__status">{statusLabel}</span>
          <span className="pc__cta">
            View <span className="pc__cta-arrow">→</span>
          </span>
        </div>
      </div>
    </article>
  );
}
