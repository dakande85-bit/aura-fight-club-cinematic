import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import '../styles/editorial-page.css';

export default function Campaign() {
  const navigate = useNavigate();
  return (
    <div className="ep">
      <Header />

      <div className="ep__header-block">
        <button className="ep__back" onClick={() => navigate('/')}>← AURA Fight Club</button>
        <p className="ep__eyebrow">AURA Fight Club</p>
        <h1 className="ep__title">The Campaign</h1>
        <p className="ep__sub">
          Earned where nobody is watching.<br />
          Pressure, rhythm, restraint, identity.
        </p>
        <div className="ep__divider" />
        <p className="ep__meta">Drop 001 · Now Available on Waitlist</p>
      </div>

      <div className="ep__body">
        <div className="ep__copy-block">
          <p className="ep__copy">
            The AURA campaign is not a photoshoot. It is a document.
            Shot in real gyms, under real light, with real fighters.
            No staging. No filters. No shortcuts.
          </p>
          <p className="ep__copy">
            Every frame was earned in the same rooms where the work happens —
            before the bell, after the round, in the silence between rounds.
            That is where your aura is built.
          </p>
          <p className="ep__copy">
            The first uniform of AURA Fight Club is built for exactly that environment.
            Drop 001 is now open for waitlist.
          </p>
        </div>

        <div className="ep__cta-block">
          <button className="ep__cta" onClick={() => navigate('/drop-001')}>
            View Drop 001 →
          </button>
          <button className="ep__cta ep__cta--ghost" onClick={() => navigate('/fight-club')}>
            Enter Fight Club →
          </button>
        </div>
      </div>
    </div>
  );
}
