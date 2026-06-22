import { useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { liveProducts } from '../data/products.js';
import { addWaitlistEntry } from '../lib/waitlistStore.js';
import { usePageHeroMedia } from '../hooks/usePageMedia.js';
import { useAllProductMedia } from '../hooks/useProductMedia.js';
import '../styles/launch-landing.css';

const launchPoints = [
  {
    title: 'Early access',
    copy: 'Join before Drop 001 opens and get first notice when products move from waitlist to release.',
  },
  {
    title: 'First circle',
    copy: 'The first AURA members shape the product direction, visuals, and next training-uniform pieces.',
  },
  {
    title: 'Limited first drop',
    copy: 'The launch collection is built around a focused cream, black, and fight-club identity system.',
  },
  {
    title: 'Behind the work',
    copy: 'Follow the campaign, frame selections, supplier samples, and product build as it becomes real.',
  },
];

function WaitlistForm({ compact = false }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('Early access only. Launch updates and Drop 001 access.');
  const [status, setStatus] = useState('idle');

  function submit(event) {
    event.preventDefault();
    const result = addWaitlistEntry({ email, source: 'launch-landing', product: 'Drop 001' });

    if (!result.ok) {
      setStatus('error');
      setMessage('Enter a valid email address.');
      return;
    }

    setEmail('');
    setStatus('success');
    setMessage(result.duplicate ? 'You were already on the list. Updated.' : 'You are on the list.');
  }

  return (
    <form className="launch-form" onSubmit={submit}>
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Enter your email"
        aria-label="Email address"
      />
      <button className="launch-btn launch-btn--primary" type="submit">
        {compact ? 'Join Waitlist' : 'Join the Fight Club waitlist'}
      </button>
      <p className={`launch-form__note launch-form__note--${status}`}>{message}</p>
    </form>
  );
}

export default function LaunchLandingPage() {
  const heroMedia = usePageHeroMedia('home');
  const { mediaMap } = useAllProductMedia();
  const heroImage = heroMedia?.image || '/campaign/jump-rope/jump-rope-07.webp';
  const featuredProducts = liveProducts.slice(0, 3);

  return (
    <div className="launch-page">
      <Header />

      <main>
        <section className="launch-hero" aria-label="AURA Fight Club launch">
          <div className="launch-hero__media" aria-hidden="true">
            <img
              src={heroImage}
              alt=""
              style={{ objectPosition: heroMedia?.position || 'center 34%', objectFit: heroMedia?.fit || 'cover' }}
              loading="eager"
              fetchPriority="high"
            />
          </div>

          <div className="launch-hero__content">
            <p className="launch-kicker">AURA Fight Club · Drop 001</p>
            <h1>Your aura is earned.</h1>
            <p className="launch-hero__lead">
              A cinematic boxing lifestyle brand built around discipline, presence, and the training culture behind the fighter.
              Drop 001 begins with the first essentials: T-Shirts, Hoodies, Steel Water Bottles, Joggers, and Tank Tops for men and women.
            </p>
            <div className="launch-actions">
              <a className="launch-btn launch-btn--primary" href="#waitlist">Join Waitlist</a>
              <a className="launch-btn launch-btn--ghost" href="/drop-001">Preview Drop 001</a>
              <a className="launch-btn launch-btn--ghost" href="/who-we-are">Who We Are</a>
            </div>
            <div className="launch-hero__stats" aria-label="Launch highlights">
              <div className="launch-stat"><strong>Drop 001</strong><span>POD candidates for men and women. Supplier-built gear moves to Drop 002.</span></div>
              <div className="launch-stat"><strong>Waitlist</strong><span>Early access before the public product release.</span></div>
              <div className="launch-stat"><strong>Fight identity</strong><span>The real fight is internal. The opponent is just the mirror.</span></div>
            </div>
          </div>
        </section>

        <section className="launch-section" id="drop-preview">
          <div className="launch-section__head">
            <div>
              <p className="launch-kicker">The first uniform</p>
              <h2>Drop 001 preview.</h2>
            </div>
            <p>
              Keep the first release tight: only the strongest products with confirmed media should lead the launch page.
              More catalogue pieces can stay in admin until their visuals are ready.
            </p>
          </div>

          <div className="launch-product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.slug} product={product} media={mediaMap[product.slug]} deferMediaFetch />
            ))}
          </div>
        </section>

        <section className="launch-section">
          <div className="launch-story">
            <blockquote>The real fight is internal. The opponent is just the mirror.</blockquote>
            <div className="launch-story__copy">
              <p>
                AURA Fight Club is not built around noise. It is built around the quiet work: footwork, rounds,
                repetition, pressure, restraint, and identity. The gear is a symbol of what has already been earned.
              </p>
              <p>
                This first launch page keeps the brand clear: premium boxing lifestyle, early-access waitlist,
                and a controlled product preview before the full store opens.
              </p>
            </div>
          </div>
        </section>

        <section className="launch-section">
          <div className="launch-section__head">
            <div>
              <p className="launch-kicker">Why join early</p>
              <h2>First circle access.</h2>
            </div>
            <p>
              The waitlist is the main conversion goal before launch. This gives us a clean audience before checkout,
              suppliers, and full product media are locked.
            </p>
          </div>

          <div className="launch-points">
            {launchPoints.map((point) => (
              <div className="launch-point" key={point.title}>
                <strong>{point.title}</strong>
                <p>{point.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="launch-section launch-waitlist" id="waitlist">
          <div className="launch-waitlist__box">
            <div>
              <p className="launch-kicker">Join the first circle</p>
              <h2>Enter before the drop.</h2>
              <p>
                Get early access to Drop 001 and the launch campaign. Entries are saved locally for testing now;
                the next production step is connecting this same flow to the final email platform.
              </p>
            </div>
            <WaitlistForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
