import { Deal, AgentLog, TeamSplit } from './types';
import { parseDealPromptWithHeuristics } from './agent';

// Global in-memory store for Next.js API routes
declare global {
  var __CREATORPAY_STORE__: {
    activeDeal: Deal | null;
    customSplits: TeamSplit[];
  } | undefined;
}

const defaultSplits: TeamSplit[] = [
  {
    id: 'split-1',
    role: 'Video Editor',
    name: 'Aman',
    email: 'aman.editor@paypal-sandbox.com',
    type: 'percentage',
    value: 15,
    status: 'pending',
  },
  {
    id: 'split-2',
    role: 'Thumbnail Designer',
    name: 'Rohan',
    email: 'rohan.designer@paypal-sandbox.com',
    type: 'fixed',
    value: 50,
    status: 'pending',
  },
];

export function getStore() {
  if (!global.__CREATORPAY_STORE__) {
    // Initialize with a pre-parsed demo deal for immediate viewing
    const initialDeal = parseDealPromptWithHeuristics({
      prompt: 'Brand CloudHost offers $2,000 for a 60-second video integration. 30% ($600) advance milestone invoice, 70% ($1,400) upon video deliverable. Disburse team cuts automatically.',
      creatorSplits: defaultSplits,
    });

    global.__CREATORPAY_STORE__ = {
      activeDeal: initialDeal,
      customSplits: defaultSplits,
    };
  }
  return global.__CREATORPAY_STORE__;
}

export function getActiveDeal(): Deal | null {
  return getStore().activeDeal;
}

export function setActiveDeal(deal: Deal): Deal {
  const store = getStore();
  store.activeDeal = deal;
  return deal;
}

export function updateActiveDeal(updater: (prev: Deal) => Deal): Deal | null {
  const store = getStore();
  if (!store.activeDeal) return null;
  store.activeDeal = updater(store.activeDeal);
  store.activeDeal.updatedAt = new Date().toISOString();
  return store.activeDeal;
}

export function appendDealLog(log: Omit<AgentLog, 'id' | 'timestamp'>): AgentLog {
  const store = getStore();
  const fullLog: AgentLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleTimeString(),
  };

  if (store.activeDeal) {
    store.activeDeal.logs = [fullLog, ...store.activeDeal.logs];
    store.activeDeal.updatedAt = new Date().toISOString();
  }

  return fullLog;
}

export function getCustomSplits(): TeamSplit[] {
  return getStore().customSplits;
}

export function setCustomSplits(splits: TeamSplit[]): TeamSplit[] {
  const store = getStore();
  store.customSplits = splits;
  return splits;
}

export function resetDemo(): Deal {
  const store = getStore();
  const freshDeal = parseDealPromptWithHeuristics({
    prompt: 'Brand CloudHost offers $2,000 for a 60-second video integration. 30% ($600) advance milestone invoice, 70% ($1,400) upon video deliverable. Disburse team cuts automatically.',
    creatorSplits: store.customSplits,
  });
  store.activeDeal = freshDeal;
  return freshDeal;
}
