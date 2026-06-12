import { Link } from 'react-router-dom';
import '../styles/homepage-extras.css';

const categories = [
  {
    title: 'Apparel',
    href: '/apparel',
    text: 'Uniform layers for discipline, presence, and work nobody sees.',
  },
  {
    title: 'Footwear',
    href: '/footwear',
    text: 'Fight-coded silhouettes built for movement, rhythm, and daily wear.',
  },
  {
    title: 'Equipment',
    href: '/equipment',
    text: 'Tools for preparation, recovery, and the ritual before the round.',
  },
];

export default function HomepageExtras() {
  return (
    <section className="home-extra" aria-label="AURA Fight Club landing sections">
      <div className="home-extra__section home-extra__drop">
        <div className="home-extra__kicker">DROP 001</div>
        <div className="home-extra__split">
          <div>
            <h2>BUILT FOR THE INTERNAL FIGHT</h2>
          </div>
          <div className="home-extra__copy">
            <p>
              The first release from AURA Fight Club is not merchandise. It is a uniform for the work that happens before anyone sees the result.
            </p>
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
          {categories.map(category => (
            <Link key={category.href} to={category.href} className="home-extra__category-card">
              <span>{category.title}</span>
              <p>{category.text}</p>
              <small>View {category.title} →</small>
            </Link>
          ))}
        </div>
      </div>

      <div className="home-extra__section home-extra__manifesto">
        <p className="home-extra__kicker">MANIFESTO</p>
        <blockquote>
          <span>Your aura is earned.</span>
          <span>The real fight is internal.</span>
          <span>The opponent is just the mirror.</span>
          <span>Fight with presence. Own your aura.</span>
        </blockquote>
      </div>

      <div className="home-extra__section home-extra__previews">
        <Link to="/campaign" className="home-extra__preview-card">
          <p className="home-extra__kicker">THE CAMPAIGN</p>
          <h3>Earned where nobody is watching.</h3>
          <span>Enter the cinematic story →</span>
        </Link>
        <Link to="/fight-club" className="home-extra__preview-card">
          <p className="home-extra__kicker">FIGHT CLUB</p>
          <h3>The identity layer behind the brand.</h3>
          <span>Join the first circle →</span>
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
