const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),Module=require('module'),ts=require('typescript');
process.env.CREATORPAY_DB_PATH=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'creatorpay-payout-')),'test.sqlite');Object.assign(process.env,{PAYPAL_ENVIRONMENT:'sandbox',PAYPAL_CLIENT_ID:'test',PAYPAL_CLIENT_SECRET:'test',PAYPAL_BUSINESS_EMAIL:'merchant@business.example.com'});
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const resolve=Module._resolveFilename;Module._resolveFilename=function(r,p,...a){return resolve.call(this,r.startsWith('@/')?path.join(__dirname,'../src',r.slice(2)):r,p,...a)};
const {NextRequest}=require('next/server');const {getSession}=require('../src/lib/analysis-session.ts');const {getDeal,setActiveDeal,mutateStore,getStore}=require('../src/lib/store.ts');const {makePayoutPlan,assertPayoutEligible,sendPayout,refreshPayout}=require('../src/lib/payout-tracking.ts');const route=require('../src/app/api/paypal/payout/route.ts');
const session=getSession(),now=new Date().toISOString();
const deal={id:'payout-test',ownerSession:session.id,contractExtraction:{},brandName:'Acme',brandEmail:'buyer@example.com',dealTitle:'Acme',totalAmount:2000,currency:'USD',prompt:'test',status:'final_paid',milestones:[{id:'m1',name:'advance',amount:600,status:'paid',paymentVerifiedAt:now,paymentTransactionIds:['p1']},{id:'m2',name:'final',amount:1400,status:'paid',paymentVerifiedAt:now,paymentTransactionIds:['p2']}],deliverable:{verified:true},deliverableReviews:[{approvedAt:now}],teamSplits:[{id:'aman',name:'Aman',role:'Editor',email:'aman@team.example',type:'percentage',value:15,calculatedAmount:300,status:'pending'}],creatorNetPayout:1700,logs:[],createdAt:now,updatedAt:now};
const mappings=[{splitId:'aman',receiverEmail:'sb-test123@personal.example.com'}];
const response=(d,status=200)=>new Response(JSON.stringify(d),{status,headers:{'Content-Type':'application/json'}});
const req=(body,cookie=session.cookie)=>new NextRequest('http://localhost:3010/api/paypal/payout',{method:'POST',headers:{cookie:`creatorpay-analysis=${cookie}`,'Content-Type':'application/json'},body:JSON.stringify({dealId:deal.id,...body})});
function batch(d,status='PENDING'){return{total_pages:1,batch_header:{payout_batch_id:'BATCH123',batch_status:status==='SUCCESS'?'SUCCESS':'PROCESSING',sender_batch_header:{sender_batch_id:d.payout.senderBatchId}},items:d.payout.items.map(i=>({payout_item_id:'ITEM123',transaction_status:status,...(status==='SUCCESS'?{transaction_id:'TX123'}:{}),payout_item:{recipient_type:'EMAIL',receiver:i.receiverEmail,amount:{currency:'USD',value:i.amount.toFixed(2)},sender_item_id:i.senderItemId}}))};}
test('eligibility blocks unpaid/unapproved, excessive or incorrect splits, wrong currency and unsafe receivers',()=>{
 for(const edit of [d=>d.deliverableReviews=[],d=>d.milestones[1].paymentVerifiedAt=undefined,d=>d.milestones[1].paymentTransactionIds=[],d=>d.teamSplits[0].calculatedAmount=999,d=>{d.teamSplits[0].value=150;d.teamSplits[0].calculatedAmount=3000},d=>d.currency='EUR']){const d=structuredClone(deal);edit(d);assert.throws(()=>assertPayoutEligible(d));}
 assert.throws(()=>makePayoutPlan(deal,[{splitId:'aman',receiverEmail:'real@gmail.com'}]));assert.throws(()=>makePayoutPlan(deal,[]));assert.equal(makePayoutPlan(deal,mappings).items[0].amount,300);
});
test('owner confirmation and immutable plan protect execution',async()=>{
 setActiveDeal(deal);assert.equal((await route.POST(req({action:'prepare',mappings},getSession().cookie))).status,403);
 assert.equal((await route.POST(req({action:'prepare',mappings}))).status,200);assert.equal((await route.POST(req({action:'prepare',mappings}))).status,409);
 assert.equal((await route.POST(req({action:'execute'}))).status,400);assert.equal(getDeal(deal.id).payout.batchId,undefined);
});
test('submitted and pending payouts are not settled; item success is verified once and refresh never sends again',async()=>{
 const original=global.fetch;let creates=0,status='PENDING';global.fetch=async(url,opts={})=>{if(url.endsWith('/oauth2/token'))return response({access_token:'test-token',expires_in:3600});if(opts.method==='POST'){creates++;return response({batch_header:{payout_batch_id:'BATCH123'}},201);}return response(batch(getDeal(deal.id),status));};
 try{await sendPayout(deal.id);assert.equal(getDeal(deal.id).teamSplits[0].status,'pending');assert.equal(getDeal(deal.id).payout.items[0].status,'PENDING');status='SUCCESS';await refreshPayout(deal.id);await refreshPayout(deal.id);assert.equal(creates,1);assert.equal(getDeal(deal.id).status,'payouts_completed');assert.equal(getStore().auditLedger.filter(a=>a.id==='payout-ITEM123').length,1);status='RETURNED';await refreshPayout(deal.id);assert.equal(getDeal(deal.id).status,'final_paid');assert.equal(getStore().auditLedger.find(a=>a.id==='payout-ITEM123').status,'RETURNED');}finally{global.fetch=original;}
});
test('wrong recipient, amount, sender ID and success without transaction cannot settle',async()=>{
 const original=global.fetch;try{for(const edit of [b=>b.items[0].payout_item.receiver='wrong@personal.example.com',b=>b.items[0].payout_item.amount.value='1.00',b=>b.batch_header.sender_batch_header.sender_batch_id='wrong',b=>delete b.items[0].transaction_id]){const b=batch(getDeal(deal.id),'SUCCESS');edit(b);global.fetch=async()=>response(b);await assert.rejects(refreshPayout(deal.id));assert.equal(getDeal(deal.id).teamSplits[0].status,'pending');}}finally{global.fetch=original;}
});
test('interrupted creation recovers original duplicate batch and never changes sender reference',async()=>{
 const d={...structuredClone(deal),id:'payout-recovery'};d.payout=makePayoutPlan(d,mappings);setActiveDeal(d);const original=global.fetch;let reference;
 global.fetch=async(url,opts={})=>{if(opts.method==='POST'){reference=JSON.parse(opts.body).sender_batch_header.sender_batch_id;return response({name:'DUPLICATE_BATCH_ID',links:[{href:'https://api-m.sandbox.paypal.com/v1/payments/payouts/BATCH123'}]},400);}return response(batch(getDeal(d.id),'SUCCESS'));};
 try{await sendPayout(d.id);assert.equal(reference,d.payout.senderBatchId);assert.equal(getDeal(d.id).payout.batchId,'BATCH123');assert.equal(getDeal(d.id).status,'payouts_completed');}finally{global.fetch=original;}
});
test('provider failure retains unsent plan and expired ambiguous retry is blocked',async()=>{
 const d={...structuredClone(deal),id:'payout-failed'};d.payout=makePayoutPlan(d,mappings);setActiveDeal(d);const original=global.fetch;global.fetch=async()=>response({name:'INSUFFICIENT_FUNDS'},400);
 try{await assert.rejects(sendPayout(d.id),/INSUFFICIENT_FUNDS/);assert.equal(getDeal(d.id).payout.batchId,undefined);mutateStore(s=>s.deals.find(x=>x.id===d.id).payout.createdAt='2025-01-01T00:00:00Z');await assert.rejects(sendPayout(d.id),/retry window expired/);}finally{global.fetch=original;}
});
