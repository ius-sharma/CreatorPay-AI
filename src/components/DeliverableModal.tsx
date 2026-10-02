'use client';

import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, Video, Upload, Link2, ShieldAlert } from 'lucide-react';
import { Deliverable } from '@/lib/types';

interface DeliverableModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliverable: Deliverable;
  onVerify: (data: { videoUrl: string; proofText: string }) => void;
  isLoading: boolean;
}

export const DeliverableModal: React.FC<DeliverableModalProps> = ({
  isOpen,
  onClose,
  deliverable,
  onVerify,
  isLoading,
}) => {
  const [videoUrl, setVideoUrl] = useState(
    deliverable.videoUrl || 'https://youtube.com/watch?v=unlisted_demo_creatorpay'
  );
  const [proofText, setProofText] = useState(
    `Video live! Includes 60s sponsor segment at 02:15 with tag ${deliverable.requiredSponsorTag} and trackable link ${deliverable.requiredLink} in the description.`
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify({ videoUrl, proofText });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">AI Deliverable Verification</h2>
            <p className="text-xs text-slate-400">Autonomous Compliance & Sponsor Criteria Check</p>
          </div>
        </div>

        {/* Required Criteria Notice */}
        <div className="mb-4 p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs">
          <p className="font-semibold text-purple-300 mb-1">Contract Verification Criteria:</p>
          <ul className="space-y-1 text-slate-300 text-[11px]">
            <li className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>Sponsor Hashtag: <code className="text-purple-300 font-mono">{deliverable.requiredSponsorTag}</code></span>
            </li>
            <li className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>Discount Deal Link: <code className="text-purple-300 font-mono">{deliverable.requiredLink}</code></span>
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <Video className="w-3.5 h-3.5 text-sky-400" />
              <span>Deliverable Video URL (YouTube / Drive)</span>
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              required
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <Link2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Description & Timestamp Notes</span>
            </label>
            <textarea
              value={proofText}
              onChange={(e) => setProofText(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Proof File Drop Simulation */}
          <div className="border border-dashed border-slate-800 rounded-xl p-3 text-center bg-slate-950/40">
            <Upload className="w-5 h-5 text-slate-500 mx-auto mb-1" />
            <p className="text-[11px] text-slate-400">
              Optional: Screenshot / Sponsor Sign-off PDF attached (<span className="text-emerald-400 font-mono">sponsor_proof_verified.png</span>)
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Verifying with AI...' : 'Run Autonomous AI Verification'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
