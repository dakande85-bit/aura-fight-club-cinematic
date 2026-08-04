import { createClient } from '@supabase/supabase-js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PRODUCT_RE = /^[a-z0-9][a-z0-9-]{1,80}$/;
const RATE_LIMIT = new Map();

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function getIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket?.remoteAddress || 'unknown')
    .split(',')[0]
    .trim();
}

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60_000;
  const max = 5;
  const bucket = (RATE_LIMIT.get(ip) || []).filter((time) => now - time < windowMs);
  bucket.push(now);
  RATE_LIMIT.set(ip, bucket);
  return bucket.length <= max;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    json(res, 405, { ok: false, error: { code: 'method_not_allowed', message: 'Use POST.' } });
    return;
  }

  if (!checkRateLimit(getIp(req))) {
    json(res, 429, { ok: false, error: { code: 'rate_limited', message: 'Please try again later.' } });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    json(res, 503, { ok: false, error: { code: 'waitlist_unconfigured', message: 'Waitlist is not configured.' } });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const email = String(body.email || '').trim().toLowerCase();
  const productSlug = String(body.productSlug || body.campaign || 'fight-club').trim().toLowerCase();
  const source = String(body.source || 'website').trim().slice(0, 80);
  const consent = body.consent === true;

  if (!EMAIL_RE.test(email)) {
    json(res, 400, { ok: false, error: { code: 'invalid_email', message: 'Enter a valid email address.' } });
    return;
  }

  if (!PRODUCT_RE.test(productSlug)) {
    json(res, 400, { ok: false, error: { code: 'invalid_product', message: 'Invalid waitlist target.' } });
    return;
  }

  if (!consent) {
    json(res, 400, { ok: false, error: { code: 'missing_consent', message: 'Consent is required.' } });
    return;
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin
    .from('waitlist_submissions')
    .upsert(
      { email, product_slug: productSlug, source, consent, submitted_at: new Date().toISOString() },
      { onConflict: 'email,product_slug' },
    )
    .select('id, email, product_slug')
    .single();

  if (error) {
    json(res, 500, { ok: false, error: { code: 'waitlist_store_failed', message: 'Unable to save your request.' } });
    return;
  }

  json(res, 200, { ok: true, data });
}
