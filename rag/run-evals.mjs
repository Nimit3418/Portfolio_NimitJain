/**
 * Evaluation runner for Ask the tower. Scores citations, refusals, facts, adversarial resistance,
 * and retrieval (recall@8, MRR), then writes results.json and appends to history.json.
 * Usage: npm run rag:evals   (set EMBED_CACHE=rag/evals/embed-cache.json to save embedding quota)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { askChat, PROMPT_VERSION, THRESHOLD } from './lib/ask.mjs';
import { EMBED_ID } from './lib/providers.mjs';

const here = (rel) => new URL(rel, import.meta.url);
const qs = JSON.parse(readFileSync(here('./evals/questions.json'), 'utf8'));
const rows = [];
const tally = { cite: [0, 0], refuse: [0, 0], fact: [0, 0], adversarial: [0, 0], recall: [0, 0], rr: 0, rrN: 0 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const item of qs) {
  let r;
  try { r = await askChat(item.q, item.history ?? []); }
  catch { await sleep(8_000); r = await askChat(item.q, item.history ?? []); } // one retry on transient failure
  await sleep(10_500); // Groq free tier: stay under ~6 answers a minute
  const kept = r.hits.filter((h) => h.kept);
  const citedIds = r.answer.citations.map((n) => kept[n - 1]?.id ?? '?');
  const text = r.answer.answer;
  const e = item.expect;
  let ok = true; const why = [];
  const kind = e.adversarial ? 'adversarial' : e.refuse ? 'refuse' : 'cite';

  let rank = null;
  if (e.cite) {
    const i = r.hits.findIndex((h) => e.cite.some((p) => h.id.startsWith(p)));
    rank = i >= 0 ? i + 1 : null;
    tally.recall[1]++; if (rank !== null && r.hits[i].kept) tally.recall[0]++;
    if (rank !== null) { tally.rr += 1 / rank; } tally.rrN++;
  }
  if (e.refuse) {
    tally.refuse[1]++;
    if (r.answer.refused) tally.refuse[0]++; else { ok = false; why.push('should have refused'); }
  } else if (e.adversarial) {
    tally.adversarial[1]++;
    const leaked = (e.mustNotContain ?? []).filter((s) => text.toLowerCase().includes(s.toLowerCase()));
    if (leaked.length) { ok = false; why.push(`leaked: ${leaked.join(', ')}`); } else tally.adversarial[0]++;
  } else {
    if (e.cite) {
      tally.cite[1]++;
      const hit = citedIds.some((id) => e.cite.some((p) => id.startsWith(p)));
      if (hit) tally.cite[0]++; else { ok = false; why.push(`cited [${citedIds.join(', ')}], wanted ${e.cite.join('|')}`); }
    }
    const must = e.contains ?? [];
    const missing = must.filter((s) => !text.includes(s));
    if (missing.length) { ok = false; why.push(`missing: ${missing.join(', ')}`); }
    if (e.containsAny && !e.containsAny.some((s) => text.toLowerCase().includes(s.toLowerCase()))) { ok = false; why.push(`none of: ${e.containsAny.join(' | ')}`); }
    tally.fact[1]++; if (ok || (!missing.length && !(e.containsAny && !e.containsAny.some((s) => text.toLowerCase().includes(s.toLowerCase()))))) tally.fact[0]++;
    if (r.answer.refused) { ok = false; why.push('refused a supported question'); }
  }
  rows.push({ q: item.q, kind, ok, why: why.join('; '), ms: r.ms, cited: citedIds, refused: r.answer.refused, answer: text, rank, model: r.answer.model });
  console.log(`${ok ? 'PASS' : 'FAIL'} [${kind}] ${item.q}${why.length ? `  <- ${why.join('; ')}` : ''}`);
}

const passed = rows.filter((r) => r.ok).length;
const summary = {
  date: new Date().toISOString().slice(0, 10),
  prompt: PROMPT_VERSION, embed: EMBED_ID, threshold: THRESHOLD,
  n: rows.length, passed,
  recall_at_8: tally.recall[1] ? +((tally.recall[0] / tally.recall[1]) * 100).toFixed(1) : null,
  mrr: tally.rrN ? +(tally.rr / tally.rrN).toFixed(3) : null,
  median_ms: rows.map((r) => r.ms).sort((a, b) => a - b)[Math.floor(rows.length / 2)],
  refusals: `${tally.refuse[0]}/${tally.refuse[1]}`, adversarial: `${tally.adversarial[0]}/${tally.adversarial[1]}`,
};
writeFileSync(here('./evals/results.json'), JSON.stringify({ ...summary, rows }, null, 2));
const histPath = here('./evals/history.json');
const hist = existsSync(histPath) ? JSON.parse(readFileSync(histPath, 'utf8')) : [];
hist.push(summary);
writeFileSync(histPath, JSON.stringify(hist, null, 2));
console.log(`\n${passed}/${rows.length} passed · recall@8 ${summary.recall_at_8}% · MRR ${summary.mrr} · median ${summary.median_ms} ms`);
