/**
 * Calibrates the refusal threshold for THIS corpus and embedding model: embeds on-topic and
 * off-topic probes, prints both score distributions, picks the midpoint of the gap, and writes
 * it into rag/index.json. Usage: npm run rag:calibrate
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { embed, cosine, EMBED_ID } from './lib/providers.mjs';

const url = new URL('./index.json', import.meta.url);
const index = JSON.parse(readFileSync(url, 'utf8'));
if (`${index.provider}:${index.model}@${index.dims}` !== EMBED_ID) throw new Error('index/provider mismatch; run npm run rag:index first');

const ON = [
  'What is CampusCritique?',
  'How many visitors does CampusCritique have?',
  'What did Nimit build for the oil spill project?',
  'What is his CGPA?',
  'How many YouTube subscribers does he have?',
  'Which hackathons has Nimit won?',
  'What is AskMyNotes?',
  'What skills does he have?',
  'Is Nimit open to internships?',
  'How can I contact Nimit?',
  'What is KisanMind built with?',
  'Where does Nimit study?',
];
const OFF = [
  'What is the capital of France?',
  'Write a poem about the ocean.',
  'How do I make pasta carbonara?',
  'What is the weather in Pune today?',
  'Explain quantum computing.',
  'Who won the cricket world cup?',
  'What is the best laptop to buy in 2026?',
  'Tell me a joke.',
  'How tall is Mount Everest?',
  'What are Bitcoin prices doing?',
];

const top = (q) => embed(q, 'RETRIEVAL_QUERY').then((v) => Math.max(...index.chunks.map((c) => cosine(v, c.v))));

const on = [], off = [];
for (const q of ON) on.push({ q, s: +(await top(q)).toFixed(3) });
for (const q of OFF) off.push({ q, s: +(await top(q)).toFixed(3) });
on.sort((a, b) => a.s - b.s); off.sort((a, b) => b.s - a.s);

console.log('\nON-TOPIC (top score per question, lowest first):');
for (const r of on) console.log(`  ${r.s}  ${r.q}`);
console.log('\nOFF-TOPIC (top score per question, highest first):');
for (const r of off) console.log(`  ${r.s}  ${r.q}`);

const minOn = on[0].s, maxOff = off[0].s;
if (maxOff >= minOn) {
  console.log(`\nNo clean gap (off-topic max ${maxOff} >= on-topic min ${minOn}). Not writing a threshold; inspect the outliers above.`);
  process.exit(1);
}
const threshold = +((minOn + maxOff) / 2).toFixed(3);
index.threshold = threshold;
writeFileSync(url, JSON.stringify(index));
console.log(`\nGap [${maxOff}, ${minOn}] -> threshold ${threshold} written to rag/index.json`);
