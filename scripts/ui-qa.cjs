// Isolated UI preview: never loads environment files or contacts external services.
const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const output = path.join(root, '.tools/ui-qa');
(async () => {
  fs.mkdirSync(output, { recursive: true });
  await require('esbuild').build({ entryPoints: [path.join(root, 'tests/ui-qa/entry.tsx')], bundle: true, outfile: path.join(output, 'app.js'), platform: 'browser', jsx: 'automatic', alias: { '@': path.join(root, 'src'), 'next/link': path.join(root, 'tests/ui-qa/link.tsx') }, define: { 'process.env.NODE_ENV': '"development"' } });
  execFileSync(process.execPath, [path.join(root, 'node_modules/tailwindcss/lib/cli.js'), '-i', 'src/app/globals.css', '-o', path.join(output, 'base.css'), '--minify'], { cwd: root, stdio: 'inherit' });
  const html = '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>CreatorPay isolated UI QA</title><link rel="stylesheet" href="/base.css"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script src="/app.js"></script></body></html>';
  http.createServer((req, res) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'none'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data:; frame-src 'self'");
    const route = new URL(req.url, 'http://localhost').pathname;
    if (['/app.js', '/app.css', '/base.css'].includes(route)) { res.setHeader('Content-Type', route.endsWith('.js') ? 'application/javascript' : 'text/css'); res.end(fs.readFileSync(path.join(output, route.slice(1)))); }
    else if (route === '/mobile') { res.setHeader('Content-Type', 'text/html'); res.end('<iframe title="Mobile dashboard" src="/dashboard" style="width:390px;height:850px;border:1px solid #888"></iframe>'); }
    else if (route === '/' || route === '/dashboard') { res.setHeader('Content-Type', 'text/html'); res.end(html); }
    else { res.writeHead(404); res.end('Only the isolated dashboard is available here.'); }
  }).listen(3060, '127.0.0.1', () => console.log('Synthetic UI QA: http://127.0.0.1:3060/dashboard (mobile: /mobile)'));
})().catch(error => { console.error(error); process.exitCode = 1; });
