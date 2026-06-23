import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import PageHero from '../components/PageHero.jsx';
import Footer from '../components/Footer.jsx';
import { addWaitlistEntry } from '../lib/waitlistStore.js';
import { usePageHeroMedia } from '../hooks/usePageMedia.js';
import '../styles/editorial-page.css';

const appComingSoonImage = '/assets/fight-club/aura-app-coming-soon.webp';

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
        headline={'TRAINING CULTURE\nBEHIND THE BRAND'}
        copy="AURA Fight Club is the waitlist and product culture behind the label: training, fit, movement, supplier development, and early access to each drop."
        image={heroMedia.image}
        imagePosition={heroMedia.imagePosition}
        imageFit={heroMedia.imageFit}
        imageScale={heroMedia.imageScale}
        className="ph--fight-club"
        ctas={[
          { label: 'Join Waitlist', to: '/fight-club', variant: 'primary' },
          { label: 'Explore Drop 001', to: '/drop-001', variant: 'ghost' },
        ]}
      />

      <div className="ep__body" id="fight-club-story">
        <div className="ep__copy-block">
          <p className="ep__copy">
            AURA is built around clothing that feels right in training and still looks composed outside the gym. The focus is fit, comfort, movement, and the confidence that comes from wearing pieces that bring out the frame.
          </p>
          <p className="ep__copy">
            Fight Club is where early access, product feedback, supplier updates, and future drops are organised. Drop 001 starts with POD-ready essentials. Drop 002 moves into supplier-built gear after samples and quality checks.
          </p>
          <p className="ep__copy">
            Join the list for first access and product updates before each public release.
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
          <p className="ep__waitlist-label">Join the drop list</p>
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
