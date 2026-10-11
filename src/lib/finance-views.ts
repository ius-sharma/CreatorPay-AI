import type { AuditLedgerEntry, PayPalInvoiceSummary } from './types';
export function invoiceTotals(items: PayPalInvoiceSummary[], currency: string) {
  const sum = (status: string) => items.filter(i => i.currency === currency && i.status === status).reduce((s,i) => s+i.amount,0);
  return { paid: sum('PAID'), outstanding: sum('SENT'), draft: sum('DRAFT') };
}
export function payoutTotal(items: AuditLedgerEntry[], currency: string) {
  return items.filter(e => e.currency === currency && e.type === 'contractor_payout' && e.status === 'COMPLETED').reduce((s,e) => s+e.amount,0);
}
export function ledgerCsv(items: AuditLedgerEntry[]) {
  const escape = (value: unknown) => { let text=String(value ?? ''); if (/^[\s]*[=+@-]/.test(text)||/^[\t\r\n]/.test(text)) text="'"+text; return '"'+text.replaceAll('"','""')+'"'; };
  const rows: unknown[][]=[['ID','Timestamp','Batch ID','Deal','Recipient','Role','Email','Type','Amount','Currency','Status']];
  items.forEach(e=>rows.push([e.id,e.timestamp,e.batchId,e.dealTitle,e.recipientName,e.recipientRole,e.recipientEmail,e.type,e.amount,e.currency,e.status]));
  return '\uFEFF'+rows.map(r=>r.map(escape).join(',')).join('\r\n');
}
