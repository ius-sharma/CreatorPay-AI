'use client';

import React from 'react';
import { Bot, RotateCcw, ExternalLink } from 'lucide-react';

interface NavbarProps {
  sandboxAccount: string;
  onReset: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ sandboxAccount, onReset, isResetting }) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-brand-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-brand-400 flex items-center justify-center shadow-md shadow-brand-600/25">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                CreatorPay<span className="text-brand-600">.AI</span>
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                Autonomous Dealmaker
              </span>
            </div>
            <p className="text-xs text-slate-500">PayPal AI Hackathon 2026 • Track 2: Merchant Solutions</p>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center space-x-3">
          {/* Live Sandbox Badge */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-800 font-semibold">Sandbox Live:</span>
            <span className="font-mono text-emerald-700 truncate max-w-[210px]" title={sandboxAccount}>
              {sandboxAccount}
            </span>
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={onReset}
            disabled={isResetting}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-200 disabled:opacity-50 cursor-pointer"
            title="Reset to fresh demo state"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo</span>
          </button>

          {/* GitHub Repo */}
          <a
            href="https://github.com/ius-sharma/CreatorPay-AI"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-all shadow-md shadow-brand-600/20"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
};
