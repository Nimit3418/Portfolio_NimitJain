/** GET /api/contact/:trace -> delivery state only. Recipient and payload never leave Notify. */
import { eventStatus, TRACE } from '../../lib/notify.mjs';

const json = (res, code, body) => { res.statusCode = code; res.setHeader('content-type', 'application/json'); res.setHeader('cache-control', 'no-store'); res.end(JSON.stringify(body)); };

export default async function handler(req, res) {
  const trace = String(req.query?.trace ?? '');
  if (!TRACE.test(trace)) return json(res, 404, { error: 'Unknown trace' });
  try {
    const { data, ms } = await eventStatus(trace);
    return json(res, 200, {
      traceId: trace, status: data.status, createdAt: data.createdAt, updatedAt: data.updatedAt, lookupMs: ms,
      jobs: (data.jobs ?? []).map((j) => ({
        channel: j.channel, status: j.status, attempts: j.attempts, createdAt: j.createdAt, updatedAt: j.updatedAt,
        deliveryAttempts: (j.deliveryAttempts ?? []).map((a) => ({ attemptNumber: a.attemptNumber, status: a.status, provider: a.provider, attemptedAt: a.attemptedAt, error: a.errorMessage ? String(a.errorMessage).slice(0, 120) : null })),
      })),
    });
  } catch (e) {
    return json(res, 503, { error: 'Status lookup failed', detail: String(e).slice(0, 200) });
  }
}
