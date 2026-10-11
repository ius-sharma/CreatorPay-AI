import 'server-only';
import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from './admin';
import { requireOwner, ensureWorkspace, portfolio, ownedDeal, updateDeal, reserveQuota, acquireJob, checkpointJob, releaseJob, payoutRepository, databaseError, type CommitExtras } from './workspace';
import { AnalysisError, extractContract } from '../groq';
import { seal, unseal } from '../analysis-session';
import { reviewContract, dealFromReview, type ContractExtraction } from '../contract';
import { isSameOrigin } from '../request-origin';
import { PayPalError, createAndSendMilestoneInvoice, invoicePaymentUrl, invoiceNumberFor, getSandboxInvoice, verifyPayPalWebhook, type SandboxInvoice } from '../paypal';
import { validateInvoicePayment } from '../payment-tracking';
import { assertPayoutEligible, makePayoutPlan, sendPayout, refreshPayout } from '../payout-tracking';
import { reviewDeliverableWithAI } from '../deliverable-ai';
import { contractFingerprint, validateDeliverableReview } from '../deliverable-review';
import type { Deal, TeamSplit } from '../types';

function json(value: unknown, status = 200) { return NextResponse.json(value, { status, headers: { 'Cache-Control': 'private, no-store' } }); }
async function guarded(fn: () => Promise<unknown>) {
  try { return json(await fn()); }
  catch (e) { return json({ success: false, error: e instanceof AnalysisError || e instanceof PayPalError ? e.message : e instanceof SyntaxError ? 'Invalid request JSON.' : 'Request could not be completed. Refresh and retry.' }, e instanceof AnalysisError || e instanceof PayPalError ? e.status : e instanceof SyntaxError ? 400 : 503); }
}
function origin(req: NextRequest) { if (!isSameOrigin(req)) throw new AnalysisError('Cross-origin requests are not allowed.', 403); }
async function body(req: Request, max = 100000) {
  if (Number(req.headers.get('content-length')) > max) throw new AnalysisError('Request is too large.', 413);
  const text = await req.text();
  if (text.length > max) throw new AnalysisError('Request is too large.', 413);
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new AnalysisError('Invalid request body.', 400);
  return parsed;
}
function validSplits(splits: unknown): asserts splits is TeamSplit[] {
  if (!Array.isArray(splits) || splits.length > 20 || splits.some(s => !s || typeof s.name !== 'string' || s.name.length > 200 || typeof s.email !== 'string' || s.email.length > 254 || typeof s.role !== 'string' || s.role.length > 200 || !['fixed','percentage'].includes(s.type) || !Number.isFinite(s.value) || s.value < 0 || s.value > 1000000 || (s.type === 'percentage' && s.value > 100))) throw new AnalysisError('Invalid saved team rules.', 400);
}
export async function dealsGet() { return guarded(async () => ({ ...(await portfolio(await requireOwner())), authenticated: true })); }
export async function dealsPost(req: NextRequest) {
  return guarded(async () => {
    origin(req); const owner = await requireOwner(); const input = await body(req);
    await ensureWorkspace(owner);
    if (input.action === 'switch_deal') {
      if (typeof input.dealId !== 'string') throw new AnalysisError('Select a deal.', 400);
      await ownedDeal(owner,input.dealId);
      const { error } = await createAdminClient().from('creatorpay_workspaces').update({ active_deal_id: input.dealId }).eq('owner_id',owner);
      if (error) databaseError(error);
    } else if (input.action === 'update_roster') {
      validSplits(input.teamRoster);
      const { error } = await createAdminClient().from('creatorpay_workspaces').update({ team_roster: input.teamRoster }).eq('owner_id',owner);
      if (error) databaseError(error);
    } else if (input.action === 'confirm_analysis') {
      const draft = unseal<{ extraction: ContractExtraction; prompt: string; splits: TeamSplit[]; session: string; expires: number; id: string }>(input.token);
      if (draft.expires < Date.now() || draft.session !== owner) throw new AnalysisError('Review expired or belongs to another account. Analyse again.', 403);
      const deal = { ...dealFromReview(reviewContract(draft.extraction,draft.prompt,draft.splits),draft.prompt,draft.id), ownerSession: owner };
      const { error } = await createAdminClient().from('creatorpay_deals').upsert({ id: deal.id, owner_id: owner, body: deal }, { onConflict:'id',ignoreDuplicates:true });
      if (error) databaseError(error);
      await ownedDeal(owner,deal.id); // A duplicated signed confirmation never replaces saved payment state.
      const saved = await createAdminClient().from('creatorpay_workspaces').update({ active_deal_id: deal.id }).eq('owner_id',owner);
      if (saved.error) databaseError(saved.error);
    } else throw new AnalysisError('Analyse and confirm a contract first.',400);
    return { success:true,...await portfolio(owner),authenticated:true };
  });
}
export async function dealsDelete(req: NextRequest) {
  return guarded(async () => { origin(req); await requireOwner(); throw new AnalysisError('Paid records cannot be reset. Create a new contract to start another deal.',409); });
}
export async function analyze(req: NextRequest) {
  return guarded(async () => {
    origin(req); const owner = await requireOwner(); const input = await body(req,30000);
    if (typeof input.prompt !== 'string' || input.prompt.trim().length < 20 || input.prompt.length > 12000) throw new AnalysisError('Paste a contract between 20 and 12,000 characters.',400);
    const splits = input.customSplits ?? []; validSplits(splits);
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.startsWith('your_')) throw new AnalysisError('AI service is not configured.',503);
    await reserveQuota(owner);
    const extraction = await extractContract(input.prompt);
    const review = reviewContract(extraction,input.prompt,splits);
    return { success:true,review,token:seal({extraction,prompt:input.prompt,splits,session:owner,expires:Date.now()+1800000,id:'deal-'+randomUUID()}) };
  });
}
export async function verify(req: NextRequest) {
  return guarded(async () => {
    origin(req); const owner = await requireOwner(); const input = await body(req);
    if (typeof input.dealId !== 'string') throw new AnalysisError('Select a confirmed contract.',400);
    const deal = (await ownedDeal(owner,input.dealId)).body;
    if (deal.demo || !deal.contractExtraction) throw new AnalysisError('Select a confirmed contract.',409);
    if (!deal.milestones[0]?.paymentVerifiedAt || deal.milestones[0].status !== 'paid') throw new AnalysisError('A verified advance payment is required first.',409);
    const fingerprint = contractFingerprint(deal);
    if (input.action === 'approve') {
      const updated = await updateDeal(owner,deal.id,current => {
        const latest = current.deliverableReviews?.[0];
        if (!latest || latest.id !== input.reviewId || contractFingerprint(current) !== fingerprint || latest.verdict === 'changes_required') throw new AnalysisError('Only the latest review without missing requirements can be approved.',409);
        if (input.confirmEvidence !== true) throw new AnalysisError('Confirm that you personally checked the actual video and every requirement.',400);
        if (latest.approvedAt) return;
        latest.approvedAt = new Date().toISOString(); latest.approvedBy = owner;
        current.deliverable = {...current.deliverable!,verified:true,verifiedAt:latest.approvedAt,videoUrl:latest.videoUrl,notes:'Human approved after AI text review; video checked by reviewer.'};
        current.status='deliverable_verified';current.updatedAt=latest.approvedAt;
        current.logs.unshift({id:`approve-${latest.id}`,timestamp:new Date().toLocaleTimeString(),type:'verification',title:'Deliverable approved by reviewer',description:'Reviewer confirmed the actual video and all requirements. Final invoice is unlocked.'});
      });
      return { success:true,deal:updated.body };
    }
    if (input.action !== 'review') throw new AnalysisError('Choose review or approve.',400);
    if (deal.milestones.slice(1).some(m=>m.invoiceId) || deal.deliverableReviews?.[0]?.approvedAt) throw new AnalysisError('Approved deliverables are locked for settlement.',409);
    const {transcript,description='',videoUrl=''}=input;
    if(typeof transcript!=='string'||transcript.trim().length<20||transcript.length>20000||typeof description!=='string'||description.length>5000||typeof videoUrl!=='string'||videoUrl.length>2000)throw new AnalysisError('Provide a transcript of 20–20,000 characters and a description of up to 5,000 characters.',400);
    if(videoUrl){try{const url=new URL(videoUrl);if(url.protocol!=='https:'||url.username||url.password)throw new Error();}catch{throw new AnalysisError('Video reference must be a valid HTTPS URL.',400);}}
    const previous=deal.deliverableReviews?.[0]?.id;
    await reserveQuota(owner);
    const raw=await reviewDeliverableWithAI({brandName:deal.brandName,requirements:deal.contractExtraction.deliverables,transcript,description});
    const review=validateDeliverableReview(raw,deal,{transcript,description,videoUrl});
    const updated=await updateDeal(owner,deal.id,current=>{
      if(contractFingerprint(current)!==fingerprint||current.deliverableReviews?.[0]?.id!==previous||current.deliverableReviews?.[0]?.approvedAt||current.milestones.slice(1).some(m=>m.invoiceId))throw new AnalysisError('Deal changed while AI was reviewing. Refresh and retry.',409);
      current.deliverableReviews=[review,...(current.deliverableReviews||[])].slice(0,10);
      current.deliverable={...current.deliverable!,verified:false,videoUrl,notes:review.verdict};
      current.status='deliverable_submitted';current.updatedAt=review.createdAt;
      current.logs.unshift({id:`review-${review.id}`,timestamp:new Date().toLocaleTimeString(),type:'verification',title:'Groq deliverable evidence reviewed',description:`${review.verdict}; ${review.checks.length} requirements checked. Actual video has not been inspected by AI.`});
    });
    return {success:true,deal:updated.body};
  });
}
export async function invoice(req: NextRequest) {
  return guarded(async()=>{
    origin(req); const owner=await requireOwner(); const input=await body(req);const index=input.milestoneIndex??0;
    if(typeof input.dealId!=='string'||![0,1].includes(index))throw new AnalysisError('Select an advance or final milestone.',400);
    const deal=(await ownedDeal(owner,input.dealId)).body;
    if(deal.demo||!deal.contractExtraction)throw new AnalysisError('Confirm a contract first.',409);
    if(!process.env.PAYPAL_WEBHOOK_ID)throw new PayPalError('Configure the PayPal webhook first.',503);
    if(index===1&&(deal.milestones.length!==2||deal.milestones[0].status!=='paid'||!deal.milestones[0].paymentVerifiedAt||!deal.deliverableReviews?.[0]?.approvedAt||!deal.deliverable?.verified))throw new AnalysisError('Final invoicing requires a verified advance and human-approved deliverable.',409);
    const milestone=deal.milestones[index];if(!milestone||milestone.amount<=0)throw new AnalysisError('Invalid milestone.',400);
    const job=await acquireJob(owner,deal.id,`${deal.id}:${milestone.id}`);
    try{
      const record=async(item:SandboxInvoice)=>{
        const extras:CommitExtras={job};
        await updateDeal(owner,deal.id,current=>{
          const m=current.milestones[index];
          if(m.invoiceId&&m.invoiceId!==item.id)throw new AnalysisError('Invoice checkpoint mismatch.',409);
          current.milestones[index]={...m,invoiceId:item.id,invoiceNumber:invoiceNumberFor(job.key),invoiceStatus:m.status==='paid'?'PAID':item.status,invoiceUrl:invoicePaymentUrl(item)||m.invoiceUrl,status:m.status==='paid'?'paid':item.status==='DRAFT'?'pending':'invoiced'};
          if(m.status!=='paid')current.status=item.status==='DRAFT'?(index===0?'analyzed':'deliverable_verified'):(index===0?'advance_invoiced':'final_invoiced');
          current.updatedAt=new Date().toISOString();
          extras.invoice={id:item.id,milestoneId:m.id,merchantEmail:process.env.PAYPAL_BUSINESS_EMAIL,invoiceNumber:invoiceNumberFor(job.key),dealTitle:current.dealTitle,brandName:current.brandName,brandEmail:current.brandEmail,milestoneTitle:m.name,amount:m.amount,currency:current.currency,status:m.status==='paid'?'PAID':item.status==='DRAFT'?'DRAFT':'SENT',issueDate:current.updatedAt.slice(0,10),dueDate:current.updatedAt.slice(0,10),paymentUrl:invoicePaymentUrl(item)||m.invoiceUrl||'',terms:'DUE_ON_RECEIPT'};
        },extras);
      };
      const result=await createAndSendMilestoneInvoice({brandName:deal.brandName,brandEmail:deal.brandEmail,milestoneTitle:milestone.name,amount:milestone.amount,currency:deal.currency,operationKey:job.key,existingInvoiceId:milestone.invoiceId||job.invoiceId||undefined,onCreated:async item=>{await checkpointJob(job,item.id);await record(item);}});
      await record({id:result.invoiceId,status:result.status,detail:{metadata:{recipient_view_url:result.paymentUrl}}});
      return {success:true,invoice:result,deal:(await ownedDeal(owner,deal.id)).body};
    }finally{await releaseJob(job);}
  });
}
export async function payout(req: NextRequest) {
  return guarded(async()=>{
    origin(req);const owner=await requireOwner();const input=await body(req);
    if(typeof input.dealId!=='string'||!['prepare','execute','refresh'].includes(input.action))throw new AnalysisError('Select a deal and payout action.',400);
    let deal=(await ownedDeal(owner,input.dealId)).body;
    if(deal.demo)throw new AnalysisError('Select a confirmed contract.',409);
    const job=await acquireJob(owner,deal.id,`payout:${deal.id}`);const repository=payoutRepository(owner,deal.id,job);
    try{
      deal=(await ownedDeal(owner,deal.id)).body;
      if(input.action==='refresh')return {success:true,deal:await refreshPayout(deal.id,repository)};
      assertPayoutEligible(deal);
      if(input.action==='prepare'){
        const updated=await updateDeal(owner,deal.id,current=>{assertPayoutEligible(current);if(current.payout)throw new AnalysisError('A payout plan is already locked. Use the original plan.',409);current.payout=makePayoutPlan(current,input.mappings);current.updatedAt=new Date().toISOString();},{job});
        return {success:true,deal:updated.body};
      }
      if(input.confirmPayout!==true)throw new AnalysisError('Confirm the locked sandbox receivers and amounts.',400);
      if(!deal.payout)throw new AnalysisError('Prepare a payout plan first.',409);
      if(deal.payout.batchId)return {success:true,deal:await refreshPayout(deal.id,repository)};
      for(const m of deal.milestones)validateInvoicePayment(await getSandboxInvoice(m.invoiceId!),deal,m);
      return {success:true,deal:await sendPayout(deal.id,repository)};
    }catch(e){
      await updateDeal(owner,deal.id,current=>{if(current.payout)current.payout.error=e instanceof PayPalError||e instanceof AnalysisError?e.message:'Payout failed. Refresh or recover the same plan.';},{job}).catch(()=>{});
      throw e;
    }finally{await releaseJob(job);}
  });
}
export async function webhook(req: Request) {
  return guarded(async()=>{
    if(!req.headers.get('paypal-transmission-sig'))throw new PayPalError('Unsigned payment events are rejected.',401);
    const event=await body(req);
    if(typeof event.id!=='string'||event.id.length>100||typeof event.event_type!=='string')throw new PayPalError('Invalid webhook event.',400);
    if(!await verifyPayPalWebhook(req.headers,event))throw new PayPalError('PayPal webhook signature verification failed.',401);
    if(event.event_type!=='INVOICING.INVOICE.PAID')return {success:true,ignored:true};
    const id=event.resource?.invoice?.id||event.resource?.id;
    if(typeof id!=='string'||!/^INV2-[A-Z0-9-]+$/.test(id))throw new PayPalError('Invalid invoice ID.',400);
    const {data:link,error}=await createAdminClient().from('creatorpay_invoice_links').select('owner_id,deal_id,merchant_email').eq('invoice_id',id).maybeSingle();
    if(error)databaseError(error);if(!link)return {success:true,ignored:true};
    if(link.merchant_email.toLowerCase()!==process.env.PAYPAL_BUSINESS_EMAIL?.toLowerCase())throw new PayPalError('Invoice belongs to a different sandbox merchant.',422);
    const actual=await getSandboxInvoice(id);
    const result=await updateDeal(link.owner_id,link.deal_id,current=>{
      const index=current.milestones.findIndex(m=>m.invoiceId===id);if(index<0)throw new PayPalError('Invoice mapping mismatch.',422);
      const ids=validateInvoicePayment(actual,current,current.milestones[index]);
      if(current.milestones[index].status==='paid')return;
      const now=new Date().toISOString();current.milestones[index]={...current.milestones[index],status:'paid',invoiceStatus:'PAID',paidAt:now,paymentVerifiedAt:now,paymentTransactionIds:ids};
      current.status=index===0?'advance_paid':current.milestones.every(m=>m.status==='paid')?'final_paid':current.status;
      current.updatedAt=now;
      current.logs.unshift({id:`payment-${event.id}`,timestamp:new Date().toLocaleTimeString(),type:'webhook',title:'PayPal sandbox payment verified',description:`${current.currency} ${current.milestones[index].amount.toFixed(2)} paid against invoice ${id}; PayPal transaction IDs: ${ids.join(', ')}.`});
    },{event:event.id,eventInvoice:id});
    return {success:true,duplicate:result.duplicate};
  });
}
export async function status() {
  return guarded(async()=>{
    const data=await portfolio(await requireOwner());
    const dates=data.allDeals.flatMap(d=>d.milestones.map(m=>m.paymentVerifiedAt).filter((v):v is string=>Boolean(v)));
    return {environment:process.env.PAYPAL_ENVIRONMENT||'not configured',credentialsConfigured:Boolean(process.env.PAYPAL_CLIENT_ID&&process.env.PAYPAL_CLIENT_SECRET&&process.env.PAYPAL_BUSINESS_EMAIL),webhookConfigured:Boolean(process.env.PAYPAL_WEBHOOK_ID),lastPaymentVerifiedAt:dates.sort().pop()||null,storage:'Supabase PostgreSQL (per-user)',payoutsEnabled:process.env.PAYPAL_ENVIRONMENT==='sandbox'};
  });
}
