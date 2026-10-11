const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('fs'),path=require('path'),os=require('os'),Module=require('module'),ts=require('typescript');
process.env.CREATORPAY_DB_PATH=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'creatorpay-review-')),'test.sqlite');
process.env.GROQ_API_KEY='test-key';
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const resolve=Module._resolveFilename;Module._resolveFilename=function(r,p,...a){return resolve.call(this,r.startsWith('@/')?path.join(__dirname,'../src',r.slice(2)):r,p,...a)};
const {NextRequest}=require('next/server');const {getSession}=require('../src/lib/analysis-session.ts');
const {setActiveDeal,getDeal,mutateStore}=require('../src/lib/store.ts');const {validateDeliverableReview}=require('../src/lib/deliverable-review.ts');const route=require('../src/app/api/agent/verify/route.ts');
const input={transcript:'Today Acme sponsors our tutorial. Acme helps creators organize their work.',description:'',videoUrl:''};
const base={id:'review-test',brandName:'Acme',brandEmail:'buyer@example.com',totalAmount:2000,currency:'USD',dealTitle:'Acme',prompt:'Acme sponsor segment',status:'advance_paid',contractExtraction:{deliverables:[{requirement:'Include an Acme sponsor segment',evidence:'Acme sponsor segment'}]},milestones:[{id:'m1',name:'advance',amount:600,percentage:30,status:'paid',paymentVerifiedAt:new Date().toISOString()},{id:'m2',name:'final',amount:1400,percentage:70,status:'pending'}],teamSplits:[],deliverable:{id:'d1',title:'sponsor',verified:false,requiredSponsorTag:'',requiredLink:''},creatorNetPayout:2000,logs:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
const check=(result='met')=>({requirementIndex:0,result,transcriptQuote:result==='met'?'Acme sponsors our tutorial.':null,descriptionQuote:null,explanation:result==='met'?'Sponsor segment present.':'Sponsor content missing.'});
test('evidence validation rejects invented quotes, missing/duplicate requirements and unsupported met claims',()=>{
 assert.throws(()=>validateDeliverableReview({checks:[{...check(),transcriptQuote:'invented'}]},base,input),/does not exist/);
 assert.throws(()=>validateDeliverableReview({checks:[]},base,input),/incomplete/);
 assert.throws(()=>validateDeliverableReview({checks:[{...check(),transcriptQuote:null}]},base,input),/without evidence/);
 assert.throws(()=>validateDeliverableReview({checks:[{...check(),requirementIndex:4}]},base,input),/invalid/);
});
test('duration cannot be auto-approved from a transcript',()=>{const d={...base,contractExtraction:{deliverables:[{requirement:'60-second Acme sponsor segment',evidence:'60-second Acme sponsor segment'}]}};assert.equal(validateDeliverableReview({checks:[check()]},d,input).verdict,'human_review');});
test('review rejects missing sponsor, accepts corrected text for human approval, prevents stale approval and locks approved settlement',async()=>{
 const session=getSession();setActiveDeal({...base,ownerSession:session.id});
 const req=(body,cookie=session.cookie)=>new NextRequest('http://localhost:3000/api/agent/verify',{method:'POST',headers:{'Content-Type':'application/json',cookie:`creatorpay-analysis=${cookie}`},body:JSON.stringify({dealId:base.id,...body})});
 const original=global.fetch;let result='missing';global.fetch=async()=>new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:JSON.stringify({checks:[check(result)]})}}]}));
 try {
  assert.equal((await route.POST(req({action:'review',...input},getSession().cookie))).status,403);
  assert.equal((await route.POST(req({action:'review',transcript:'short'}))).status,400);
  let r=await (await route.POST(req({action:'review',...input}))).json();assert.equal(r.deal.deliverableReviews[0].verdict,'changes_required');const old=r.deal.deliverableReviews[0].id;
  assert.equal((await route.POST(req({action:'approve',reviewId:old,confirmEvidence:true}))).status,409);
  const fresh=getSession();mutateStore(s=>s.deals.find(d=>d.id===base.id).ownerSession=fresh.id);result='met';
  r=await (await route.POST(req({action:'review',...input},fresh.cookie))).json();const id=r.deal.deliverableReviews[0].id;
  assert.equal(r.deal.deliverable.verified,false);assert.equal(r.deal.deliverableReviews.length,2);
  assert.equal((await route.POST(req({action:'approve',reviewId:old,confirmEvidence:true},fresh.cookie))).status,409);
  assert.equal((await route.POST(req({action:'approve',reviewId:id},fresh.cookie))).status,400);
  assert.equal((await route.POST(req({action:'approve',reviewId:id,confirmEvidence:true},fresh.cookie))).status,200);
  assert.equal(getDeal(base.id).status,'deliverable_verified');const logs=getDeal(base.id).logs.length;
  assert.equal((await route.POST(req({action:'approve',reviewId:id,confirmEvidence:true},fresh.cookie))).status,200);assert.equal(getDeal(base.id).logs.length,logs);
  assert.equal((await route.POST(req({action:'review',...input},fresh.cookie))).status,409);
 } finally {global.fetch=original;}
});
test('unpaid advances cannot start review and provider failure does not save approval',async()=>{
 const session=getSession();setActiveDeal({...base,id:'unpaid-review',ownerSession:session.id,milestones:[{...base.milestones[0],status:'invoiced',paymentVerifiedAt:undefined},base.milestones[1]]});
 const req=()=>new NextRequest('http://localhost:3000/api/agent/verify',{method:'POST',headers:{cookie:`creatorpay-analysis=${session.cookie}`},body:JSON.stringify({dealId:'unpaid-review',action:'review',...input})});
 assert.equal((await route.POST(req())).status,409);
 mutateStore(s=>{s.deals.find(d=>d.id==='unpaid-review').milestones[0]={...base.milestones[0]}});
 const original=global.fetch;global.fetch=async()=>new Response('{}',{status:503});try{assert.equal((await route.POST(req())).status,502);assert.equal(getDeal('unpaid-review').deliverableReviews,undefined);}finally{global.fetch=original;}
});
