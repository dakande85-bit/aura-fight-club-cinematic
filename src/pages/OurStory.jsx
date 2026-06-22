import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/our-story.css';

const JOURNEY = [
  {
    number: '01',
    label: 'ROADWORK',
    title: 'THE ROAD BEFORE THE WORLD WAKES',
    body: 'Before the noise, before the gym, before the gloves are tied, the fighter moves. Roadwork is where the lungs open, the legs harden, and the mind learns to keep going without applause.',
    micro: 'Discipline starts in silence.',
    image: '/assets/our-story/our-story-01-roadwork.webp',
    alt: 'AURA fighter running through a cold mountain road at dawn',
  },
  {
    number: '02',
    label: 'SHADOW BOXING',
    title: 'FIGHTING THE INVISIBLE OPPONENT',
    body: 'Shadow boxing is where rhythm becomes identity. Every step, feint, slip, and counter is rehearsed before pressure arrives. The fighter learns to move with control before the opponent is even real.',
    micro: 'The opponent is just the mirror.',
    image: '/assets/our-story/our-story-02-shadow-boxing.webp',
    alt: 'AURA fighter shadow boxing in black training gear near the coast',
  },
  {
    number: '03',
    label: 'STRENGTH',
    title: 'BUILT BEFORE IT IS SEEN',
    body: 'Strength is not decoration. It is posture, structure, control, and the ability to hold form under pressure. The body becomes armour because the work is repeated when nobody cares.',
    micro: 'Built by repetition.',
    image: '/assets/our-story/our-story-03-strength.webp',
    alt: 'AURA fighter performing strength work on a pull-up bar at dawn',
  },
  {
    number: '04',
    label: 'RHYTHM',
    title: 'THE ROPE TEACHES TIMING',
    body: 'Skipping is not warm-up. It is rhythm, breath, balance, and footwork. The fighter learns to stay light, calm, and sharp while fatigue tries to steal coordination.',
    micro: 'Timing beats speed.',
    image: '/assets/our-story/our-story-04-rhythm.webp',
    alt: 'AURA fighter skipping rope in black training gear above a city at sunrise',
  },
  {
    number: '05',
    label: 'POWER',
    title: 'EVERY SHOT HAS A COST',
    body: 'The heavy bag does not lie. It records every weakness in balance, breath, and intention. Power is not anger. Power is structure, timing, and the discipline to hit with purpose.',
    micro: 'Pressure tested.',
    image: '/assets/our-story/our-story-05-heavy-bag.webp',
    alt: 'AURA fighter training with impact and controlled power in a dark gym',
  },
  {
    number: '06',
    label: 'PRECISION',
    title: 'CONTROL THE SMALL THINGS',
    body: 'The ceiling ball sharpens what the crowd barely notices - eyes, timing, patience, and touch. Precision is the difference between movement and mastery.',
    micro: 'Control creates aura.',
    image: '/assets/our-story/our-story-06-precision.webp',
    alt: 'AURA fighter training precision with a reflex ball in a cinematic gym',
  },
  {
    number: '07',
    label: 'PREPARATION',
    title: 'THE QUIET RITUAL',
    body: 'Wrapping the hands is the final private act before contact. It is protection, intention, and transition. The fighter leaves the ordinary world and enters the fight.',
    micro: 'Prepare like it matters.',
    image: '/assets/our-story/our-story-07-preparation.webp',
    alt: 'AURA fighter wrapping hands in a dark locker room before training',
  },
  {
    number: '08',
    label: 'SPARRING',
    title: 'THE TEST BEFORE THE TEST',
    body: 'Sparring exposes what training hides. Distance, fear, timing, ego, and composure all reveal themselves under pressure. This is where the fighter learns who he is when the answer comes back.',
    micro: 'Composure under fire.',
    image: '/assets/our-story/our-story-08-sparring.webp',
    alt: 'Two AURA fighters sparring in a dark boxing ring',
  },
  {
    number: '09',
    label: 'ARRIVAL',
    title: 'THE WALK INTO DESTINY',
    body: 'By the time the fighter walks to the ring, the story is already written. The crowd sees the entrance. The fighter carries the miles, the rounds, the sacrifice, and the silence.',
    micro: 'Your aura is earned.',
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
            <p className="os-eyebrow">AURA FIGHT CLUB / OUR STORY</p>
            <h1 id="our-story-title">{title}</h1>
            <p className="os-hero__subtitle">DISCIPLINE. SACRIFICE. DESTINY.</p>
            <p className="os-hero__copy">
              AURA Fight Club was built for the fighter before the fight - the unseen miles, the silent rounds, the private pressure, and the decision to become someone different before anyone else sees it.
            </p>
            <p className="os-hero__micro">Your aura is earned.</p>
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
            <h2 id="origin-title">THE REAL FIGHT IS INTERNAL</h2>
          </div>
          <div className="os-origin__copy">
            <p>
              The opponent is only the mirror. Before the lights, before the crowd, before the first bell, the real fight has already started. It starts when nobody is watching. It starts when the body is tired, the mind is loud, and the easy choice is still available.
            </p>
            <p>
              AURA exists for that moment. The moment a fighter chooses discipline over emotion, repetition over comfort, and presence over noise.
            </p>
          </div>
        </section>

        <section className="os-journey" aria-labelledby="journey-title">
          <div className="os-journey__intro">
            <p className="os-eyebrow">THE WARRIOR JOURNEY</p>
            <h2 id="journey-title">NINE STAGES BEFORE THE BELL</h2>
            <p>
              Every fighter carries a story the crowd never sees. These are the stages that build the aura before the arena ever feels it.
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
          <p className="os-eyebrow">MANIFESTO</p>
          <h2 id="manifesto-title">AURA IS NOT GIVEN</h2>
          <div className="os-manifesto__copy">
            <p>AURA is not confidence. It is evidence.</p>
            <p>Evidence of the miles.</p>
            <p>Evidence of the rounds.</p>
            <p>Evidence of the sacrifices nobody saw.</p>
            <p>Evidence of the person you became before the world had permission to notice.</p>
            <p>The real fight is internal.</p>
            <p>The opponent is just the mirror.</p>
            <p>Your aura is earned.</p>
          </div>
        </section>

        <section className="os-closing" aria-labelledby="closing-title">
          <p className="os-eyebrow">AURA FIGHT CLUB</p>
          <h2 id="closing-title">FIGHT WITH PRESENCE</h2>
          <p>
            AURA Fight Club is built for the ones who train before the lights, move before the crowd, and carry discipline into every room they enter.
          </p>
          <div className="os-actions" aria-label="Our Story actions">
            <a className="os-btn os-btn--primary" href="/drop-001">EXPLORE DROP 001</a>
            <a className="os-btn os-btn--ghost" href="/fight-club">ENTER FIGHT CLUB</a>
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
