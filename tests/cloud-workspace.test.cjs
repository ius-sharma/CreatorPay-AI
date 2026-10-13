// Exercise real cloud handlers against PostgreSQL, with Auth/provider boundaries mocked.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const { PGlite } = require('@electric-sql/pglite');
require.extensions['.ts'] = (module,file) => module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file);
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222';
let owner=A, db, providerCalls=0;
const sqlName=s=>{if(!/^[a-z_]+$/.test(s))throw Error('Invalid SQL name');return s;};
class Query {
  constructor(table){this.table=sqlName(table);this.filters=[];this.columns='*';this.mode='select';}
  select(columns='*'){this.columns=columns;return this;}
  eq(column,value){this.filters.push([sqlName(column),value]);return this;}
  order(column){this.orderBy=sqlName(column);return this;}
  range(start,end){this.offset=start;this.limitValue=end-start+1;return this;}
  limit(value){this.limitValue=value;return this;}
  single(){this.one=true;return this;}
  maybeSingle(){this.one=true;return this;}
  update(value){this.mode='update';this.value=value;return this;}
  insert(value){this.mode='insert';this.value=value;return this;}
  upsert(value,options){this.mode='insert';this.value=value;this.options=options;return this;}
  async execute(){
    try{
      const values=[];const param=v=>{values.push(v&&typeof v==='object'?JSON.stringify(v):v);return '$'+values.length;};
      const where=this.filters.length?' where '+this.filters.map(([c,v])=>c+'='+param(v)).join(' and '):'';
      let sql;
      if(this.mode==='select')sql='select '+(this.columns==='*'?'*':this.columns.split(',').map(sqlName).join(','))+' from public.'+this.table+where+(this.orderBy?' order by '+this.orderBy:'')+(this.limitValue!==undefined?' limit '+this.limitValue:'')+(this.offset?' offset '+this.offset:'');
      else if(this.mode==='update')sql='update public.'+this.table+' set '+Object.entries(this.value).map(([k,v])=>sqlName(k)+'='+param(v)).join(',')+where+' returning *';
      else{
        const rows=Array.isArray(this.value)?this.value:[this.value];const columns=Object.keys(rows[0]);
        sql='insert into public.'+this.table+'('+columns.map(sqlName).join(',')+') values '+rows.map(row=>'('+columns.map(c=>param(row[c])).join(',')+')').join(',');
        if(this.options?.ignoreDuplicates)sql+=' on conflict('+sqlName(this.options.onConflict)+') do nothing';
        sql+=' returning *';
      }
      const result=await db.query(sql,values);return {data:this.one?result.rows[0]||null:result.rows,error:null};
    }catch(error){return {data:null,error:{code:error.code,message:error.message}};}
  }
  then(resolve,reject){return this.execute().then(resolve,reject);}
}
const admin={from:table=>new Query(table),rpc:async(name,args)=>{try{const keys=Object.keys(args);const values=keys.map(k=>args[k]&&typeof args[k]==='object'?JSON.stringify(args[k]):args[k]);const r=await db.query('select public.'+sqlName(name)+'('+keys.map((k,i)=>sqlName(k)+' => $'+(i+1)).join(',')+') as result',values);return {data:r.rows[0].result,error:null};}catch(e){return {data:null,error:{code:e.code,message:e.message}};}}};
const load=Module._load;
Module._load=function(request,parent,...args){
  if(request==='server-only')return {};
  if(request==='@/lib/supabase/admin')return {createAdminClient:()=>admin};
  if(request.startsWith('@/'))return load.call(this,path.join(__dirname,'../src',request.slice(2)),parent,...args);
  if(request==='./admin'&&parent?.filename.includes('supabase'))return {createAdminClient:()=>admin};
  if(request==='./server'&&parent?.filename.includes('supabase'))return {createClient:()=>({auth:{getUser:async()=>({data:{user:owner?{id:owner}:null},error:null})}})};
  return load.call(this,request,parent,...args);
};
const {NextRequest}=require('next/server');
const routes=require('../src/lib/supabase/routes.ts');
const drafts=require('../src/app/api/draft/route.ts');
const settings=require('../src/app/api/workspace/route.ts');
const request=(input,path='/api/deals')=>new NextRequest('http://localhost'+path,{method:'POST',headers:{origin:'http://localhost','content-type':'application/json'},body:JSON.stringify(input)});
const {seal}=require('../src/lib/analysis-session.ts');
const source='Acme offers USD 2,000. Bill finance@acme.example. 30% advance and 70% after approval. Deliver a 60-second sponsor segment by 2026-11-01.';
const field=value=>({value,evidence:source});
const extraction={brandName:field('Acme'),brandEmail:field('finance@acme.example'),totalAmount:field(2000),currency:field('USD'),deadline:field('2026-11-01'),milestones:[{name:'Advance',amount:null,percentage:30,evidence:source},{name:'After approval',amount:null,percentage:70,evidence:source}],deliverables:[{requirement:'60-second sponsor segment',evidence:source}],teamSplits:[],conflicts:[]};

