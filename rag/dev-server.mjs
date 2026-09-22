/** Local dev server: static files + POST /api/ask, mimicking Vercel. Usage: node rag/dev-server.mjs [port] */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import handler from '../api/ask.mjs';
import contact from '../api/contact.mjs';
import contactTrace from '../api/contact/[trace].mjs';

const PORT = Number(process.argv[2] ?? 4174);
const ROOT = new URL('..', import.meta.url).pathname;
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp' };

createServer(async (req, res) => {
  const api = { '/api/ask': handler, '/api/contact': contact }[req.url];
  if (api) {
    let body = '';
    for await (const c of req) body += c;
    try { req.body = JSON.parse(body || '{}'); } catch { req.body = {}; }
    res.status = (code) => { res.statusCode = code; return res; };
    return api(req, res);
  }
  const trace = req.url?.match(/^\/api\/contact\/([^/?]+)/);
  if (trace) { req.query = { trace: trace[1] }; return contactTrace(req, res); }
  const path = normalize(decodeURIComponent((req.url ?? '/').split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  const file = join(ROOT, path === '/' ? 'index.html' : path);
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404); res.end('not found');
  }
}).listen(PORT, () => console.log(`dev server with /api/ask on http://localhost:${PORT}`));
