export default function ProductRevealCard({ product }) {
  if (!product.image) return null;

  return (
    <article className="product-card">
      <div className="product-card__img-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="product-card__img product-card__img--primary"
          loading="lazy"
          decoding="async"
        />
        {product.hoverImage && (
          <img
            src={product.hoverImage}
            alt={`${product.name} in use`}
            className="product-card__img product-card__img--hover"
            loading="lazy"
            decoding="async"
          />
        )}
        <span className="product-card__status">Waitlist Open</span>
        <div className="product-card__light-edge" aria-hidden="true" />
      </div>
      <div className="product-card__info">
        <p className="product-card__cat">{product.category}</p>
        <h3 className="product-card__name">{product.name}</h3>
        <span className="product-card__cta">Join Waitlist →</span>
      </div>
    </article>
  );
}
