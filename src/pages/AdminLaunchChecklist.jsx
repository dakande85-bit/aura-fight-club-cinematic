import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/admin-launch-checklist.css';

const blockers = [
  {
    title: 'Waitlist not connected',
    severity: 'critical',
    owner: 'Launch system',
    action: 'Connect / and /fight-club forms to one real email capture backend before sending traffic.',
    link: '/fight-club',
    linkLabel: 'Check waitlist page',
  },
  {
    title: 'Final logo/media lock pending',
    severity: 'critical',
    owner: 'Brand/media',
    action: 'Use /admin/page-media to choose the final logo and page hero images, then lock them into repo defaults.',
    link: '/admin/page-media',
    linkLabel: 'Open page media',
  },
  {
    title: 'Only 3 products launch-safe',
    severity: 'high',
    owner: 'Product/media',
    action: 'Keep non-live-media products hidden from launch pages until card, hover, and gallery images are approved.',
    link: '/drop-001',
    linkLabel: 'View Drop 001',
  },
  {
    title: 'Opening cinematic video needs optimisation',
    severity: 'medium',
    owner: 'Performance',
    action: 'Convert opening video to poster-first loading and create a lighter production MP4/WebM.',
    link: '/cinematic',
    linkLabel: 'View cinematic',
  },
];

const workOrder = [
  {
    step: '01',
    title: 'Control the visuals first',
    copy: 'Open page media and select the logo + hero for each major page. Do not manually edit individual page files unless the value is being locked permanently.',
    primary: { href: '/admin/page-media', label: 'Page media' },
    secondary: { href: '/', label: 'View landing' },
  },
  {
    step: '02',
    title: 'Clean the cinematic experience',
    copy: 'Remove weak, repeated, cropped, or too-dark frames. Export the removal manifest before any permanent cleanup commit.',
    primary: { href: '/admin/cinematic', label: 'Cinematic editor' },
    secondary: { href: '/cinematic', label: 'View cinematic' },
  },
  {
    step: '03',
    title: 'Check launch product reality',
    copy: 'Launch only with the three products that have live media unless additional product slots are properly completed.',
    primary: { href: '/drop-001', label: 'Drop 001' },
    secondary: { href: '/admin', label: 'Product admin' },
  },
  {
    step: '04',
    title: 'Connect waitlist',
    copy: 'The landing page now converts visually, but emails must be saved to one backend before launch traffic starts.',
    primary: { href: '/fight-club', label: 'Fight Club' },
    secondary: { href: '/', label: 'Landing page' },
  },
  {
    step: '05',
    title: 'Final mobile QA',
    copy: 'Check iPhone first: header, hero crop, CTA visibility, product cards, product pages, footer, and speed.',
    primary: { href: '/', label: 'Start QA' },
    secondary: { href: '/admin/suppliers', label: 'Suppliers' },
  },
];

const checklist = [
  {
    area: 'Landing page',
    status: 'needs-review',
    priority: 'P0',
    route: '/',
    items: [
      'Review new launch landing page on desktop and mobile after Vercel deploy.',
      'Confirm hero image/logo using /admin/page-media.',
      'Make sure waitlist CTA is visible above the fold.',
      'Confirm the page feels like a launch page, not just a cinematic experiment.',
    ],
  },
  {
    area: 'Page media',
    status: 'in-progress',
    priority: 'P0',
    route: '/admin/page-media',
    items: [
      'Pick hero images for Home, Drop 001, Apparel, Footwear, Equipment, Campaign, and Fight Club.',
      'Set object-position so heads/products are not cropped.',
      'Confirm mobile crop separately before locking defaults.',
      'Once correct, lock final values into repo so they are not browser-only.',
    ],
  },
  {
    area: 'Cinematic editor',
    status: 'in-progress',
    priority: 'P1',
    route: '/admin/cinematic',
    items: [
      'Remove weak/cropped/repeated frames.',
      'Restore mistakes if a frame is removed too quickly.',
      'Export removal manifest before permanent cleanup.',
      'Optimise opening video to poster-first loading.',
    ],
  },
  {
    area: 'Products',
    status: 'partial',
    priority: 'P0',
    route: '/drop-001',
    items: [
      'Only 3 products currently have live media: Cream Fight Boots, Cream Boxing Gloves, Black Sleeveless Hoodie.',
      'Keep missing-media products off the launch landing page until visuals are ready.',
      'Prepare final card, hover, and gallery images for all launch products.',
      'Check product detail page for each live product.',
    ],
  },
  {
    area: 'Waitlist',
    status: 'not-connected',
    priority: 'P0',
    route: '/fight-club',
    items: [
      'Current landing-page waitlist is front-end confirmation only.',
      'Connect to Klaviyo, Mailchimp, Supabase, or email capture endpoint before launch.',
      'Use the same waitlist backend on / and /fight-club.',
      'Add success/error states and test mobile entry.',
    ],
  },
  {
    area: 'Performance',
    status: 'pending',
    priority: 'P1',
    route: '/cinematic',
    items: [
      'Opening video must not block the homepage.',
      'Use poster-first loading.',
      'Compress production MP4 and consider WebM fallback.',
      'Check Vercel deployment speed and mobile load.',
    ],
  },
  {
    area: 'Supplier backend',
    status: 'usable',
    priority: 'P2',
    route: '/admin/suppliers',
    items: [
      'Use supplier admin for sample tracking, production readiness, QC, and purchase-order planning.',
      'Do not let supplier work block landing-page launch unless product claims depend on it.',
      'Keep supplier status separate from public launch visuals.',
    ],
  },
  {
    area: 'Launch QA',
    status: 'pending',
    priority: 'P0',
    route: '/',
    items: [
      'Check mobile header/menu.',
      'Check all public route links.',
      'Check product cards and product detail pages.',
      'Check 404 fallback route.',
      'Check footer and legal/basic contact details before paid traffic.',
    ],
  },
];

