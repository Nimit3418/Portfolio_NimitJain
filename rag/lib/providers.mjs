/**
 * Provider layer for Ask the tower (Nimit's RAG chat). Generation: Groq (gpt-oss-120b) first,
 * Gemini as fallback. Embeddings: Cloudflare Workers AI (bge-m3, 1024 dims) when a token and
 * account id are set; Gemini otherwise. Keys are read server-side only (.env locally, project
 * env vars on Vercel). The index records which embedding model built it; ask() refuses to
 * compare vectors from a different model. Ported from satyamkumarsingh.com's rag library.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

export function env(name) {
  if (process.env[name]) return process.env[name];
  try {
    const m = readFileSync(new URL('../../.env', import.meta.url), 'utf8').match(new RegExp(`^${name}=(.+)$`, 'm'));
    if (m) return m[1].trim();
  } catch {}
  return undefined;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function normalize(v) {
  const n = Math.hypot(...v) || 1;
  return v.map((x) => +(x / n).toFixed(5));
}
export function cosine(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s; // both normalised
}

/* ---------------- Embeddings ---------------- */
export const CF_MODEL = '@cf/baai/bge-m3';
export const CF_DIMS = 1024;
export const GEMINI_EMBED_MODEL = 'gemini-embedding-2';
export const GEMINI_EMBED_DIMS = 768;
const cfToken = () => env('CLOUDFLARE_API_TOKEN') ?? env('WORKER_AI');
const cfAccount = () => env('CLOUDFLARE_ACCOUNT_ID');

export const EMBED = cfToken() && cfAccount()
  ? { provider: 'cloudflare', model: CF_MODEL, dims: CF_DIMS }
  : { provider: 'gemini', model: GEMINI_EMBED_MODEL, dims: GEMINI_EMBED_DIMS };
export const EMBED_ID = `${EMBED.provider}:${EMBED.model}@${EMBED.dims}`;

/* Optional on-disk cache for scripts (EMBED_CACHE=path), keyed by model, task and text. Never used by the server. */
const cachePath = typeof process !== 'undefined' ? process.env.EMBED_CACHE : undefined;
let cache = null;
function cacheGet(key) { if (!cachePath) return; if (!cache) cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, 'utf8')) : {}; return cache[key]; }
function cachePut(key, v) { if (!cachePath || !cache) return; cache[key] = v; writeFileSync(cachePath, JSON.stringify(cache)); }

async function cloudflareEmbed(texts, attempt = 0) {
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccount()}/ai/run/${CF_MODEL}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${cfToken()}`, 'content-type': 'application/json' },
    body: JSON.stringify({ text: texts }),
  });
  if (r.status === 429 && attempt < 3) { await sleep(2_000 * (attempt + 1)); return cloudflareEmbed(texts, attempt + 1); }
  const j = await r.json();
  if (!r.ok || !j.success) throw new Error(`cloudflare ${r.status} ${JSON.stringify(j.errors ?? '').slice(0, 160)}`);
  return j.result.data.map(normalize);
}

/* ---------------- Gemini (embeddings fallback + generation fallback) ---------------- */
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_GEN_MODELS = ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest'];

async function geminiPost(model, method, body, attempt = 0) {
  const key = env('GEMINI_API_KEY');
  if (!key) throw new Error('GEMINI_API_KEY is not set');
  const r = await fetch(`${GEMINI_BASE}/${model}:${method}?key=${key}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json();
  if (r.status === 429 && attempt < 3) {
    const hint = Number(String(j?.error?.message ?? '').match(/retry in ([\d.]+)s/i)?.[1]);
    await sleep(Math.min(65_000, (Number.isFinite(hint) ? hint * 1000 : 15_000 * (attempt + 1)) + 500));
    return geminiPost(model, method, body, attempt + 1);
  }
  if (!r.ok) throw new Error(`${model}:${method} ${r.status} ${j?.error?.message ?? ''}`);
  return j;
}

async function geminiEmbed(text, taskType) {
  const j = await geminiPost(GEMINI_EMBED_MODEL, 'embedContent', { content: { parts: [{ text }] }, taskType, outputDimensionality: GEMINI_EMBED_DIMS });
  return normalize(j.embedding.values);
}

async function geminiEmbedBatch(texts, taskType) {
  const out = [];
  for (let i = 0; i < texts.length; i += 16) {
    const slice = texts.slice(i, i + 16);
    const j = await geminiPost(GEMINI_EMBED_MODEL, 'batchEmbedContents', { requests: slice.map((t) => ({ model: `models/${GEMINI_EMBED_MODEL}`, content: { parts: [{ text: t }] }, taskType, outputDimensionality: GEMINI_EMBED_DIMS })) });
    for (const e of j.embeddings) out.push(normalize(e.values));
  }
  return out;
}

