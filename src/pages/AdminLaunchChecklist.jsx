import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/admin-launch-checklist.css';

const checklist = [
  {
    area: 'Landing page',
    status: 'needs-review',
    items: [
      'Check / on desktop and mobile after Vercel deploy.',
      'Confirm hero image/logo using /admin/page-media.',
      'Make sure waitlist CTA is visible above the fold.',
    ],
  },
  {
    area: 'Page media',
    status: 'in-progress',
    items: [
      'Use /admin/page-media to pick hero images for Home, Drop 001, Apparel, Footwear, Equipment, Campaign, and Fight Club.',
      'Set object-position so heads/products are not cropped.',
      'Once correct, lock final values into repo.',
    ],
  },
  {
    area: 'Cinematic editor',
    status: 'in-progress',
    items: [
      'Use /admin/cinematic to remove weak/cropped/repeated frames.',
      'Export removal manifest before permanent cleanup.',
      'Optimise opening video to poster-first loading.',
    ],
  },
  {
    area: 'Products',
    status: 'partial',
    items: [
      'Only 3 products currently have live media: Cream Fight Boots, Cream Boxing Gloves, Black Sleeveless Hoodie.',
      'Keep missing-media products off the launch landing page until visuals are ready.',
      'Prepare final card, hover, and gallery images for all launch products.',
    ],
  },
  {
    area: 'Waitlist',
    status: 'not-connected',
    items: [
      'Current landing-page waitlist is front-end confirmation only.',
      'Connect to Klaviyo, Mailchimp, Supabase, or email capture endpoint before launch.',
      'Use the same waitlist backend on / and /fight-club.',
    ],
  },
  {
    area: 'Launch QA',
    status: 'pending',
    items: [
      'Check mobile header/menu.',
      'Check product cards and product detail pages.',
      'Check Vercel deployment speed.',
      'Check all links and 404 fallback.',
    ],
  },
];

function statusLabel(status) {
  return {
    'needs-review': 'Needs review',
    'in-progress': 'In progress',
    partial: 'Partial',
    'not-connected': 'Not connected',
    pending: 'Pending',
  }[status] || status;
}

export default function AdminLaunchChecklist() {
  return (
    <div className="alc-page">
      <Header />
      <main className="alc-shell">
        <section className="alc-hero">
          <p className="alc-kicker">AURA Admin</p>
          <h1>Launch checklist</h1>
          <p>Use this as the working control list before public launch. It keeps the landing page, media tools, cinematic editor, products, waitlist, and QA in one place.</p>
          <div className="alc-actions">
            <a href="/admin/page-media">Page media</a>
            <a href="/admin/cinematic">Cinematic editor</a>
            <a href="/admin/suppliers">Supplier admin</a>
            <a href="/">View landing page</a>
          </div>
        </section>

        <section className="alc-grid">
          {checklist.map((section) => (
            <article className={`alc-card alc-card--${section.status}`} key={section.area}>
              <div className="alc-card__head">
                <h2>{section.area}</h2>
                <span>{statusLabel(section.status)}</span>
              </div>
              <ul>
                {section.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
