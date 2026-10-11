// Expose ONLY this relay through a development tunnel, never the full dashboard.
const http = require('node:http');
const port = Number(process.env.WEBHOOK_RELAY_PORT || 3030);
const appPort = Number(process.env.WEBHOOK_APP_PORT || 3000);
if (!Number.isInteger(appPort) || appPort < 1 || appPort > 65535) throw new Error('Invalid application port');
http.createServer(async (req, res) => {
  if (req.url === '/health' && req.method === 'GET') { res.writeHead(200); return res.end('Webhook relay ready'); }
  if (req.url !== '/api/paypal/webhook' || req.method !== 'POST') { res.writeHead(404); return res.end('Not found'); }
  if (!req.headers['paypal-transmission-sig']) { res.writeHead(401); return res.end('Unsigned events are rejected'); }
  const chunks = [];
  let bytes = 0;
  try {
    for await (const chunk of req) {
      bytes += chunk.length;
      if (bytes > 100000) { res.writeHead(413); return res.end('Payload too large'); }
      chunks.push(chunk);
    }
    const headers = { 'content-type': 'application/json' };
    for (const [key, value] of Object.entries(req.headers)) if (key.startsWith('paypal-') && typeof value === 'string') headers[key] = value;
    const response = await fetch(`http://127.0.0.1:${appPort}/api/paypal/webhook`, { method: 'POST', headers, body: Buffer.concat(chunks), signal: AbortSignal.timeout(50000) });
    res.writeHead(response.status, { 'content-type': 'application/json' }); res.end(await response.text());
  } catch { res.writeHead(502); res.end('Local webhook handler unavailable'); }
}).listen(port, '127.0.0.1', () => console.log(`Webhook-only relay listening on http://127.0.0.1:${port}; forwards to app port ${appPort}`));
