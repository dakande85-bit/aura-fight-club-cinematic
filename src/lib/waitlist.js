export async function submitWaitlist({ email, productSlug, source = 'website', consent = true }) {
  const response = await fetch('/api/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, productSlug, source, consent }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    const message = payload?.error?.message || 'Unable to join the waitlist right now.';
    throw new Error(message);
  }

  return payload.data;
}
