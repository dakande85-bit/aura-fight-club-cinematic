import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/our-story.css';
import '../styles/our-story-expanded.css';

const pillars = [
  {
    title: 'NEWS',
    copy: 'Independent boxing news, analysis, rankings, fight build-up and reaction — with enough context to explain why the story matters.',
  },
  {
    title: 'YOUTUBE',
    copy: 'Original video stories, interviews, breakdowns, documentaries and opinion built for people who want more than clips and headlines.',
  },
  {
    title: 'LIFESTYLE',
    copy: 'The culture around the fight game: style, training, design and limited member-led concepts inspired by boxing without becoming generic merch.',
  },
  {
    title: 'COMMUNITY',
    copy: 'A place for boxing people to follow the sport, debate the big questions and become part of what AURA builds next.',
  },
];

const platformCards = [
  {
    title: 'Read',
    copy: 'Breaking stories, credible reporting, strong opinion and deeper features across the global fight game.',
    image: '/assets/our-story/our-story-04-rhythm.webp',
    alt: 'AURA Fight Club editorial boxing visual',
  },
  {
    title: 'Watch',
    copy: 'YouTube is where the stories expand: interviews, fight analysis, profiles, documentaries and original boxing formats.',
    image: '/assets/category-support/apparel-cream-jacket.webp',
    alt: 'AURA Fight Club video and culture visual',
  },
  {
    title: 'Live',
    copy: 'AURA extends beyond the screen into the lifestyle, attitude and design language of boxing culture.',
    image: '/assets/our-story/our-story-09-arrival.webp',
    alt: 'AURA Fight Club lifestyle visual',
  },
];

