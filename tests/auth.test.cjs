const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, file);
let calls = [];
let error = null;
let user = null;
let signupSession = null;
let verificationThrows = false;
const client = { auth: {
  getUser: async () => ({ data: { user }, error }),
  signInWithPassword: async (credentials) => { calls.push(['login', credentials]); return { error }; },
  signUp: async (credentials) => { calls.push(['signup', credentials]); return { data: { session: signupSession }, error }; },
  signOut: async () => ({ error }),
  exchangeCodeForSession: async (code) => { if (verificationThrows) throw new Error('private diagnostics'); calls.push(['exchange', code]); return { error }; },
  verifyOtp: async (details) => { if (verificationThrows) throw new Error('private diagnostics'); calls.push(['verify', details]); return { error }; },
} };
const load = Module._load;
Module._load = function(request, parent, ...args) {
  if (request === '@/lib/supabase/server') return { createClient: () => client };
  if (request === '@supabase/ssr') return { createServerClient: () => client };
  if (request === 'next/navigation') return { redirect: (url) => { throw new Error('REDIRECT:' + url); } };
  return load.call(this, request, parent, ...args);
};
const { NextRequest } = require('next/server');
const { authenticate } = require('../src/app/login/actions.ts');
const { middleware } = require('../src/middleware.ts');
const { GET } = require('../src/app/auth/callback/route.ts');
const { GET: confirm } = require('../src/app/auth/confirm/route.ts');
const form = (mode, email, password) => { const f = new FormData(); f.set('mode', mode); f.set('email', email); f.set('password', password); return f; };
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test';

test('malformed credentials and short signup password never call Auth', async () => {
  calls = [];
  assert.ok((await authenticate({}, form('login', 'invalid', 'password'))).error);
  assert.ok((await authenticate({}, form('signup', 'a@example.com', 'short'))).error);
  assert.ok((await authenticate({}, form('other', 'a@example.com', 'long-password'))).error);
  assert.equal(calls.length, 0);
});
test('signup waits for email confirmation; login failure is safe; verified login redirects', async () => {
  error = null; signupSession = null;
  assert.match((await authenticate({}, form('signup', 'a@example.com', 'long-password'))).message, /confirm/);
  error = { message: 'private provider diagnostics' };
  const failed = await authenticate({}, form('login', 'a@example.com', 'long-password'));
  assert.match(failed.error, /Login failed/);
  assert.ok(!failed.error.includes('private'));
  error = null;
  await assert.rejects(authenticate({}, form('login', 'a@example.com', 'long-password')), /REDIRECT:\/account/);
});
test('forged cookie cannot access account; verified user can; missing setup fails closed', async () => {
  user = null; error = null;
  const denied = await middleware(new NextRequest('http://localhost/account', { headers: { cookie: 'fake-session=admin' } }));
  assert.equal(denied.status, 307);
  assert.equal(new URL(denied.headers.get('location')).pathname, '/login');
  user = { id: 'verified-user' };
  assert.equal((await middleware(new NextRequest('http://localhost/account'))).status, 200);
  const old = process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  assert.equal((await middleware(new NextRequest('http://localhost/account'))).status, 503);
  process.env.NEXT_PUBLIC_SUPABASE_URL = old;
});
test('callback verifies code and ignores external redirect targets', async () => {
  error = null;
  const good = await GET(new NextRequest('http://localhost/auth/callback?code=test&next=https://evil.example'));
  assert.equal(good.headers.get('location'), 'http://localhost/account');
  error = { message: 'invalid code' };
  assert.equal((await GET(new NextRequest('http://localhost/auth/callback?code=bad'))).headers.get('location'), 'http://localhost/login?error=confirmation');
});
test('confirmation failures and unavailable Auth recover to login without exposing diagnostics', async () => {
  error = null;
  assert.equal((await confirm(new NextRequest('http://localhost/auth/confirm?token_hash=test&type=email'))).headers.get('location'), 'http://localhost/account');
  assert.equal((await confirm(new NextRequest('http://localhost/auth/confirm?token_hash=test&type=recovery'))).headers.get('location'), 'http://localhost/login?error=confirmation');
  verificationThrows = true;
  for (const [handler, url] of [[GET, '/auth/callback?code=test'], [confirm, '/auth/confirm?token_hash=test&type=email']]) {
    assert.equal((await handler(new NextRequest('http://localhost'+url))).headers.get('location'), 'http://localhost/login?error=confirmation');
  }
  verificationThrows = false;
});
test('cloud dashboard and all application APIs require Auth; PayPal webhook remains cookie-free', async () => {
  process.env.CREATORPAY_BACKEND = 'supabase';
  user = null; error = null;
  assert.equal((await middleware(new NextRequest('http://localhost/dashboard'))).status, 307);
  for (const path of ['/api/deals','/api/agent/analyze','/api/agent/verify','/api/paypal/invoice','/api/paypal/payout','/api/paypal/status']) {
    const result = await middleware(new NextRequest('http://localhost'+path));
    assert.equal(result.status, 401);
    assert.equal(result.headers.get('cache-control'), 'private, no-store');
  }
  assert.equal((await middleware(new NextRequest('http://localhost/api/paypal/webhook'))).status, 200);
  delete process.env.CREATORPAY_BACKEND;
});
