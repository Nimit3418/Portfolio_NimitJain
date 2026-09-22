# Ask the tower: setup

The RAG chat on this site ("ASK THE TOWER", bottom right) answers questions about Nimit using only
the site's own content, with citations. Same architecture as satyamkumarsingh.com's Ask this site:
precomputed chunk embeddings + cosine retrieval (top 8) + a calibrated refusal threshold + a grounded
LLM answer that must cite its sources.

## What Nimit needs (all free)

1. **Groq key** (generation): console.groq.com -> API Keys -> create. `GROQ_API_KEY`
2. **Embeddings**, pick ONE:
   - **Cloudflare Workers AI** (recommended; bge-m3, same as Satyam's site):
     dash.cloudflare.com -> the account id is in the dashboard URL -> `CLOUDFLARE_ACCOUNT_ID`;
     My Profile -> API Tokens -> Create Token -> Workers AI (Read) -> `CLOUDFLARE_API_TOKEN`
   - **Gemini** (simplest; one key runs embeddings AND acts as generation fallback):
     aistudio.google.com -> Get API key -> `GEMINI_API_KEY`

Copy `.env.example` to `.env` and fill in the keys. NEVER commit `.env` (it is gitignored).

## Build order (run once, then after any content change)

```
npm run rag:index       # embeds the corpus -> rag/index.json
npm run rag:calibrate   # measures on/off-topic score gap, writes the threshold into index.json
npm run rag:evals       # 32 questions: facts, citations, refusals, adversarial; writes rag/evals/results.json
```

The corpus lives in `rag/lib/corpus.mjs`. Edit it whenever the site's facts change, then rerun the
three commands. If calibrate reports "no clean gap", read the outliers it prints: usually an
off-topic probe that actually IS on the site, or a corpus chunk that is too generic.

## Run locally with the API

`python3 -m http.server` cannot run the API function. Use Vercel's dev server instead:

```
npm i -g vercel
vercel dev
```

## Deploy (Vercel)

1. Push this folder to a GitHub repo, import it in Vercel (framework preset: Other; no build command;
   output directory: `.`).
2. Project Settings -> Environment Variables: add the same keys as `.env`
   (`GROQ_API_KEY` plus either the two `CLOUDFLARE_*` vars or `GEMINI_API_KEY`).
3. Deploy. `api/ask.mjs` becomes `POST /api/ask` automatically; `rag/index.json` ships with the function.

## Free-tier limits (why the code is shaped this way)

- Groq gpt-oss-120b: ~8K tokens/min -> the eval runner paces itself (~6 answers/min); the API retries
  a 429 only when it clears within 2.5 s, then falls back to Gemini if a key is set.
- Cloudflare Workers AI: 10,000 neurons/day -> query embeddings are tiny; the eval runner caches them
  (`rag/evals/embed-cache.json`) so reruns cost nothing.
- The API rate-limits to 20 questions/min per IP and caches identical questions for an hour.

## Guarantees carried over from Satyam's build

- The index records which embedding model built it; the server refuses to compare vectors from a
  different model (prevents silent garbage after a provider switch).
- Every factual sentence must end in a citation; answers with no supported sources refuse with
  "Not on this site" instead of guessing.
- Numbers are never paraphrased; the prompt orders exact copies ("1,100+", "9.45", "43,719").
