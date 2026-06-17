import { Link } from 'react-router-dom';

function HeroCta({ item }) {
  if (!item) return null;
  const className = `ph-btn ph-btn--${item.variant || 'ghost'}`;

  if (item.href || item.to?.startsWith('#')) {
    return (
      <a href={item.href || item.to} className={className}>
        {item.label}
      </a>
    );
  }

  return (
    <Link to={item.to} className={className}>
      {item.label}
    </Link>
  );
}

export default function PageHero({
  label,
  headline,
  copy,
  ctas = [],
  image,
  imageAlt = '',
  imagePosition = 'center center',
  imageFit = 'contain',
  imageScale = 1,
  align = 'left',
  className = '',
}) {
  const lines = String(headline || '').split('\n').filter(Boolean);
  const safeImagePosition = imagePosition || 'center center';
  const safeImageFit = imageFit || 'contain';
  const safeImageScale = Number(imageScale) || 1;
  const heroStyle = {
    '--ph-image-position': safeImagePosition,
    '--ph-image-fit': safeImageFit,
    '--ph-image-scale': safeImageScale,
  };

  return (
    <section className={`ph ph--${align} ${className}`.trim()} style={heroStyle}>
      {image && (
        <div className="ph__media" aria-hidden={imageAlt ? undefined : true}>
          <img
            className="ph__image"
            src={image}
            alt={imageAlt}
            loading="eager"
            decoding="async"
          />
        </div>
      )}

      <div className="ph__scrim" aria-hidden="true" />

      <div className="ph__content">
        {label && <p className="ph__label">{label}</p>}
        {lines.length > 0 && (
          <h1 className="ph__headline">
            {lines.map(line => (
              <span key={line}>{line}</span>
            ))}
          </h1>
        )}
        {copy && <p className="ph__copy">{copy}</p>}
        {ctas.length > 0 && (
          <div className="ph__ctas">
            {ctas.map(item => (
              <HeroCta key={item.label} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
