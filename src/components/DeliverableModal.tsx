'use client';

import React, { useState } from 'react';
import { X, Sparkles, Video, Upload, Link2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-brand-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-4">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-600 border border-brand-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">AI Deliverable Verification</h2>
            <p className="text-xs text-slate-500">Autonomous Compliance & Sponsor Criteria Check</p>
          </div>
        </div>

        {/* Required Criteria Notice */}
        <div className="mb-4 p-3.5 rounded-2xl bg-brand-50/60 border border-brand-200 text-xs">
          <p className="font-bold text-brand-900 mb-1">Contract Verification Criteria:</p>
          <ul className="space-y-1.5 text-slate-700 text-[11px]">
            <li className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
              <span>Sponsor Hashtag: <code className="text-brand-700 font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-brand-200">{deliverable.requiredSponsorTag}</code></span>
            </li>
            <li className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
              <span>Discount Deal Link: <code className="text-brand-700 font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-brand-200">{deliverable.requiredLink}</code></span>
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center space-x-1.5">
              <Video className="w-3.5 h-3.5 text-brand-600" />
              <span>Deliverable Video URL (YouTube / Drive)</span>
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              required
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center space-x-1.5">
              <Link2 className="w-3.5 h-3.5 text-brand-600" />
              <span>Description & Timestamp Notes</span>
            </label>
            <textarea
              value={proofText}
              onChange={(e) => setProofText(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white resize-none"
            />
          </div>

          {/* Proof File Drop Simulation */}
          <div className="border border-dashed border-slate-200 rounded-xl p-3 text-center bg-slate-50/70">
            <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
            <p className="text-[11px] text-slate-600">
              Optional Proof Attachment: <span className="text-emerald-700 font-mono font-bold">sponsor_proof_verified.png</span>
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/25 disabled:opacity-50 cursor-pointer"
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
