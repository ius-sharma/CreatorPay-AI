'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { DealInput } from '@/components/DealInput';
import { DealTimeline } from '@/components/DealTimeline';
import { AgentTerminal } from '@/components/AgentTerminal';
import { PayoutLedger } from '@/components/PayoutLedger';
import { DeliverableModal } from '@/components/DeliverableModal';
import { WebhookSimulatorBar } from '@/components/WebhookSimulatorBar';
import { Deal, TeamSplit } from '@/lib/types';
import { Bot } from 'lucide-react';

export default function Home() {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [splits, setSplits] = useState<TeamSplit[]>([]);
  const [sandboxAccount, setSandboxAccount] = useState<string>('sb-9l0ms53173777@business.example.com');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isDeliverableModalOpen, setIsDeliverableModalOpen] = useState<boolean>(false);

  const fetchDealData = async () => {
    try {
      const res = await fetch('/api/deals');
      const data = await res.json();
      if (data.deal) {
        setDeal(data.deal);
      }
      if (data.splits) {
        setSplits(data.splits);
      }
      if (data.sandboxAccount) {
        setSandboxAccount(data.sandboxAccount);
      }
    } catch (err) {
      console.error('Failed to fetch deal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealData();
  }, []);

  const handlePromptSubmit = async (prompt: string, updatedSplits: TeamSplit[]) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, customSplits: updatedSplits }),
      });
      const data = await res.json();
      if (data.deal) {
        setDeal(data.deal);
      }
    } catch (err) {
      console.error('Error submitting prompt:', err);
    } finally {
      setActionLoading(false);
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
      if (data.deal) {
        setDeal(data.deal);
      }
    } catch (err) {
      console.error('Error resetting demo:', err);
    } finally {
      setIsResetting(false);
    }
  };

  if (loading || !deal) {
    return (
      <div className="min-h-screen bg-[#fbfbfe] flex flex-col items-center justify-center text-slate-700">
        <div className="w-12 h-12 rounded-2xl bg-brand-600 animate-pulse flex items-center justify-center mb-4 shadow-xl shadow-brand-600/25">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <p className="font-bold text-sm text-slate-900">Connecting to PayPal Sandbox & CreatorPay Agent...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbfe] text-slate-900 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        sandboxAccount={sandboxAccount}
        onReset={handleResetDemo}
        isResetting={isResetting}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Quick Simulator Highlight Bar for Judges */}
        <WebhookSimulatorBar
          deal={deal}
          onGenerateInvoice={handleGenerateInvoice}
          onSimulateWebhook={handleSimulateWebhook}
          onOpenDeliverableModal={() => setIsDeliverableModalOpen(true)}
          onExecutePayout={handleExecutePayout}
          actionLoading={actionLoading}
        />

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (5 Cols): Command Center & Live Agent Terminal */}
          <div className="lg:col-span-5 space-y-6">
            <DealInput
              onSubmit={handlePromptSubmit}
              splits={splits}
              onUpdateSplits={setSplits}
              isLoading={actionLoading}
            />

            <AgentTerminal logs={deal.logs} />
          </div>

          {/* Right Column (7 Cols): Deal Lifecycle Pipeline & Multi-Party Payout Ledger */}
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
      </main>

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

      {/* Footer */}
      <footer className="border-t border-brand-100 bg-white py-4 text-center text-xs text-slate-500">
        <p>
          CreatorPay AI • Powered by PayPal Invoicing API v2, Payouts API v1 & Webhooks • Built for PayPal AI Hackathon 2026
        </p>
      </footer>
    </div>
  );
}
