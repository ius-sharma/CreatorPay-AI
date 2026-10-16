const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), Module = require('node:module'), ts = require('typescript');
process.env.CREATORPAY_DB_PATH = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'creatorpay-payment-')), 'test.sqlite');
Object.assign(process.env, { PAYPAL_ENVIRONMENT: 'sandbox', PAYPAL_CLIENT_ID: 'fake-client', PAYPAL_CLIENT_SECRET: 'fake-secret', PAYPAL_BUSINESS_EMAIL: 'merchant@business.example', PAYPAL_WEBHOOK_ID: 'WH-TEST' });
require.extensions['.ts'] = (m,f) => m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, f);
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request,parent,...args) { return resolve.call(this, request.startsWith('@/') ? path.join(__dirname,'../src',request.slice(2)) : request,parent,...args); };
const { NextRequest } = require('next/server');
const { getSession } = require('../src/lib/analysis-session.ts');
const { getDeal, getActiveDeal, setActiveDeal, setActiveDealId, getStore, resetDemo } = require('../src/lib/store.ts');
const { database, acquireInvoiceJob, releaseInvoiceJob } = require('../src/lib/database.ts');
const { validateInvoicePayment, applyVerifiedPayment } = require('../src/lib/payment-tracking.ts');
const { createAndSendMilestoneInvoice, invoiceNumberFor } = require('../src/lib/paypal.ts');
const invoiceRoute = require('../src/app/api/paypal/invoice/route.ts');
const webhookRoute = require('../src/app/api/paypal/webhook/route.ts');
const session = getSession();
const cookie = `creatorpay-analysis=${session.cookie}`;
const deal = { id: 'deal-payment-test', ownerSession: session.id, contractExtraction: {}, brandName: 'Acme', brandEmail: 'buyer@personal.example', dealTitle: 'Acme contract', totalAmount: 2000, currency: 'USD', prompt: 'test', status: 'analyzed', milestones: [{ id: 'm1', name: '30% advance', amount: 600, percentage: 30, status: 'pending' }, { id: 'm2', name: '70% balance', amount: 1400, percentage: 70, status: 'pending' }], teamSplits: [], creatorNetPayout: 2000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), logs: [] };
const number = invoiceNumberFor(`${deal.id}:m1`);
function invoice(status = 'SENT') { return { id: 'INV2-REAL-TEST-1234', status, detail: { invoice_number: number, metadata: { recipient_view_url: 'https://www.sandbox.paypal.com/invoice/p/#REAL' } }, invoicer: { email_address: process.env.PAYPAL_BUSINESS_EMAIL }, primary_recipients: [{ billing_info: { email_address: deal.brandEmail } }], amount: { value: '600.00', currency_code: 'USD' }, payments: { paid_amount: { value: '600.00', currency_code: 'USD' }, transactions: [{ type: 'PAYPAL', payment_id: 'PAYMENT-REAL-1', amount: { value: '600.00', currency_code: 'USD' } }] } }; }
const response = (data, status=200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
const request = (url, body, headers={}) => new NextRequest(`http://localhost:3000${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
const signedHeaders = { 'paypal-auth-algo': 'SHA256withRSA', 'paypal-cert-url': 'https://api.sandbox.paypal.com/v1/notifications/certs/CERT-TEST', 'paypal-transmission-id': 'TRANS-TEST', 'paypal-transmission-sig': 'test-signature', 'paypal-transmission-time': '2026-10-11T10:00:00Z' };

test('stable invoice job rejects concurrent creation and recovers after release', () => {
  acquireInvoiceJob('lock-test'); assert.throws(() => acquireInvoiceJob('lock-test'), /already running/); releaseInvoiceJob('lock-test'); acquireInvoiceJob('lock-test'); releaseInvoiceJob('lock-test');
});
test('same-origin guard accepts the browser Host and rejects external origins', () => {
  const { isSameOrigin } = require('../src/lib/request-origin.ts');
  const r = origin => new NextRequest('http://localhost:3010/api/deals', { headers: { Host: '127.0.0.1:3010', Origin: origin } });
  assert.equal(isSameOrigin(r('http://127.0.0.1:3010')),true);
  assert.equal(isSameOrigin(r('https://attacker.example')),false);
});
test('invoice API stores actual IDs, requires owner and retries without duplicate creation', async () => {
  setActiveDeal(deal);
  const original = global.fetch;
  let creates=0, sends=0, state='DRAFT';
  global.fetch = async (url,opts={}) => {
    if (url.endsWith('/oauth2/token')) return response({ access_token: 'test-token', expires_in: 3600 });
    if (url.includes('search-invoices')) return response({ items: [] });
    if (url.endsWith('/invoices') && opts.method==='POST') { creates++; assert.equal(JSON.parse(opts.body).detail.payment_term.term_type,'DUE_ON_RECEIPT'); return response({ id: invoice().id },201); }
    if (url.endsWith('/send')) { sends++; state='SENT'; return new Response(null,{status:202}); }
    return response(invoice(state));
  };
  try {
    const body = { dealId: deal.id, milestoneIndex: 0 };
    assert.equal((await invoiceRoute.POST(request('/api/paypal/invoice',body))).status,403);
    assert.equal((await invoiceRoute.POST(request('/api/paypal/invoice',body,{cookie}))).status,200);
    assert.equal((await invoiceRoute.POST(request('/api/paypal/invoice',body,{cookie}))).status,200);
    assert.equal(creates,1); assert.equal(sends,1);
    const stored=getDeal(deal.id); assert.equal(stored.milestones[0].invoiceId,invoice().id); assert.equal(stored.milestones[0].status,'invoiced');
    assert.equal((await invoiceRoute.POST(request('/api/paypal/invoice',{...body,milestoneIndex:1},{cookie}))).status,409);
  } finally { global.fetch=original; }
});
test('invoice provider failure throws instead of inventing successful IDs', async () => {
  const original=global.fetch; global.fetch=async()=>response({name:'SERVICE_UNAVAILABLE'},503);
  try { await assert.rejects(createAndSendMilestoneInvoice({ brandName:'Acme',brandEmail:deal.brandEmail,milestoneTitle:'advance',amount:600,currency:'USD',operationKey:'failure-test' }),/rejected/); }
  finally { global.fetch=original; }
});
test('send failure retains draft ID and does not record SENT', async () => {
  let checkpoint;
  const original=global.fetch;
  global.fetch=async(url)=>url.includes('search-invoices')?response({items:[]}):url.endsWith('/invoices')?response({id:'INV2-DRAFT-TEST'}):url.endsWith('/send')?response({name:'SEND_FAILED'},500):response({...invoice('DRAFT'),id:'INV2-DRAFT-TEST',detail:{invoice_number:invoiceNumberFor('send-failure')}});
  try { await assert.rejects(createAndSendMilestoneInvoice({ brandName:'Acme',brandEmail:deal.brandEmail,milestoneTitle:'advance',amount:600,currency:'USD',operationKey:'send-failure',onCreated:i=>checkpoint=i }),/rejected/); assert.equal(checkpoint.id,'INV2-DRAFT-TEST'); assert.equal(checkpoint.status,'DRAFT'); }
  finally { global.fetch=original; }
});
test('wrong amount, currency, merchant, recipient, pending and manual payments fail validation', () => {
  const stored=getDeal(deal.id), milestone=stored.milestones[0];
  for(const change of [i=>i.amount.value='1.00',i=>i.payments.paid_amount.currency_code='EUR',i=>i.status='PAYMENT_PENDING',i=>i.invoicer.email_address='attacker@example.com',i=>i.primary_recipients[0].billing_info.email_address='wrong@example.com',i=>i.payments.transactions[0].type='EXTERNAL',i=>i.payments.transactions[0].amount.value='599.00']) { const i=invoice('PAID');change(i);assert.throws(()=>validateInvoicePayment(i,stored,milestone)); }
});
test('unsigned and invalidly signed webhooks cannot change payment state', async () => {
  const original=global.fetch;global.fetch=async()=>response({verification_status:'FAILURE'});
  try { const event={id:'WH-FAIL',event_type:'INVOICING.INVOICE.PAID',resource:{invoice:{id:invoice().id}}};assert.equal((await webhookRoute.POST(request('/api/paypal/webhook',event))).status,401);assert.equal((await webhookRoute.POST(request('/api/paypal/webhook',event,signedHeaders))).status,401);assert.equal(getDeal(deal.id).milestones[0].status,'invoiced'); }
  finally { global.fetch=original; }
});
test('verified webhook maps invoice to its own deal and duplicate deliveries produce one payment log', async () => {
  setActiveDealId('deal-cloudhost');
  const original=global.fetch;
  global.fetch=async(url)=>url.includes('verify-webhook')?response({verification_status:'SUCCESS'}):response(invoice('PAID'));
  try {
    const event={id:'WH-PAID-TEST',event_type:'INVOICING.INVOICE.PAID',resource:{invoice:{id:invoice().id}},milestoneIndex:99};
    assert.equal((await webhookRoute.POST(request('/api/paypal/webhook',event,signedHeaders))).status,200);
    const duplicate=await webhookRoute.POST(request('/api/paypal/webhook',event,signedHeaders));assert.equal((await duplicate.json()).duplicate,true);
    const stored=getDeal(deal.id);assert.equal(stored.milestones[0].status,'paid');assert.equal(stored.logs.filter(l=>l.type==='webhook').length,1);assert.equal(getActiveDeal().id,'deal-cloudhost');assert.equal(stored.milestones[1].status,'pending');
    assert.equal(applyVerifiedPayment(invoice('PAID'),'WH-PAID-SECOND').duplicate,true);
  } finally { global.fetch=original; }
});
test('deals, payments, dedupe records survive a separate Node process and demo reset', () => {
  resetDemo(); assert.equal(getDeal(deal.id).milestones[0].status,'paid');
  const script="const {DatabaseSync}=require('node:sqlite');const d=new DatabaseSync(process.env.CREATORPAY_DB_PATH);const s=JSON.parse(d.prepare('SELECT body FROM app_state WHERE id=1').get().body);console.log(JSON.stringify({paid:s.deals.find(d=>d.id==='deal-payment-test').milestones[0].status,events:d.prepare('SELECT COUNT(*) AS n FROM webhook_events').get().n}));d.close();";
  const result=JSON.parse(require('child_process').execFileSync(process.execPath,['-e',script],{encoding:'utf8'}));assert.equal(result.paid,'paid');assert.equal(result.events,2);
});

test('final invoice requires current human approval and reuses one invoice; verified final payment completes payment stage', async()=>{
  const finalDeal={...deal,id:'final-test',milestones:[{...deal.milestones[0],status:'paid',paymentVerifiedAt:new Date().toISOString()},{...deal.milestones[1]}],deliverable:{id:'d-final',verified:false},deliverableReviews:[]};
  setActiveDeal(finalDeal);
  const body={dealId:finalDeal.id,milestoneIndex:1};
  assert.equal((await invoiceRoute.POST(request('/api/paypal/invoice',body,{cookie}))).status,409);
  const {mutateStore}=require('../src/lib/store.ts');mutateStore(s=>{const d=s.deals.find(d=>d.id===finalDeal.id);d.deliverable.verified=true;d.deliverableReviews=[{id:'approved',approvedAt:new Date().toISOString()}];});
  const number=invoiceNumberFor(finalDeal.id+':m2');let creates=0,sends=0,state='DRAFT';const original=global.fetch;
  const actual=()=>({...invoice(state),id:'INV2-FINAL-TEST',detail:{invoice_number:number,metadata:{recipient_view_url:'https://www.sandbox.paypal.com/invoice/p/#FINAL'}},amount:{value:'1400.00',currency_code:'USD'},payments:{paid_amount:{value:'1400.00',currency_code:'USD'},transactions:[{type:'PAYPAL',payment_id:'FINAL-PAYMENT',amount:{value:'1400.00',currency_code:'USD'}}]}});
  global.fetch=async(url,opts={})=>{if(url.includes('search-invoices'))return response({items:[]});if(url.endsWith('/invoices')&&opts.method==='POST'){creates++;return response({id:'INV2-FINAL-TEST'},201);}if(url.endsWith('/send')){sends++;state='SENT';return new Response(null,{status:202});}return response(actual());};
  try{assert.equal((await invoiceRoute.POST(request('/api/paypal/invoice',body,{cookie}))).status,200);assert.equal((await invoiceRoute.POST(request('/api/paypal/invoice',body,{cookie}))).status,200);assert.equal(creates,1);assert.equal(sends,1);assert.equal(getDeal(finalDeal.id).status,'final_invoiced');state='PAID';applyVerifiedPayment(actual(),'WH-FINAL');assert.equal(getDeal(finalDeal.id).status,'deal_closed');assert.equal(getDeal(finalDeal.id).payout,undefined);
    const teamDeal={...getDeal(finalDeal.id),id:'team-final-test',status:'final_invoiced',teamSplits:[{id:'editor',name:'Editor',email:'editor@example.com',type:'fixed',value:300}],milestones:getDeal(finalDeal.id).milestones.map((m,i)=>i===1?{...m,status:'invoiced',paymentVerifiedAt:undefined,invoiceId:'INV2-TEAM-FINAL'}:m)};setActiveDeal(teamDeal);
    applyVerifiedPayment({...actual(),id:'INV2-TEAM-FINAL'},'WH-TEAM-FINAL');assert.equal(getDeal(teamDeal.id).status,'final_paid');}finally{global.fetch=original;}
});
