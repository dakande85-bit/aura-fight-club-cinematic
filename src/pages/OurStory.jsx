import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/our-story.css';

const JOURNEY = [
  {
    number: '01',
    label: 'ROADWORK',
    title: 'MILES BEFORE THE GYM',
    body: 'Roadwork sets the baseline: lungs, legs, posture, and discipline. AURA is built for the training hours that shape how the body moves and how the frame carries clothing.',
    micro: 'Start with the base.',
    image: '/assets/our-story/our-story-01-roadwork.webp',
    alt: 'AURA fighter running through a cold mountain road at dawn',
  },
  {
    number: '02',
    label: 'SHADOW BOXING',
    title: 'CONTROL BEFORE CONTACT',
    body: 'Shadow boxing is where balance, rhythm, range, and shape are refined. The same idea guides the clothing: minimal pieces that do not fight the movement.',
    micro: 'Move clean first.',
    image: '/assets/our-story/our-story-02-shadow-boxing.webp',
    alt: 'AURA fighter shadow boxing in black training gear near the coast',
  },
  {
    number: '03',
    label: 'STRENGTH',
    title: 'STRUCTURE THAT SHOWS',
    body: 'Strength changes posture and silhouette. AURA pieces are designed to work with the frame: shoulders, chest, waist, legs, and the way a person stands after training.',
    micro: 'Fit follows structure.',
    image: '/assets/our-story/our-story-03-strength.webp',
    alt: 'AURA fighter performing strength work on a pull-up bar at dawn',
  },
  {
    number: '04',
    label: 'RHYTHM',
    title: 'LIGHT FEET, CLEAN FIT',
    body: 'Skipping teaches timing, coordination, and relaxed control. The product direction is the same: comfortable enough to move in, sharp enough to keep on after training.',
    micro: 'Comfort removes noise.',
    image: '/assets/our-story/our-story-04-rhythm.webp',
    alt: 'AURA fighter skipping rope in black training gear above a city at sunrise',
  },
  {
    number: '05',
    label: 'POWER',
    title: 'CONTROLLED OUTPUT',
    body: 'Power works only when the structure is right. AURA is not built around loud graphics. It is built around silhouette, restraint, and the confidence that comes from feeling put together.',
    micro: 'No wasted movement.',
    image: '/assets/our-story/our-story-05-heavy-bag.webp',
    alt: 'AURA fighter training with impact and controlled power in a dark gym',
  },
  {
    number: '06',
    label: 'PRECISION',
    title: 'DETAILS MATTER',
    body: 'Small details change the whole impression: sleeve length, shoulder shape, taper, weight, and where the branding sits. AURA is designed to stay minimal but intentional.',
    micro: 'Clean details. Better presence.',
    image: '/assets/our-story/our-story-06-precision.webp',
    alt: 'AURA fighter training precision with a reflex ball in a cinematic gym',
  },
  {
    number: '07',
    label: 'PREPARATION',
    title: 'READY WITHOUT EXCESS',
    body: 'The goal is not costume fightwear. The goal is clothing that feels ready: training, recovery, travel, and daily life without changing identity between each one.',
    micro: 'Train in it. Live in it.',
    image: '/assets/our-story/our-story-07-preparation.webp',
    alt: 'AURA fighter wrapping hands in a dark locker room before training',
  },
  {
    number: '08',
    label: 'SPARRING',
    title: 'TESTED UNDER PRESSURE',
    body: 'Sparring shows what holds up. AURA will grow the same way: pieces stay in development until fit, materials, and quality match the standard.',
    micro: 'Approval before release.',
    image: '/assets/our-story/our-story-08-sparring.webp',
    alt: 'Two AURA fighters sparring in a dark boxing ring',
  },
  {
    number: '09',
    label: 'ARRIVAL',
    title: 'CARRY IT OUTSIDE',
    body: 'The work changes how you carry yourself. AURA is for that space after training too: clean, minimal clothing that keeps the same presence outside the gym.',
    micro: 'Carry your aura.',
    image: '/assets/our-story/our-story-09-arrival.webp',
    alt: 'AURA fighter moving toward the final stage of the journey at dawn',
  },
];

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
            <p className="os-eyebrow">AURA FIGHT CLUB / BRAND PHILOSOPHY</p>
            <h1 id="our-story-title">{title}</h1>
            <p className="os-hero__subtitle">FIT. COMFORT. PRESENCE.</p>
            <p className="os-hero__copy">
              AURA Fight Club was built from a simple problem: finding minimal training clothes that fit well, feel comfortable, and bring out the physique without looking loud or generic.
            </p>
            <p className="os-hero__micro">Train in it. Live in it. Carry it.</p>
          </div>

          <StoryImage
            src="/assets/our-story/our-story-08-sparring.webp"
            alt="AURA fighters sparring in a dark cinematic gym"
            eager
          />
        </section>

        <section className="os-origin" aria-labelledby="origin-title">
          <div className="os-section-head">
            <p className="os-eyebrow">ORIGIN</p>
            <h2 id="origin-title">THE FIT CHANGES THE FEEL</h2>
          </div>
          <div className="os-origin__copy">
            <p>
              Most training clothes are either too plain, too loud, badly fitted, or built only for the gym. AURA sits between boxing, training, and lifestyle: pieces made to move well, fit clean, and carry outside of training.
            </p>
            <p>
              When clothing feels right, you carry yourself differently. Comfort removes distraction. A clean silhouette builds confidence. Confidence and control create aura.
            </p>
          </div>
        </section>

        <section className="os-journey" aria-labelledby="journey-title">
          <div className="os-journey__intro">
            <p className="os-eyebrow">TRAINING TO LIFESTYLE</p>
            <h2 id="journey-title">THE SYSTEM BEHIND THE PRODUCT</h2>
            <p>
              AURA is designed around the whole training rhythm: roadwork, gym work, recovery, movement, and the hours after. The clothes should support the work and still look composed outside it.
            </p>
          </div>

          <div className="os-stage-list">
            {JOURNEY.map((scene) => (
              <article className="os-stage" key={scene.number}>
                <StoryImage src={scene.image} alt={scene.alt} />
                <div className="os-stage__copy">
                  <div className="os-stage__meta">
                    <span>{scene.number}</span>
                    <p>{scene.label}</p>
                  </div>
                  <h3>{scene.title}</h3>
                  <p>{scene.body}</p>
                  <strong>{scene.micro}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="os-manifesto" aria-labelledby="manifesto-title">
          <p className="os-eyebrow">DESIGN STANDARD</p>
          <h2 id="manifesto-title">AURA IS CARRIED</h2>
          <div className="os-manifesto__copy">
            <p>Minimal branding.</p>
            <p>Strong silhouette.</p>
            <p>Comfortable movement.</p>
            <p>Training-to-lifestyle versatility.</p>
            <p>Pieces that bring out the frame without shouting.</p>
            <p>The real fight is internal.</p>
            <p>Your aura is earned.</p>
          </div>
        </section>

        <section className="os-closing" aria-labelledby="closing-title">
          <p className="os-eyebrow">AURA FIGHT CLUB</p>
          <h2 id="closing-title">MOVE WITH PRESENCE</h2>
          <p>
            AURA is built for people who want training clothes that feel comfortable, fit clean, and make them feel composed before, during, and after the work.
          </p>
          <div className="os-actions" aria-label="Our Story actions">
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
