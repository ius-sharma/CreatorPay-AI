'use client';
import { useState } from 'react';
import type { useContractDraft } from './useContractDraft';

export function DraftToolbar({ draft, disabled, onReload }: { draft: ReturnType<typeof useContractDraft>; disabled: boolean; onReload: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const reload = async () => { if (await draft.load()) onReload(); setConfirm(false); };
  return <section aria-label="Contract draft" className="contract-approval !mt-0">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h3>Contract draft</h3><p role="status">{draft.busy ? 'Syncing draft…' : draft.dirty ? 'Unsaved changes — save before closing this page.' : draft.saved?.savedAt ? `Saved to your account · ${new Date(draft.saved.savedAt).toLocaleString()}` : 'One draft per account. Save your text to continue later.'}</p></div>
      <div className="contract-approval-actions !mt-0"><button disabled={disabled || draft.busy || !draft.saved || !draft.dirty} onClick={() => void draft.save()}>Save draft</button><button disabled={disabled || draft.busy} onClick={() => draft.dirty ? setConfirm(true) : void reload()}>{draft.saved ? 'Load saved draft' : 'Retry draft connection'}</button></div>
    </div>
    {draft.error && <p role="alert" className="mt-3 text-red-700">{draft.error}</p>}
    {confirm && <div className="contract-issues"><p>Replace your current text with the saved draft? Copy any unsaved edits you want to keep first.</p><div className="contract-approval-actions"><button disabled={draft.busy} onClick={() => void reload()}>Replace with saved draft</button><button onClick={() => setConfirm(false)}>Keep editing</button></div></div>}
  </section>;
}
