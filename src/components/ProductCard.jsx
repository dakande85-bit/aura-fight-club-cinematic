import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/product-card.css';

export default function ProductCard({ product, onClick }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  if (!product || product.mediaStatus !== 'live') return null;

  const statusLabel = {
    waitlist:  'Waitlist Open',
    available: 'Available Now',
    'sold-out':'Sold Out',
  }[product.status] ?? 'Coming Soon';

  const ctaLabel = product.status === 'available' ? 'View Product' : 'Join Waitlist';

  return (
    <article
      className={`pc${hovered ? ' pc--hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => { if (onClick) { onClick(product); } else { navigate(`/product/${product.slug}`); } }}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') { if (onClick) { onClick(product); } else { navigate(`/product/${product.slug}`); } } }}
      aria-label={product.name}
    >
      {/* Image area — fixed aspect ratio, no layout shift */}
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
            alt={`${product.name} — in use`}
            className="pc__img pc__img--hover"
            loading="lazy"
            draggable={false}
            aria-hidden="true"
          />
        )}
        <span className="pc__badge">{statusLabel}</span>
        <div className="pc__edge" aria-hidden="true" />
      </div>

      {/* Info */}
      <div className="pc__info">
        <p className="pc__category">{product.category} · {product.collection}</p>
        <h3 className="pc__name">{product.name}</h3>
        <p className="pc__desc">{product.shortDesc}</p>
        <span className="pc__cta">{ctaLabel} →</span>
      </div>
    </article>
  );
}
