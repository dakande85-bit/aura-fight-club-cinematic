import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { useCart } from '../lib/commerce/useCart.js';
import '../styles/cart.css';

function money(value) {
  if (!value?.amount) return '';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: value.currencyCode || 'GBP',
  }).format(Number(value.amount));
}

export default function CartPage() {
  const { cart, configured, error, loading, updateLine, removeLine } = useCart();
  const lines = cart?.lines?.nodes || [];

  return (
    <div className="cart-page">
      <Header />
      <main className="cart-page__main">
        <p className="cart-page__eyebrow">AURA Fight Club</p>
        <h1>Cart</h1>

        {!configured && (
          <div className="cart-page__notice">
            Shopify Storefront API is not configured. Add the public Storefront environment variables to enable cart and checkout.
          </div>
        )}

        {error && <div className="cart-page__error">{error}</div>}
        {loading && <p className="cart-page__muted">Refreshing cart...</p>}

        {configured && lines.length === 0 && (
          <p className="cart-page__muted">Your cart is empty.</p>
        )}

        {lines.length > 0 && (
          <section className="cart-page__lines" aria-label="Cart lines">
            {lines.map((line) => (
              <article className="cart-page__line" key={line.id}>
                {line.merchandise?.image?.url && (
                  <img src={line.merchandise.image.url} alt={line.merchandise.image.altText || ''} loading="lazy" />
                )}
                <div>
                  <h2>{line.merchandise?.product?.title}</h2>
                  <p>{line.merchandise?.title}</p>
                  <p>{money(line.merchandise?.price)}</p>
                </div>
                <div className="cart-page__actions">
                  <input
                    type="number"
                    min="1"
                    value={line.quantity}
                    onChange={(event) => updateLine({ lineId: line.id, quantity: Number(event.target.value) })}
                    aria-label={`Quantity for ${line.merchandise?.product?.title}`}
                  />
                  <button type="button" onClick={() => removeLine(line.id)}>Remove</button>
                </div>
              </article>
            ))}
          </section>
        )}

        {cart?.checkoutUrl && (
          <a className="cart-page__checkout" href={cart.checkoutUrl}>
            Continue to Shopify Checkout
          </a>
        )}
      </main>
      <Footer />
    </div>
  );
}
