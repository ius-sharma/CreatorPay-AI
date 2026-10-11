import { createHash } from 'crypto';

export class PayPalError extends Error {
  constructor(message: string, public status = 502, public duplicateBatchId?: string) { super(message); }
}
const PAYPAL_BASE_URL = 'https://api-m.sandbox.paypal.com';
function sandboxOnly(): void {
  if (process.env.PAYPAL_ENVIRONMENT !== 'sandbox') throw new PayPalError('Set PAYPAL_ENVIRONMENT=sandbox. Live payments are disabled.', 503);
}
let cachedToken: { token: string; expiresAt: number; credentials: string } | null = null;
export async function getPayPalAccessToken(): Promise<string> {
  sandboxOnly();
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new PayPalError('PayPal sandbox credentials are not configured.', 503);
  const credentials = createHash('sha256').update(clientId + ':' + clientSecret).digest('hex');
  if (cachedToken?.credentials === credentials && cachedToken.expiresAt > Date.now() + 60000) return cachedToken.token;
  let response: Response;
  try {
    response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, { method: 'POST', headers: { Authorization: `Basic ${Buffer.from(clientId + ':' + clientSecret).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials', signal: AbortSignal.timeout(20000) });
  } catch { throw new PayPalError('PayPal sandbox could not be reached. Please retry.'); }
  if (!response.ok) throw new PayPalError('PayPal sandbox authentication failed. Check the app credentials.', 503);
  const data = await response.json();
  if (!data.access_token || !Number.isFinite(data.expires_in)) throw new PayPalError('PayPal returned an invalid authentication response.');
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000, credentials };
  return data.access_token;
}
export async function paypalRequest(path: string, method = 'GET', body?: unknown, extraHeaders: Record<string, string> = {}): Promise<any> {
  const token = await getPayPalAccessToken();
  let response: Response;
  try {
    response = await fetch(`${PAYPAL_BASE_URL}${path}`, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...extraHeaders }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(20000) });
  } catch { throw new PayPalError('PayPal request timed out or could not connect. Retry to recover the same invoice.'); }
  const text = await response.text();
  let data: any = {};
  if (text) { try { data = JSON.parse(text); } catch { throw new PayPalError('PayPal returned an invalid response.'); } }
  if (!response.ok) {
    const issue = data.details?.[0]?.issue || data.name;
    const safeIssue = typeof issue === 'string' && /^[A-Z0-9_]+$/.test(issue) ? ` (${issue})` : '';
    let duplicateBatchId: string | undefined;
    if (issue === 'DUPLICATE_BATCH_ID') {
      for (const link of [...(data.links || []), ...(data.details || []).flatMap((d: any) => d.links || [])]) {
        try { const url = new URL(link.href); const match = url.pathname.match(/^\/v1\/payments\/payouts\/([A-Z0-9]+)$/); if (url.origin === PAYPAL_BASE_URL && match) duplicateBatchId = match[1]; } catch { /* Ignore untrusted links. */ }
      }
    }
    throw new PayPalError(`PayPal rejected the request${safeIssue}. No simulated success was recorded.`, response.status === 429 ? 429 : 502, duplicateBatchId);
  }
  return { ...data, _location: response.headers.get('location') };
}
export interface SandboxInvoice {
  id: string; status: string;
  detail?: { invoice_number?: string; currency_code?: string; metadata?: { recipient_view_url?: string } };
  invoicer?: { email_address?: string };
  primary_recipients?: Array<{ billing_info?: { email_address?: string } }>;
  amount?: { value: string; currency_code: string };
  payments?: { paid_amount?: { value: string; currency_code: string }; transactions?: Array<{ type?: string; payment_id?: string; amount?: { value: string; currency_code: string }; payment_date?: string }> };
}
export interface InvoiceCreationParams {
  brandName: string; brandEmail: string; milestoneTitle: string; amount: number; currency?: string; note?: string;
  operationKey: string; existingInvoiceId?: string; onCreated?: (invoice: SandboxInvoice) => void;
}
export interface InvoiceResult {
  invoiceId: string; invoiceNumber: string; status: string; amount: number; currency: string; paymentUrl: string;
}
export function invoiceNumberFor(key: string): string { return `CP-${createHash('sha256').update(key).digest('hex').slice(0, 20).toUpperCase()}`; }
export async function getSandboxInvoice(id: string): Promise<SandboxInvoice> {
  if (!/^INV2-[A-Z0-9-]+$/.test(id)) throw new PayPalError('Invalid PayPal invoice ID.', 400);
  return paypalRequest(`/v2/invoicing/invoices/${encodeURIComponent(id)}`);
}
export function invoicePaymentUrl(invoice: SandboxInvoice): string {
  const url = invoice.detail?.metadata?.recipient_view_url;
  if (!url) return '';
  try { const parsed = new URL(url); return parsed.protocol === 'https:' && ['www.sandbox.paypal.com', 'sandbox.paypal.com'].includes(parsed.hostname) ? url : ''; }
  catch { return ''; }
}
function matchesExpected(invoice: SandboxInvoice, params: InvoiceCreationParams): boolean {
  return invoice.detail?.invoice_number === invoiceNumberFor(params.operationKey)
    && invoice.amount?.currency_code === (params.currency || 'USD')
    && /^\d+(\.\d{1,2})?$/.test(invoice.amount?.value || '')
    && Math.round(Number(invoice.amount?.value) * 100) === Math.round(params.amount * 100)
    && invoice.primary_recipients?.[0]?.billing_info?.email_address?.toLowerCase() === params.brandEmail.toLowerCase()
    && invoice.invoicer?.email_address?.toLowerCase() === process.env.PAYPAL_BUSINESS_EMAIL?.toLowerCase();
}
export async function createAndSendMilestoneInvoice(params: InvoiceCreationParams): Promise<InvoiceResult> {
  sandboxOnly();
  if (!process.env.PAYPAL_BUSINESS_EMAIL) throw new PayPalError('Configure PAYPAL_BUSINESS_EMAIL for the sandbox merchant.', 503);
  if (!Number.isFinite(params.amount) || params.amount <= 0 || !['USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(params.currency || 'USD')) throw new PayPalError('Unsupported currency or invalid invoice amount.', 400);
  const invoiceNumber = invoiceNumberFor(params.operationKey);
  let id = params.existingInvoiceId;
  if (!id) {
    // Search by a stable unique invoice number to recover after an interrupted request.
    const search = await paypalRequest('/v2/invoicing/search-invoices?page_size=100', 'POST', { invoice_number: invoiceNumber });
    id = search.items?.find((item: SandboxInvoice) => item.detail?.invoice_number === invoiceNumber)?.id;
  }
  if (!id) {
    const created = await paypalRequest('/v2/invoicing/invoices', 'POST', {
      detail: { invoice_number: invoiceNumber, reference: params.operationKey.slice(0, 120), invoice_date: new Date().toISOString().slice(0, 10), currency_code: params.currency || 'USD', note: params.note || 'CreatorPay sandbox milestone', payment_term: { term_type: 'DUE_ON_RECEIPT' } },
      invoicer: { email_address: process.env.PAYPAL_BUSINESS_EMAIL },
      primary_recipients: [{ billing_info: { business_name: params.brandName.slice(0, 300), email_address: params.brandEmail } }],
      items: [{ name: params.milestoneTitle.slice(0, 200), quantity: '1', unit_amount: { currency_code: params.currency || 'USD', value: params.amount.toFixed(2) } }],
      configuration: { partial_payment: { allow_partial_payment: false }, allow_tip: false },
    }, { Prefer: 'return=representation', 'PayPal-Request-Id': createHash('sha256').update(params.operationKey).digest('hex').slice(0, 38) });
    const href = created._location || created.href || created.links?.find((l: any) => l.rel === 'self')?.href;
    id = created.id || (typeof href === 'string' ? href.split('/').pop() : undefined);
    if (!id || !/^INV2-[A-Z0-9-]+$/.test(id)) throw new PayPalError('PayPal created a draft but returned no valid invoice ID. Retry to recover it.');
    // Persist ID before any subsequent network call.
    params.onCreated?.({ id, status: 'DRAFT', detail: { invoice_number: invoiceNumber } });
  }
  let invoice = await getSandboxInvoice(id);
  if (!matchesExpected(invoice, params)) throw new PayPalError('PayPal invoice details do not match the confirmed milestone. Review merchant, currency, amount and recipient.');
  params.onCreated?.(invoice);
  if (invoice.status === 'DRAFT') {
    // Generate a payable sandbox link without sending notifications to outside recipients.
    await paypalRequest(`/v2/invoicing/invoices/${id}/send`, 'POST', { send_to_recipient: false, send_to_invoicer: false });
    invoice = await getSandboxInvoice(id);
  }
  if (!matchesExpected(invoice, params) || !['SENT', 'UNPAID', 'PAID', 'PARTIALLY_PAID', 'PAYMENT_PENDING'].includes(invoice.status)) throw new PayPalError('PayPal invoice is not in a payable state. No payment has been recorded.');
  return { invoiceId: invoice.id, invoiceNumber, status: invoice.status, amount: params.amount, currency: params.currency || 'USD', paymentUrl: invoicePaymentUrl(invoice) };
}
export async function verifyPayPalWebhook(headers: Headers, event: unknown): Promise<boolean> {
  const fields: Record<string, string> = { auth_algo: 'paypal-auth-algo', cert_url: 'paypal-cert-url', transmission_id: 'paypal-transmission-id', transmission_sig: 'paypal-transmission-sig', transmission_time: 'paypal-transmission-time' };
  const payload: Record<string, unknown> = { webhook_event: event, webhook_id: process.env.PAYPAL_WEBHOOK_ID };
  if (!payload.webhook_id) throw new PayPalError('PayPal webhook is not configured.', 503);
  for (const [field, header] of Object.entries(fields)) {
    const value = headers.get(header);
    if (!value || value.length > 1000) return false;
    payload[field] = value;
  }
  try {
    const cert = new URL(payload.cert_url as string);
    if (cert.protocol !== 'https:' || !['api.sandbox.paypal.com', 'api-m.sandbox.paypal.com'].includes(cert.hostname) || !cert.pathname.startsWith('/v1/notifications/certs/')) return false;
  } catch { return false; }
  const result = await paypalRequest('/v1/notifications/verify-webhook-signature', 'POST', payload);
  return result.verification_status === 'SUCCESS';
}

export interface PayoutRecipient {
  recipientEmail: string;
  amount: number;
  note: string;
  recipientId: string;
}

export interface PayoutResult {
  batchId: string;
  batchStatus: string;
  totalAmount: number;
  recipientsCount: number;
  payoutItems: Array<{
    recipientEmail: string;
    amount: number;
    payoutItemId: string;
    status: string;
  }>;
  rawResponse?: any;
}

export async function createBatchPayout(items: PayoutRecipient[], currency = 'USD'): Promise<PayoutResult> {
  throw new PayPalError('Payout execution is disabled until the payout stage is implemented.', 409);
}
