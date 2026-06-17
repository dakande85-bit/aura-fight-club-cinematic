import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import PageHero from '../components/PageHero.jsx';
import Footer from '../components/Footer.jsx';
import { addWaitlistEntry } from '../lib/waitlistStore.js';
import { usePageHeroMedia } from '../hooks/usePageMedia.js';
import '../styles/editorial-page.css';

const appComingSoonImage = '/assets/fight-club/aura-app-coming-soon.png';

export default function FightClub() {
  const navigate = useNavigate();
  const heroMedia = usePageHeroMedia('fightClub');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');

  function submitWaitlist() {
    const result = addWaitlistEntry({ email, source: 'fight-club-page', product: 'AURA Fight Club' });

    if (!result.ok) {
      setStatus('error');
      setMessage('Enter a valid email address.');
      return;
    }

    setEmail('');
    setStatus('success');
    setMessage(result.duplicate ? 'YOU WERE ALREADY ON THE LIST. UPDATED.' : "YOU'RE ON THE LIST.");
  }

  return (
    <div className="ep">
      <Header />

      <PageHero
        label="AURA FIGHT CLUB"
        headline={'THE REAL FIGHT\nIS INTERNAL'}
        copy="AURA Fight Club is the world behind the product: discipline, identity, training culture, and the presence earned before anyone is watching."
        image={heroMedia.image}
        imagePosition={heroMedia.imagePosition}
        imageFit={heroMedia.imageFit}
        imageScale={heroMedia.imageScale}
        className="ph--fight-club"
        ctas={[
          { label: 'Enter Fight Club', to: '/fight-club', variant: 'primary' },
          { label: 'Explore Drop 001', to: '/drop-001', variant: 'ghost' },
        ]}
      />

      <div className="ep__body" id="fight-club-story">
        <div className="ep__copy-block">
          <p className="ep__copy">
            AURA Fight Club is not a gym. It is not a label. It is a standard.
            A way of approaching the work — the rounds, the wraps, the discipline —
            that most people never see and fewer still maintain.
          </p>
          <p className="ep__copy">
            The first circle of AURA Fight Club is reserved for those who understand
            that the aura is not given. It is built in private, over time,
            without an audience.
          </p>
          <p className="ep__copy">
            Drop 001 is the first uniform. The founding members get access first.
          </p>
        </div>

        <figure className="ep__app-promo" aria-label="AURA Fight Club app coming soon">
          <img
            src={appComingSoonImage}
            alt="AURA Fight Club app coming soon"
            width="1536"
            height="1024"
            loading="lazy"
            decoding="async"
          />
        </figure>

        <div className="ep__waitlist-block">
          <p className="ep__waitlist-label">Join the first circle</p>
          <div className="ep__form">
            <input
              className="ep__email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              onKeyDown={event => event.key === 'Enter' && submitWaitlist()}
              aria-label="Email address"
            />
            <button
              className="ep__submit"
              onClick={submitWaitlist}
            >
              Join Waitlist
            </button>
          </div>
          {message && <p className={`ep__confirm ep__confirm--${status}`}>{message}</p>}
        </div>

        <div className="ep__cta-block" style={{ marginTop: '32px' }}>
          <button className="ep__cta ep__cta--ghost" onClick={() => navigate('/drop-001')}>
            View Drop 001
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
