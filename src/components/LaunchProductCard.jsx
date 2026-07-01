import { Link } from 'react-router-dom';
import '../styles/launch-product-card.css';

export default function LaunchProductCard({ product, compact = false }) {
  if (!product) return null;

  const hasImage = Boolean(product.image);
  const cardClass = compact ? 'lpc lpc--compact' : 'lpc';

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
        <p>{product.description}</p>
        <div className="lpc__status">
          <span>{product.status}</span>
          <small>{product.secondaryLabel}</small>
        </div>
        <Link className="lpc__cta" to="/fight-club">Join Waitlist</Link>
      </div>
    </article>
  );
}
