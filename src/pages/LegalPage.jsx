import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/legal.css';

const PAGES = {
  privacy: {
    title: 'Privacy Policy',
    intro: 'This page is the production structure for AURA Fight Club privacy disclosures.',
    sections: ['Data controller details', 'Personal data collected', 'How data is used', 'Legal basis', 'Retention', 'Customer rights', 'Contact for privacy requests'],
  },
  terms: {
    title: 'Terms and Conditions',
    intro: 'This page is the production structure for AURA Fight Club customer terms.',
    sections: ['Seller identity', 'Product information', 'Orders and checkout', 'Pricing and taxes', 'Customer responsibilities', 'Limitations', 'Governing law'],
  },
  shipping: {
    title: 'Shipping',
    intro: 'This page is the production structure for shipping information.',
    sections: ['Dispatch times', 'Shipping destinations', 'Carriers', 'Costs', 'Tracking', 'Delays'],
  },
  returns: {
    title: 'Returns and Refunds',
    intro: 'This page is the production structure for returns and refund information.',
    sections: ['Return window', 'Return conditions', 'How to request a return', 'Refund timing', 'Exclusions', 'Faulty items'],
  },
};

export default function LegalPage({ type }) {
  const page = PAGES[type] || PAGES.terms;

  return (
    <div className="legal-page">
      <Header />
      <main className="legal-page__main">
        <p className="legal-page__eyebrow">AURA Fight Club</p>
        <h1>{page.title}</h1>
        <p className="legal-page__intro">{page.intro}</p>
        <div className="legal-page__notice">
          Owner action required before production launch: verified company identity, trading address,
          support email, jurisdiction, tax/VAT details where applicable, and final policy wording.
        </div>
        <section className="legal-page__sections" aria-label={`${page.title} required sections`}>
          {page.sections.map((section) => (
            <article key={section}>
              <h2>{section}</h2>
              <p>Pending verified owner-provided information.</p>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
