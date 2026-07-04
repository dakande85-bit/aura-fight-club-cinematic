import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { dropOneProducts } from '../data/products.js';
import { formatPriceEUR, getShopProduct, isShopProduct } from '../data/shopProducts.js';
import '../styles/cart.css';

const CART_KEY = 'aura_cart_v1';
const CONTACT_EMAIL = 'hello@aurafightclub.com';

function loadCart() {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function getProduct(slug) {
  return dropOneProducts.find((product) => product.slug === slug) || null;
}

function buildCartLine(slug) {
  const product = getProduct(slug);
  const shop = getShopProduct(slug);
  if (!product || !shop) return null;

  return {
    slug,
    name: product.name,
    category: product.category,
    image: product.image,
    priceEUR: shop.priceEUR,
    size: shop.sizes?.[0] || 'One Size',
    quantity: 1,
  };
}

function addToCart(items, slug) {
  if (!isShopProduct(slug)) return items;
  const existing = items.find((item) => item.slug === slug);
  if (existing) {
    return items.map((item) => item.slug === slug ? { ...item, quantity: item.quantity + 1 } : item);
  }
  const line = buildCartLine(slug);
  return line ? [...items, line] : items;
}

function orderSummary(items) {
  return items
    .map((item) => `${item.quantity} x ${item.name} - ${item.size} - ${formatPriceEUR(item.priceEUR)} each`)
    .join('\n');
}

export default function Cart() {
  const location = useLocation();
  const [items, setItems] = useState(() => loadCart());
  const [customer, setCustomer] = useState({ name: '', email: '', notes: '' });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const slug = params.get('add');
    if (!slug) return;

    setItems((current) => {
      const next = addToCart(current, slug);
      saveCart(next);
      return next;
    });
  }, [location.search]);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.priceEUR * item.quantity, 0), [items]);
  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent('AURA order request');
    const body = encodeURIComponent([
      'AURA order request',
      '',
      `Name: ${customer.name}`,
      `Email: ${customer.email}`,
      '',
      'Items:',
      orderSummary(items),
      '',
      `Total: ${formatPriceEUR(total)}`,
      '',
      `Notes: ${customer.notes}`,
    ].join('\n'));
    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }, [customer, items, total]);

  function updateQuantity(slug, delta) {
    setItems((current) => current
      .map((item) => item.slug === slug ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  }

  function removeItem(slug) {
    setItems((current) => current.filter((item) => item.slug !== slug));
  }

  function clearCart() {
    setItems([]);
    saveCart([]);
  }

  return (
    <div className="cart-page">
      <Header />
      <main className="cart-main">
        <section className="cart-hero">
          <p className="cart-eyebrow">AURA Checkout</p>
          <h1>Your Cart</h1>
          <p>Drop 001 items are available to order. Review your items and send the order request.</p>
        </section>

        {items.length === 0 ? (
          <section className="cart-empty">
            <h2>Your cart is empty.</h2>
            <p>Add Drop 001 apparel or accessories to start an order.</p>
            <Link to="/drop-001" className="cart-btn cart-btn--primary">Shop Drop 001</Link>
          </section>
        ) : (
          <section className="cart-layout">
            <div className="cart-items">
              {items.map((item) => (
                <article className="cart-item" key={item.slug}>
                  <div className="cart-item__media">
                    {item.image ? <img src={item.image} alt={item.name} loading="lazy" decoding="async" /> : <span>AURA</span>}
                  </div>
                  <div className="cart-item__body">
                    <p>{item.category}</p>
                    <h2>{item.name}</h2>
                    <label>
                      Size
                      <select
                        value={item.size}
                        onChange={(event) => setItems((current) => current.map((line) => line.slug === item.slug ? { ...line, size: event.target.value } : line))}
                      >
                        {(getShopProduct(item.slug)?.sizes || ['One Size']).map((size) => <option key={size}>{size}</option>)}
                      </select>
                    </label>
                    <div className="cart-item__controls">
                      <button type="button" onClick={() => updateQuantity(item.slug, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.slug, 1)}>+</button>
                    </div>
                    <button className="cart-remove" type="button" onClick={() => removeItem(item.slug)}>Remove</button>
                  </div>
                  <strong>{formatPriceEUR(item.priceEUR * item.quantity)}</strong>
                </article>
              ))}
            </div>

            <aside className="cart-summary">
              <p className="cart-eyebrow">Order Summary</p>
              <div className="cart-summary__row">
                <span>Subtotal</span>
                <strong>{formatPriceEUR(total)}</strong>
              </div>
              <p className="cart-note">Shipping and final payment are confirmed after your order request is received.</p>

              <label>
                Name
                <input value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Your name" />
              </label>
              <label>
                Email
                <input value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} placeholder="you@example.com" />
              </label>
              <label>
                Notes
                <textarea value={customer.notes} onChange={(event) => setCustomer({ ...customer, notes: event.target.value })} placeholder="Colour, delivery country, or anything else" />
              </label>

              <a className="cart-btn cart-btn--primary" href={mailtoHref}>Place Order Request</a>
              <Link className="cart-btn cart-btn--ghost" to="/drop-001">Continue Shopping</Link>
              <button className="cart-clear" type="button" onClick={clearCart}>Clear Cart</button>
            </aside>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
