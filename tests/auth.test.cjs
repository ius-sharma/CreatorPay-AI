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
  resetPasswordForEmail: async (...args) => { calls.push(['recover', ...args]); return { error }; },
  resend: async (...args) => { calls.push(['resend', ...args]); return { error }; },
  updateUser: async (...args) => { calls.push(['update', ...args]); return { error }; },
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
const { authenticate, requestAccountEmail, updatePassword } = require('../src/app/login/actions.ts');
const { middleware } = require('../src/middleware.ts');
const { GET } = require('../src/app/auth/callback/route.ts');
const { GET: confirm } = require('../src/app/auth/confirm/route.ts');
const { judgeLoginEmail } = require('../src/lib/judge-access.ts');
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

test('judge shortcut requires sandbox configuration and never bypasses password login', async () => {
  const names=['CREATORPAY_JUDGE_ACCESS','CREATORPAY_JUDGE_EMAIL','CREATORPAY_BACKEND','PAYPAL_ENVIRONMENT'];
  const before=Object.fromEntries(names.map(name=>[name,process.env[name]]));
  try {
    Object.assign(process.env,{CREATORPAY_JUDGE_ACCESS:'true',CREATORPAY_JUDGE_EMAIL:'judge@creatorpay.example',CREATORPAY_BACKEND:'supabase',PAYPAL_ENVIRONMENT:'sandbox'});
    assert.equal(judgeLoginEmail(),'judge@creatorpay.example');
    for(const [key,value] of [['PAYPAL_ENVIRONMENT','live'],['CREATORPAY_BACKEND','sqlite'],['CREATORPAY_JUDGE_ACCESS','false'],['CREATORPAY_JUDGE_EMAIL','invalid']]){
      const old=process.env[key];process.env[key]=value;assert.equal(judgeLoginEmail(),null);process.env[key]=old;
    }
    calls=[];error=null;
    assert.ok((await authenticate({},form('judge','judge@creatorpay.example',''))).error);
    assert.equal(calls.length,0);
    const f=form('login','judge@creatorpay.example','test-password-only');f.set('destination','workspace');
    error={message:'wrong password'};
    assert.ok((await authenticate({},f)).error);
    error=null;
    await assert.rejects(authenticate({},f),/REDIRECT:\/dashboard/);
    f.set('destination','https://evil.example');
    await assert.rejects(authenticate({},f),/REDIRECT:\/account/);
  } finally {
    error=null;
    for(const name of names) if(before[name]===undefined)delete process.env[name];else process.env[name]=before[name];
  }
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
  assert.equal((await confirm(new NextRequest('http://localhost/auth/confirm?token_hash=test&type=recovery'))).headers.get('location'), 'http://localhost/auth/reset-password');
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

test('recovery redirects stay on configured origin and email responses do not expose membership', async () => {
  process.env.NEXT_PUBLIC_APP_URL = 'https://creator.example'; error = null; calls = [];
  const sent = await requestAccountEmail({}, form('recover','a@example.com',''));
  assert.equal(calls[0][2].redirectTo, 'https://creator.example/auth/callback?flow=recovery');
  error = {message:'unknown account'};
  assert.deepEqual(await requestAccountEmail({}, form('recover','unknown@example.com','')),sent);
  await requestAccountEmail({}, form('resend','a@example.com',''));
  assert.equal(calls.at(-1)[1].options.emailRedirectTo,'https://creator.example/auth/callback');
  calls = [];
  assert.ok((await requestAccountEmail({}, form('recover','invalid',''))).error);
  process.env.NEXT_PUBLIC_APP_URL = 'javascript:alert(1)';
  assert.ok((await requestAccountEmail({}, form('recover','a@example.com',''))).error);
  assert.equal(calls.length,0); error = null;
  const result = await GET(new NextRequest('http://localhost/auth/callback?code=test&flow=recovery&next=https://evil.example'));
  assert.equal(result.headers.get('location'),'http://localhost/auth/reset-password');
});
test('password changes require a verified identity and matching strong passwords', async () => {
  calls=[]; user=null; error=null;
  const f=form('recover','a@example.com','new-long-password'); f.set('confirmation','new-long-password');
  assert.ok((await updatePassword({},f)).error); assert.equal(calls.length,0);
  user={id:'verified'}; f.set('confirmation','wrong');
  assert.ok((await updatePassword({},f)).error); assert.equal(calls.length,0);
  f.set('confirmation','new-long-password');
  assert.ok((await updatePassword({},f)).message); assert.equal(calls[0][0],'update');
  error={message:'private diagnostics'};
  assert.ok(!(await updatePassword({},f)).error.includes('private diagnostics'));
  error=null; user=null;
});
