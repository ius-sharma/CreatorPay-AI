import { Deal, AgentLog, TeamSplit, PayPalInvoiceSummary, AuditLedgerEntry } from './types';
import { parseDealPromptWithHeuristics } from './agent';

declare global {
  var __CREATORPAY_STORE__: {
    deals: Deal[];
    activeDealId: string;
    teamRoster: TeamSplit[];
    invoices: PayPalInvoiceSummary[];
    auditLedger: AuditLedgerEntry[];
  } | undefined;
}

const defaultRoster: TeamSplit[] = [
  {
    id: 'split-1',
    role: 'Lead Video Editor',
    name: 'Aman Verma',
    email: 'aman.editor@paypal-sandbox.com',
    type: 'percentage',
    value: 15,
    status: 'pending',
    w9Status: 'verified',
  },
  {
    id: 'split-2',
    role: 'Thumbnail & Motion Designer',
    name: 'Rohan Mehta',
    email: 'rohan.designer@paypal-sandbox.com',
    type: 'fixed',
    value: 50,
    status: 'pending',
    w9Status: 'verified',
  },
  {
    id: 'split-3',
    role: 'Senior Tech Scriptwriter',
    name: 'Neha Roy',
    email: 'neha.writer@paypal-sandbox.com',
    type: 'fixed',
    value: 200,
    status: 'pending',
    w9Status: 'verified',
  },
  {
    id: 'split-4',
    role: 'Sponsorship Business Manager',
    name: 'Marcus Vance',
    email: 'marcus.agency@paypal-sandbox.com',
    type: 'percentage',
    value: 5,
    status: 'pending',
    w9Status: 'verified',
  },
];

function initializeSeedDeals(): Deal[] {
  // Deal 1: CloudHost (Active Demo Deal)
  const d1 = parseDealPromptWithHeuristics({
    prompt: 'Brand CloudHost offers $2,000 for a 60-second video integration. 30% ($600) advance milestone invoice, 70% ($1,400) upon video deliverable. Disburse team cuts automatically.',
    creatorSplits: defaultRoster.slice(0, 2),
  });
  d1.id = 'deal-cloudhost';

  // Deal 2: NordVPN ($6,500 - In Production)
  const d2 = parseDealPromptWithHeuristics({
    prompt: 'Brand NordVPN cybersecurity sponsorship for $6,500 total. 25% ($1,625) advance milestone, 75% ($4,875) upon video live. 15% to editor Aman, $50 to designer Rohan, $200 to scriptwriter Neha.',
    creatorSplits: defaultRoster.slice(0, 3),
  });
  d2.id = 'deal-nordvpn';
  d2.status = 'advance_paid';
  d2.milestones[0].status = 'paid';
  d2.milestones[0].paidAt = '2026-10-01T14:20:00Z';
  d2.milestones[0].invoiceId = 'INV2-NORD-092';
  d2.milestones[0].invoiceNumber = 'INV-883901';

  // Deal 3: Shopify ($12,000 - Dedicated Video)
  const d3 = parseDealPromptWithHeuristics({
    prompt: 'Brand Shopify annual creator campaign for $12,000 total. 50% ($6,000) upfront deposit invoice now, 50% ($6,000) upon final delivery.',
    creatorSplits: defaultRoster,
  });
  d3.id = 'deal-shopify';
  d3.status = 'advance_invoiced';
  d3.milestones[0].status = 'invoiced';
  d3.milestones[0].invoiceId = 'INV2-SHOP-551';
  d3.milestones[0].invoiceNumber = 'INV-883902';

  return [d1, d2, d3];
}

function initializeInvoices(deals: Deal[]): PayPalInvoiceSummary[] {
  return [
    {
      id: 'INV2-NORD-092',
      invoiceNumber: 'INV-883901',
      dealTitle: 'Cybersecurity Sponsorship',
      brandName: 'NordVPN',
      brandEmail: 'sponsorships@nordvpn.com',
      milestoneTitle: '25% Production Advance',
      amount: 1625,
      currency: 'USD',
      status: 'PAID',
      issueDate: '2026-10-01',
      dueDate: '2026-10-01',
      paymentUrl: 'https://www.sandbox.paypal.com/invoice/p/#INV2-NORD-092',
      terms: 'DUE_ON_RECEIPT',
    },
    {
      id: 'INV2-SHOP-551',
      invoiceNumber: 'INV-883902',
      dealTitle: 'E-Commerce Creator Showcase',
      brandName: 'Shopify',
      brandEmail: 'partnerships@shopify.com',
      milestoneTitle: '50% Initial Production Deposit',
      amount: 6000,
      currency: 'USD',
      status: 'SENT',
      issueDate: '2026-10-02',
      dueDate: '2026-10-09',
      paymentUrl: 'https://www.sandbox.paypal.com/invoice/p/#INV2-SHOP-551',
      terms: 'NET_10',
    },
  ];
}

