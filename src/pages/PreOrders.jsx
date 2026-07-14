import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import LaunchProductCard from '../components/LaunchProductCard.jsx';
import { activePreorderProducts } from '../data/activeShopifyProducts.js';
import { getPreorderProduct } from '../data/preorderProducts.js';
import { applyProductOverride } from '../data/productOverrides.js';
import '../styles/preorders.css';

const processSteps = [
  {
    number: '01',
    title: 'Choose your piece',
    copy: 'Select the product, size, colour, and any fighter personalisation you want.',
  },
  {
    number: '02',
    title: 'Confirm and pay',
    copy: 'AURA confirms the final specification, delivery address, and full payment before production.',
  },
  {
    number: '03',
    title: 'Made for you',
    copy: 'The supplier produces your individual order. Estimated delivery is 5–7 weeks.',
  },
];

const sleevelessHoodie = applyProductOverride(getPreorderProduct('aura-sleeveless-training-hoodie'));
const displayPreorderProducts = [
  ...(sleevelessHoodie ? [sleevelessHoodie] : []),
  ...activePreorderProducts.filter((product) => product.slug !== 'aura-sleeveless-training-hoodie'),
];

export default function PreOrders() {
  return (
    <div className="preorder-page">
      <Header />

      <main>
        <section className="preorder-hero">
          <div className="preorder-hero__media" aria-hidden="true">
            <img
              src="/assets/products/aura-cream-boxing-gloves/card-hover-model.webp"
              alt=""
              fetchPriority="high"
              decoding="async"
            />
          </div>
          <div className="preorder-hero__shade" />
          <div className="preorder-hero__content">
            <p className="preorder-kicker">AURA / MADE TO ORDER</p>
            <h1>ORDER FIRST.<br />WE MAKE IT.</h1>
            <p className="preorder-hero__copy">
              Active AURA fight pieces produced only after an order is confirmed. No mass stock, no wasted inventory, and no compromise on identity.
            </p>
            <div className="preorder-hero__actions">
              <a href="#preorder-products" className="preorder-button preorder-button--light">View Pre-Orders</a>
              <Link to="/drop-001" className="preorder-button">Shop Faster-Delivery Drop 001</Link>
            </div>
            <p className="preorder-hero__notice">Made to order / estimated delivery 5–7 weeks</p>
          </div>
        </section>

        <section className="preorder-intro" aria-labelledby="preorder-intro-title">
          <div>
            <p className="preorder-kicker">A DIFFERENT RELEASE MODEL</p>
            <h2 id="preorder-intro-title">SPECIALIST PIECES WITHOUT THE WAITING STOCK.</h2>
          </div>
          <div className="preorder-intro__copy">
            <p>
              These products are separate from AURA’s print-on-demand clothing. They take longer because each order is submitted individually for production after payment.
            </p>
            <p>
              Products with strong demand can later move into small stocked batches for faster dispatch. Your order helps decide what AURA produces next.
            </p>
          </div>
        </section>

        <section className="preorder-process" aria-label="How AURA pre-orders work">
          {processSteps.map((step) => (
            <article key={step.number} className="preorder-process__card">
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </section>

        <section className="preorder-products" id="preorder-products" aria-labelledby="preorder-products-title">
          <div className="preorder-products__head">
            <div>
              <p className="preorder-kicker">CURRENT PRE-ORDERS</p>
              <h2 id="preorder-products-title">MADE FOR THE FIGHTER.</h2>
            </div>
            <p>{displayPreorderProducts.length} active specialist products available individually.</p>
          </div>

          <div className="preorder-products__grid">
            {displayPreorderProducts.map((product) => (
              <LaunchProductCard product={product} key={product.slug} />
            ))}
          </div>
        </section>

        <section className="preorder-demand" aria-labelledby="preorder-demand-title">
          <div>
            <p className="preorder-kicker">FROM PRE-ORDER TO STOCKED DROP</p>
            <h2 id="preorder-demand-title">YOU SHOW US WHAT SHOULD STAY.</h2>
          </div>
          <div>
            <p>
              AURA begins by ordering each piece one at a time. When a product proves demand, we can produce a ten-unit batch, hold stock, and reduce future delivery times.
            </p>
            <Link to="/cart" className="preorder-button preorder-button--light">View Your Cart</Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