const journey = [
  {
    number: '01',
    label: 'The sport',
    title: 'BOXING COMES FIRST',
    body: 'AURA Fight Club starts with the sport itself. Fighters, fights, rankings, rivalries, prospects, promoters, business and the stories shaping boxing now. We want the site to be useful before it is fashionable.',
    micro: 'Know the fight. Know the story.',
    image: '/assets/aura-scroll/05_drop_001_tools_uniform/frame_09_cream_full_outfit_model.webp',
    alt: 'AURA Fight Club visual',
  },
  {
    number: '02',
    label: 'The stories',
    title: 'MORE THAN THE HEADLINE',
    body: 'The news feed tells you what happened. Our features, analysis and YouTube channel are built to go further — asking what it means, what comes next and what everyone else may be missing.',
    micro: 'Context. Opinion. Film.',
    image: '/assets/products/aura-sleeveless-hoodie/card-hover-model.webp',
    alt: 'AURA Fight Club storytelling visual',
  },
  {
    number: '03',
    label: 'The culture',
    title: 'BOXING DOES NOT END AT THE BELL',
    body: 'Fight culture has always influenced music, fashion, photography, language and identity. AURA Lifestyle explores that world with a cleaner, more considered point of view and exclusive concepts for members.',
    micro: 'Fight culture, without the costume.',
    image: '/assets/category-support/apparel-training-vest.webp',
    alt: 'AURA Fight Club culture visual',
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
          <p className="os-hero__subtitle">BOXING. STORIES. FILM. CULTURE.</p>
          <p className="os-hero__copy">
            AURA Fight Club is an independent boxing media and culture platform. We cover the sport through news, analysis and original stories, bring those stories to life on YouTube, and explore the lifestyle that exists around the fight game.
          </p>
          <p className="os-hero__micro">Built for people who follow boxing beyond fight night.</p>
        </div>
        <StoryImage
          src="/assets/aura-scroll/05_drop_001_tools_uniform/frame_09_cream_full_outfit_model.webp"
          alt="AURA Fight Club hero visual"
          eager
        />
      </section>

      <section className="os-origin" aria-labelledby="origin-title">
        <div className="os-section-head">
          <p className="os-eyebrow">THE IDEA</p>
          <h2 id="origin-title">NOT JUST ANOTHER BOXING SITE</h2>
        </div>
        <div className="os-origin__copy">
          <p>Boxing coverage is often split between fast news, promotional content and social-media noise. AURA was built to connect the pieces.</p>
          <p>We want one place where a fan can discover what is happening, understand the bigger story, watch original coverage and stay connected to the culture surrounding the sport.</p>
          <p>That means serious boxing coverage first — then film, personality, design and lifestyle around it. The same audience should be able to move naturally from a breaking story to a long-form video to a piece of AURA culture without feeling like they have entered a different brand.</p>
        </div>
      </section>

      <section className="os-lifestyle" aria-labelledby="platform-title">
        <div className="os-lifestyle__intro">
          <p className="os-eyebrow">THE PLATFORM</p>
          <h2 id="platform-title">READ. WATCH. LIVE IT.</h2>
          <p>
            AURA Fight Club is built around three connected experiences. The website keeps you informed. YouTube takes you deeper. Lifestyle turns the identity of the fight game into something you can be part of.
          </p>
        </div>
        <div className="os-lifestyle-grid">
          {platformCards.map((card) => (
            <article className="os-lifestyle-card" key={card.title}>
              <img src={card.image} alt={card.alt} loading="lazy" decoding="async" />
              <div>
                <h3>{card.title}</h3>
                <p>{card.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="os-quality" aria-labelledby="pillars-title">
        <div className="os-quality__grid">
          <div>
            <p className="os-eyebrow">WHAT WE DO</p>
            <h2 id="pillars-title">ONE FIGHT CLUB. FOUR PILLARS.</h2>
          </div>
          <div className="os-quality__copy">
            <p>AURA is not trying to be a promoter, a fan page or a clothing store pretending to be media. The core product is the boxing audience and the quality of what we give them.</p>
            <p>Every part of the platform should strengthen the others: credible news builds trust, original video builds personality, lifestyle builds identity, and membership builds community.</p>
          </div>
        </div>

        <div className="os-standard-grid">
          {pillars.map((item, index) => (
            <article className="os-standard-card" key={item.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="os-journey" aria-labelledby="journey-title">
        <div className="os-journey__intro">
          <p className="os-eyebrow">OUR POINT OF VIEW</p>
          <h2 id="journey-title">THE FIGHT GAME, IN FULL</h2>
          <p>
            We are interested in the whole ecosystem — what happens in the ring, what happens behind it, and the culture boxing creates outside it.
          </p>
        </div>

        <div className="os-stage-list">
          {journey.map((scene) => (
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
        <p className="os-eyebrow">THE STANDARD</p>
        <h2 id="manifesto-title">CREDIBLE ENOUGH FOR HARDCORE FANS. ACCESSIBLE ENOUGH FOR EVERYONE ELSE.</h2>
        <div className="os-manifesto__copy">
          <p>We respect the intelligence of boxing fans.</p>
          <p>We explain the sport without flattening it.</p>
          <p>We separate reporting from opinion.</p>
          <p>We look beyond the obvious headline.</p>
          <p>We give emerging fighters the same curiosity we give established stars.</p>
          <p>And we build everything — articles, video and lifestyle — with a strong visual identity.</p>
        </div>
      </section>

      <section className="os-closing" aria-labelledby="closing-title">
        <p className="os-eyebrow">AURA FIGHT CLUB</p>
        <h2 id="closing-title">FOLLOW THE SPORT. UNDERSTAND THE STORY. JOIN THE CULTURE.</h2>
        <p>
          Read the latest boxing coverage, watch AURA original content and explore the lifestyle side of the fight game. This is a fight club built for the audience.
        </p>
        <div className="os-actions" aria-label="Explore AURA Fight Club">
          <a className="os-btn os-btn--shop" href="/news">READ THE NEWS</a>
          <a className="os-btn os-btn--ghost" href="/watch">WATCH AURA</a>
          <a className="os-btn os-btn--ghost" href="/lifestyle">EXPLORE LIFESTYLE</a>
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
