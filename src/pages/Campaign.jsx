import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import '../styles/campaign-cinematic.css';

const BASE = '/assets/aura-scroll';

const rhythmFrames = [
  `${BASE}/04_footwork_skipping/frame_01_skip_ready.png`,
  `${BASE}/04_footwork_skipping/frame_03_rope_swing_low.png`,
  `${BASE}/04_footwork_skipping/frame_06_jump_midair.png`,
  `${BASE}/04_footwork_skipping/frame_08_jump_high.png`,
  `${BASE}/04_footwork_skipping/frame_10_skip_reset.png`,
];

const pressureFrames = [
  `${BASE}/06_campaign_mitts_sequence/frame_01_mitts_real.png`,
  `${BASE}/06_campaign_mitts_sequence/frame_02_mitts_real.png`,
  `${BASE}/06_campaign_mitts_sequence/frame_03_mitts_real.png`,
  `${BASE}/06_campaign_mitts_sequence/frame_04_mitts_real.png`,
  `${BASE}/06_campaign_mitts_sequence/frame_05_mitts_real.png`,
];

const repetitionFrames = [
  `${BASE}/02_shadow_boxing_the_standard/frame_02_shadow_02_guard_raised.png`,
  `${BASE}/02_shadow_boxing_the_standard/frame_05_shadow_05_jab_start.png`,
  `${BASE}/02_shadow_boxing_the_standard/frame_06_shadow_06_jab_extension.png`,
  `${BASE}/02_shadow_boxing_the_standard/frame_07_shadow_07_return_guard.png`,
  `${BASE}/02_shadow_boxing_the_standard/frame_08_shadow_08_defensive_slip.png`,
];

const timingFrames = [
  `${BASE}/03_the_work_handwraps/frame_01_handwrap_start.png`,
  `${BASE}/03_the_work_handwraps/frame_03_wrap_check.png`,
  `${BASE}/03_the_work_handwraps/frame_05_wrap_tighten.png`,
  `${BASE}/03_the_work_handwraps/frame_08_wrap_guard.png`,
  `${BASE}/03_the_work_handwraps/frame_10_work_final.png`,
];

const controlFrames = [
  `${BASE}/07_fight_club_close/frame_01_fight_club_close.png`,
  `${BASE}/07_fight_club_close/frame_03_fight_club_ringside_black.png`,
  `${BASE}/07_fight_club_close/frame_04_fight_club_tracksuit_ring.png`,
  `${BASE}/07_fight_club_close/frame_05_fight_club_female_wraps.png`,
];

const chapters = [
  {
    kicker: 'RHYTHM',
    title: 'The round starts before the first punch.',
    copy: 'Footwork, breath, balance and repeatable rhythm. AURA begins with movement that looks effortless because the work has already been paid for.',
    frames: rhythmFrames,
  },
  {
    kicker: 'PRESSURE',
    title: 'Not panic. Pace.',
    copy: 'Pressure is not noise. It is timing, patience, distance, restraint and the ability to stay cold when the room gets loud.',
    frames: pressureFrames,
  },
  {
    kicker: 'REPETITION',
    title: 'Power is built one round at a time.',
    copy: 'No wasted movement. No wasted emotion. The body repeats until the mind no longer has to ask.',
    frames: repetitionFrames,
  },
  {
    kicker: 'TIMING',
    title: 'Speed without control is wasted.',
    copy: 'The fighter does not chase the moment. He reads it, waits for it, then takes it clean.',
    frames: timingFrames,
  },
  {
    kicker: 'CONTROL',
    title: 'The body follows what the mind can hold.',
    copy: 'The unseen work is the identity. The ritual, the recovery, the silence, the choice to return again tomorrow.',
    frames: controlFrames,
  },
];

