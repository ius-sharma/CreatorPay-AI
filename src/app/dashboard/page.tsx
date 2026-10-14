'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DealInput } from '@/components/DealInput';
import { InvoicingHubView } from '@/components/InvoicingHubView';
import { ContractsManagerView } from '@/components/ContractsManagerView';
import { AuditLedgerView } from '@/components/AuditLedgerView';
import { DiagnosticsView } from '@/components/DiagnosticsView';
import { Deal, TeamSplit, PayPalInvoiceSummary, AuditLedgerEntry } from '@/lib/types';
import { DealWorkspace } from '@/components/DealWorkspace';
import { WorkspaceShell, type WorkspaceView } from '@/components/WorkspaceShell';
import { WorkspaceSetup } from '@/components/WorkspaceSetup';
import { WorkspaceHome } from '@/components/WorkspaceHome';
import { ContractReview } from '@/components/ContractReview';
import { useContractDraft } from '@/components/useContractDraft';
import { DraftToolbar } from '@/components/DraftToolbar';
import type { ContractReview as Review } from '@/lib/contract';
import { readWorkspaceLocation, workspaceUrl, readDealSection, type DealSection } from '@/lib/workspace-navigation';

import { emptyDeliverableDraft, hasUnreviewedDraft, type DeliverableDraft } from '@/lib/deliverable-draft';

