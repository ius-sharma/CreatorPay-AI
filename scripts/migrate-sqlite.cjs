// Explicit reviewed, one-owner sandbox import. Original SQLite is read-only.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const { createClient } = require('@supabase/supabase-js');
require('@next/env').loadEnvConfig(process.cwd());
const args = process.argv.slice(2);
const argument = key => args[args.indexOf(key) + 1];
async function main() {
  if (!args.includes('--email') || !args.includes('--db') || !args.includes('--merchant')) throw new Error('Use --email OWNER_EMAIL --db .data/FILE.sqlite --merchant SANDBOX_MERCHANT [--apply --confirm-digest DIGEST].');
  const email = argument('--email');
  const merchant = argument('--merchant');
  if (!/^sb-[a-z0-9]+@business\.example\.com$/i.test(merchant)) throw new Error('Only generated sandbox business merchants are supported.');
  const file = path.resolve(argument('--db'));
  const root = path.resolve('.data') + path.sep;
  if (!file.startsWith(root) || !file.endsWith('.sqlite') || !fs.existsSync(file)) throw new Error('Source must be an existing .data SQLite file.');
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  let owner;
  for (let page = 1; !owner; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw new Error('Cannot look up the destination account.');
    owner = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (data.users.length < 100) break;
  }
  if (!owner?.email_confirmed_at) throw new Error('Destination must be an existing email-confirmed account.');
  const db = new DatabaseSync(file, { readOnly: true });
  const state = JSON.parse(db.prepare('select body from app_state where id=1').get().body);
  const deals = state.deals.filter(d => !d.demo && d.contractExtraction);
  const invoiceIds = new Set(deals.flatMap(d => d.milestones.map(m => m.invoiceId).filter(Boolean)));
  const batchIds = new Set(deals.map(d => d.payout?.batchId).filter(Boolean));
  const invoices = state.invoices.filter(i => invoiceIds.has(i.id));
  const audit = state.auditLedger.filter(a => batchIds.has(a.batchId) && a.id.startsWith('payout-'));
  const events = db.prepare('select * from webhook_events').all().filter(e => invoiceIds.has(e.invoice_id));
  const jobs = db.prepare('select * from invoice_jobs').all().filter(j => deals.some(d => j.key.startsWith(d.id+':') || j.key === 'payout:'+d.id));
  if (jobs.some(j => j.lease_until > Date.now())) throw new Error('A source payment operation is still running. Retry after completion.');
  db.close();
  const payload = { owner: owner.id, merchant, deals, invoices, audit, events, jobs };
  const digest = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  console.log(JSON.stringify({ mode: args.includes('--apply') ? 'apply' : 'preview', destinationEmail: owner.email, source: path.relative(process.cwd(), file), deals: deals.map(d => ({ id: d.id, total: d.totalAmount, currency: d.currency, status: d.status, payments: d.milestones.map(m => ({ amount: m.amount, status: m.status, invoiceId: m.invoiceId })), payout: d.payout?.items.map(i => ({ amount: i.amount, status: i.status, transactionId: i.transactionId })) })), invoiceCount: invoices.length, auditCount: audit.length, verifiedWebhookCount: events.length, digest }));
  if (!args.includes('--apply')) return;
  if (!args.includes('--confirm-digest') || argument('--confirm-digest') !== digest) throw new Error('Review digest does not match the current source. Preview again.');
  fs.writeFileSync(path.join('.data', 'migration-backup-'+digest.slice(0,16)+'.json'), JSON.stringify({ state, events, jobs }, null, 2), { flag: 'wx' });
  const checked = async promise => { const result = await promise; if (result.error) throw new Error('Import stopped ('+result.error.code+'). Original SQLite and private backup are preserved.'); return result.data; };
  await checked(admin.from('creatorpay_workspaces').upsert({ owner_id: owner.id, team_roster: state.teamRoster || [] }, { onConflict:'owner_id',ignoreDuplicates:true }));
  for (const source of deals) {
    const prior = await checked(admin.from('creatorpay_deals').select('id').eq('id', source.id).maybeSingle());
    if (prior) throw new Error('Destination already contains this deal; existing records will not be overwritten.');
    const deal = { ...source, ownerSession: owner.id };
    await checked(admin.from('creatorpay_deals').insert({ id:deal.id,owner_id:owner.id,body:deal }));
    for (const m of deal.milestones.filter(m=>m.invoiceId)) {
      const summary = invoices.find(i=>i.id===m.invoiceId);
      if (!summary) throw new Error('Source invoice registry entry is missing.');
      await checked(admin.from('creatorpay_invoice_links').insert({ invoice_id:m.invoiceId,deal_id:deal.id,owner_id:owner.id,milestone_id:m.id,merchant_email:merchant,body:summary }));
    }
    const records = audit.filter(a=>a.batchId===deal.payout?.batchId);
    if (records.length) await checked(admin.from('creatorpay_audit').insert(records.map(a=>({id:a.id,deal_id:deal.id,owner_id:owner.id,body:a}))));
    const receipt = events.filter(e=>deal.milestones.some(m=>m.invoiceId===e.invoice_id));
    if (receipt.length) await checked(admin.from('creatorpay_webhook_events').insert(receipt.map(e=>({id:e.id,invoice_id:e.invoice_id,processed_at:e.processed_at}))));
    const checkpoints = jobs.filter(j=>j.key.startsWith(deal.id+':')||j.key==='payout:'+deal.id);
    if (checkpoints.length) await checked(admin.from('creatorpay_jobs').insert(checkpoints.map(j=>({key:j.key,deal_id:deal.id,invoice_id:j.invoice_id,lease_until:'1970-01-01T00:00:00Z'}))));
  }
  if (deals.length) await checked(admin.from('creatorpay_workspaces').update({active_deal_id:deals.some(d=>d.id===state.activeDealId)?state.activeDealId:deals[0].id}).eq('owner_id',owner.id));
  console.log('Import complete. Original database and private snapshot preserved.');
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