async function geminiGenerate(prompt, opts = {}) {
  let lastErr;
  for (const model of GEMINI_GEN_MODELS) {
    try {
      const j = await geminiPost(model, 'generateContent', {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: opts.temperature ?? 0.2, maxOutputTokens: 600, ...(opts.json ? { responseMimeType: 'application/json' } : {}) },
      });
      const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
      if (!text) throw new Error(`${model} returned no text (${j.candidates?.[0]?.finishReason ?? 'unknown'})`);
      const u = j.usageMetadata ?? {};
      return { text, model, usage: { promptTokens: u.promptTokenCount ?? 0, outputTokens: u.candidatesTokenCount ?? 0 } };
    } catch (e) { lastErr = e; }
  }
  throw lastErr;
}

export async function embed(text, task) {
  const key = `${EMBED_ID}|${task}|${text}`;
  const hit = cacheGet(key);
  if (hit) return hit;
  const v = EMBED.provider === 'cloudflare' ? (await cloudflareEmbed([text]))[0] : await geminiEmbed(text, task);
  cachePut(key, v);
  return v;
}

export async function embedBatch(texts, task) {
  if (EMBED.provider === 'cloudflare') {
    const out = [];
    for (let i = 0; i < texts.length; i += 50) out.push(...(await cloudflareEmbed(texts.slice(i, i + 50))));
    return out;
  }
  return geminiEmbedBatch(texts, task);
}

/* ---------------- Generation ---------------- */
export const GROQ_MODEL = 'openai/gpt-oss-120b';

async function groqGenerate(prompt, opts, attempt = 0) {
  let r;
  try {
    r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { authorization: `Bearer ${env('GROQ_API_KEY')}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: opts.json ? 'You reply with a single JSON object and nothing else.' : 'You reply in plain text.' },
        { role: 'user', content: prompt },
      ],
      temperature: opts.temperature ?? 0.2,
      reasoning_effort: 'low', // the answer is extraction, not reasoning
      max_tokens: 900,
      ...(opts.json ? { response_format: { type: 'json_object' } } : {}),
    }),
  });
  } catch (e) {
    // transient network failure; one retry after a short pause
    if (attempt < 1) { await sleep(1_500); return groqGenerate(prompt, opts, attempt + 1); }
    throw e;
  }
  if (r.status === 429) {
    const j = await r.json().catch(() => ({}));
    const hint = Number(String(j?.error?.message ?? '').match(/try again in ([\d.]+)(m?s)/i)?.[1]);
    const unit = String(j?.error?.message ?? '').match(/try again in [\d.]+(m?s)/i)?.[1];
    const waitMs = Number.isFinite(hint) ? (unit === 'ms' ? hint : hint * 1000) : 99_000;
    if (attempt < 1 && waitMs <= 2_500) { await sleep(waitMs + 200); return groqGenerate(prompt, opts, attempt + 1); }
    throw new Error(`groq 429, clears in ${Math.round(waitMs / 1000)} s`);
  }
  const j = await r.json();
  if (!r.ok) {
    // json mode 400s when the model wants to answer with bare text (e.g. a refusal); retry in plain text,
    // ask() parses non-JSON answers fine.
    if (r.status === 400 && opts.json && /Failed to generate JSON/i.test(j?.error?.message ?? '') && attempt < 1) {
      return groqGenerate(prompt, { ...opts, json: false }, attempt + 1);
    }
    throw new Error(`groq ${r.status} ${j?.error?.message ?? ''}`);
  }
  const text = j.choices?.[0]?.message?.content ?? '';
  if (!text) throw new Error(`groq returned no text (${j.choices?.[0]?.finish_reason ?? 'unknown'})`);
  return { text, model: `groq/${GROQ_MODEL}`, usage: { promptTokens: j.usage?.prompt_tokens ?? 0, outputTokens: j.usage?.completion_tokens ?? 0 } };
}

/** Groq first when a key exists, then Gemini. The model that answered is recorded on every result. */
export async function generate(prompt, opts = {}) {
  const errors = [];
  if (env('GROQ_API_KEY')) {
    try { return await groqGenerate(prompt, opts); } catch (e) { errors.push(String(e)); }
  }
  if (env('GEMINI_API_KEY')) {
    try { return await geminiGenerate(prompt, opts); } catch (e) { errors.push(String(e)); }
  }
  throw new Error(`no generation provider answered: ${errors.join(' | ') || 'no keys set'}`);
}
