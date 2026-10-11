import { NextResponse } from 'next/server';
import { getAllDeals } from '@/lib/store';
export const dynamic = 'force-dynamic';
export async function GET() {
  if (process.env.CREATORPAY_BACKEND === "supabase") return (await import("@/lib/supabase/routes")).status();
  const verifications = getAllDeals().filter(d => !d.demo).flatMap(d => d.milestones.map(m => m.paymentVerifiedAt).filter((date): date is string => Boolean(date)));
  return NextResponse.json({ aiConfigured: Boolean(process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.startsWith('your_')), environment: process.env.PAYPAL_ENVIRONMENT || 'not configured', credentialsConfigured: Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET && process.env.PAYPAL_BUSINESS_EMAIL), webhookConfigured: Boolean(process.env.PAYPAL_WEBHOOK_ID), lastPaymentVerifiedAt: verifications.sort().pop() || null, storage: 'SQLite (local persistent disk)', payoutsEnabled: process.env.PAYPAL_ENVIRONMENT === 'sandbox' }, { headers: { 'Cache-Control': 'no-store' } });
}
