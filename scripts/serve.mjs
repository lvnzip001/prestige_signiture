import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const functionsOrigin = 'https://nrehqharpjphuwvijket.supabase.co/functions/v1';

const root = process.cwd();
const port = Number(process.argv[2] || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };

createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(requestUrl.pathname);
    if (pathname.startsWith('/api/')) {
      const upstream = await fetch(functionsOrigin + pathname.slice(4) + requestUrl.search, {
        method: req.method,
        headers: {
          'content-type': req.headers['content-type'] || 'application/json',
          ...(req.headers.authorization ? { authorization: req.headers.authorization } : {}),
          ...(req.headers.origin ? { origin: req.headers.origin } : {}),
        },
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : await new Promise((resolve, reject) => {
          const chunks = [];
          req.on('data', chunk => chunks.push(chunk));
          req.on('end', () => resolve(Buffer.concat(chunks)));
          req.on('error', reject);
        }),
      });
      const payload = Buffer.from(await upstream.arrayBuffer());
      res.writeHead(upstream.status, { 'content-type': upstream.headers.get('content-type') || 'application/json', 'cache-control': 'no-store' });
      res.end(payload);
      return;
    }
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    const file = path.resolve(root, relative);
    const publicFile = /^[a-z0-9-]+\.html$/.test(relative) || ['sitemap.xml', 'robots.txt'].includes(relative) || /^assets\/(css|js|fonts|icons)\//.test(relative) || /^assets\/images\/(optimized\/|brand-master\.jpg$)/.test(relative);
    if (!publicFile || !file.startsWith(root + path.sep) || relative.includes('..') || relative.includes('\\')) { res.writeHead(404); res.end(); return; }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(await readFile(path.join(root, '404.html')).catch(() => 'Not found'));
  }
}).listen(port, '127.0.0.1', () => console.log(`Prestige preview: http://127.0.0.1:${port}`));
