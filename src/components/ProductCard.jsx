import { useNavigate } from 'react-router-dom';
import { useProductMedia } from '../hooks/useProductMedia.js';
import '../styles/product-card.css';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { media } = useProductMedia(product?.slug);

  if (!product || product.mediaStatus !== 'live') return null;

  // Supabase approved media takes priority; fall back to local webp
  const cardImage  = media?.cardImage  ?? product.image;
  const hoverImage = media?.hoverImage ?? product.hoverImage;

  const statusLabel = {
    waitlist:   'Waitlist Open',
    available:  'Available Now',
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
      <div className="pc__media">
        <img
          src={cardImage}
          alt={product.name}
          className="pc__img pc__img--primary"
          loading="lazy"
          draggable={false}
        />
        {hoverImage && (
          <img
            src={hoverImage}
            alt=""
            className="pc__img pc__img--hover"
            loading="lazy"
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
