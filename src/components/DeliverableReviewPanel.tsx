'use client';
import { useState } from 'react';
import type { Deal } from '@/lib/types';
export function DeliverableReviewPanel({ deal, onChange }: { deal: Deal; onChange: (deal: Deal) => void }) {
  const latest = deal.deliverableReviews?.[0];
  const [transcript, setTranscript] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const request = async (action: 'review' | 'approve') => {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/agent/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dealId: deal.id, action, transcript, description, videoUrl, reviewId: latest?.id, confirmEvidence: confirmed }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Review failed.');
      onChange(data.deal); setConfirmed(false);
    } catch (e) { setError(e instanceof Error ? e.message : 'Review failed.'); }
    finally { setBusy(false); }
  };
  if (!deal.contractExtraction || deal.demo) return null;
  return <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
    <h2 className="text-sm font-semibold">Deliverable evidence review</h2>
    <p className="text-sm text-slate-600">Groq checks your pasted transcript and description against the contract. The video URL is a reference only: AI does not watch the video or verify its duration, visuals, publication or authenticity. Actual video checks require human approval.</p>
    {!deal.milestones[0]?.paymentVerifiedAt ? <p className="text-sm">Unlocks after a verified advance payment.</p> : <>
      {!latest?.approvedAt && <form className="space-y-3" onSubmit={e => { e.preventDefault(); request('review'); }}>
        <label className="block text-sm">Video reference URL (optional)<input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} maxLength={2000} className="mt-2 block w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" placeholder="https://..." /></label>
        <label className="block text-sm">Actual video transcript<textarea required minLength={20} maxLength={20000} rows={7} value={transcript} onChange={e => setTranscript(e.target.value)} className="mt-2 block w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" /></label>
        <label className="block text-sm">Published description / links<textarea maxLength={5000} rows={3} value={description} onChange={e => setDescription(e.target.value)} className="mt-2 block w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" /></label>
        <p className="text-xs text-slate-500">Text is sent to Groq. Reviews share the contract analysis usage limits. Previous reviews are retained; only the latest can be approved.</p>
        <button disabled={busy} className="bg-brand-600 text-white rounded-lg px-3 py-2 disabled:opacity-50">{busy ? 'Reviewing...' : latest ? 'Review corrected submission' : 'Review with Groq'}</button>
      </form>}
      {latest && <div className="space-y-3 border-t pt-3"><p className="font-semibold">{latest.approvedAt ? 'Human approved' : latest.verdict.replaceAll('_', ' ')}</p>
        {latest.checks.map(check => <div key={check.requirementIndex} className="border rounded-lg p-3 text-sm space-y-1"><p className="font-semibold">{deal.contractExtraction!.deliverables[check.requirementIndex]?.requirement}: {check.result}</p><blockquote className="text-slate-500">Contract: {deal.contractExtraction!.deliverables[check.requirementIndex]?.evidence}</blockquote>{check.transcriptQuote && <blockquote className="border-l-2 pl-2">Transcript: {check.transcriptQuote}</blockquote>}{check.descriptionQuote && <blockquote className="border-l-2 pl-2">Description: {check.descriptionQuote}</blockquote>}<p>{check.explanation}</p></div>)}
        {!latest.approvedAt && latest.verdict !== 'changes_required' && <><label className="flex gap-2 text-sm"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />I personally checked the actual video, duration, visuals and every contract requirement, including uncertain checks.</label><button disabled={busy || !confirmed} onClick={() => request('approve')} className="bg-emerald-700 text-white rounded-lg px-3 py-2 disabled:opacity-50">Approve deliverable & unlock final invoice</button></>}
        {latest.verdict === 'changes_required' && <p className="text-sm text-red-700">Approval blocked. Correct the missing requirements and submit a new review.</p>}
        <details className="text-xs"><summary>Reviewed submission and history ({deal.deliverableReviews?.length})</summary>{deal.deliverableReviews?.map(r => <div className="border-t py-2" key={r.id}><p>{r.createdAt}: {r.verdict}{r.approvedAt ? ' — human approved' : ''}</p><pre className="whitespace-pre-wrap">{r.transcript}</pre><p>{r.description}</p></div>)}</details>
      </div>}
    </>}
    {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
  </section>;
}
