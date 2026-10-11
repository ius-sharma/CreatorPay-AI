import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'crypto';
import { AnalysisError } from './groq';

// Development guardrails only: replace with authenticated, durable quotas before public deployment.
const state = globalThis as typeof globalThis & { __analysisState?: { secret: string; quotas: Map<string, { count: number; last: number; day: string }> } };
const shared = state.__analysisState ||= { secret: process.env.CONTRACT_SIGNING_SECRET || randomBytes(32).toString('hex'), quotas: new Map() };
const sign = (value: string) => createHmac('sha256', shared.secret).update(value).digest('base64url');
export function seal(value: unknown): string {
  const encoded = Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}
export function unseal<T>(token: string): T {
  if (typeof token !== 'string' || token.length > 150000) throw new AnalysisError('Invalid review. Analyse the contract again.', 400);
  const [encoded, signature, extra] = token.split('.');
  const expected = Buffer.from(sign(encoded || ''));
  const supplied = Buffer.from(signature || '');
  if (extra || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) throw new AnalysisError('Review could not be verified. Analyse the contract again.', 400);
  try { return JSON.parse(Buffer.from(encoded, 'base64url').toString()); }
  catch { throw new AnalysisError('Invalid review. Analyse the contract again.', 400); }
}
export function getSession(cookie: string | undefined): { id: string; cookie: string } {
  if (cookie) {
    try {
      const session = unseal<{ id: string; expires: number }>(cookie);
      if (session.expires > Date.now() && typeof session.id === 'string') return { id: session.id, cookie };
    } catch { /* Invalid or expired cookie receives a fresh demo session. */ }
  }
  const id = randomUUID();
  return { id, cookie: seal({ id, expires: Date.now() + 86400000 }) };
}
export function reserveAnalysis(id: string): void {
  const now = Date.now();
  const day = new Date().toISOString().slice(0, 10);
  shared.quotas.forEach((value, key) => { if (value.day !== day) shared.quotas.delete(key); });
  const user = shared.quotas.get(id) || { count: 0, last: 0, day };
  const total = shared.quotas.get('__total') || { count: 0, last: 0, day };
  if (user.count >= 10) throw new AnalysisError('This demo session has reached 10 analyses today. Try again after 00:00 UTC.', 429);
  if (now - user.last < 10000) throw new AnalysisError('Please wait 10 seconds between analyses.', 429);
  if (total.count >= 100) throw new AnalysisError('The server demo budget of 100 analyses today is exhausted. Try again after 00:00 UTC.', 429);
  shared.quotas.set(id, { count: user.count + 1, last: now, day });
  shared.quotas.set('__total', { count: total.count + 1, last: now, day });
}
