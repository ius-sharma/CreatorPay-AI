const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, file);
const { summarize, nextAction } = require('../src/lib/workspace-summary.ts');
const deal = { currency: 'USD', status: 'analyzed', milestones: [{ amount: 600, status: 'paid', paymentVerifiedAt: '2026-10-11' }, { amount: 1400, status: 'pending' }], payout: { items: [{ amount: 300, status: 'SUCCESS', transactionId: 'verified' }, { amount: 500, status: 'PENDING' }] } };
test('overview excludes samples, separates currencies and counts only verified payments and payouts', () => {
  assert.deepEqual(summarize([deal, { ...deal, demo: true }, { ...deal, currency: 'EUR' }], 'USD'), { received: 600, outstanding: 1400, paidOut: 300, active: 1 });
  assert.deepEqual(summarize([], 'USD'), { received: 0, outstanding: 0, paidOut: 0, active: 0 });
  assert.equal(summarize([{ ...deal, milestones: [{ amount: 600, status: 'paid' }] }], 'USD').received, 0);
});
test('next actions respect milestone payment, approval and payout stages', () => {
  assert.equal(nextAction(deal), 'Review deliverable');
  assert.equal(nextAction({ ...deal, deliverableReviews: [{ approvedAt: '2026-10-11' }] }), 'Create final invoice');
  assert.equal(nextAction({ ...deal, milestones: [{ amount: 600, status: 'pending' }] }), 'Create advance invoice');
  assert.equal(nextAction({ ...deal, milestones: [{ amount: 600, status: 'invoiced', invoiceId: 'invoice' }] }), 'Check invoice');
  assert.equal(nextAction({ ...deal, status: 'payouts_completed' }), 'View settlement');
});

const {isSoloComplete,completeSoloDeal}=require('../src/lib/deal-completion.ts');
const {isComplete}=require('../src/lib/workspace-summary.ts');
test('solo completion requires real contract, approval and every verified payment without a payout',()=>{
 const solo={...deal,teamSplits:[],payout:undefined,contractExtraction:{},deliverable:{verified:true},deliverableReviews:[{approvedAt:'verified'}],milestones:[{status:'paid',paymentVerifiedAt:'verified',amount:2000}]};
 assert.equal(isSoloComplete(solo),true); assert.equal(isComplete(solo),true);
 assert.equal(nextAction(solo),'View settlement');
 completeSoloDeal(solo); assert.equal(solo.status,'deal_closed'); assert.equal(solo.payout,undefined);
 for(const change of [{demo:true},{contractExtraction:null},{teamSplits:[{id:'team'}]},{deliverable:{verified:false}},{deliverableReviews:[]},{milestones:[]},{milestones:[{status:'paid'}]},{payout:{items:[]}}]){
  const incomplete={...solo,status:'final_paid',...change};
  assert.equal(isSoloComplete(incomplete),false);completeSoloDeal(incomplete);assert.equal(incomplete.status,'final_paid');
 }
});
