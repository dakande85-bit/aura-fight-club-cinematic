import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { products, dropOneProducts } from '../data/products.js';
import { preorderProducts } from '../data/preorderProducts.js';
import { getActiveShopifyProduct } from '../data/activeShopifyProducts.js';
import { formatPriceEUR, getShopProduct, isShopProduct } from '../data/shopProducts.js';
import { getStandaloneProductOverride } from '../data/productOverrides.js';
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
  return getActiveShopifyProduct(slug)
    || preorderProducts.find((product) => product.slug === slug)
    || dropOneProducts.find((product) => product.slug === slug)
    || products.find((product) => product.slug === slug)
    || getStandaloneProductOverride(slug)
    || null;
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
    colour: shop.colours?.[0] || shop.colour || '',
    personalisation: '',
    preorder: Boolean(shop.preorder),
    leadTime: shop.leadTime || '',
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
    .map((item) => {
      const shop = getShopProduct(item.slug);
      const fields = [
        `${item.quantity} x ${item.name}`,
        item.size,
        item.colour || shop?.colour,
        item.personalisation ? `Personalisation: ${item.personalisation}` : null,
        item.preorder || shop?.preorder ? 'PRE-ORDER / MADE TO ORDER' : null,
        `${formatPriceEUR(item.priceEUR)} each`,
      ].filter(Boolean);
      return fields.join(' - ');
    })
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

  const hasPreorders = items.some((item) => item.preorder || getShopProduct(item.slug)?.preorder);
  const total = useMemo(() => items.reduce((sum, item) => sum + item.priceEUR * item.quantity, 0), [items]);
  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent(hasPreorders ? 'AURA pre-order request' : 'AURA order request');
    const body = encodeURIComponent([
      hasPreorders ? 'AURA PRE-ORDER REQUEST' : 'AURA ORDER REQUEST',
      '',
      `Name: ${customer.name}`,
      `Email: ${customer.email}`,
      '',
      'Items:',
      orderSummary(items),
      '',
      `Total product value: ${formatPriceEUR(total)}`,
      '',
      hasPreorders ? 'I understand production begins only after full payment and final specifications are confirmed.' : '',
      hasPreorders ? 'Estimated made-to-order delivery: 5-7 weeks after confirmation.' : '',
      '',
      `Notes: ${customer.notes}`,
    ].filter((line) => line !== '').join('\n'));
    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }, [customer, hasPreorders, items, total]);

  function updateQuantity(slug, delta) {
    setItems((current) => current
      .map((item) => item.slug === slug ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  }

  function updateLine(slug, field, value) {
    setItems((current) => current.map((line) => line.slug === slug ? { ...line, [field]: value } : line));
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
          <h1>{hasPreorders ? 'Your Pre-Order' : 'Your Cart'}</h1>
          <p>
            {hasPreorders
              ? 'Confirm your size, colour, and personalisation. Full payment is arranged before made-to-order production begins.'
              : 'Review your items and send the order request.'}
          </p>
        </section>

        {items.length === 0 ? (
          <section className="cart-empty">
            <h2>Your cart is empty.</h2>
            <p>Add AURA apparel, equipment, or made-to-order pre-orders to begin.</p>
            <Link to="/apparel" className="cart-btn cart-btn--primary">Shop AURA</Link>
          </section>
        ) : (
          <section className="cart-layout">
            <div className="cart-items">
              {items.map((item) => {
                const shop = getShopProduct(item.slug);
                const isPreorder = Boolean(item.preorder || shop?.preorder);
                return (
                  <article className="cart-item" key={item.slug}>
                    <div className="cart-item__media">
                      {item.image ? <img src={item.image} alt={item.name} loading="lazy" decoding="async" /> : <span>AURA</span>}
                    </div>
                    <div className="cart-item__body">
                      <p>{isPreorder ? 'PRE-ORDER / MADE TO ORDER' : item.category}</p>
                      <h2>{item.name}</h2>
                      <label>
                        Size
                        <select
                          value={item.size}
                          onChange={(event) => updateLine(item.slug, 'size', event.target.value)}
                        >
                          {(shop?.sizes || ['One Size']).map((size) => <option key={size}>{size}</option>)}
                        </select>
                      </label>
                      {(shop?.colours?.length || item.colour) ? (
                        <label>
                          Colour
                          <select
                            value={item.colour || shop?.colours?.[0] || ''}
                            onChange={(event) => updateLine(item.slug, 'colour', event.target.value)}
                          >
                            {(shop?.colours || [shop?.colour || item.colour]).filter(Boolean).map((colour) => <option key={colour}>{colour}</option>)}
                          </select>
                        </label>
                      ) : null}
                      {shop?.personalisation ? (
                        <label>
                          Fighter name / personalisation
                          <input
                            value={item.personalisation || ''}
                            onChange={(event) => updateLine(item.slug, 'personalisation', event.target.value)}
                            placeholder="Optional - confirm spelling carefully"
                          />
                        </label>
                      ) : null}
                      {isPreorder ? <p>{shop?.leadTime || 'Estimated delivery: 5-7 weeks'}</p> : null}
                      <div className="cart-item__controls">
                        <button type="button" onClick={() => updateQuantity(item.slug, -1)}>-</button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.slug, 1)}>+</button>
                      </div>
                      <button className="cart-remove" type="button" onClick={() => removeItem(item.slug)}>Remove</button>
                    </div>
                    <strong>{formatPriceEUR(item.priceEUR * item.quantity)}</strong>
                  </article>
                );
              })}
            </div>

            <aside className="cart-summary">
              <p className="cart-eyebrow">{hasPreorders ? 'Pre-Order Summary' : 'Order Summary'}</p>
              <div className="cart-summary__row">
                <span>Product total</span>
                <strong>{formatPriceEUR(total)}</strong>
              </div>
              <p className="cart-note">
                {hasPreorders
                  ? 'Shipping is confirmed separately. Full payment must clear before the supplier order is placed and production begins.'
                  : 'Shipping and final payment are confirmed after your order request is received.'}
              </p>

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
                <textarea value={customer.notes} onChange={(event) => setCustomer({ ...customer, notes: event.target.value })} placeholder="Delivery country, deadline, or anything else" />
              </label>

              <a className="cart-btn cart-btn--primary" href={mailtoHref}>{hasPreorders ? 'Submit Pre-Order Request' : 'Place Order Request'}</a>
              <Link className="cart-btn cart-btn--ghost" to="/apparel">Continue Shopping</Link>
              <button className="cart-clear" type="button" onClick={clearCart}>Clear Cart</button>
            </aside>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
