'use client';
import { useEffect, useRef, useState } from 'react';
import { FileUp } from 'lucide-react';
import { readContractPdf } from '@/lib/read-contract-pdf';

export function PdfContractUpload({ value, disabled, onImport }: { value: string; disabled: boolean; onImport: (text: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [ready, setReady] = useState<{ text: string; pages: number; name: string } | null>(null);
  const [replace, setReplace] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const controller = useRef<AbortController | null>(null);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; controller.current?.abort(); }; }, []);
  const read = async (file: File) => {
    controller.current?.abort();
    const current = new AbortController(); controller.current = current;
    setBusy(true); setError(''); setReady(null); setNotice(''); setReplace(false);
    try {
      const result = await readContractPdf(file, current.signal);
      if (alive.current && controller.current === current && !current.signal.aborted) setReady({ ...result, name: file.name });
    } catch (e) {
      if (alive.current && controller.current === current && !current.signal.aborted) setError(e instanceof Error ? e.message : 'Could not read this PDF.');
    } finally {
      if (alive.current && controller.current === current) { setBusy(false); if (input.current) input.current.value = ''; }
    }
  };
  const apply = () => {
    if (!ready || disabled) return;
    if (value.trim() && !replace) { setReplace(true); return; }
    onImport(ready.text);
    setNotice(`Imported ${ready.pages} page${ready.pages === 1 ? '' : 's'}. Check the text below before analyzing.`);
    setReady(null); setReplace(false);
  };
  return <div aria-busy={busy} className="mt-5 rounded-lg border border-slate-200 p-4">
    <label className="flex items-center gap-2 text-sm font-semibold"><FileUp size={16}/>Import contract PDF
      <input ref={input} tabIndex={-1} type="file" accept=".pdf,application/pdf" disabled={disabled || busy} onChange={e => { const file = e.target.files?.[0]; if (file) void read(file); }} className="sr-only"/>
    </label>
    <p className="mt-2 text-xs leading-6 text-slate-500">Text-based PDF · up to 5 MB and 20 pages · 12,000 characters. Read locally in your browser. Only the imported text is sent to AI when you analyze. Editing the imported text removes its PDF page references.</p>
    <div className="mt-3 flex flex-wrap items-center gap-3"><button type="button" disabled={disabled || busy} onClick={() => input.current?.click()} className="ui-button ui-button-secondary">{busy ? 'Reading PDF…' : 'Choose PDF'}</button>{busy && <button type="button" className="ui-button ui-button-secondary" onClick={() => { controller.current?.abort(); setBusy(false); setNotice('Import cancelled. Your contract text is unchanged.'); }}>Cancel import</button>}</div>
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error} Your current text is unchanged.</p>}
    {notice && <p role="status" className="mt-3 text-sm text-slate-600">{notice}</p>}
    {ready && <div className="mt-4 space-y-3"><p role="status" className="break-words text-sm">{ready.name} · {ready.pages} pages · {ready.text.length.toLocaleString()} characters</p><details><summary className="cursor-pointer text-sm text-brand-700">Preview extracted text</summary><pre className="mt-2 max-h-56 overflow-y-auto whitespace-pre-wrap break-words text-xs leading-6">{ready.text}</pre></details>{replace && <p className="text-sm text-amber-800">This will replace your current contract text. Save or copy it first if you want to keep it.</p>}<div className="flex flex-wrap gap-3"><button type="button" disabled={disabled} className="ui-button" onClick={apply}>{replace ? 'Replace current text' : 'Use extracted text'}</button><button type="button" className="ui-button ui-button-secondary" onClick={() => { setReady(null); setReplace(false); }}>Discard import</button></div></div>}
  </div>;
}
