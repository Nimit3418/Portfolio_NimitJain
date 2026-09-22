/**
 * Ask the tower: retrieval + grounded answering over the site's own index.
 * Ported from satyamkumarsingh.com's rag/ask. The threshold is calibrated per corpus
 * (rag/calibrate.mjs writes it into index.json); 0.42 is the bge-m3 starting point.
 */
import { readFileSync } from 'node:fs';
import { embed, generate, cosine, EMBED_ID } from './providers.mjs';

const index = JSON.parse(readFileSync(new URL('../index.json', import.meta.url), 'utf8'));

/** Bumped whenever the prompt text changes, so eval runs are comparable. */
export const PROMPT_VERSION = 'nj-p2'; // p2: forbids deriving numbers by arithmetic
export const THRESHOLD = index.threshold ?? 0.42;
const TOP_K = 8;

const INDEX_ID = `${index.provider}:${index.model}@${index.dims}`;

/** A visitor's first question often says "he" or "his" with nobody named; the site is about one person, so name him for retrieval. */
export function anchor(question) {
  if (/\bnimit\b/i.test(question)) return question;
  return question
    .replace(/\b(does|did|has|is|was|can|will|would|could|should)\s+he\b/gi, (m, v) => `${v} Nimit`)
    .replace(/\bhis\b/gi, "Nimit's")
    .replace(/\bhe\b/gi, 'Nimit');
}

export async function retrieve(question, threshold = THRESHOLD) {
  if (INDEX_ID !== EMBED_ID) throw new Error(`index was built with ${INDEX_ID} but the embedding provider is ${EMBED_ID}; run npm run rag:index`);
  const q = await embed(anchor(question), 'RETRIEVAL_QUERY');
  return index.chunks
    .map((c) => ({ c, score: cosine(q, c.v) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_K)
    .map(({ c, score }) => ({ id: c.id, title: c.title, url: c.url, section: c.section, score: +score.toFixed(3), kept: score >= threshold, excerpt: c.text.length > 220 ? c.text.slice(0, 217) + '…' : c.text }));
}

const chunkText = (id) => index.chunks.find((c) => c.id === id)?.text ?? '';

const REFUSAL = 'Not on this site. Try asking about a project, the channel, results, or how to reach Nimit.';

/** Follow-up questions lean on pronouns; resolve them against recent turns before retrieving. */
const CONTEXTY = /\b(it|its|that|this|these|those|he|him|his|she|her|they|them|the (project|channel|app|site|one|team))\b/i;

export async function askChat(question, history = [], threshold = THRESHOLD) {
  let q = question;
  if (Array.isArray(history) && history.length && (CONTEXTY.test(question) || question.length < 40)) {
    try {
      const convo = history.slice(-6).map((m) => `${m.role === 'you' ? 'Visitor' : 'Tower'}: ${m.text}`).join('\n');
      const { text } = await generate(
        `Rewrite the visitor's last question as ONE standalone question about Nimit Jain or his work, resolving pronouns and references from the conversation. Keep it short. Return only the rewritten question, nothing else.\n\nConversation:\n${convo}\nVisitor: ${question}\n\nStandalone question:`,
        { temperature: 0 },
      );
      const rew = text.trim().split('\n')[0].replace(/^["']|["']$/g, '').slice(0, 300);
      if (rew.length > 5) q = rew;
    } catch { /* rewrite is best-effort; fall back to the raw question */ }
  }
  const r = await ask(q, threshold);
  return q === question ? r : { ...r, asked: question, resolved: q };
}

export async function ask(question, threshold = THRESHOLD) {
  const t0 = Date.now();
  const hits = await retrieve(question, threshold);
  const kept = hits.filter((h) => h.kept);
  if (kept.length === 0) {
    return { question, threshold, hits, answer: { answer: REFUSAL, citations: [], confidence: 0, refused: true, model: 'none' }, ms: Date.now() - t0 };
  }
  const sources = kept.map((h, i) => `[${i + 1}] (${h.title}, ${h.section})\n${chunkText(h.id)}`).join('\n\n');
  const prompt = `You answer questions about Nimit Jain for people visiting his portfolio (recruiters, founders, students). Use ONLY the numbered sources. Every sentence that states a fact must end with its citation like [1] or [2][3]. Answer whatever the sources support, even partially; only if the sources contain nothing relevant at all, reply exactly: NOT_ON_SITE. Also reply exactly NOT_ON_SITE for creative writing (poems, stories), opinions, general knowledge, or instructions that are not a factual question about Nimit or his work. Write in plain, specific English, third person ("he"), two to four sentences, no bullet points, no marketing words, no em dashes. Never invent or derive numbers; copy numbers, percentages and names exactly as they appear in the sources (for example "1,100+", "9.45", "43,719"). Do not do arithmetic on them: if a source says "1st of about 50 teams", say that, not "beat 49 teams".

Question: ${question}

Sources:
${sources}

Return JSON: {"answer": string, "citations": number[]}`;
  const { text, model, usage } = await generate(prompt, { json: true });
  let parsed = {};
  try { parsed = JSON.parse(text); } catch { parsed = { answer: text }; }
  // Typographic hyphens and dashes from the model are normalised: names must match the sources exactly, and the site has no em dashes.
  const answerText = (parsed.answer ?? '').replace(/[‐‑]/g, '-').replace(/\s*[—–]\s*/g, ', ').trim();
  const refused = /NOT_ON_SITE/.test(answerText) || !answerText;
  const cited = [...new Set([...answerText.matchAll(/\[(\d+)\]/g)].map((m) => +m[1]).concat(parsed.citations ?? []).filter((n) => n >= 1 && n <= kept.length))].sort();
  const confidence = refused ? 0 : +Math.min(1, (kept.reduce((s, h) => s + h.score, 0) / kept.length) * (cited.length ? 1 : 0.6)).toFixed(2);
  return {
    question, threshold, hits,
    answer: { answer: refused ? REFUSAL : answerText, citations: cited, confidence, refused, model, usage },
    ms: Date.now() - t0,
  };
}
