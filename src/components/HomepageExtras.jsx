import { Link } from 'react-router-dom';
import '../styles/homepage-extras.css';

const categories = [
  {
    title: 'Apparel',
    href: '/apparel',
    text: 'Uniform layers for discipline, presence, and work nobody sees.',
    image: '/assets/products/aura-sleeveless-hoodie/card-hover-model.webp',
    imageAlt: 'AURA sleeveless hoodie worn as part of the training uniform',
  },
  {
    title: 'Footwear',
    href: '/footwear',
    text: 'Fight-coded silhouettes built for movement, rhythm, and daily wear.',
    image: '/assets/products/aura-cream-fight-boots/card-product.webp',
    imageAlt: 'AURA Cream Fight Boots product image',
  },
  {
    title: 'Equipment',
    href: '/equipment',
    text: 'Tools for preparation, recovery, and the ritual before the round.',
    image: '/assets/products/aura-cream-boxing-gloves/card-product.webp',
    imageAlt: 'AURA Cream Boxing Gloves product image',
  },
];

export default function HomepageExtras() {
  return (
    <section className="home-extra" aria-label="AURA Fight Club landing sections">
      <div className="home-extra__section home-extra__drop">
        <div className="home-extra__drop-media" aria-hidden="true">
          <img
            src="/assets/aura-scroll/05_drop_001_tools_uniform/frame_09_cream_full_outfit_model.png"
            alt=""
            loading="eager"
          />
        </div>
        <div className="home-extra__split home-extra__split--media">
          <div className="home-extra__drop-copy">
            <div className="home-extra__kicker">DROP 001</div>
            <h2>BUILT FOR THE INTERNAL FIGHT</h2>
            <p>
              The first release from AURA Fight Club is not merchandise. It is a uniform for the work that happens before anyone sees the result.
            </p>
          </div>
          <div className="home-extra__copy home-extra__copy--panel">
            <p>
              Discipline. Presence. Restraint. Drop 001 marks the beginning of the standard.
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
              <img src={category.image} alt={category.imageAlt} loading="eager" />
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
            src="/assets/aura-scroll/07_fight_club_close/frame_04_fight_club_tracksuit_ring.png"
            alt=""
            loading="eager"
          />
        </div>
        <div className="home-extra__manifesto-copy">
          <p className="home-extra__kicker">MANIFESTO</p>
          <h2>
            YOUR AURA
            <span>IS EARNED.</span>
          </h2>
          <div className="home-extra__manifesto-lines">
            <span>The real fight is internal.</span>
            <span>The opponent is just the mirror.</span>
            <span>Fight with presence. Own your aura.</span>
          </div>
          <div className="home-extra__manifesto-actions">
            <Link to="/drop-001" className="home-extra__button home-extra__button--light">Explore Drop 001</Link>
            <Link to="/fight-club" className="home-extra__button">Enter Fight Club</Link>
          </div>
        </div>
      </div>

      <div className="home-extra__section home-extra__previews">
        <Link to="/campaign" className="home-extra__preview-card home-extra__preview-card--campaign">
          <p className="home-extra__kicker">THE CAMPAIGN</p>
          <h3>Earned where nobody is watching.</h3>
          <span>Enter the cinematic story</span>
        </Link>
        <Link to="/fight-club" className="home-extra__preview-card home-extra__preview-card--fight">
          <p className="home-extra__kicker">FIGHT CLUB</p>
          <h3>The identity layer behind the brand.</h3>
          <span>Join the first circle</span>
        </Link>
      </div>

      <div className="home-extra__section home-extra__final-cta">
        <p className="home-extra__kicker">FOUNDING ACCESS</p>
        <h2>ENTER THE FIRST CIRCLE.</h2>
        <p>Get early access to Drop 001, Fight Club updates, and the next phase of AURA.</p>
        <Link to="/fight-club" className="home-extra__button home-extra__button--light">Join Waitlist</Link>
      </div>
    </section>
  );
}
