import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/our-story.css';

function StoryImage({ src, alt, eager = false }) {
  function markFallback(event) {
    event.currentTarget.closest('.os-image-shell')?.classList.add('os-image-shell--fallback');
    event.currentTarget.hidden = true;
  }

  return (
    <div className="os-image-shell">
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={eager ? 'high' : 'auto'}
        onError={markFallback}
      />
    </div>
  );
}

export function WhoWeAreSections({ title = 'WHO WE ARE' }) {
  return (
    <main id="who-we-are">
      <section className="os-hero" aria-labelledby="our-story-title">
        <div className="os-hero__content">
          <p className="os-eyebrow">AURA / BRAND STORY</p>
          <h1 id="our-story-title">{title}</h1>
          <p className="os-hero__subtitle">COMFORT. MOVEMENT. PRESENCE.</p>
          <p className="os-hero__copy">
            AURA was created for training clothes that feel comfortable, fit clean, and still work outside the gym.
          </p>
          <p className="os-hero__micro">Train in it. Live in it. Carry it.</p>
        </div>
        <StoryImage
          src="/assets/aura-scroll/05_drop_001_tools_uniform/frame_09_cream_full_outfit_model.webp"
          alt="AURA cream outfit on model"
          eager
        />
      </section>

      <section className="os-origin" aria-labelledby="origin-title">
        <div className="os-section-head">
          <p className="os-eyebrow">ORIGIN</p>
          <h2 id="origin-title">WHY AURA EXISTS</h2>
        </div>
        <div className="os-origin__copy">
          <p>AURA sits between training and lifestyle: comfortable pieces with a clean look and a strong identity.</p>
          <p>The aim is simple: clothing and accessories for the gym, recovery, travel, and everyday life.</p>
        </div>
      </section>

      <section className="os-manifesto" aria-labelledby="manifesto-title">
        <p className="os-eyebrow">DESIGN STANDARD</p>
        <h2 id="manifesto-title">A UNIFORM FOR THE DAY</h2>
        <div className="os-manifesto__copy">
          <p>Comfortable movement.</p>
          <p>Clean silhouettes.</p>
          <p>Minimal branding.</p>
          <p>Training-to-lifestyle versatility.</p>
          <p>Accessories that complete the look.</p>
        </div>
      </section>

      <section className="os-closing" aria-labelledby="closing-title">
        <p className="os-eyebrow">AURA</p>
        <h2 id="closing-title">BUILT FOR THE WHOLE DAY.</h2>
        <p>Comfortable clothing first. Strong identity always.</p>
        <div className="os-actions" aria-label="Story actions">
          <a className="os-btn os-btn--primary" href="/drop-001">EXPLORE DROP 001</a>
          <a className="os-btn os-btn--ghost" href="/fight-club">JOIN WAITLIST</a>
        </div>
      </section>
    </main>
  );
}

export default function OurStory() {
  return (
    <div className="os-page">
      <Header />
      <WhoWeAreSections />
      <Footer />
    </div>
  );
}
