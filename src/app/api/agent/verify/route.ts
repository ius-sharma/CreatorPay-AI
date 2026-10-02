import { NextResponse } from 'next/server';
import { getActiveDeal, updateActiveDeal, appendDealLog } from '@/lib/store';
import { verifyDeliverable } from '@/lib/agent';

export async function POST(req: Request) {
  try {
    const { videoUrl, proofText, proofImageUrl } = await req.json();
    const deal = getActiveDeal();

    if (!deal || !deal.deliverable) {
      return NextResponse.json({ success: false, error: 'No active deal or deliverable found' }, { status: 404 });
    }

    const verificationResult = verifyDeliverable(deal.deliverable, {
      videoUrl,
      proofText,
      proofImageUrl,
    });

    const now = new Date().toISOString();

    const updatedDeal = updateActiveDeal((prev) => {
      if (!prev.deliverable) return prev;
      return {
        ...prev,
        status: 'deliverable_verified',
        deliverable: {
          ...prev.deliverable,
          videoUrl: videoUrl || prev.deliverable.videoUrl,
          proofImageUrl: proofImageUrl || prev.deliverable.proofImageUrl,
          verified: verificationResult.verified,
          verifiedAt: now,
          notes: verificationResult.explanation,
        },
      };
    });

    appendDealLog({
      type: 'verification',
      title: 'AI Multimodal Deliverable Verified',
      description: `Analyzed sponsor video proof: Confirmed sponsor tag (${deal.deliverable.requiredSponsorTag}) and trackable link (${deal.deliverable.requiredLink}). Compliance score: ${verificationResult.score}%. Dispatched to brand for final sign-off.`,
      toolCall: {
        name: 'ai.verify_sponsor_deliverable',
        params: {
          videoUrl,
          proofText,
          requiredTag: deal.deliverable.requiredSponsorTag,
        },
        result: verificationResult,
      },
    });

    return NextResponse.json({
      success: true,
      verification: verificationResult,
      deal: updatedDeal,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
