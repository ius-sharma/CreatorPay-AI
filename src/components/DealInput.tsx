'use client';

import React, { useState } from 'react';
import { Sparkles, Send, Users } from 'lucide-react';
import { TeamSplit } from '@/lib/types';

interface DealInputProps {
  onSubmit: (prompt: string, splits: TeamSplit[]) => void;
  splits: TeamSplit[];
  onUpdateSplits: (splits: TeamSplit[]) => void;
  isLoading: boolean;
}

const PRESETS = [
  {
    label: 'CloudHost $2,000 Deal (30% Advance)',
    prompt:
      'Brand CloudHost offers $2,000 for a 60-second video integration. 30% ($600) advance milestone invoice, 70% ($1,400) upon video deliverable. Disburse team cuts automatically.',
  },
  {
    label: 'NordVPN $4,500 Multi-Milestone Deal',
    prompt:
      'Brand NordVPN contract approved for $4,500 sponsorship. Send 25% ($1,125) upfront milestone invoice to sponsorships@nordvpn.com. Remaining 75% on live YouTube video.',
  },
  {
    label: 'Shopify $3,000 50/50 Partnership',
    prompt:
      'Brand Shopify partnership for $3,000 total. 50% ($1,500) deposit advance invoice now. Final 50% upon publication. Automatically split 15% to editor and $50 to designer.',
  },
];

export const DealInput: React.FC<DealInputProps> = ({
  onSubmit,
  splits,
  onUpdateSplits,
  isLoading,
}) => {
  const [prompt, setPrompt] = useState(PRESETS[0].prompt);
  const [showSplitsEditor, setShowSplitsEditor] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSubmit(prompt, splits);
  };

  return (
    <div className="bg-white border border-brand-100 rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-brand-50 text-brand-600 border border-brand-200">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-slate-900 text-sm">Deal Command Center</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowSplitsEditor(!showSplitsEditor)}
          className="flex items-center space-x-1.5 text-xs text-brand-700 hover:text-brand-800 font-semibold cursor-pointer"
        >
          <Users className="w-3.5 h-3.5" />
          <span>{showSplitsEditor ? 'Hide Team Rules' : 'Team Rules (Aman 15%, Rohan $50)'}</span>
        </button>
      </div>

      {/* Preset Pills */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {PRESETS.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setPrompt(p.prompt)}
            className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 border border-slate-200 hover:border-brand-200 transition-colors cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Splits Rule Drawer */}
      {showSplitsEditor && (
        <div className="mb-4 p-3.5 rounded-xl bg-brand-50/50 border border-brand-200 text-xs">
          <p className="font-bold text-slate-800 mb-2">Team Revenue Split Guardrails (Phase 0)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {splits.map((split) => (
              <div key={split.id} className="p-2.5 rounded-lg bg-white border border-brand-100 flex items-center justify-between shadow-2xs">
                <div>
                  <p className="font-semibold text-slate-900">{split.name} <span className="text-slate-500 font-normal">({split.role})</span></p>
                  <p className="text-[10px] text-slate-400 font-mono">{split.email}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-brand-700 text-sm">
                    {split.type === 'percentage' ? `${split.value}%` : `\$${split.value}`}
                  </span>
                  <p className="text-[10px] text-slate-400 capitalize">{split.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="Drop contract terms or email (e.g. '$2,000 deal with CloudHost, 30% advance, rest upon video live')..."
            className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white resize-none leading-relaxed transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="absolute bottom-3 right-3 flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-600/25 disabled:opacity-50 transition-all cursor-pointer"
          >
            <span>{isLoading ? 'Analyzing...' : 'Parse & Execute Deal'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
