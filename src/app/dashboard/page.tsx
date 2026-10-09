'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { ExecutiveKpiStrip } from '@/components/ExecutiveKpiStrip';
import { DealSwitcherTray } from '@/components/DealSwitcherTray';
import { DealInput } from '@/components/DealInput';
import { DealTimeline } from '@/components/DealTimeline';
import { AgentTerminal } from '@/components/AgentTerminal';
import { PayoutLedger } from '@/components/PayoutLedger';
import { DeliverableModal } from '@/components/DeliverableModal';
import { FloatingSandboxConsole } from '@/components/FloatingSandboxConsole';
import { InvoicingHubView } from '@/components/InvoicingHubView';
import { ContractsManagerView } from '@/components/ContractsManagerView';
import { AuditLedgerView } from '@/components/AuditLedgerView';
import { DiagnosticsView } from '@/components/DiagnosticsView';
import { Deal, TeamSplit, TabType, PayPalInvoiceSummary, AuditLedgerEntry } from '@/lib/types';
import { Bot } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('workspace');
  const [deal, setDeal] = useState<Deal | null>(null);
  const [allDeals, setAllDeals] = useState<Deal[]>([]);
  const [roster, setRoster] = useState<TeamSplit[]>([]);
  const [invoices, setInvoices] = useState<PayPalInvoiceSummary[]>([]);
  const [auditLedger, setAuditLedger] = useState<AuditLedgerEntry[]>([]);
  const [sandboxAccount, setSandboxAccount] = useState<string>('sb-9l0ms53173777@business.example.com');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isDeliverableModalOpen, setIsDeliverableModalOpen] = useState<boolean>(false);

  const fetchPortfolioData = async () => {
    try {
      const res = await fetch('/api/deals');
      const data = await res.json();
      if (data.activeDeal) setDeal(data.activeDeal);
      if (data.allDeals) setAllDeals(data.allDeals);
      if (data.teamRoster) setRoster(data.teamRoster);
      if (data.invoices) setInvoices(data.invoices);
      if (data.auditLedger) setAuditLedger(data.auditLedger);
      if (data.sandboxAccount) setSandboxAccount(data.sandboxAccount);
    } catch (err) {
      console.error('Failed to fetch portfolio data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const handleSelectDeal = async (dealId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'switch_deal', dealId }),
      });
      const data = await res.json();
      if (data.activeDeal) setDeal(data.activeDeal);
      if (data.allDeals) setAllDeals(data.allDeals);
    } catch (err) {
      console.error('Error switching deal:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePromptSubmit = async (prompt: string, updatedSplits: TeamSplit[]) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, customSplits: updatedSplits }),
      });
      const data = await res.json();
      if (data.activeDeal) setDeal(data.activeDeal);
      if (data.allDeals) setAllDeals(data.allDeals);
    } catch (err) {
      console.error('Error submitting prompt:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRoster = async (updatedRoster: TeamSplit[]) => {
    setRoster(updatedRoster);
    try {
      await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_roster', teamRoster: updatedRoster }),
      });
    } catch (err) {
      console.error('Error updating roster:', err);
    }
  };

  const handleGenerateInvoice = async (milestoneIndex: number) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/paypal/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneIndex }),
      });
      const data = await res.json();
      if (data.deal) {
        setDeal(data.deal);
        fetchPortfolioData(); // refresh invoices and KPIs
      }
    } catch (err) {
      console.error('Error creating invoice:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateWebhook = async (milestoneIndex: number) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/paypal/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'INVOICING.INVOICE.PAID',
          milestoneIndex,
        }),
      });
      const data = await res.json();
      if (data.deal) {
        setDeal(data.deal);
        fetchPortfolioData();
      }
    } catch (err) {
      console.error('Error simulating webhook:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyDeliverable = async (submission: { videoUrl: string; proofText: string }) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/agent/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });
      const data = await res.json();
      if (data.deal) {
        setDeal(data.deal);
      }
      setIsDeliverableModalOpen(false);
    } catch (err) {
      console.error('Error verifying deliverable:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecutePayout = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/paypal/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.deal) {
        setDeal(data.deal);
        fetchPortfolioData(); // refresh audit ledger
      }
    } catch (err) {
      console.error('Error executing payout:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/deals', { method: 'DELETE' });
      const data = await res.json();
      if (data.activeDeal) setDeal(data.activeDeal);
      if (data.allDeals) setAllDeals(data.allDeals);
      if (data.teamRoster) setRoster(data.teamRoster);
      if (data.invoices) setInvoices(data.invoices);
      if (data.auditLedger) setAuditLedger(data.auditLedger);
    } catch (err) {
      console.error('Error resetting demo:', err);
    } finally {
      setIsResetting(false);
    }
  };

  if (loading || !deal) {
    return (
      <div className="min-h-screen bg-[#FFFDFC] flex flex-col items-center justify-center text-[#75645E]">
        <div className="w-12 h-12 rounded-2xl bg-brand-500 animate-pulse flex items-center justify-center mb-4 shadow-xl shadow-brand-500/25">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <p className="font-extrabold text-sm text-[#2B1D19]">
          Connecting to PayPal Developer Platform & Apex Media Studio...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDFC] text-[#2B1D19] flex flex-col">
      {/* 5-Tab Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sandboxAccount={sandboxAccount}
        onReset={handleResetDemo}
        isResetting={isResetting}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-28">
        {/* Top Executive KPI Financial Bar */}
        <ExecutiveKpiStrip deals={allDeals} activeDeal={deal} />

        {/* Tab 1: Deals Workspace */}
        {activeTab === 'workspace' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Multi-Deal Portfolio Tray */}
            <DealSwitcherTray
              deals={allDeals}
              activeDealId={deal.id}
              onSelectDeal={handleSelectDeal}
            />

            {/* 2-Column Deal Execution Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (5 cols): Command Center & Agent Feed */}
              <div className="lg:col-span-5 space-y-6">
                <DealInput
                  onSubmit={handlePromptSubmit}
                  splits={deal.teamSplits}
                  onUpdateSplits={(newSplits) => {
                    const updated = { ...deal, teamSplits: newSplits };
                    setDeal(updated);
                  }}
                  isLoading={actionLoading}
                />

                <AgentTerminal logs={deal.logs} />
              </div>

              {/* Right Column (7 cols): Pipeline Stepper & Settlement Ledger */}
              <div className="lg:col-span-7 space-y-6">
                <DealTimeline
                  deal={deal}
                  onGenerateInvoice={handleGenerateInvoice}
                  onSimulateWebhook={handleSimulateWebhook}
                  onOpenDeliverableModal={() => setIsDeliverableModalOpen(true)}
                  onExecutePayout={handleExecutePayout}
                  actionLoading={actionLoading}
                />

                <PayoutLedger deal={deal} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: PayPal Invoicing Hub */}
        {activeTab === 'invoicing' && (
          <div className="animate-in fade-in duration-150">
            <InvoicingHubView invoices={invoices} />
          </div>
        )}

        {/* Tab 3: Team Splits & Roster Manager */}
        {activeTab === 'splits' && (
          <div className="animate-in fade-in duration-150">
            <ContractsManagerView roster={roster} onUpdateRoster={handleUpdateRoster} />
          </div>
        )}

        {/* Tab 4: Audit & Tax Ledger */}
        {activeTab === 'audit' && (
          <div className="animate-in fade-in duration-150">
            <AuditLedgerView ledger={auditLedger} />
          </div>
        )}

        {/* Tab 5: API Diagnostics & Telemetry */}
        {activeTab === 'diagnostics' && (
          <div className="animate-in fade-in duration-150">
            <DiagnosticsView />
          </div>
        )}
      </main>

      {/* Floating Non-Intrusive Sandbox Console for Hackathon Judges */}
      <FloatingSandboxConsole
        deal={deal}
        onGenerateInvoice={handleGenerateInvoice}
        onSimulateWebhook={handleSimulateWebhook}
        onOpenDeliverableModal={() => setIsDeliverableModalOpen(true)}
        onExecutePayout={handleExecutePayout}
        actionLoading={actionLoading}
      />

      {/* Deliverable Verification Modal */}
      {deal.deliverable && (
        <DeliverableModal
          isOpen={isDeliverableModalOpen}
          onClose={() => setIsDeliverableModalOpen(false)}
          deliverable={deal.deliverable}
          onVerify={handleVerifyDeliverable}
          isLoading={actionLoading}
        />
      )}

      {/* Ultra-Grade Footer */}
      <footer className="border-t border-espresso-100 bg-[#FFFDFC] py-4 text-center text-xs text-[#75645E]">
        <p>
          CreatorPay AI • Enterprise Merchant Solutions • Powered by PayPal Invoicing v2, Payouts v1 & Webhooks • PayPal AI Hackathon 2026
        </p>
      </footer>
    </div>
  );
}
