import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { extractContract, AnalysisError } from '@/lib/groq';
import { reviewContract } from '@/lib/contract';
import { getSession, reserveAnalysis, seal } from '@/lib/analysis-session';
import type { TeamSplit } from '@/lib/types';
import { isSameOrigin } from '@/lib/request-origin';

export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  const session = getSession(req.cookies.get('creatorpay-analysis')?.value);
  let result: NextResponse;
  try {
    if (!isSameOrigin(req)) throw new AnalysisError('Cross-origin analysis requests are not allowed.', 403);
    const text = await req.text();
    if (text.length > 30000) throw new AnalysisError('Request is too large.', 413);
    const body = JSON.parse(text);
    if (typeof body.prompt !== 'string' || body.prompt.trim().length < 20 || body.prompt.length > 12000) throw new AnalysisError('Paste a contract between 20 and 12,000 characters.', 400);
    const splits = body.customSplits ?? [];
    if (!Array.isArray(splits) || splits.length > 20 || splits.some((s: TeamSplit) => !s || typeof s.name !== 'string' || typeof s.email !== 'string' || typeof s.role !== 'string' || !['fixed', 'percentage'].includes(s.type) || typeof s.value !== 'number')) throw new AnalysisError('Invalid saved team rules.', 400);
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.startsWith('your_')) throw new AnalysisError('Groq is not configured. Add GROQ_API_KEY to .env.local and restart the app.', 503);
    reserveAnalysis(session.id);
    const extraction = await extractContract(body.prompt);
    const review = reviewContract(extraction, body.prompt, splits);
    const token = seal({ extraction, prompt: body.prompt, splits, session: session.id, expires: Date.now() + 1800000, id: `deal-${randomUUID()}` });
    result = NextResponse.json({ success: true, review, token });
  } catch (error) {
    const known = error instanceof AnalysisError;
    result = NextResponse.json({ success: false, error: known ? error.message : error instanceof SyntaxError ? 'Invalid request JSON.' : 'Contract analysis could not be validated. Please retry.' }, { status: known ? error.status : error instanceof SyntaxError ? 400 : 502 });
  }
  result.cookies.set('creatorpay-analysis', session.cookie, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 86400 });
  result.headers.set('Cache-Control', 'no-store');
  return result;
}
