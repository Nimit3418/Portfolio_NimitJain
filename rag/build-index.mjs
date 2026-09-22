/** Builds rag/index.json: embeds every corpus chunk with the configured provider. Usage: npm run rag:index */
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { buildCorpus } from './lib/corpus.mjs';
import { embedBatch, EMBED } from './lib/providers.mjs';

const chunks = buildCorpus();
console.log(`${chunks.length} chunks; embedding with ${EMBED.provider}:${EMBED.model}@${EMBED.dims}…`);
const vectors = await embedBatch(chunks.map((c) => c.text), 'RETRIEVAL_DOCUMENT');

const out = new URL('./index.json', import.meta.url);
// keep a previously calibrated threshold when rebuilding with the same provider
let threshold;
if (existsSync(out)) {
  const prev = JSON.parse(readFileSync(out, 'utf8'));
  if (prev.provider === EMBED.provider && prev.model === EMBED.model) threshold = prev.threshold;
}
const index = { provider: EMBED.provider, model: EMBED.model, dims: EMBED.dims, ...(threshold ? { threshold } : {}), built: new Date().toISOString(), chunks: chunks.map((c, i) => ({ ...c, v: vectors[i] })) };
writeFileSync(out, JSON.stringify(index));
console.log(`wrote rag/index.json (${Math.round(JSON.stringify(index).length / 1024)} KB)${threshold ? `, kept threshold ${threshold}` : ', threshold not yet calibrated (npm run rag:calibrate)'}`);
