import { completeSoloDeal } from '@/lib/deal-completion';
import { NextRequest, NextResponse } from 'next/server';
import { getDeal, mutateStore } from '@/lib/store';
import { getSession, reserveAnalysis } from '@/lib/analysis-session';
import { AnalysisError } from '@/lib/groq';
import { reviewDeliverableWithAI } from '@/lib/deliverable-ai';
import { contractFingerprint, validateDeliverableReview } from '@/lib/deliverable-review';
import { isSameOrigin } from '@/lib/request-origin';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  if (process.env.CREATORPAY_BACKEND === "supabase") return (await import("@/lib/supabase/routes")).verify(req);
  try {
    if (!isSameOrigin(req)) throw new AnalysisError('Cross-origin requests are not allowed.', 403);
    if (Number(req.headers.get('content-length')) > 100000) throw new AnalysisError('Submission is too large.', 413);
    const body = await req.json();
    const session = getSession(req.cookies.get('creatorpay-analysis')?.value);
    const deal = typeof body.dealId === 'string' ? getDeal(body.dealId) : undefined;
    if (!deal || deal.demo || !deal.contractExtraction) throw new AnalysisError('Select a confirmed contract.', 409);
    if (deal.ownerSession !== session.id) throw new AnalysisError('Use the browser session that confirmed this contract. This deal belongs to another or expired session.', 403);
    if (!deal.milestones[0]?.paymentVerifiedAt || deal.milestones[0].status !== 'paid') throw new AnalysisError('A verified advance payment is required first.', 409);
    const fingerprint = contractFingerprint(deal);
    if (body.action === 'approve') {
      const updated = mutateStore(store => {
        const current = store.deals.find(d => d.id === deal.id)!;
        const latest = current.deliverableReviews?.[0];
        if (!latest || latest.id !== body.reviewId || contractFingerprint(current) !== fingerprint || latest.verdict === 'changes_required') throw new AnalysisError('Only the latest review without missing requirements can be approved.', 409);
        if (body.confirmEvidence !== true) throw new AnalysisError('Confirm that you personally checked the actual video and every requirement.', 400);
        if (latest.approvedAt) return current;
        latest.approvedAt = new Date().toISOString(); latest.approvedBy = session.id;
        current.deliverable = { ...current.deliverable!, verified: true, verifiedAt: latest.approvedAt, videoUrl: latest.videoUrl, notes: 'Human approved after AI text review; video checked by reviewer.' };
        current.status = 'deliverable_verified'; current.updatedAt = latest.approvedAt; completeSoloDeal(current);
        current.logs.unshift({ id: `approve-${latest.id}`, timestamp: new Date().toLocaleTimeString(), type: 'verification', title: 'Deliverable approved by reviewer', description: 'Reviewer confirmed the actual video and all contract requirements. Final invoice is unlocked.' });
        return current;
      });
      return NextResponse.json({ success: true, deal: updated });
    }
    if (body.action !== 'review') throw new AnalysisError('Choose review or approve.', 400);
    if (deal.milestones.slice(1).some(m => m.invoiceId) || deal.deliverableReviews?.[0]?.approvedAt) throw new AnalysisError('Approved deliverables are locked for settlement.', 409);
    const { transcript, description = '', videoUrl = '' } = body;
    if (typeof transcript !== 'string' || transcript.trim().length < 20 || transcript.length > 20000 || typeof description !== 'string' || description.length > 5000 || typeof videoUrl !== 'string' || videoUrl.length > 2000) throw new AnalysisError('Provide a transcript of 20–20,000 characters and a description of up to 5,000 characters.', 400);
    if (videoUrl) { try { const url = new URL(videoUrl); if (url.protocol !== 'https:' || url.username || url.password) throw new Error(); } catch { throw new AnalysisError('Video reference must be a valid HTTPS URL.', 400); } }
    const previousReview = deal.deliverableReviews?.[0]?.id;
    reserveAnalysis(session.id);
    const raw = await reviewDeliverableWithAI({ brandName: deal.brandName, requirements: deal.contractExtraction.deliverables, transcript, description });
    const review = validateDeliverableReview(raw, deal, { transcript, description, videoUrl });
    const updated = mutateStore(store => {
      const current = store.deals.find(d => d.id === deal.id)!;
      if (contractFingerprint(current) !== fingerprint || current.deliverableReviews?.[0]?.id !== previousReview || current.deliverableReviews?.[0]?.approvedAt || current.milestones.slice(1).some(m => m.invoiceId)) throw new AnalysisError('This deal changed while AI was reviewing it. Refresh and retry.', 409);
      current.deliverableReviews = [review, ...(current.deliverableReviews || [])].slice(0, 10);
      current.deliverable = { ...current.deliverable!, verified: false, videoUrl, notes: review.verdict };
      current.status = 'deliverable_submitted'; current.updatedAt = review.createdAt;
      current.logs.unshift({ id: `review-${review.id}`, timestamp: new Date().toLocaleTimeString(), type: 'verification', title: 'Groq deliverable evidence reviewed', description: `${review.verdict}; ${review.checks.length} requirements checked. Actual video has not been inspected by AI.` });
      return current;
    });
    return NextResponse.json({ success: true, deal: updated });
  } catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Review failed.' }, { status: error instanceof AnalysisError ? error.status : error instanceof SyntaxError ? 400 : 500 }); }
}
