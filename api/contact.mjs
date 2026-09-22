/**
 * POST /api/contact  { name, email, message, page, company? }  ->  { traceId, status, ms }
 * Hands the message to Notify (tenant nimit, event nimit.contact). Honeypot, 3 messages per 10 minutes per IP.
 */
import { ingestContact, newTraceId, OWNER_EMAIL } from '../lib/notify.mjs';

const rate = new Map();
function limited(ip) {
  const now = Date.now();
  const recent = (rate.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  rate.set(ip, recent);
  return recent.length > 3;
}
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const json = (res, code, body) => { res.statusCode = code; res.setHeader('content-type', 'application/json'); res.setHeader('cache-control', 'no-store'); res.end(JSON.stringify(body)); };

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'POST only' });
  const ip = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || req.socket?.remoteAddress || 'anon';
  const body = req.body && typeof req.body === 'object' ? req.body : {};

  // Honeypot: real people never see this field.
  if (typeof body.company === 'string' && body.company.length > 0) return json(res, 202, { traceId: newTraceId(), status: 'RECEIVED', ms: 0 });

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const message = String(body.message ?? '').trim();
  const page = String(body.page ?? '/').slice(0, 120);
  if (name.length < 2 || name.length > 80) return json(res, 400, { error: 'Name should be 2 to 80 characters.' });
  if (!EMAIL.test(email) || email.length > 120) return json(res, 400, { error: 'That email address does not look right.' });
  if (message.length < 10 || message.length > 2000) return json(res, 400, { error: 'Message should be 10 to 2000 characters.' });
  if (limited(ip)) return json(res, 429, { error: `Three messages per ten minutes is the limit. Email works too: ${OWNER_EMAIL}.` });

  const traceId = newTraceId();
  try {
    const { data, ms } = await ingestContact(traceId, { name, email, message, page });
    return json(res, 202, { traceId, eventId: data.id, status: data.status, ms, acceptedAt: new Date().toISOString() });
  } catch (e) {
    return json(res, 503, { error: `Notify did not accept the message. Email me directly at ${OWNER_EMAIL}.`, detail: String(e).slice(0, 200) });
  }
}
