import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/legal.css';

export default function ContactPage() {
  return (
    <div className="legal-page">
      <Header />
      <main className="legal-page__main">
        <p className="legal-page__eyebrow">AURA Fight Club</p>
        <h1>Contact</h1>
        <p className="legal-page__intro">Customer contact details must be confirmed by the store owner before launch.</p>
        <div className="legal-page__notice">
          Owner action required: provide verified support email, business address if required, and response-time policy.
        </div>
      </main>
      <Footer />
    </div>
  );
}
