import Header from './Header.jsx';

const HERO_IMAGE = '/assets/aura-scroll/05_drop_001_tools_uniform/frame_09_cream_full_outfit_model.png';

export default function HomeStaticHero() {
  return (
    <section className="home-static" aria-label="AURA Fight Club homepage hero">
      <Header />
      <div className="home-static__stage">
        <div className="home-static__media" aria-hidden="true">
          <img src={HERO_IMAGE} alt="" loading="eager" decoding="async" />
        </div>
        <div className="home-static__scrim" aria-hidden="true" />
        <div className="home-static__content">
          <p className="home-static__eyebrow">AURA FIGHT CLUB</p>
          <h1>YOUR AURA<br />IS EARNED.</h1>
          <p className="home-static__copy">The real fight is internal.<br />The opponent is just the mirror.</p>
          <div className="home-static__actions">
            <a className="home-static__button home-static__button--primary" href="/drop-001">Explore Drop 001</a>
            <a className="home-static__button home-static__button--secondary" href="/fight-club">Enter Fight Club</a>
          </div>
        </div>
      </div>
    </section>
  );
}
