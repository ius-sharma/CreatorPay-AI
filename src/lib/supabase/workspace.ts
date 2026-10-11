import 'server-only';
import { createClient } from './server';
import { createAdminClient } from './admin';
import { AnalysisError } from '../groq';
import type { Deal, AuditLedgerEntry, PayPalInvoiceSummary, TeamSplit } from '../types';

export const cloudEnabled = () => process.env.CREATORPAY_BACKEND === 'supabase';
export async function requireOwner(): Promise<string> {
  const { data: { user }, error } = await createClient().auth.getUser();
  if (error || !user) throw new AnalysisError('Log in to access your workspace.', 401);
  return user.id;
}
export function databaseError(error: { code?: string; message?: string } | null): never {
  if (error?.code === '40001') throw new AnalysisError('This deal changed. Refresh and retry.', 409);
  if (error?.code === '42501') throw new AnalysisError('Record access denied.', 403);
  if (error?.code === 'P0001') throw new AnalysisError(error.message || 'Operation is unavailable.', /limit|budget|Wait/.test(error.message || '') ? 429 : 409);
  throw new AnalysisError('Database request failed. No simulated success was recorded.', 503);
}
export async function ensureWorkspace(owner: string) {
  const admin = createAdminClient();
  const { error } = await admin.from('creatorpay_workspaces').upsert({ owner_id: owner }, { onConflict: 'owner_id', ignoreDuplicates: true });
  if (error) databaseError(error);
  const result = await admin.from('creatorpay_workspaces').select('*').eq('owner_id', owner).single();
  if (result.error) databaseError(result.error);
  return result.data;
}
export async function ownedRows(table: string, owner: string) {
  const rows: any[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await createAdminClient().from(table).select('*').eq('owner_id', owner).order(table === 'creatorpay_deals' ? 'id' : table === 'creatorpay_invoice_links' ? 'invoice_id' : 'id').range(offset, offset + 499);
    if (error) databaseError(error);
    rows.push(...(data || []));
    if ((data || []).length < 500) return rows;
  }
}
export async function portfolio(owner: string) {
  const workspace = await ensureWorkspace(owner);
  const [rows, invoices, audit] = await Promise.all([
    ownedRows('creatorpay_deals', owner), ownedRows('creatorpay_invoice_links', owner), ownedRows('creatorpay_audit', owner),
  ]);
  const deals: Deal[] = rows.map(r => r.body).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  return { activeDeal: deals.find(d => d.id === workspace.active_deal_id) || deals[0] || null, allDeals: deals, teamRoster: workspace.team_roster as TeamSplit[], invoices: invoices.map(r => r.body) as PayPalInvoiceSummary[], auditLedger: audit.map(r => r.body) as AuditLedgerEntry[], sandboxAccount: process.env.PAYPAL_BUSINESS_EMAIL || '', environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox' };
}
export async function ownedDeal(owner: string, id: string) {
  const { data, error } = await createAdminClient().from('creatorpay_deals').select('*').eq('owner_id', owner).eq('id', id).maybeSingle();
  if (error) databaseError(error);
  if (!data) throw new AnalysisError('Deal not found in your workspace.', 404);
  return data as { id: string; owner_id: string; body: Deal; revision: number };
}
export type CommitExtras = { invoice?: unknown; audit?: AuditLedgerEntry[]; event?: string; eventInvoice?: string; job?: { key: string; token: string } };
export async function updateDeal(owner: string, id: string, mutate: (deal: Deal) => void, extras: CommitExtras = {}) {
  // Re-read and replay only pure local state updates after a concurrent webhook.
  for (let attempt = 0; attempt < 3; attempt++) {
    const row = await ownedDeal(owner, id);
    const next = structuredClone(row.body);
    mutate(next);
    const { data, error } = await createAdminClient().rpc('creatorpay_commit_deal', {
      p_owner: owner, p_deal: id, p_revision: row.revision, p_body: next,
      p_invoice: extras.invoice || null, p_audit: extras.audit || [],
      p_event: extras.event || null, p_event_invoice: extras.eventInvoice || null,
      p_job: extras.job?.key || null, p_token: extras.job?.token || null,
    });
    if (error?.code === '40001' && attempt < 2) continue;
    if (error) databaseError(error);
    return data as { body: Deal; duplicate: boolean; revision: number };
  }
  throw new AnalysisError('Deal changed. Retry.', 409);
}
export async function reserveQuota(owner: string) {
  const { error } = await createAdminClient().rpc('creatorpay_reserve_analysis', { p_owner: owner });
  if (error) databaseError(error);
}
export async function acquireJob(owner: string, deal: string, key: string) {
  const { data, error } = await createAdminClient().rpc('creatorpay_acquire_job', { p_owner: owner, p_deal: deal, p_key: key });
  if (error) databaseError(error);
  return { key, token: data.token as string, invoiceId: data.invoiceId as string | null };
}
export async function checkpointJob(job: { key: string; token: string }, invoice: string) {
  const { error } = await createAdminClient().rpc('creatorpay_checkpoint_job', { p_key: job.key, p_token: job.token, p_invoice: invoice });
  if (error) databaseError(error);
}
export async function releaseJob(job: { key: string; token: string }) {
  const { error } = await createAdminClient().rpc('creatorpay_release_job', { p_key: job.key, p_token: job.token });
  if (error) databaseError(error);
}
export function payoutRepository(owner: string, id: string, job: { key: string; token: string }) {
  return {
    getDeal: async (_id: string) => { if (_id !== id) throw new AnalysisError('Deal mismatch.', 403); return (await ownedDeal(owner, id)).body; },
    mutateStore: async (mutate: (store: { deals: Deal[]; auditLedger: AuditLedgerEntry[] }) => Deal) => {
      const { data, error } = await createAdminClient().from('creatorpay_audit').select('body').eq('owner_id', owner).eq('deal_id', id);
      if (error) databaseError(error);
      const audits: AuditLedgerEntry[] = (data || []).map(r => r.body);
      const row = await ownedDeal(owner, id);
      const store = { deals: [structuredClone(row.body)], auditLedger: audits };
      const updated = mutate(store);
      // Result is based on this revision; do not replay stale external receipt data.
      const result = await createAdminClient().rpc('creatorpay_commit_deal', { p_owner: owner, p_deal: id, p_revision: row.revision, p_body: updated, p_audit: store.auditLedger, p_job: job.key, p_token: job.token });
      if (result.error) databaseError(result.error);
      return result.data.body as Deal;
    },
  };
}
