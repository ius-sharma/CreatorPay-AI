// Register/update only this project's sandbox webhook; keep credentials private.
const fs = require('node:fs');
const ts = require('typescript');
require('@next/env').loadEnvConfig(process.cwd());
require.extensions['.ts'] = (m,f) => m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, f);
const { paypalRequest } = require('../src/lib/paypal.ts');
(async () => {
  const url = new URL(process.argv[2]);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/api/paypal/webhook') throw new Error('Provide the full HTTPS /api/paypal/webhook endpoint URL');
  const all = await paypalRequest('/v1/notifications/webhooks');
  let webhook = all.webhooks?.find(w => w.url === url.href);
  if (!webhook && process.env.PAYPAL_WEBHOOK_ID) {
    const existing = all.webhooks?.find(w => w.id === process.env.PAYPAL_WEBHOOK_ID);
    if (existing) webhook = await paypalRequest(`/v1/notifications/webhooks/${existing.id}`, 'PATCH', [{ op: 'replace', path: '/url', value: url.href }, { op: 'replace', path: '/event_types', value: [{ name: 'INVOICING.INVOICE.PAID' }] }]);
    if (existing && !webhook.id) webhook = { ...existing, url: url.href };
  }
  if (!webhook) webhook = await paypalRequest('/v1/notifications/webhooks', 'POST', { url: url.href, event_types: [{ name: 'INVOICING.INVOICE.PAID' }] });
  if (!webhook.id) throw new Error('PayPal did not return a webhook ID');
  const envFile = process.env.CREATORPAY_ENV_FILE || '.env.local';
  if (!['.env.local', '.env.sandbox-us.local'].includes(envFile)) throw new Error('Unsupported private profile file.');
  let env = fs.readFileSync(envFile,'utf8').replace(/^PAYPAL_WEBHOOK_ID=.*\r?\n?/mg,'').replace(/^PAYPAL_WEBHOOK_URL=.*\r?\n?/mg,'');
  env += `\nPAYPAL_WEBHOOK_ID=${webhook.id}\nPAYPAL_WEBHOOK_URL=${url.href}\n`;
  fs.writeFileSync(envFile,env);
  console.log('PayPal sandbox webhook registered; private environment file updated. Restart the app to load it.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
