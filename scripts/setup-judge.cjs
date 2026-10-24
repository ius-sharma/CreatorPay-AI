// Provision exactly one dedicated, ordinary Auth user; never reset existing users.
const fs = require('node:fs');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const { createClient } = require('@supabase/supabase-js');
require('@next/env').loadEnvConfig(process.cwd());
const email = 'judge@creatorpay.example';
const marker = 'creatorpay-hackathon-2026';
const directory = path.resolve('.data');
const credentialsPath = path.join(directory, 'judge-access.json');
const instructionsPath = path.join(directory, 'judge-access.md');
const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };

async function main() {
  if (!process.argv.includes('--create')) throw new Error('Use node scripts/setup-judge.cjs --create to provision the dedicated sandbox judge account.');
  if (process.env.CREATORPAY_BACKEND !== 'supabase' || process.env.PAYPAL_ENVIRONMENT !== 'sandbox') throw new Error('Judge setup requires the authenticated Supabase backend and PayPal sandbox environment.');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !secret || !key) throw new Error('Private Supabase setup is incomplete.');
  const admin = createClient(url, secret, options);
  // Check schema before creating an identity; no financial records are copied.
  const schema = await admin.from('creatorpay_workspaces').select('owner_id,workspace_name,contract_draft').limit(0);
  if (schema.error) throw new Error(schema.status === 0 ? 'Supabase is unreachable. Resume the project or check its configured URL, then rerun.' : 'Workspace schema is unavailable. Complete database setup first.');
  let user;
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw new Error('Could not check the dedicated judge account.');
    user = data.users.find(u => u.email?.toLowerCase() === email);
    if (user || data.users.length < 100) break;
  }
  fs.mkdirSync(directory, { recursive: true });
  let credentials = null;
  try { if (fs.existsSync(credentialsPath)) credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8')); }
  catch { throw new Error('Private judge credential file is invalid. No account was changed.'); }
  if (credentials && (credentials.email !== email || credentials.projectUrl !== url || typeof credentials.password !== 'string' || credentials.password.length < 20)) throw new Error('Saved judge credentials do not match this project. No account was changed.');
  if (user && (user.app_metadata?.creatorpay_review !== marker || !credentials || (credentials.userId && credentials.userId !== user.id))) throw new Error('An existing account cannot be reused safely with this private credential file. No password or account was changed.');
  if (!credentials) {
    credentials = { email, password: 'CpJ-' + randomBytes(28).toString('base64url') + '-9!', projectUrl: url, userId: null };
    fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  }
  if (!user) {
    const result = await admin.auth.admin.createUser({ email, password: credentials.password, email_confirm: true, app_metadata: { creatorpay_review: marker }, user_metadata: { name: 'Hackathon judge' } });
    if (result.error || !result.data.user) throw new Error('Judge account creation did not complete. Keep the private credential file and rerun to recover safely.');
    user = result.data.user;
  }
  if (!user.email_confirmed_at) throw new Error('Judge account is not confirmed. No password was reset.');
  credentials.userId = user.id;
  fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2) + '\n', { mode: 0o600 });
  const workspace = await admin.from('creatorpay_workspaces').upsert({ owner_id: user.id, workspace_name: 'Hackathon review studio' }, { onConflict: 'owner_id', ignoreDuplicates: true });
  if (workspace.error) throw new Error('Account exists, but its workspace could not be initialized. Rerun after checking the database.');
  const client = createClient(url, key, options);
  const login = await client.auth.signInWithPassword({ email, password: credentials.password });
  if (login.error || login.data.user?.id !== user.id) throw new Error('Judge sign-in verification failed. No password was changed.');
  try {
    const identity = await client.auth.getUser();
    if (identity.error || identity.data.user?.id !== user.id) throw new Error('Judge identity verification failed.');
    const own = await client.from('creatorpay_workspaces').select('owner_id').eq('owner_id', user.id).single();
    const visible = await client.from('creatorpay_workspaces').select('owner_id').limit(100);
    if (own.error || visible.error || own.data?.owner_id !== user.id || visible.data?.some(row => row.owner_id !== user.id)) throw new Error('Judge workspace isolation verification failed.');
  } finally { await client.auth.signOut({ scope: 'local' }); }
  const envPath = path.resolve('.env.local');
  let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  for (const [name, value] of [['CREATORPAY_JUDGE_ACCESS', 'true'], ['CREATORPAY_JUDGE_EMAIL', email]]) {
    const expression = new RegExp('^' + name + '=.*$', 'm');
    env = expression.test(env) ? env.replace(expression, name + '=' + value) : env.trimEnd() + '\n' + name + '=' + value + '\n';
  }
  fs.writeFileSync(envPath, env, { mode: 0o600 });
  fs.writeFileSync(instructionsPath, `# Private judge testing access\n\nEmail: ${email}\n\nPassword: ${credentials.password}\n\nOpen the deployed app's /login?mode=judge page (local preview: http://127.0.0.1:3057/login?mode=judge).\n\nSupply these credentials through Devpost testing instructions. Do not publish this file in the public repository. This is a shared test workspace: use synthetic contracts only.\n\nSuggested path: New deal -> Use a sample contract or import a text PDF -> Analyze -> inspect source evidence -> confirm. All PayPal operations use sandbox test funds. Buyer/receiver sandbox logins are separate and must be supplied in your final judging instructions if checkout is to be exercised.\n\nThis account is an ordinary Auth user with its own workspace, not an administrator. Keep it available through judging. After judging, disable this identity in Supabase and set CREATORPAY_JUDGE_ACCESS=false.\n`, { mode: 0o600 });
  console.log('Dedicated judge account ready. Password sign-in and workspace isolation verified.');
  console.log('Private credentials: .data/judge-access.md (ignored by Git). Restart the app to show Judge sign-in.');
}
main().catch(error => { console.error(error instanceof Error ? error.message : 'Judge setup failed.'); process.exitCode = 1; });
