import { Link } from 'react-router-dom';
import '../styles/homepage-extras.css';

const categories = [
  {
    title: 'Apparel',
    href: '/apparel',
    text: 'Comfortable clothing for training, recovery, travel, and everyday life.',
    image: '/assets/products/aura-sleeveless-hoodie/card-hover-model.webp',
    imageAlt: 'AURA apparel worn as part of the training-to-lifestyle uniform',
  },
  {
    title: 'Footwear',
    href: '/footwear',
    text: 'Upcoming movement-focused footwear concepts for the next AURA phase.',
    image: '/assets/products/aura-cream-fight-boots/card-product.webp',
    imageAlt: 'AURA cream footwear preview',
  },
  {
    title: 'Accessories',
    href: '/equipment',
    text: 'Bottles, bags, and everyday carry pieces to complete the AURA look.',
    image: '/assets/products/aura-cream-boxing-gloves/card-product.webp',
    imageAlt: 'AURA accessory preview',
  },
];

export default function HomepageExtras() {
  return (
    <section className="home-extra" aria-label="AURA homepage sections">
      <div className="home-extra__section home-extra__drop">
        <div className="home-extra__drop-media" aria-hidden="true">
          <img
            src="/assets/aura-scroll/05_drop_001_tools_uniform/frame_09_cream_full_outfit_model.webp"
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="home-extra__split home-extra__split--media">
          <div className="home-extra__drop-copy">
            <div className="home-extra__kicker">DROP 001</div>
            <h2>COMFORTABLE DAILY TRAINING LAYERS</h2>
            <p>
              AURA starts with clothing you can train in, recover in, travel in, and keep wearing through the day.
            </p>
          </div>
          <div className="home-extra__copy home-extra__copy--panel">
            <p>
              T-shirts, hoodies, joggers, tank tops, and a steel water bottle form the first AURA release.
            </p>
            <Link to="/drop-001" className="home-extra__button">Explore Drop 001</Link>
          </div>
        </div>
      </div>

      <div className="home-extra__section">
        <div className="home-extra__kicker">THE UNIFORM</div>
        <div className="home-extra__category-grid">
          {categories.map((category) => (
            <Link key={category.href} to={category.href} className="home-extra__category-card">
              <img src={category.image} alt={category.imageAlt} loading="lazy" decoding="async" />
              <span>{category.title}</span>
              <p>{category.text}</p>
              <small>View {category.title}</small>
            </Link>
          ))}
        </div>
      </div>

      <div className="home-extra__section home-extra__manifesto">
        <div className="home-extra__manifesto-media" aria-hidden="true">
          <img
            src="/assets/category-support/apparel-cream-jacket.webp"
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="home-extra__manifesto-copy">
          <p className="home-extra__kicker">WHY AURA EXISTS</p>
          <h2>
            LIFE HAS
            <span>ROUNDS.</span>
          </h2>
          <div className="home-extra__manifesto-lines">
            <span>Train in comfort.</span>
            <span>Move with presence.</span>
            <span>Dress for the whole day.</span>
          </div>
          <div className="home-extra__manifesto-actions">
            <Link to="/who-we-are" className="home-extra__button home-extra__button--light">Read Story</Link>
            <Link to="/fight-club" className="home-extra__button">Join Waitlist</Link>
          </div>
        </div>
      </div>

      <div className="home-extra__section home-extra__final-cta">
        <p className="home-extra__kicker">EARLY ACCESS</p>
        <h2>JOIN THE DROP LIST.</h2>
        <p>Get early access to the first AURA release and future product updates.</p>
        <Link to="/fight-club" className="home-extra__button home-extra__button--light">Join Waitlist</Link>
      </div>
    </section>
  );
}
