import { NextRequest, NextResponse } from 'next/server';
import { 
  getActiveDeal, 
  getAllDeals, 
  setActiveDealId, 
  setActiveDeal, 
  resetDemo, 
  getTeamRoster, 
  updateTeamRoster,
  getInvoicesRegistry,
  getAuditLedger
} from '@/lib/store';
import { dealFromReview, reviewContract, ContractExtraction } from '@/lib/contract';
import { getSession, unseal } from '@/lib/analysis-session';
import { AnalysisError } from '@/lib/groq';
import type { TeamSplit } from '@/lib/types';
import { isSameOrigin } from '@/lib/request-origin';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const activeDeal = getActiveDeal();
  const allDeals = getAllDeals();
  const teamRoster = getTeamRoster();
  const invoices = getInvoicesRegistry();
  const auditLedger = getAuditLedger();

  return NextResponse.json({
    activeDeal,
    allDeals,
    teamRoster,
    invoices,
    auditLedger,
    sandboxAccount: process.env.PAYPAL_BUSINESS_EMAIL || 'sb-9l0ms53173777@business.example.com',
    environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox',
  });
}

export async function POST(req: NextRequest) {
  try {
    if (!isSameOrigin(req)) throw new AnalysisError('Cross-origin requests are not allowed.', 403);
    const body = await req.json();

    // 1. Switch active deal
    if (body.action === 'switch_deal' && body.dealId) {
      const switched = setActiveDealId(body.dealId);
      return NextResponse.json({ success: true, activeDeal: switched, allDeals: getAllDeals() });
    }

    // 2. Update team roster
    if (body.action === 'update_roster' && body.teamRoster) {
      const updated = updateTeamRoster(body.teamRoster);
      return NextResponse.json({ success: true, teamRoster: updated });
    }

    // Only server-signed, reviewed AI terms can create a new deal.
    if (body.action !== 'confirm_analysis') throw new AnalysisError('Analyse and review the contract before creating a deal.', 400);
    const draft = unseal<{ extraction: ContractExtraction; prompt: string; splits: TeamSplit[]; session: string; expires: number; id: string }>(body.token);
    const session = getSession(req.cookies.get('creatorpay-analysis')?.value);
    if (draft.expires < Date.now() || draft.session !== session.id) throw new AnalysisError('Review expired. Analyse the contract again.', 400);
    const reviewed = reviewContract(draft.extraction, draft.prompt, draft.splits);
    const newDeal = { ...dealFromReview(reviewed, draft.prompt, draft.id), ownerSession: session.id };

    const savedDeal = setActiveDeal(newDeal);
    return NextResponse.json({ 
      success: true, 
      activeDeal: savedDeal,
      allDeals: getAllDeals() 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE() {
  const freshDeal = resetDemo();
  return NextResponse.json({ 
    success: true, 
    activeDeal: freshDeal, 
    allDeals: getAllDeals(),
    teamRoster: getTeamRoster(),
    invoices: getInvoicesRegistry(),
    auditLedger: getAuditLedger()
  });
}