const adminTools = [
  { title: 'Page media', href: '/admin/page-media', copy: 'Logo, hero images, fit, crop, and page-level media control.' },
  { title: 'Cinematic editor', href: '/admin/cinematic', copy: 'Replace frames, remove weak frames, restore, and export cleanup manifest.' },
  { title: 'Product assets', href: '/admin', copy: 'Product media slots, candidate assets, and product visual review.' },
  { title: 'Suppliers', href: '/admin/suppliers', copy: 'Suppliers, contacts, samples, QC review, production, and PO centre.' },
];

function statusLabel(status) {
  return {
    'needs-review': 'Needs review',
    'in-progress': 'In progress',
    partial: 'Partial',
    'not-connected': 'Not connected',
    pending: 'Pending',
    usable: 'Usable',
  }[status] || status;
}

function severityLabel(severity) {
  return {
    critical: 'Critical blocker',
    high: 'High priority',
    medium: 'Medium priority',
  }[severity] || severity;
}

export default function AdminLaunchChecklist() {
  const criticalCount = blockers.filter((item) => item.severity === 'critical').length;
  const p0Count = checklist.filter((item) => item.priority === 'P0').length;

  return (
    <div className="alc-page">
      <Header />
      <main className="alc-shell">
        <section className="alc-hero">
          <p className="alc-kicker">AURA Admin</p>
          <h1>Launch command centre</h1>
          <p>Work from this page first. It keeps the landing page, media controls, cinematic editor, product readiness, waitlist, and launch QA in one operating view.</p>
          <div className="alc-scoreboard" aria-label="Launch status summary">
            <div><strong>{criticalCount}</strong><span>Critical blockers</span></div>
            <div><strong>{p0Count}</strong><span>P0 launch areas</span></div>
            <div><strong>3</strong><span>Products with live media</span></div>
            <div><strong>1</strong><span>Landing page ready for review</span></div>
          </div>
          <div className="alc-actions">
            <a href="/admin/page-media">Page media</a>
            <a href="/admin/cinematic">Cinematic editor</a>
            <a href="/admin/suppliers">Supplier admin</a>
            <a href="/">View landing page</a>
          </div>
        </section>

        <section className="alc-section">
          <div className="alc-section__head">
            <div>
              <p className="alc-kicker">Do not skip</p>
              <h2>Launch blockers</h2>
            </div>
            <p>These are the issues that can make the website look unfinished or stop launch traffic converting.</p>
          </div>
          <div className="alc-blocker-grid">
            {blockers.map((blocker) => (
              <article className={`alc-blocker alc-blocker--${blocker.severity}`} key={blocker.title}>
                <span>{severityLabel(blocker.severity)}</span>
                <h3>{blocker.title}</h3>
                <p>{blocker.action}</p>
                <small>{blocker.owner}</small>
                <a href={blocker.link}>{blocker.linkLabel}</a>
              </article>
            ))}
          </div>
        </section>

        <section className="alc-section">
          <div className="alc-section__head">
            <div>
              <p className="alc-kicker">When you get home</p>
              <h2>Correct work order</h2>
            </div>
            <p>Follow this order so the launch build does not collapse into random visual patches again.</p>
          </div>
          <div className="alc-flow">
            {workOrder.map((step) => (
              <article className="alc-step" key={step.step}>
                <strong>{step.step}</strong>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
                <div>
                  <a href={step.primary.href}>{step.primary.label}</a>
                  <a href={step.secondary.href}>{step.secondary.label}</a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="alc-section">
          <div className="alc-section__head">
            <div>
              <p className="alc-kicker">Admin tools</p>
              <h2>Control room</h2>
            </div>
            <p>Each admin page has a job. Use the right tool instead of changing public pages blindly.</p>
          </div>
          <div className="alc-tool-grid">
            {adminTools.map((tool) => (
              <a className="alc-tool" href={tool.href} key={tool.href}>
                <h3>{tool.title}</h3>
                <p>{tool.copy}</p>
                <span>Open →</span>
              </a>
            ))}
          </div>
        </section>

        <section className="alc-section">
          <div className="alc-section__head">
            <div>
              <p className="alc-kicker">Detailed checklist</p>
              <h2>Launch areas</h2>
            </div>
            <p>This is the full tactical list. Anything marked P0 should be reviewed before launch traffic.</p>
          </div>
          <section className="alc-grid">
            {checklist.map((section) => (
              <article className={`alc-card alc-card--${section.status}`} key={section.area}>
                <div className="alc-card__head">
                  <div>
                    <h2>{section.area}</h2>
                    <small>{section.priority} · {section.route}</small>
                  </div>
                  <span>{statusLabel(section.status)}</span>
                </div>
                <ul>
                  {section.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <a className="alc-card__route" href={section.route}>Open area →</a>
              </article>
            ))}
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}