function initializeAuditLedger(): AuditLedgerEntry[] {
  return [
    {
      id: 'AUDIT-101',
      timestamp: '2026-10-01 15:45:10',
      batchId: 'CP-BATCH-77491',
      dealTitle: 'NordVPN Advance Rev-Share',
      recipientName: 'Aman Verma',
      recipientRole: 'Lead Video Editor',
      recipientEmail: 'aman.editor@paypal-sandbox.com',
      type: 'contractor_payout',
      amount: 243.75,
      currency: 'USD',
      status: 'COMPLETED',
      taxDeductible: true,
      category: '1099 Contractor Fee',
    },
    {
      id: 'AUDIT-102',
      timestamp: '2026-10-01 15:45:10',
      batchId: 'CP-BATCH-77491',
      dealTitle: 'NordVPN Advance Rev-Share',
      recipientName: 'Rohan Mehta',
      recipientRole: 'Motion Designer',
      recipientEmail: 'rohan.designer@paypal-sandbox.com',
      type: 'contractor_payout',
      amount: 50.00,
      currency: 'USD',
      status: 'COMPLETED',
      taxDeductible: true,
      category: '1099 Contractor Fee',
    },
    {
      id: 'AUDIT-103',
      timestamp: '2026-10-01 15:45:12',
      batchId: 'CP-BATCH-77491',
      dealTitle: 'NordVPN Advance Net Retained',
      recipientName: 'Apex Media (Creator)',
      recipientRole: 'Studio Owner',
      recipientEmail: 'sb-9l0ms53173777@business.example.com',
      type: 'creator_retention',
      amount: 1331.25,
      currency: 'USD',
      status: 'COMPLETED',
      taxDeductible: false,
      category: 'Net Studio Operating Income',
    },
  ];
}

export function getStore() {
  if (!global.__CREATORPAY_STORE__) {
    const deals = initializeSeedDeals();
    global.__CREATORPAY_STORE__ = {
      deals,
      activeDealId: deals[0].id,
      teamRoster: defaultRoster,
      invoices: initializeInvoices(deals),
      auditLedger: initializeAuditLedger(),
    };
  }
  return global.__CREATORPAY_STORE__;
}

export function getAllDeals(): Deal[] {
  return getStore().deals;
}

export function getActiveDeal(): Deal | null {
  const store = getStore();
  return store.deals.find((d) => d.id === store.activeDealId) || store.deals[0] || null;
}

export function setActiveDealId(id: string): Deal | null {
  const store = getStore();
  const found = store.deals.find((d) => d.id === id);
  if (found) {
    store.activeDealId = id;
    return found;
  }
  return getActiveDeal();
}

export function setActiveDeal(deal: Deal): Deal {
  const store = getStore();
  const existingIdx = store.deals.findIndex((d) => d.id === deal.id);
  if (existingIdx >= 0) {
    store.deals[existingIdx] = deal;
  } else {
    store.deals.unshift(deal);
  }
  store.activeDealId = deal.id;
  return deal;
}

export function updateActiveDeal(updater: (prev: Deal) => Deal): Deal | null {
  const store = getStore();
  const active = getActiveDeal();
  if (!active) return null;

  const updated = updater(active);
  updated.updatedAt = new Date().toISOString();

  const idx = store.deals.findIndex((d) => d.id === active.id);
  if (idx >= 0) {
    store.deals[idx] = updated;
  }

  return updated;
}

export function appendDealLog(log: Omit<AgentLog, 'id' | 'timestamp'>): AgentLog {
  const store = getStore();
  const active = getActiveDeal();

  const fullLog: AgentLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleTimeString(),
  };

  if (active) {
    active.logs = [fullLog, ...active.logs];
    active.updatedAt = new Date().toISOString();
  }

  return fullLog;
}

export function getTeamRoster(): TeamSplit[] {
  return getStore().teamRoster;
}

export function updateTeamRoster(roster: TeamSplit[]): TeamSplit[] {
  const store = getStore();
  store.teamRoster = roster;
  return roster;
}

export function getInvoicesRegistry(): PayPalInvoiceSummary[] {
  return getStore().invoices;
}

export function addInvoiceToRegistry(inv: PayPalInvoiceSummary): PayPalInvoiceSummary {
  const store = getStore();
  store.invoices.unshift(inv);
  return inv;
}

export function getAuditLedger(): AuditLedgerEntry[] {
  return getStore().auditLedger;
}

export function addAuditEntry(entry: AuditLedgerEntry): AuditLedgerEntry {
  const store = getStore();
  store.auditLedger.unshift(entry);
  return entry;
}

export function resetDemo(): Deal {
  const store = getStore();
  const deals = initializeSeedDeals();
  store.deals = deals;
  store.activeDealId = deals[0].id;
  store.teamRoster = defaultRoster;
  store.invoices = initializeInvoices(deals);
  store.auditLedger = initializeAuditLedger();
  return deals[0];
}