export default function Home() {
  const [dealSection, setDealSection] = useState<DealSection | null>(null);
  const [evidenceDrafts, setEvidenceDrafts] = useState<Record<string, DeliverableDraft>>({});
  const selectedDeal = useRef<string | null>(null);
  const dealsCache = useRef<Deal[]>([]);
  const requestVersion = useRef(0);
  const navigationVersion = useRef(0);
  const actionBusy = useRef(false);
  const contractDraft = useContractDraft();
  const { prompt: draftPrompt, useTeamRules: draftTeamRules } = contractDraft.draft;
  const setDraftPrompt = (prompt: string) => contractDraft.change({ prompt });
  const setDraftTeamRules = (useTeamRules: boolean) => contractDraft.change({ useTeamRules });
  const [activeTab, setActiveTab] = useState<WorkspaceView>('overview');
  const [openedSettings, setOpenedSettings] = useState(false);
  useEffect(() => { if (activeTab === 'diagnostics') setOpenedSettings(true); }, [activeTab]);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [allDeals, setAllDeals] = useState<Deal[]>([]);
  const [roster, setRoster] = useState<TeamSplit[]>([]);
  const [invoices, setInvoices] = useState<PayPalInvoiceSummary[]>([]);
  const [auditLedger, setAuditLedger] = useState<AuditLedgerEntry[]>([]);
  const [workspaceName, setWorkspaceName] = useState('Creator workspace');
  const [sandboxAccount, setSandboxAccount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);


  const [contractReview, setContractReview] = useState<{ review: Review; token: string } | null>(null);
  const [analysisError, setAnalysisError] = useState('');
  const [portfolioError, setPortfolioError] = useState('');
  const [notice, setNotice] = useState('');
  const hasUnsavedEvidence = Object.entries(evidenceDrafts).some(([id, draft]) => hasUnreviewedDraft(draft, allDeals.find(d => d.id === id)?.deliverableReviews?.[0]));
  useEffect(() => {
    if (!hasUnsavedEvidence) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    const guardLink = (event: MouseEvent) => {
      const link = (event.target as Element)?.closest?.('a');
      if (!link || link.target === '_blank' || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin === window.location.origin && url.pathname === '/dashboard') return;
      if (!window.confirm('Your unsubmitted deliverable text is kept only while this workspace is open. Leave and discard it?')) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener('beforeunload', warn);
    document.addEventListener('click', guardLink, true);
    return () => { window.removeEventListener('beforeunload', warn); document.removeEventListener('click', guardLink, true); };
  }, [hasUnsavedEvidence]);


  const fetchPortfolioData = async () => {
    if (actionBusy.current) return;
    const version = ++requestVersion.current;
    try {
      const res = await fetch('/api/deals');
      if (res.status === 401) { window.location.assign('/login'); return; }
      const data = await res.json();
      if (version !== requestVersion.current) return;
      if (!res.ok) throw new Error(data.error || 'Could not load your workspace.');
      setPortfolioError('');

      dealsCache.current = data.allDeals || [];
      setDeal(selectedDeal.current ? dealsCache.current.find(d => d.id === selectedDeal.current) || null : data.activeDeal || null);
      if (data.allDeals) setAllDeals(data.allDeals);
      if (data.teamRoster) setRoster(data.teamRoster);
      if (data.invoices) setInvoices(data.invoices);
      if (data.auditLedger) setAuditLedger(data.auditLedger);
      if (data.workspaceName) setWorkspaceName(data.workspaceName);
      if (data.sandboxAccount) setSandboxAccount(data.sandboxAccount);
    } catch (err) {
      if (version === requestVersion.current) setPortfolioError(err instanceof Error ? err.message : 'Could not load your workspace.');
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  };

  useEffect(() => {
    const restore = () => {
      navigationVersion.current++;
      const route = readWorkspaceLocation(window.location.search);
      selectedDeal.current = route.dealId;
      setActiveTab(route.view);
      setDealSection(readDealSection(window.location.search));
      if (route.view === 'detail') setDeal(dealsCache.current.find(d => d.id === route.dealId) || null);
      setAnalysisError('');
    };
    restore();
    fetchPortfolioData();
    const timer = setInterval(fetchPortfolioData, 5000);
    window.addEventListener('popstate', restore);
    return () => { clearInterval(timer); window.removeEventListener('popstate', restore); requestVersion.current++; };
  }, []);

  const navigate = (view: WorkspaceView, dealId?: string, section?: DealSection) => {
    navigationVersion.current++;
    const url = workspaceUrl(view, dealId, section);
    setDealSection(section || null);
    if (window.location.pathname + window.location.search !== url) window.history.pushState(null, '', url);
    selectedDeal.current = view === 'detail' ? dealId || null : null;
    setActiveTab(view);
    if (view === 'detail') setDeal(dealsCache.current.find(d => d.id === dealId) || null);
    setAnalysisError('');
  };

  const applyDealUpdate = (updated: Deal) => {
    requestVersion.current++;
    dealsCache.current = dealsCache.current.map(item => item.id === updated.id ? updated : item);
    setAllDeals(dealsCache.current);
    if (selectedDeal.current === updated.id) setDeal(updated);
  };

  const handleSelectDeal = (dealId: string) => {
    if (actionBusy.current) return;
    // Reading a cached, account-owned deal does not need a server-side selection write.
    navigate('detail', dealId);
  };

  const handlePromptSubmit = async (prompt: string, updatedSplits: TeamSplit[]) => {
    actionBusy.current = true;
    requestVersion.current++;
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
      actionBusy.current = false; setActionLoading(false);
      void fetchPortfolioData();
    }
  };

  const handleConfirmContract = async () => {
    if (!contractReview) return;
    actionBusy.current = true;
    requestVersion.current++;
    setActionLoading(true);
    setAnalysisError('');
    try {
      const res = await fetch('/api/deals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'confirm_analysis', token: contractReview.token }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not confirm this review.');
      dealsCache.current = data.allDeals;
      setAllDeals(data.allDeals);
      setContractReview(null);
      contractDraft.change({ prompt: '', useTeamRules: false });
      // Clear only this revision. Another tab's newer draft must survive.
      const cleared = await contractDraft.save({ prompt: '', useTeamRules: false });
      setNotice(cleared ? 'Deal created. Your saved draft has been cleared.' : 'Deal created. The saved draft could not be cleared. Check it in New deal before starting another contract.');
      navigate('detail', data.activeDeal.id);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Could not confirm this review.');
    } finally { actionBusy.current = false; setActionLoading(false);
      void fetchPortfolioData(); }
  };

  const handleUpdateRoster = async (updatedRoster: TeamSplit[]) => {
    setAnalysisError('');
    actionBusy.current = true;
    requestVersion.current++;
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
      setAnalysisError(err instanceof Error ? err.message : 'Could not save team changes.');
      return false;
    } finally { actionBusy.current = false; setActionLoading(false);
      void fetchPortfolioData(); }
  };

  const handleGenerateInvoice = async (milestoneIndex: number) => {
    actionBusy.current = true;
    requestVersion.current++;
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
        applyDealUpdate(data.deal);
      }
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'PayPal invoice request failed.');
    } finally {
      actionBusy.current = false; setActionLoading(false);
      void fetchPortfolioData();
    }
  };


  const titles: Record<WorkspaceView, [string, string]> = {
    overview: ['Your studio, in focus.', 'Your next steps, in one place.'],
    deals: ['Deals', 'Every partnership, from agreed terms to final settlement.'],
    detail: [deal?.brandName || 'Deal details', deal?.dealTitle || 'Milestones, deliverables and payments.'],
    new: ['Start a new deal', 'Add your contract. Review the extracted terms before confirming the deal.'],
    invoicing: ['Invoices', 'Track the invoices attached to your contract milestones.'],
    splits: ['Your team', 'Manage collaborators and default split rules for new contracts.'],
    audit: ['Payout activity', 'Recorded collaborator payouts and settlement history.'],
    diagnostics: ['Connections', 'Check your workspace storage and PayPal sandbox configuration.'],
  };
  return <WorkspaceShell view={activeTab} onNavigate={navigate} title={titles[activeTab][0]} description={titles[activeTab][1]} merchant={sandboxAccount} workspaceName={workspaceName} busy={actionLoading}>
    {notice && <div role="status" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-4 text-sm"><span>{notice}</span><button onClick={() => setNotice('')} className="font-semibold underline">Dismiss</button></div>}
    {portfolioError && <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"><span>{portfolioError}</span><button onClick={fetchPortfolioData} className="font-semibold underline">Retry</button></div>}
    {loading ? <div role="status" aria-label="Loading workspace" className="space-y-5"><p className="text-sm text-slate-500">Loading your workspace…</p><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[1,2,3,4].map(i => <div key={i} className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white" />)}</div><div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" /></div> : <>
      {activeTab === 'overview' && <WorkspaceSetup deals={allDeals} name={workspaceName} onNavigate={navigate} busy={actionLoading} />}
      {(activeTab === 'overview' || activeTab === 'deals') && <WorkspaceHome deals={allDeals} overview={activeTab === 'overview'} busy={actionLoading} onOpen={handleSelectDeal} onNew={() => navigate('new')} onViewAll={() => navigate('deals')} />}
      {analysisError && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{analysisError}</p>}
      {activeTab === 'new' && <div className="space-y-6"><DraftToolbar draft={contractDraft} disabled={actionLoading} onReload={() => { setContractReview(null); setAnalysisError(''); }} /><DealInput onEdit={() => { setContractReview(null); setAnalysisError(''); }} onSubmit={handlePromptSubmit} splits={roster} prompt={draftPrompt} onPromptChange={setDraftPrompt} useTeamRules={draftTeamRules} onTeamRulesChange={setDraftTeamRules} isLoading={actionLoading || contractDraft.busy} />{contractReview && <ContractReview source={draftPrompt} review={contractReview.review} busy={actionLoading || contractDraft.busy} onConfirm={handleConfirmContract} onDismiss={() => setContractReview(null)} />}</div>}
      {activeTab === 'detail' && !deal && <div className="rounded-xl border border-slate-200 bg-white p-8 text-center"><h2 className="font-semibold">Deal unavailable</h2><p className="mt-2 text-sm text-slate-500">This deal could not be found in your workspace.</p><button onClick={() => navigate('deals')} className="mt-4 text-sm font-medium text-brand-700">Return to deals</button></div>}
      {activeTab === 'detail' && deal && <DealWorkspace key={deal.id} deal={deal} sectionOverride={dealSection} onSection={section => navigate('detail', deal.id, section)} draft={evidenceDrafts[deal.id] || emptyDeliverableDraft} onDraft={draft => setEvidenceDrafts(current => ({ ...current, [deal.id]: draft }))} busy={actionLoading} onBack={() => navigate('deals')} onInvoice={handleGenerateInvoice} onChange={updated => { applyDealUpdate(updated); fetchPortfolioData(); }} />}
      {activeTab === 'invoicing' && <InvoicingHubView invoices={invoices} />}
      <div hidden={activeTab !== 'splits'}><ContractsManagerView roster={roster} onUpdateRoster={handleUpdateRoster} /></div>
      {activeTab === 'audit' && <AuditLedgerView ledger={auditLedger} />}
      {(activeTab === 'diagnostics' || openedSettings) && <div hidden={activeTab !== 'diagnostics'}><DiagnosticsView onName={setWorkspaceName} /></div>}
    </>}
  </WorkspaceShell>;
}
