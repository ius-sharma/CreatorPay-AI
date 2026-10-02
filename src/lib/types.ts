export type TabType = 'workspace' | 'invoicing' | 'splits' | 'audit' | 'diagnostics';

export type MilestoneStatus = 'pending' | 'invoiced' | 'paid';
export type DealStatus = 
  | 'draft' 
  | 'analyzed' 
  | 'advance_invoiced' 
  | 'advance_paid' 
  | 'in_production' 
  | 'deliverable_submitted' 
  | 'deliverable_verified' 
  | 'final_invoiced' 
  | 'final_paid' 
  | 'payouts_completed' 
  | 'deal_closed';

export interface Milestone {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  status: MilestoneStatus;
  invoiceId?: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  paidAt?: string;
}

export interface TeamSplit {
  id: string;
  role: string;
  name: string;
  email: string;
  type: 'percentage' | 'fixed';
  value: number; // e.g. 15 for 15% or 50 for $50
  calculatedAmount?: number;
  status: 'pending' | 'settled';
  payoutBatchId?: string;
  payoutItemId?: string;
  settledAt?: string;
  w9Status?: 'verified' | 'pending';
}

export interface Deliverable {
  id: string;
  title: string;
  videoUrl?: string;
  proofImageUrl?: string;
  requiredSponsorTag: string;
  requiredLink: string;
  verified: boolean;
  notes?: string;
  verifiedAt?: string;
}

export interface AgentLog {
  id: string;
  timestamp: string;
  type: 'thought' | 'action' | 'webhook' | 'payout' | 'verification' | 'success';
  title: string;
  description: string;
  toolCall?: {
    name: string;
    params?: any;
    result?: any;
  };
}

export interface Deal {
  id: string;
  brandName: string;
  brandEmail: string;
  dealTitle: string;
  totalAmount: number;
  currency: string;
  prompt: string;
  status: DealStatus;
  milestones: Milestone[];
  teamSplits: TeamSplit[];
  deliverable?: Deliverable;
  creatorNetPayout: number;
  createdAt: string;
  updatedAt: string;
  logs: AgentLog[];
}

export interface PayPalInvoiceSummary {
  id: string;
  invoiceNumber: string;
  dealTitle: string;
  brandName: string;
  brandEmail: string;
  milestoneTitle: string;
  amount: number;
  currency: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';
  issueDate: string;
  dueDate: string;
  paymentUrl: string;
  terms: string;
}

export interface AuditLedgerEntry {
  id: string;
  timestamp: string;
  batchId: string;
  dealTitle: string;
  recipientName: string;
  recipientRole: string;
  recipientEmail: string;
  type: 'contractor_payout' | 'creator_retention';
  amount: number;
  currency: string;
  status: 'COMPLETED' | 'PENDING';
  taxDeductible: boolean;
  category: string;
}
