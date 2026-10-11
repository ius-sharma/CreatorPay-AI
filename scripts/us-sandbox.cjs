// Isolated local US merchant profile. Never print credentials or copy paid India deals.
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const profile = '.env.sandbox-us.local';
require('@next/env').loadEnvConfig(process.cwd());
const values = {};
for (const line of fs.readFileSync(profile, 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (match) values[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, '$2');
}
if (values.PAYPAL_ENVIRONMENT !== 'sandbox' || values.PAYPAL_BUSINESS_EMAIL !== 'sb-jv4yo53303566@business.example.com' || values.CREATORPAY_DB_PATH !== '.data/creatorpay-us.sqlite') throw new Error('US profile must use its expected sandbox merchant and separate database.');
if (!values.PAYPAL_CLIENT_ID || !values.PAYPAL_CLIENT_SECRET) throw new Error('Add US app credentials to the private US profile.');
const action = process.argv[2] || 'start';
const port = process.env.CREATORPAY_PORT || '3020';
if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) throw new Error('Invalid local app port.');
const env = { ...process.env, ...values, CREATORPAY_ENV_FILE: profile, NEXT_BUILD_DIR: process.env.NEXT_BUILD_DIR || '.next-phase4-check' };
const command = action === 'start' ? [path.join('node_modules', 'next', 'dist', 'bin', 'next'), 'start', '--port', port, '--hostname', '127.0.0.1']
  : action === 'webhook' ? ['scripts/paypal-webhook.cjs', process.argv[3]]
  : action === 'check' ? ['scripts/us-sandbox-check.cjs'] : null;
if (!command) throw new Error('Use start, webhook <HTTPS URL>, or check.');
const child = spawn(process.execPath, command, { env, stdio: 'inherit' });
child.on('exit', code => { process.exitCode = code || 0; });
