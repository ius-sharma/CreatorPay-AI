import { NextResponse } from 'next/server';
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
import { parseDealPromptWithHeuristics } from '@/lib/agent';

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

export async function POST(req: Request) {
  try {
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

    // 3. Create / Parse new deal
    const roster = getTeamRoster();
    const newDeal = parseDealPromptWithHeuristics({
      prompt: body.prompt || 'Brand deal with CloudHost',
      creatorSplits: body.customSplits || roster.slice(0, 2),
    });

    setActiveDeal(newDeal);
    return NextResponse.json({ 
      success: true, 
      activeDeal: newDeal, 
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
