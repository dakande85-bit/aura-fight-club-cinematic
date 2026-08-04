import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { submitWaitlist } from '../lib/waitlist.js';
import '../styles/editorial-page.css';

export default function FightClub() {
  const navigate  = useNavigate();
  const [email,     setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitState, setSubmitState] = useState('idle');
  const [submitError, setSubmitError] = useState('');

  async function handleWaitlistSubmit() {
    setSubmitState('submitting');
    setSubmitError('');
    try {
      await submitWaitlist({ email, productSlug: 'fight-club', source: 'fight-club', consent: true });
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSubmitState('idle');
    }
  }

  return (
    <div className="ep">
      <Header />

      <div className="ep__header-block">
        <button className="ep__back" onClick={() => navigate('/')}>Back to AURA Fight Club</button>
        <p className="ep__eyebrow">AURA Fight Club</p>
        <h1 className="ep__title">Fight Club</h1>
        <p className="ep__sub">
          More than a brand. A fight identity.<br />
          Join the first circle.
        </p>
        <div className="ep__divider" />
        <p className="ep__meta">Drop 001 · Founding Members Opening</p>
      </div>

      <div className="ep__body">
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
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && email && handleWaitlistSubmit()}
                aria-label="Email address"
              />
              <button
                className="ep__submit"
                onClick={() => email && handleWaitlistSubmit()}
                disabled={submitState === 'submitting'}
              >
                {submitState === 'submitting' ? 'Joining...' : 'Join Waitlist'}
              </button>
              {submitError && <p className="ep__waitlist-error">{submitError}</p>}
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
