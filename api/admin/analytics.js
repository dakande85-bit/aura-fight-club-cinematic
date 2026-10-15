import { createHash, timingSafeEqual } from 'node:crypto';

/**
 * Private Aura newsroom analytics proxy. Never put Vercel API credentials in Vite env vars.
 * Credentials: AURA_ANALYTICS_ADMIN_PASSWORD (falls back to ARTICLE_EDITOR_PASSWORD),
 * AURA_VERCEL_TOKEN, optional AURA_VERCEL_PROJECT_ID and AURA_VERCEL_TEAM_ID.
 */
const PROJECT_ID = process.env.AURA_VERCEL_PROJECT_ID || 'prj_csrVYmjsoZFLuqPtjZDE0j5zBp2U';
const TEAM_ID = process.env.AURA_VERCEL_TEAM_ID || 'team_dbaQGgEAfQg3bdl0pZhrmitX';
const send = (res, status, body) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(body));
};
const sameSecret = (provided, expected) => {
  const digest = value => createHash('sha256').update(value).digest();
  return timingSafeEqual(digest(provided), digest(expected));
};
const dateDaysAgo = days => new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);

async function requestAnalytics(endpoint, values, token) {
  const url = new URL('https://api.vercel.com/v1/query/web-analytics/' + endpoint);
  Object.entries({ projectId: PROJECT_ID, teamId: TEAM_ID, ...values }).forEach(([name, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.append(name, String(value));
  });
  const response = await fetch(url, {
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    const error = new Error(response.status === 401 || response.status === 403
      ? 'The Vercel token is not authorized for this project. Check its team scope.'
      : response.status === 404 ? 'Vercel Web Analytics is not enabled or the API is unavailable.'
        : 'Vercel Web Analytics returned HTTP ' + response.status + '.');
    error.status = response.status;
    throw error;
  }
  const json = await response.json();
  return json.data;
}

export default async function handler(req, res) {
  res.setHeader('Allow', 'GET');
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  const expected = process.env.AURA_ANALYTICS_ADMIN_PASSWORD || process.env.ARTICLE_EDITOR_PASSWORD;
  if (!expected) return send(res, 503, { error: 'Analytics admin password not configured on the server.' });
  const authorization = req.headers.authorization || '';
  const supplied = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!supplied || supplied.length > 256 || !sameSecret(supplied, expected)) {
    return send(res, 401, { error: 'Invalid newsroom credentials.' });
  }
  const token = process.env.AURA_VERCEL_TOKEN;
  if (!token) return send(res, 503, { error: 'AURA_VERCEL_TOKEN is missing. Add a Vercel access token to Production and Preview environment variables.' });

  const days = req.query?.days === '7' ? 7 : 30;
  const since = dateDaysAgo(days - 1);
  const until = new Date().toISOString().slice(0, 10);
  const params = { since, until };
  const queries = {
    total: ['visits/count', params],
    trend: ['visits/aggregate', { ...params, by: 'day', limit: 31 }],
    pages: ['visits/aggregate', { ...params, by: 'requestPath', limit: 20 }],
    referrers: ['visits/aggregate', { ...params, by: 'referrerHostname', limit: 12 }],
    devices: ['visits/aggregate', { ...params, by: 'deviceType', limit: 8 }],
    countries: ['visits/aggregate', { ...params, by: 'country', limit: 12 }],
    sources: ['visits/aggregate', { ...params, by: 'utmSource', limit: 12 }],
  };
  const entries = Object.entries(queries);
  const settled = await Promise.allSettled(entries.map(([, [endpoint, query]]) => requestAnalytics(endpoint, query, token)));
  const result = { range: { days, since, until }, retrievedAt: new Date().toISOString(), configured: true, errors: {} };
  settled.forEach((item, index) => {
    const key = entries[index][0];
    if (item.status === 'fulfilled') {
      result[key] = item.value;
    } else {
      result[key] = null;
      result.errors[key] = item.reason?.message || 'Analytics query failed.';
    }
  });
  if (Object.keys(result.errors).length === entries.length) {
    return send(res, 502, { error: result.errors.total || 'Could not retrieve analytics.' });
  }
  return send(res, 200, result);
}
