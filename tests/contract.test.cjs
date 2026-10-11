const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
process.env.CREATORPAY_DB_PATH = path.join(fs.mkdtempSync(path.join(require('os').tmpdir(), 'creatorpay-contract-')), 'test.sqlite');
// Transpile isolated server modules in memory; no build artifacts or provider calls.
const original = require.extensions['.ts'];
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, file);
const { reviewContract, dealFromReview } = require('../src/lib/contract.ts');
const { seal, unseal, reserveAnalysis } = require('../src/lib/analysis-session.ts');
const { extractContract } = require('../src/lib/groq.ts');
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...args) { return resolve.call(this, request.startsWith('@/') ? path.join(__dirname, '../src', request.slice(2)) : request, parent, ...args); };
const { NextRequest } = require('next/server');
const analyze = require('../src/app/api/agent/analyze/route.ts');
const deals = require('../src/app/api/deals/route.ts');
const source = 'Acme offers USD 2,000. Bill finance@acme.example. 30% advance and 70% after approval. Deliver a 60-second sponsor segment by 2026-11-01. Aman editor aman@team.example gets 15%.';
const quoted = value => ({ value, evidence: source });
const fixture = () => ({ brandName: quoted('Acme'), brandEmail: quoted('finance@acme.example'), totalAmount: quoted(2000), currency: quoted('USD'), deadline: quoted('2026-11-01'), milestones: [{ name: 'Advance', amount: null, percentage: 30, evidence: source }, { name: 'After approval', amount: null, percentage: 70, evidence: source }], deliverables: [{ requirement: '60-second sponsor segment', evidence: source }], teamSplits: [{ name: 'Aman', role: 'editor', email: 'aman@team.example', type: 'percentage', value: 15, evidence: source }], conflicts: [] });

