import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import PageHero from '../components/PageHero.jsx';
import Footer from '../components/Footer.jsx';
import { usePageHeroMedia } from '../hooks/usePageMedia.js';
import '../styles/editorial-page.css';

export default function FightClub() {
  const navigate = useNavigate();
  const heroMedia = usePageHeroMedia('fightClub');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

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

        <div className="ep__waitlist-block">
          <p className="ep__waitlist-label">Join the first circle</p>
          {!submitted ? (
            <div className="ep__form">
              <input
                className="ep__email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                onKeyDown={event => event.key === 'Enter' && email && setSubmitted(true)}
                aria-label="Email address"
              />
              <button
                className="ep__submit"
                onClick={() => email && setSubmitted(true)}
              >
                Join Waitlist
              </button>
            </div>
          ) : (
            <p className="ep__confirm">YOU'RE ON THE LIST.</p>
          )}
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
