import { NextResponse } from 'next/server';
import { getActiveDeal, setActiveDeal, resetDemo, getCustomSplits, setCustomSplits } from '@/lib/store';
import { parseDealPromptWithHeuristics } from '@/lib/agent';

export async function GET() {
  const deal = getActiveDeal();
  const splits = getCustomSplits();
  return NextResponse.json({
    deal,
    splits,
    sandboxAccount: process.env.PAYPAL_BUSINESS_EMAIL || 'sb-9l0ms53173777@business.example.com',
    environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox',
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const splits = getCustomSplits();
    
    if (body.customSplits) {
      setCustomSplits(body.customSplits);
    }

    const newDeal = parseDealPromptWithHeuristics({
      prompt: body.prompt || 'Brand deal with CloudHost',
      creatorSplits: body.customSplits || splits,
    });

    setActiveDeal(newDeal);
    return NextResponse.json({ success: true, deal: newDeal });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE() {
  const freshDeal = resetDemo();
  return NextResponse.json({ success: true, deal: freshDeal });
}
