import { NextRequest, NextResponse } from 'next/server';
import { cloudEnabled, requireOwner, ensureWorkspace, databaseError } from '@/lib/supabase/workspace';
import { createAdminClient } from '@/lib/supabase/admin';
import { AnalysisError } from '@/lib/groq';
import { isSameOrigin } from '@/lib/request-origin';

export const dynamic = 'force-dynamic';
async function guarded(action: () => Promise<unknown>) {
  try {
    if (!cloudEnabled()) throw new AnalysisError('Workspace settings require a signed-in cloud account.', 503);
    return NextResponse.json(await action(), { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (e) {
    return NextResponse.json({ error: e instanceof AnalysisError ? e.message : e instanceof SyntaxError ? 'Invalid settings request.' : 'Could not load or save workspace settings. Please retry.' }, { status: e instanceof AnalysisError ? e.status : e instanceof SyntaxError ? 400 : 503, headers: { 'Cache-Control': 'private, no-store' } });
  }
}
export async function GET() {
  return guarded(async () => {
    const owner = await requireOwner();
    const row = await ensureWorkspace(owner);
    const now = new Date();
    const day = now.toISOString().slice(0,10);
    const { data, error } = await createAdminClient().from('creatorpay_usage').select('count').eq('owner_id', owner).eq('bucket', `user:${owner}`).eq('day', day).maybeSingle();
    if (error) databaseError(error);
    const used = data?.count || 0;
    return { name: row.workspace_name || 'Creator workspace', editable: typeof row.workspace_name === 'string', usage: { used, limit: 10, remaining: Math.max(0,10-used), resetsAt: new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()+1)).toISOString() } };
  });
}
export async function PUT(req: NextRequest) {
  return guarded(async () => {
    if (!isSameOrigin(req)) throw new AnalysisError('Cross-origin requests are not allowed.',403);
    const owner = await requireOwner();
    if (Number(req.headers.get('content-length')) > 2000) throw new AnalysisError('Settings request is too large.',413);
    const text = await req.text();
    if (text.length > 2000) throw new AnalysisError('Settings request is too large.',413);
    const input = JSON.parse(text);
    if (typeof input?.name !== 'string' || !input.name.trim() || input.name.trim().length > 80 || /[\u0000-\u001f\u007f]/.test(input.name)) throw new AnalysisError('Enter a studio name of 1–80 characters without control characters.',400);
    await ensureWorkspace(owner);
    const name = input.name.trim();
    const { error } = await createAdminClient().from('creatorpay_workspaces').update({ workspace_name: name }).eq('owner_id',owner);
    if (error) databaseError(error);
    return { name };
  });
}