function FrameStrip({ frames, label }) {
  return (
    <div className="campaign-strip" aria-label={`${label} campaign frames`}>
      {frames.map((src, index) => (
        <figure className="campaign-frame" key={src}>
          <img src={src} alt={`${label} frame ${index + 1}`} loading="lazy" />
          <figcaption>{String(index + 1).padStart(2, '0')}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function Chapter({ chapter, index }) {
  const isReverse = index % 2 === 1;

  return (
    <section className={`campaign-chapter ${isReverse ? 'campaign-chapter--reverse' : ''}`}>
      <div className="campaign-chapter__copy">
        <p className="campaign-kicker">{chapter.kicker}</p>
        <h2>{chapter.title}</h2>
        <p>{chapter.copy}</p>
      </div>
      <FrameStrip frames={chapter.frames} label={chapter.kicker} />
    </section>
  );
}

export default function Campaign() {
  const navigate = useNavigate();

  return (
    <div className="campaign-page">
      <Header />

      <section className="campaign-hero">
        <div className="campaign-hero__media">
          <img src={`${BASE}/04_footwork_skipping/frame_08_jump_high.png`} alt="AURA Fight Club campaign hero" />
        </div>
        <div className="campaign-hero__content">
          <button className="campaign-back" onClick={() => navigate('/')}>← AURA Fight Club</button>
          <p className="campaign-kicker">AURA FIGHT CLUB</p>
          <h1>THE CAMPAIGN</h1>
          <p className="campaign-hero__line">EARNED WHERE NOBODY IS WATCHING.</p>
          <p className="campaign-hero__sub">Pressure. Rhythm. Restraint. Identity.</p>
          <div className="campaign-actions">
            <button onClick={() => navigate('/drop-001')}>View Drop 001</button>
            <button className="campaign-actions__ghost" onClick={() => navigate('/fight-club')}>Enter Fight Club</button>
          </div>
        </div>
      </section>

      <main>
        <section className="campaign-intro">
          <p className="campaign-kicker">BEFORE THE CROWD. BEFORE THE RESULT.</p>
          <h2>This is the work before the world sees the fighter.</h2>
          <p>
            This is not a photoshoot. It is a document of the ritual: the rounds,
            the rhythm, the pressure, the repetition and the uniform of the fighter.
          </p>
        </section>

        {chapters.map((chapter, index) => (
          <Chapter chapter={chapter} index={index} key={chapter.kicker} />
        ))}

        <section className="campaign-manifesto">
          <p>THE REAL FIGHT IS INTERNAL.</p>
          <p>THE OPPONENT IS JUST THE MIRROR.</p>
          <p>YOUR AURA IS EARNED.</p>
        </section>

        <section className="campaign-products" aria-label="Drop 001 product bridge">
          <div className="campaign-products__header">
            <p className="campaign-kicker">DROP 001</p>
            <h2>The first uniform of AURA Fight Club.</h2>
          </div>
          <div className="campaign-products__grid">
            <button onClick={() => navigate('/apparel')}>
              <img src={`${BASE}/05_drop_001_tools_uniform/frame_01_cream_uniform_model.png`} alt="AURA apparel" loading="lazy" />
              <span>APPAREL</span>
              <small>The uniform.</small>
            </button>
            <button onClick={() => navigate('/footwear')}>
              <img src={`${BASE}/05_drop_001_tools_uniform/frame_09_cream_full_outfit_model.png`} alt="AURA footwear" loading="lazy" />
              <span>FOOTWEAR</span>
              <small>The stance.</small>
            </button>
            <button onClick={() => navigate('/equipment')}>
              <img src={`${BASE}/06_campaign_mitts_sequence/frame_03_mitts_real.png`} alt="AURA equipment" loading="lazy" />
              <span>EQUIPMENT</span>
              <small>The tools.</small>
            </button>
          </div>
        </section>

        <section className="campaign-final">
          <p className="campaign-kicker">AURA FIGHT CLUB</p>
          <h2>FIGHT WITH PRESENCE. OWN YOUR AURA.</h2>
          <div className="campaign-actions campaign-actions--center">
            <button onClick={() => navigate('/drop-001')}>View Drop 001</button>
            <button className="campaign-actions__ghost" onClick={() => navigate('/fight-club')}>Join Fight Club</button>
          </div>
        </section>
      </main>
    </div>
  );
}
