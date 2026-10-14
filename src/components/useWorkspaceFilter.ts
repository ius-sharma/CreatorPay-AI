 'use client';
import { useEffect, useState } from 'react';
export function useWorkspaceFilter(key: string, fallback: string, allowed?: readonly string[]) {
  const [value, setValue] = useState(fallback);
  const allowedKey = allowed?.join('|');
  useEffect(() => {
    const read = () => {
      const next = new URLSearchParams(window.location.search).get(key);
      setValue(next !== null && (!allowedKey || allowedKey.split('|').includes(next)) ? next.slice(0, 200) : fallback);
    };
    read(); window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, [key, fallback, allowedKey]);
  const update = (next: string) => {
    next = next.slice(0, 200);
    setValue(next);
    const url = new URL(window.location.href);
    if (next === fallback) url.searchParams.delete(key); else url.searchParams.set(key, next);
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
  };
  return [value, update] as const;
}
