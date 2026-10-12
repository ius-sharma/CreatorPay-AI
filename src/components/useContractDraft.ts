'use client';
import { useEffect, useRef, useState } from 'react';

type Draft = { prompt: string; useTeamRules: boolean };
type Saved = { draft: Draft; revision: number; savedAt: string | null };
const empty: Draft = { prompt: '', useTeamRules: false };
export function useContractDraft() {
  const [draft, setDraft] = useState<Draft>(empty);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const editVersion = useRef(0);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved?.draft || empty);
  const change = (patch: Partial<Draft>) => { editVersion.current++; setDraft(current => ({ ...current, ...patch })); };
  const load = async () => {
    if (lock.current) return false;
    lock.current = true; setBusy(true); setError('');
    const version = editVersion.current;
    try {
      const res = await fetch('/api/draft', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not load your saved draft.');
      setSaved(data);
      if (version === editVersion.current) setDraft(data.draft);
      return true;
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not load draft. Retry when connected.'); return false; }
    finally { lock.current = false; setBusy(false); }
  };
  const save = async (next: Draft = draft) => {
    if (lock.current || !saved) return false;
    lock.current = true; setBusy(true); setError('');
    try {
      const res = await fetch('/api/draft', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ draft: next, revision: saved.revision }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save your draft. Your text is still here.');
      // An edit made during a save remains dirty; never replace it with the response.
      setSaved(data);
      return true;
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save draft. Your text is still here.'); return false; }
    finally { lock.current = false; setBusy(false); }
  };
  useEffect(() => { void load(); }, []);
  useEffect(() => {
    if (!dirty && !busy) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, busy]);
  return { draft, change, saved, busy, error, dirty, load, save };
}
