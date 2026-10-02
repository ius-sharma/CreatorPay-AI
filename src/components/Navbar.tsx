'use client';

import React from 'react';
import { Bot, RotateCcw, ExternalLink, Briefcase, FileText, Users, ShieldCheck, Server } from 'lucide-react';
import { TabType } from '@/lib/types';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  sandboxAccount: string;
  onReset: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  sandboxAccount,
  onReset,
  isResetting,
}) => {
  const tabs = [
    { id: 'workspace' as TabType, label: 'Deals Workspace', icon: Briefcase },
    { id: 'invoicing' as TabType, label: 'Invoicing Hub', icon: FileText },
    { id: 'splits' as TabType, label: 'Team Splits', icon: Users },
    { id: 'audit' as TabType, label: 'Audit & Tax', icon: ShieldCheck },
    { id: 'diagnostics' as TabType, label: 'API Engine', icon: Server },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-brand-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Upper Row: Brand & Status */}
        <div className="h-16 flex items-center justify-between">
          {/* Logo & Studio Info */}
          <div className="flex items-center space-x-3">
            {/* Dual Monogram: PayPal Blue + CreatorPay Brand */}
            <div className="flex items-center -space-x-1.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#001C3E] via-[#003087] to-[#0079C1] flex items-center justify-center shadow-md shadow-blue-900/20 text-white font-black italic text-lg z-10">
                P
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-brand-400 flex items-center justify-center shadow-md shadow-brand-600/20 text-white">
                <Bot className="w-5 h-5 text-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl tracking-tight text-slate-900">
                  CreatorPay<span className="text-brand-600">.AI</span>
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  Track 2: Merchant Solutions
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Studio: <strong className="text-slate-800">Apex Media LLC</strong> (1.6M Creators)
              </p>
            </div>
          </div>

          {/* Right Status Actions */}
          <div className="flex items-center space-x-3">
            {/* Live Sandbox Status Pill */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>PayPal Sandbox Connected:</span>
              <span className="font-mono text-emerald-700 max-w-[190px] truncate" title={sandboxAccount}>
                {sandboxAccount}
              </span>
            </div>

            {/* Reset Demo */}
            <button
              onClick={onReset}
              disabled={isResetting}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-200 disabled:opacity-50 cursor-pointer"
              title="Reset portfolio state"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset</span>
            </button>

            {/* GitHub */}
            <a
              href="https://github.com/ius-sharma/CreatorPay-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/20"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Lower Row: 5-Tab Navigation Suite */}
        <div className="flex space-x-1 border-t border-slate-100 py-1.5 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
