import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/drops.css';

const currentCategories = [
  'Heavyweight tees',
  'Hoodies',
  'Sweatshirts',
  'Caps / beanies',
  'Campaign posters',
];

const upcomingCandidates = [
  'AURA boxing-style casual shoes',
  'AURA wrestling high-top trainer',
  'AURA sauna suit',
  'AURA boxing gloves',
  'AURA hand wraps',
  'AURA fight bag',
  'AURA premium tracksuit',
  'AURA compression/performance wear',
];

const pipeline = [
  { product: 'AURA Fight Club Apparel', drop: 'Drop 001', stage: 'POD setup', status: 'Waitlist opening' },
  { product: 'AURA Campaign Posters', drop: 'Drop 001', stage: 'POD setup', status: 'Launch candidate' },
  { product: 'AURA Boxing-Style Shoe', drop: 'Drop 002', stage: 'Supplier research', status: 'Sample required' },
  { product: 'AURA Sauna Suit', drop: 'Drop 002', stage: 'Supplier shortlist', status: 'Sample required' },
  { product: 'AURA Boxing Gloves', drop: 'Drop 002', stage: 'Supplier shortlist', status: 'Quality testing required' },
  { product: 'AURA Fight Bag', drop: 'Drop 002', stage: 'Design phase', status: 'Supplier quote needed' },
  { product: 'AURA Premium Tracksuit', drop: 'Drop 002', stage: 'Supplier research', status: 'Fabric sample required' },
];

function DropCard({ eyebrow, title, status, copy, items, cta, href }) {
  return (
    <article className="drops-card">
      <div className="drops-card__head">
        <p>{eyebrow}</p>
        <span>{status}</span>
      </div>
      <h3>{title}</h3>
      <p className="drops-card__copy">{copy}</p>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <a className="drops-link" href={href}>{cta}</a>
    </article>
  );
}

export default function Drops() {
  return (
    <div className="drops-page">
      <Header />
      <main>
        <section className="drops-hero">
          <p className="drops-eyebrow">AURA FIGHT CLUB</p>
          <h1>DROPS</h1>
          <p className="drops-subtitle">CURRENT RELEASES. UPCOMING GEAR. WAITLIST ACCESS.</p>
          <p className="drops-hero__copy">
            AURA drops are released in stages. Drop 001 begins with POD-ready apparel and campaign pieces. Drop 002 moves into supplier-built fight lifestyle gear after samples, quality checks, and production approval.
          </p>
          <div className="drops-actions">
            <a className="drops-btn drops-btn--primary" href="/drop-001">VIEW DROP 001</a>
            <a className="drops-btn drops-btn--ghost" href="#waitlist">JOIN WAITLIST</a>
          </div>
        </section>

        <section className="drops-section" aria-labelledby="current-drop-title">
          <div className="drops-section__head">
            <p className="drops-eyebrow">RELEASE STATUS</p>
            <h2 id="current-drop-title">CURRENT DROP</h2>
          </div>
          <DropCard
            eyebrow="DROP 001"
            title="DROP 001 - POD LAUNCH"
            status="COMING SOON / WAITLIST"
            copy="The first AURA release focuses on premium POD-ready apparel and campaign pieces that can launch quickly through Gelato or Printful while supplier-built gear is developed properly."
            items={currentCategories}
            cta="View Drop 001"
            href="/drop-001"
          />
        </section>

        <section className="drops-section drops-section--split" aria-labelledby="upcoming-drop-title">
          <div className="drops-section__head">
            <p className="drops-eyebrow">SUPPLIER BUILT</p>
            <h2 id="upcoming-drop-title">UPCOMING DROP</h2>
          </div>
          <DropCard
            eyebrow="DROP 002"
            title="DROP 002 - SUPPLIER-BUILT GEAR"
            status="IN DEVELOPMENT"
            copy="Drop 002 is reserved for products that need supplier conversations, samples, testing, and quality control before launch. These products should not go live until materials, fit, sizing, and production quality are confirmed."
            items={upcomingCandidates}
            cta="Join Drop 002 Waitlist"
            href="#waitlist"
          />
        </section>

        <section className="drops-section drops-pipeline" aria-labelledby="pipeline-title">
          <div className="drops-section__head">
            <p className="drops-eyebrow">ROADMAP</p>
            <h2 id="pipeline-title">PRODUCT PIPELINE</h2>
            <p>
              The pipeline shows what is ready to launch, what needs supplier approval, and what is being prepared for future drops.
            </p>
          </div>
          <div className="drops-pipeline__grid">
            {pipeline.map((item) => (
              <article className="drops-pipeline__item" key={`${item.product}-${item.drop}`}>
                <span>{item.drop}</span>
                <h3>{item.product}</h3>
                <dl>
                  <div>
                    <dt>Stage</dt>
                    <dd>{item.stage}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{item.status}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="drops-waitlist" id="waitlist" aria-labelledby="drops-waitlist-title">
          <div>
            <p className="drops-eyebrow">EARLY ACCESS</p>
            <h2 id="drops-waitlist-title">JOIN THE DROP LIST</h2>
            <p>
              Join the AURA Drop List for early access to Drop 001 and updates when Drop 002 samples are approved.
            </p>
          </div>
          <form className="drops-form">
            <label>
              <span>Name</span>
              <input type="text" name="name" placeholder="Your name" />
            </label>
            <label>
              <span>Email</span>
              <input type="email" name="email" placeholder="you@example.com" />
            </label>
            <label>
              <span>Interested in</span>
              <select name="interest" defaultValue="All Drops">
                <option>Apparel</option>
                <option>Footwear</option>
                <option>Equipment</option>
                <option>All Drops</option>
              </select>
            </label>
            <button type="button">JOIN WAITLIST</button>
            <p>Waitlist opening soon.</p>
          </form>
        </section>

        <section className="drops-closing" aria-labelledby="drops-closing-title">
          <p className="drops-eyebrow">DROP 001 STARTS THE STANDARD</p>
          <h2 id="drops-closing-title">DROP 001 STARTS THE STANDARD</h2>
          <p>
            AURA launches with what can be delivered cleanly first. The serious gear follows only after samples, suppliers, and quality checks are ready.
          </p>
          <div className="drops-actions">
            <a className="drops-btn drops-btn--primary" href="/drop-001">View Drop 001</a>
            <a className="drops-btn drops-btn--ghost" href="/fight-club">Enter Fight Club</a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