test('cloud handlers isolate accounts, enforce signed ownership and preserve durable quota state',async()=>{
  db=new PGlite();const originalFetch=global.fetch;global.fetch=async()=>{providerCalls++;throw Error('Provider must not be called');};
  try{
    await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql as $$select null::uuid$$;insert into auth.users values('${A}'),('${B}');`);
    for(const file of ['202610110001_workspace.sql','202610110002_atomic_deal_updates.sql','202610120001_contract_drafts.sql','202610120002_workspace_profile.sql'])await db.exec(fs.readFileSync(path.join(__dirname,'../supabase/migrations',file),'utf8'));
    owner=A;process.env.CREATORPAY_BACKEND='supabase';
    const putDraft=(revision,prompt,origin='http://localhost')=>drafts.PUT(new NextRequest('http://localhost/api/draft',{method:'PUT',headers:{origin,'content-type':'application/json'},body:JSON.stringify({revision,draft:{prompt,useTeamRules:false},owner:B})}));
    assert.equal((await (await drafts.GET()).json()).revision,0);
    assert.equal((await putDraft(0,'Saved contract A')).status,200);
    assert.equal((await putDraft(0,'Stale edit')).status,409,'stale tab cannot overwrite');
    assert.equal((await (await drafts.GET()).json()).draft.prompt,'Saved contract A');
    assert.equal((await putDraft(1,'x'.repeat(12001))).status,400);
    assert.equal((await putDraft(1,'cross origin','https://evil.example')).status,403);
    owner=B;assert.equal((await (await drafts.GET()).json()).draft.prompt,'','owner comes from Auth, not request body');
    owner=null;assert.equal((await drafts.GET()).status,401);assert.equal((await putDraft(0,'anonymous')).status,401);
    owner=A;assert.equal((await putDraft(1,'')).status,200);assert.equal((await (await drafts.GET()).json()).draft.prompt,'');
    const putSettings=(name,origin='http://localhost')=>settings.PUT(new NextRequest('http://localhost/api/workspace',{method:'PUT',headers:{origin,'content-type':'application/json'},body:JSON.stringify({name,owner:B})}));
    assert.equal((await putSettings('A Studio')).status,200);
    assert.equal((await (await settings.GET()).json()).name,'A Studio');
    assert.equal((await putSettings('  ')).status,400);
    assert.equal((await putSettings('x'.repeat(81))).status,400);
    assert.equal((await putSettings('Bad','https://evil.example')).status,403);
    owner=B;assert.equal((await (await settings.GET()).json()).name,'Creator workspace');
    owner=null;assert.equal((await settings.GET()).status,401);assert.equal((await putSettings('Anonymous')).status,401);
    owner=A;
    const empty=await routes.dealsGet();assert.equal(empty.status,200);assert.equal((await empty.json()).activeDeal,null);
    const token=seal({extraction,prompt:source,splits:[],session:A,expires:Date.now()+60000,id:'deal-cloud-a'});
    assert.equal((await routes.dealsPost(request({action:'confirm_analysis',token}))).status,200);
    await db.exec("update public.creatorpay_deals set body=jsonb_set(body,'{status}','\"advance_paid\"') where id='deal-cloud-a'");
    assert.equal((await routes.dealsPost(request({action:'confirm_analysis',token}))).status,200);
    assert.equal((await db.query("select body->>'status' as status from public.creatorpay_deals where id='deal-cloud-a'")).rows[0].status,'advance_paid','duplicate confirmation must not reset payment state');
    owner=B;
    assert.equal((await (await routes.dealsGet()).json()).allDeals.length,0);
    assert.equal((await routes.dealsPost(request({action:'confirm_analysis',token}))).status,403);
    assert.equal((await routes.dealsPost(request({action:'switch_deal',dealId:'deal-cloud-a'}))).status,404);
    for(const [handler,input]of [[routes.invoice,{dealId:'deal-cloud-a'}],[routes.payout,{dealId:'deal-cloud-a',action:'execute',confirmPayout:true}],[routes.verify,{dealId:'deal-cloud-a',action:'approve'}]])assert.equal((await handler(request(input))).status,404);
    assert.equal(providerCalls,0);
    owner=null;
    assert.equal((await routes.dealsGet()).status,401);
    assert.equal((await routes.analyze(request({prompt:source}))).status,401);
    assert.equal((await routes.webhook(new Request('http://localhost/api/paypal/webhook',{method:'POST',body:'{}'}))).status,401);
    owner=A;process.env.GROQ_API_KEY='test-key';
    await db.exec(`insert into public.creatorpay_usage(bucket,day,owner_id,count,last_at) values('user:${A}',(now() at time zone 'UTC')::date,'${A}',10,now()-interval '1 minute')`);
    const usage=(await (await settings.GET()).json()).usage;assert.equal(usage.used,10);assert.equal(usage.remaining,0);assert.ok(new Date(usage.resetsAt)>new Date());
    const limited=await routes.analyze(request({prompt:source}));assert.equal(limited.status,429);assert.equal(providerCalls,0);
    assert.equal((await db.query('select count from public.creatorpay_usage where owner_id=$1',[A])).rows[0].count,10);
    assert.equal((await routes.dealsDelete(new NextRequest('http://localhost/api/deals',{method:'DELETE',headers:{origin:'http://evil.example'}}))).status,403);
    // Run invoice -> signed webhook -> human approval -> final payment -> payout
    // against real PostgreSQL with deterministic provider responses.
    process.env.PAYPAL_ENVIRONMENT='sandbox';process.env.PAYPAL_BUSINESS_EMAIL='merchant@business.example.com';
    process.env.PAYPAL_CLIENT_ID='test-client';process.env.PAYPAL_CLIENT_SECRET='test-secret';process.env.PAYPAL_WEBHOOK_ID='test-webhook';
    const {invoiceNumberFor}=require('../src/lib/paypal.ts');
    const invoices={};let currentInvoice,invoiceCreates=0,payoutCreates=0,payoutPayload;
    global.fetch=async(url,options={})=>{
      const pathname=new URL(url).pathname;let response;
      if(pathname==='/v1/oauth2/token')response={access_token:'test-access',expires_in:3600};
      else if(pathname==='/v2/invoicing/search-invoices')response={items:[]};
      else if(pathname==='/v2/invoicing/invoices'){
        const input=JSON.parse(options.body);invoiceCreates++;currentInvoice='INV2-CLOUD-TEST-'+invoiceCreates;
        invoices[currentInvoice]={id:currentInvoice,status:'DRAFT',detail:{invoice_number:input.detail.invoice_number,metadata:{recipient_view_url:'https://sandbox.paypal.com/invoice/p/#'+currentInvoice}},amount:input.items[0].unit_amount,invoicer:input.invoicer,primary_recipients:input.primary_recipients};response={id:currentInvoice};
      }else if(pathname.endsWith('/send')){const id=pathname.split('/')[4];invoices[id].status='SENT';response={};}
      else if(pathname.startsWith('/v2/invoicing/invoices/'))response=invoices[pathname.split('/').pop()];
      else if(pathname==='/v1/notifications/verify-webhook-signature')response={verification_status:'SUCCESS'};
      else if(pathname==='/v1/payments/payouts'){
        payoutCreates++;payoutPayload=JSON.parse(options.body);response={batch_header:{payout_batch_id:'CLOUDBATCH'}};
      }else if(pathname==='/v1/payments/payouts/CLOUDBATCH')response={batch_header:{payout_batch_id:'CLOUDBATCH',batch_status:'SUCCESS',sender_batch_header:payoutPayload.sender_batch_header},items:payoutPayload.items.map(item=>({payout_item:item,payout_item_id:'CLOUDITEM',transaction_status:'SUCCESS',transaction_id:'CLOUDTRANSACTION'}))};
      else throw Error('Unexpected provider URL '+pathname);
      return new Response(JSON.stringify(response),{status:200});
    };
    let result=await routes.invoice(request({dealId:'deal-cloud-a',milestoneIndex:0}));assert.equal(result.status,200,JSON.stringify(await result.clone().json()));
    result=await routes.invoice(request({dealId:'deal-cloud-a',milestoneIndex:0}));assert.equal(result.status,200);assert.equal(invoiceCreates,1);
    const paidEvent=async(index)=>{
      const id='INV2-CLOUD-TEST-'+index;const item=invoices[id];item.status='PAID';item.payments={paid_amount:item.amount,transactions:[{type:'PAYPAL',payment_id:'CLOUDPAYMENT'+index,amount:item.amount}]};
      const req=()=>new Request('http://localhost/api/paypal/webhook',{method:'POST',headers:{'paypal-transmission-sig':'test','paypal-transmission-id':'test','paypal-transmission-time':new Date().toISOString(),'paypal-auth-algo':'SHA256withRSA','paypal-cert-url':'https://api.sandbox.paypal.com/v1/notifications/certs/test'},body:JSON.stringify({id:'CLOUDEVENT'+index,event_type:'INVOICING.INVOICE.PAID',resource:{id}})});
      const first=await routes.webhook(req());assert.equal(first.status,200,JSON.stringify(await first.clone().json()));
      assert.equal((await (await routes.webhook(req())).json()).duplicate,true);
    };
    await paidEvent(1);
    const beforeApproval=await routes.invoice(request({dealId:'deal-cloud-a',milestoneIndex:1}));assert.equal(beforeApproval.status,409);
    const row=(await db.query("select body from public.creatorpay_deals where id='deal-cloud-a'")).rows[0].body;
    row.deliverableReviews=[{id:'human-review',verdict:'human_review',checks:[],createdAt:new Date().toISOString()}];
    row.teamSplits=[{id:'aman',name:'Aman',role:'editor',email:'aman@team.example',type:'percentage',value:15,calculatedAmount:300,status:'pending'}];
    await db.query("update public.creatorpay_deals set body=$1 where id='deal-cloud-a'",[JSON.stringify(row)]);
    assert.equal((await routes.verify(request({dealId:'deal-cloud-a',action:'approve',reviewId:'human-review',confirmEvidence:true}))).status,200);
    result=await routes.invoice(request({dealId:'deal-cloud-a',milestoneIndex:1}));assert.equal(result.status,200,JSON.stringify(await result.clone().json()));
    await paidEvent(2);
    assert.equal((await routes.payout(request({dealId:'deal-cloud-a',action:'prepare',mappings:[{splitId:'aman',receiverEmail:'sb-test@personal.example.com'}]}))).status,200);
    result=await routes.payout(request({dealId:'deal-cloud-a',action:'execute',confirmPayout:true}));assert.equal(result.status,200,JSON.stringify(await result.clone().json()));
    assert.equal((await result.json()).deal.status,'payouts_completed');
    assert.equal((await routes.payout(request({dealId:'deal-cloud-a',action:'execute',confirmPayout:true}))).status,200);assert.equal(payoutCreates,1);
    assert.equal((await db.query('select count(*)::integer as n from public.creatorpay_audit')).rows[0].n,1);
    assert.equal((await db.query('select count(*)::integer as n from public.creatorpay_webhook_events')).rows[0].n,2);
    const diagnostics=await routes.status();
    assert.equal(diagnostics.status,200);
    const configuration=await diagnostics.json();
    assert.equal(typeof configuration.aiConfigured,'boolean');
    assert.ok(configuration.lastPaymentVerifiedAt);
    assert.equal(configuration.storage,'Supabase PostgreSQL (per-user)');
    assert.deepEqual(Object.keys(configuration).sort(),['aiConfigured','credentialsConfigured','environment','lastPaymentVerifiedAt','payoutsEnabled','storage','webhookConfigured'].sort());
    owner=B;
    assert.equal((await (await routes.status()).json()).lastPaymentVerifiedAt,null);
    owner=null;
    assert.equal((await routes.status()).status,401);
  }finally{global.fetch=originalFetch;await db.close();}
});
