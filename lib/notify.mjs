/**
 * Server-only client for Notify (https://github.com/Satyam087/notify), the notification service
 * behind this site's contact form. Tenant: nimit. The API key lives in Vercel env vars (NOTIFY_API_KEY)
 * or the gitignored .env; it never reaches the browser.
 */
import { env } from '../rag/lib/providers.mjs';

export const TENANT = 'nimit';
export const EVENT_TYPE = 'nimit.contact';
export const OWNER_EMAIL = 'jainnimit34b@gmail.com';
const RECIPIENT_USER_ID = 'nimit';

const base = () => (env('NOTIFY_BASE_URL') ?? 'https://notify-prod.onrender.com').replace(/\/$/, '');
const apiKey = () => { const k = env('NOTIFY_API_KEY'); if (!k) throw new Error('NOTIFY_API_KEY is not set'); return k; };

async function call(path, init = {}, timeoutMs = 12_000) {
  const t0 = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${base()}${path}`, { ...init, signal: ctrl.signal, headers: { 'content-type': 'application/json', 'x-notify-api-key': apiKey(), ...(init.headers ?? {}) } });
    const text = await res.text();
    if (!res.ok) throw new Error(`Notify ${res.status} on ${path}: ${text.slice(0, 160)}`);
    return { data: JSON.parse(text), ms: Date.now() - t0 };
  } finally { clearTimeout(timer); }
}

/** Idempotency key doubles as the public trace id: opaque, unguessable, no personal data. */
export function newTraceId() {
  const rand = crypto.getRandomValues(new Uint8Array(9));
  const b = Array.from(rand, (x) => x.toString(36).padStart(2, '0')).join('').slice(0, 14);
  return `contact-${Date.now().toString(36)}-${b}`;
}
export const TRACE = /^contact-[a-z0-9]{6,12}-[a-z0-9]{8,16}$/;

export function ingestContact(traceId, { name, email, message, page }) {
  return call('/api/v1/events', {
    method: 'POST',
    body: JSON.stringify({
      tenantId: TENANT,
      eventType: EVENT_TYPE,
      idempotencyKey: traceId,
      recipient: { userId: RECIPIENT_USER_ID, email: OWNER_EMAIL },
      // fromName and replyTo are read by Notify's email channel: the mail shows the site as sender, replies go to the visitor.
      payload: { name, email, message, page, traceId, fromName: "Nimit Jain's site", replyTo: email },
    }),
  });
}

export function eventStatus(traceId) {
  const q = new URLSearchParams({ tenantId: TENANT, idempotencyKey: traceId });
  return call(`/api/v1/events/status?${q}`);
}
