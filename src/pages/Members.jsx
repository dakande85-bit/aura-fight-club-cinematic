import { Link } from 'react-router-dom';
import { ArrowRight, Crown, LockKeyhole, Newspaper, Play, Trophy, Users } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/aura-home-redesign.css';
import '../styles/aura-members.css';

const benefits = [
  [Newspaper, 'Member analysis', 'Long-form breakdowns, tactical reads and stories that go deeper than the news cycle.'],
  [Trophy, 'Early fight previews', 'Premium pre-fight scouting, matchup keys and what to watch before the opening bell.'],
  [Play, 'Members video', 'Interviews, breakdowns and selected behind-the-scenes content in one clean feed.'],
  [Users, 'The corner', 'A dedicated members space for conversation, recommendations and Fight Club culture.'],
];

export default function MembersPage() {
  return (
    <div className="afc-home-shell">
      <Header />
      <main className="afc-members-page">
        <section className="afc-members-hero">
          <div>
            <p className="afc-eyebrow">AURA Fight Club membership</p>
            <h1>INSIDE<br /><span>THE CORNER.</span></h1>
            <p>For readers who want more than headlines. A premium members layer built around serious boxing analysis, fight week access and culture.</p>
            <div className="afc-hero__actions">
              <a className="afc-btn afc-btn--gold" href="#membership">Explore membership <ArrowRight size={17} /></a>
              <Link className="afc-btn afc-btn--ghost" to="/news">Read the public desk</Link>
            </div>
          </div>
          <div className="afc-members-hero__card">
            <Crown size={34} />
            <p className="afc-eyebrow">Founding members</p>
            <h2>THE FIRST ROUND.</h2>
            <p>The members area is now live in preview. Paid access, account login and billing will be switched on before public membership sales open.</p>
          </div>
        </section>

        <section className="afc-members-benefits" id="membership">
          <div className="afc-section-head">
            <div><p className="afc-eyebrow">Member benefits</p><h2>WHAT'S INSIDE.</h2></div>
          </div>
          <div className="afc-members-benefit-grid">
            {benefits.map(([Icon, title, text]) => (
              <article key={title}>
                <Icon size={28} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="afc-members-access">
          <div>
            <p className="afc-eyebrow">Member access</p>
            <h2>BUILT FOR THE PEOPLE WHO WATCH THE ROUNDS BETWEEN THE ROUNDS.</h2>
            <p>The public site stays open. Membership adds deeper analysis, selected exclusives and a cleaner premium experience without replacing the main Fight Club.</p>
          </div>
          <div className="afc-members-access__panel">
            <LockKeyhole size={28} />
            <h3>Membership systems next</h3>
            <p>Account authentication, paid plans and the private content gate are the remaining launch layer.</p>
            <Link to="/news">Continue to Fight News <ArrowRight size={16} /></Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
