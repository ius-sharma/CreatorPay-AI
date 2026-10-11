import { NextResponse } from 'next/server';
import { verifyPayPalWebhook, getSandboxInvoice, PayPalError } from '@/lib/paypal';
import { applyVerifiedPayment, findTrackedInvoice } from '@/lib/payment-tracking';

export const runtime = 'nodejs';
export async function POST(req: Request) {
  try {
    if (!req.headers.get('paypal-transmission-sig')) throw new PayPalError('Unsigned payment events are rejected.', 401);
    const raw = await req.text();
    if (raw.length > 100000) throw new PayPalError('Webhook payload is too large.', 413);
    const event = JSON.parse(raw);
    if (typeof event.id !== 'string' || event.id.length > 100 || typeof event.event_type !== 'string') throw new PayPalError('Invalid webhook event.', 400);
    if (!await verifyPayPalWebhook(req.headers, event)) throw new PayPalError('PayPal webhook signature verification failed.', 401);
    if (event.event_type !== 'INVOICING.INVOICE.PAID') return NextResponse.json({ success: true, ignored: true });
    const invoiceId = event.resource?.invoice?.id || event.resource?.id;
    if (typeof invoiceId !== 'string' || !/^INV2-[A-Z0-9-]+$/.test(invoiceId)) throw new PayPalError('Payment event does not identify a valid invoice.', 400);
    if (!findTrackedInvoice(invoiceId)) return NextResponse.json({ success: true, ignored: true });
    const invoice = await getSandboxInvoice(invoiceId);
    const result = applyVerifiedPayment(invoice, event.id);
    return NextResponse.json({ success: true, duplicate: result.duplicate });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Payment event could not be processed.' }, { status: error instanceof PayPalError ? error.status : error instanceof SyntaxError ? 400 : 500 });
  }
}
