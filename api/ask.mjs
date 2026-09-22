/**
 * POST /api/ask  { q: string }  ->  AskResult
 * Vercel serverless function. Rate limited per IP, answers cached per question for an hour.
 * Keys (GROQ_API_KEY, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN or GEMINI_API_KEY) live in
 * Vercel project env vars; nothing reaches the client but the answer.
 */
import { askChat } from '../rag/lib/ask.mjs';

const MAX_LEN = 300;
const rate = new Map();
const cache = new Map();

function limited(ip) {
  const now = Date.now();
  const r = rate.get(ip);
  if (!r || now - r.t > 60_000) { rate.set(ip, { n: 1, t: now }); return false; }
  r.n += 1;
  return r.n > 20;
}

export default async function handler(req, res) {
  res.setHeader('content-type', 'application/json');
  if (req.method !== 'POST') return res.status(405).end(JSON.stringify({ error: 'POST only' }));
  const ip = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || req.socket?.remoteAddress || 'anon';
  if (limited(ip)) return res.status(429).end(JSON.stringify({ error: 'Too many questions; try again in a minute.' }));

  const q = String(req.body?.q ?? '').trim();
  if (q.length < 3 || q.length > MAX_LEN) return res.status(400).end(JSON.stringify({ error: `Ask between 3 and ${MAX_LEN} characters.` }));
  const history = (Array.isArray(req.body?.history) ? req.body.history : [])
    .slice(-6)
    .map((m) => ({ role: m?.role === 'you' ? 'you' : 'tower', text: String(m?.text ?? '').slice(0, 500) }))
    .filter((m) => m.text);

  const key = q.toLowerCase().replace(/\s+/g, ' ');
  const hit = history.length ? undefined : cache.get(key); // follow-ups are conversation-specific, no cache
  if (hit && Date.now() - hit.at < 3_600_000) { res.setHeader('x-cache', 'hit'); return res.status(200).end(hit.body); }

  try {
    const result = await askChat(q, history);
    const body = JSON.stringify(result);
    if (!history.length) cache.set(key, { at: Date.now(), body });
    res.setHeader('cache-control', 'no-store');
    return res.status(200).end(body);
  } catch (e) {
    return res.status(503).end(JSON.stringify({ error: 'The tower is off frequency right now. Email works: jainnimit34b@gmail.com', detail: String(e).slice(0, 200) }));
  }
}
