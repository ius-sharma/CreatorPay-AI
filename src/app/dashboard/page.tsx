'use client';

import React, { useState, useEffect } from 'react';
import { DealInput } from '@/components/DealInput';
import { InvoicingHubView } from '@/components/InvoicingHubView';
import { ContractsManagerView } from '@/components/ContractsManagerView';
import { AuditLedgerView } from '@/components/AuditLedgerView';
import { DiagnosticsView } from '@/components/DiagnosticsView';
import { Deal, TeamSplit, PayPalInvoiceSummary, AuditLedgerEntry } from '@/lib/types';
import { DealWorkspace } from '@/components/DealWorkspace';
import { WorkspaceShell, type WorkspaceView } from '@/components/WorkspaceShell';
import { WorkspaceHome } from '@/components/WorkspaceHome';
import { ContractReview } from '@/components/ContractReview';
import type { ContractReview as Review } from '@/lib/contract';

export default function Home() {
  const [activeTab, setActiveTab] = useState<WorkspaceView>('overview');
  const [deal, setDeal] = useState<Deal | null>(null);
  const [allDeals, setAllDeals] = useState<Deal[]>([]);
  const [roster, setRoster] = useState<TeamSplit[]>([]);
  const [invoices, setInvoices] = useState<PayPalInvoiceSummary[]>([]);
  const [auditLedger, setAuditLedger] = useState<AuditLedgerEntry[]>([]);
  const [sandboxAccount, setSandboxAccount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);


  const [contractReview, setContractReview] = useState<{ review: Review; token: string } | null>(null);
  const [analysisError, setAnalysisError] = useState('');
  const [portfolioError, setPortfolioError] = useState('');


  const fetchPortfolioData = async () => {
    try {
      const res = await fetch('/api/deals');
      if (res.status === 401) { window.location.assign('/login'); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not load your workspace.');
      setPortfolioError('');

      setDeal(data.activeDeal || null);
      if (data.allDeals) setAllDeals(data.allDeals);
      if (data.teamRoster) setRoster(data.teamRoster);
      if (data.invoices) setInvoices(data.invoices);
      if (data.auditLedger) setAuditLedger(data.auditLedger);
      if (data.sandboxAccount) setSandboxAccount(data.sandboxAccount);
    } catch (err) {
      setPortfolioError(err instanceof Error ? err.message : 'Could not load your workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
    const timer = setInterval(fetchPortfolioData, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectDeal = async (dealId: string) => {
    setActionLoading(true);
    setPortfolioError('');
    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'switch_deal', dealId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not open this deal.');
      if (data.activeDeal) { setDeal(data.activeDeal); setActiveTab('detail'); }
      if (data.allDeals) setAllDeals(data.allDeals);
    } catch (err) {
      setPortfolioError(err instanceof Error ? err.message : 'Could not open this deal.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePromptSubmit = async (prompt: string, updatedSplits: TeamSplit[]) => {
    setActionLoading(true);
    setAnalysisError('');
    setContractReview(null);
    try {
      const res = await fetch('/api/agent/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, customSplits: updatedSplits }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Contract analysis failed.');
      setContractReview({ review: data.review, token: data.token });
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Contract analysis failed. Please retry.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmContract = async () => {
    if (!contractReview) return;
    setActionLoading(true);
    setAnalysisError('');
    try {
      const res = await fetch('/api/deals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'confirm_analysis', token: contractReview.token }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not confirm this review.');
      setDeal(data.activeDeal);
      setAllDeals(data.allDeals);
      setContractReview(null);
      setActiveTab('detail');
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Could not confirm this review.');
    } finally { setActionLoading(false); }
  };

  const handleUpdateRoster = async (updatedRoster: TeamSplit[]) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_roster', teamRoster: updatedRoster }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save team changes.');
      setRoster(data.teamRoster || updatedRoster);
      return true;
    } catch (err) {
      setPortfolioError(err instanceof Error ? err.message : 'Could not save team changes.');
      return false;
    } finally { setActionLoading(false); }
  };

  const handleGenerateInvoice = async (milestoneIndex: number) => {
    setActionLoading(true);
    setAnalysisError('');
    try {
      const res = await fetch('/api/paypal/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId: deal?.id, milestoneIndex }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'PayPal invoice request failed.');
      if (data.deal) {
        setDeal(data.deal);
        fetchPortfolioData(); // refresh invoices and KPIs
      }
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'PayPal invoice request failed.');
      fetchPortfolioData();
    } finally {
      setActionLoading(false);
    }
  };

  const navigate = (view: WorkspaceView) => {
    setActiveTab(view);
    setAnalysisError('');
  };
  const titles: Record<WorkspaceView, [string, string]> = {
    overview: ['Your workspace, at a glance.', 'Keep track of your deals, payments and what needs your attention.'],
    deals: ['Deals', 'Every partnership, from agreed terms to final settlement.'],
    detail: [deal?.brandName || 'Deal details', deal?.dealTitle || 'Milestones, deliverables and payments.'],
    new: ['Start a new deal', 'Add your contract. Review the extracted terms before confirming the deal.'],
    invoicing: ['Invoices', 'Track the invoices attached to your contract milestones.'],
    splits: ['Your team', 'Manage collaborators and default split rules for new contracts.'],
    audit: ['Payout activity', 'Recorded collaborator payouts and settlement history.'],
    diagnostics: ['Connections', 'Check your workspace storage and PayPal sandbox configuration.'],
  };
  return <WorkspaceShell view={activeTab} onNavigate={navigate} title={titles[activeTab][0]} description={titles[activeTab][1]} merchant={sandboxAccount} busy={actionLoading}>
    {portfolioError && <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"><span>{portfolioError}</span><button onClick={fetchPortfolioData} className="font-semibold underline">Retry</button></div>}
    {loading ? <div role="status" aria-label="Loading workspace" className="space-y-5"><p className="text-sm text-slate-500">Loading your workspace…</p><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[1,2,3,4].map(i => <div key={i} className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white" />)}</div><div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" /></div> : <>
      {(activeTab === 'overview' || activeTab === 'deals') && <WorkspaceHome deals={allDeals} overview={activeTab === 'overview'} busy={actionLoading} onOpen={handleSelectDeal} onNew={() => navigate('new')} />}
      {analysisError && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{analysisError}</p>}
      {activeTab === 'new' && <div className="max-w-3xl space-y-5"><DealInput onEdit={() => { setContractReview(null); setAnalysisError(''); }} onSubmit={handlePromptSubmit} splits={roster} onUpdateSplits={setRoster} isLoading={actionLoading} />{contractReview && <ContractReview review={contractReview.review} busy={actionLoading} onConfirm={handleConfirmContract} onDismiss={() => setContractReview(null)} />}</div>}
      {activeTab === 'detail' && deal && <DealWorkspace key={deal.id} deal={deal} busy={actionLoading} onBack={() => navigate('deals')} onInvoice={handleGenerateInvoice} onChange={updated => { setDeal(updated); fetchPortfolioData(); }} />}
      {activeTab === 'invoicing' && <InvoicingHubView invoices={invoices} />}
      {activeTab === 'splits' && <ContractsManagerView roster={roster} onUpdateRoster={handleUpdateRoster} />}
      {activeTab === 'audit' && <AuditLedgerView ledger={auditLedger} />}
      {activeTab === 'diagnostics' && <DiagnosticsView />}
    </>}
  </WorkspaceShell>;
}