test('calculates milestones and splits and confirms without executing payments', () => {
  const review = reviewContract(fixture(), source);
  assert.deepEqual(review.issues, []);
  assert.deepEqual(review.calculatedMilestones.map(m => m.amount), [600, 1400]);
  assert.equal(review.calculatedSplits[0].calculatedAmount, 300);
  assert.equal(review.creatorNet, 1700);
  const deal = dealFromReview(review, source, 'deal-test');
  assert.equal(deal.brandEmail, 'finance@acme.example');
  assert.ok(deal.milestones.every(m => m.status === 'pending' && !m.invoiceId));
});
test('missing or invented billing email cannot be confirmed', () => {
  for (const brandEmail of [{ value: null, evidence: null }, quoted('invented@acme.example')]) {
    const data = fixture(); data.brandEmail = brandEmail;
    const review = reviewContract(data, source);
    assert.ok(review.issues.some(issue => /brandEmail/.test(issue)));
    assert.throws(() => dealFromReview(review, source, 'bad'));
  }
});
test('invented evidence and schema violations are rejected', () => {
  const data = fixture(); data.deliverables[0].evidence = 'not in contract';
  assert.ok(reviewContract(data, source).issues.some(issue => /Deliverable/.test(issue)));
  data.totalAmount.value = '2000'; assert.throws(() => reviewContract(data, source), /Invalid AI/);
  const extra = fixture(); extra.extraneous = true; assert.throws(() => reviewContract(extra, source), /Unexpected/);
});
test('invented numeric values cannot use unrelated real evidence', () => {
  const data = fixture(); data.totalAmount.value = 9000;
  assert.ok(reviewContract(data, source).issues.some(issue => /numerically/.test(issue)));
});
test('conflicts, amount disagreement and incomplete milestones block confirmation', () => {
  const data = fixture(); data.conflicts = ['Two incompatible prices']; data.milestones[0].amount = 2000;
  const issues = reviewContract(data, source).issues;
  assert.ok(issues.some(issue => /conflict/.test(issue)));
  assert.ok(issues.some(issue => /disagree/.test(issue)));
  assert.ok(issues.some(issue => /add up/.test(issue)));
});
test('over-allocation and missing split recipients block confirmation', () => {
  const conflict = reviewContract(fixture(), source + ' The contract total is USD 3,000.');
  assert.ok(conflict.issues.some(issue => /Conflicting explicit/.test(issue)));
  assert.throws(() => dealFromReview(conflict, source, 'conflict'));
  const data = fixture(); data.teamSplits[0].value = 150; data.teamSplits[0].email = null;
  const issues = reviewContract(data, source).issues;
  assert.ok(issues.some(issue => /exceed/.test(issue)));
  assert.ok(issues.some(issue => /email/.test(issue)));
});
test('contract splits override saved rules; unsupplied splits stay empty', () => {
  const saved = [{ name: 'Bob', role: 'editor', email: 'bob@team.example', type: 'fixed', value: 50 }];
  assert.equal(reviewContract(fixture(), source, saved).calculatedSplits[0].name, 'Aman');
  const data = fixture(); data.teamSplits = [];
  assert.equal(reviewContract(data, source).calculatedSplits.length, 0);
  assert.equal(reviewContract(data, source, saved).calculatedSplits[0].calculatedAmount, 50);
});
test('review signatures reject modifications', () => {
  const token = seal({ amount: 2000 }); assert.equal(unseal(token).amount, 2000);
  assert.throws(() => unseal(`${Buffer.from('{"amount":1}').toString('base64url')}.${token.split('.')[1]}`));
});
test('demo guardrail limits rapid repeat requests', () => {
  const id = 'test-session'; reserveAnalysis(id); assert.throws(() => reserveAnalysis(id), /10 seconds/);
});
test('Groq failures never become simulated successes', async () => {
  const key = process.env.GROQ_API_KEY;
  const fetch = global.fetch;
  try {
    delete process.env.GROQ_API_KEY;
    await assert.rejects(extractContract(source), /not configured/);
    process.env.GROQ_API_KEY = 'test-not-a-real-key';
    global.fetch = async () => ({ ok: false, status: 429 });
    await assert.rejects(extractContract(source), /usage limit/);
    global.fetch = async () => ({ ok: true, json: async () => ({ choices: [{ finish_reason: 'length', message: { content: '{}' } }] }) });
    await assert.rejects(extractContract(source), /incomplete/);
  } finally { global.fetch = fetch; if (key === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = key; }
});

test('API analyses a contract, requires confirmation, isolates sessions and creates one deal', async () => {
  const key = process.env.GROQ_API_KEY, fetch = global.fetch;
  const request = (url, body, cookie) => new NextRequest(`http://localhost:3000${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}) }, body: JSON.stringify(body) });
  try {
    process.env.GROQ_API_KEY = 'test-not-a-real-key';
    let calls = 0;
    global.fetch = async (_url, options) => {
      calls++;
      const sent = JSON.parse(options.body);
      assert.equal(sent.response_format.json_schema.strict, true);
      assert.equal(sent.messages[sent.messages.length - 1].content, source);
      return { ok: true, json: async () => ({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(fixture()) } }] }) };
    };
    const before = (await (await deals.GET()).json()).allDeals.length;
    const response = await analyze.POST(request('/api/agent/analyze', { prompt: source }));
    assert.equal(response.status, 200);
    const { token, review } = await response.json(); assert.deepEqual(review.issues, []);
    const cookie = response.headers.get('set-cookie').split(';')[0];
    assert.equal((await (await deals.GET()).json()).allDeals.length, before);
    const wrongSession = await deals.POST(request('/api/deals', { action: 'confirm_analysis', token }));
    assert.equal(wrongSession.status, 400);
    const confirmed = await deals.POST(request('/api/deals', { action: 'confirm_analysis', token }, cookie));
    assert.equal(confirmed.status, 200);
    const state = await confirmed.json();
    assert.equal(state.allDeals.length, before + 1);
    assert.equal(state.activeDeal.totalAmount, 2000);
    const repeated = await deals.POST(request('/api/deals', { action: 'confirm_analysis', token }, cookie));
    assert.equal((await repeated.json()).allDeals.length, before + 1);
    const throttled = await analyze.POST(request('/api/agent/analyze', { prompt: source }, cookie));
    assert.equal(throttled.status, 429); assert.equal(calls, 1);
    for (const endpoint of ['paypal/payout', 'agent/verify']) {
      const route = require(`../src/app/api/${endpoint}/route.ts`);
      assert.equal((await route.POST(request(`/api/${endpoint}`, {}))).status, 409);
    }
    assert.equal((await require('../src/app/api/paypal/webhook/route.ts').POST(request('/api/paypal/webhook', {}))).status, 401);
    assert.equal(calls, 1);
  } finally { global.fetch = fetch; if (key === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = key; }
});
test('API rejects oversized, malformed and unsigned inputs and reports missing key', async () => {
  const key = process.env.GROQ_API_KEY;
  const request = body => new NextRequest('http://localhost:3000/api/agent/analyze', { method: 'POST', body: JSON.stringify(body) });
  try {
    delete process.env.GROQ_API_KEY;
    assert.equal((await analyze.POST(request({ prompt: source }))).status, 503);
    assert.equal((await analyze.POST(request({ prompt: 'x'.repeat(12001) }))).status, 400);
    assert.equal((await analyze.POST(request({ prompt: source, customSplits: [{ value: 'bad' }] }))).status, 400);
    const unsigned = new NextRequest('http://localhost:3000/api/deals', { method: 'POST', body: JSON.stringify({ prompt: source }) });
    assert.equal((await deals.POST(unsigned)).status, 400);
    const tampered = new NextRequest('http://localhost:3000/api/deals', { method: 'POST', body: JSON.stringify({ action: 'confirm_analysis', token: 'tampered' }) });
    assert.equal((await deals.POST(tampered)).status, 400);
  } finally { if (key === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = key; }
});
