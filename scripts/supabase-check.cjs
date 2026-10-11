// Read-only connection/schema check. Never log credentials or account records.
require('@next/env').loadEnvConfig(process.cwd());
const { createClient } = require('@supabase/supabase-js');
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !secret || !key) throw new Error('Supabase URL, publishable key and server secret are required.');
  const options = { auth: { persistSession: false, autoRefreshToken: false } };
  const admin = createClient(url, secret, options);
  const anon = createClient(url, key, options);
  const tables = ['workspaces', 'deals', 'invoice_links', 'audit', 'webhook_events', 'jobs', 'usage'];
  let failed = false;
  for (const suffix of tables) {
    const table = 'creatorpay_' + suffix;
    const { error } = await admin.from(table).select('*').limit(0);
    const { error: denied } = await anon.from(table).select('*').limit(0);
    const result = { table, serverAccessible: !error, anonymousDenied: denied?.code === '42501', errorCode: error?.code };
    console.log(JSON.stringify(result));
    if (error || denied?.code !== '42501') failed = true;
  }
  if (failed) process.exitCode = 1;
}
main().catch(() => { console.error('Supabase setup check failed. Check private configuration and connectivity.'); process.exitCode = 1; });
