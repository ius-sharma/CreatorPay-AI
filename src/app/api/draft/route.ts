import { NextRequest, NextResponse } from 'next/server';
import { requireOwner, ensureWorkspace, databaseError, cloudEnabled } from '@/lib/supabase/workspace';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSameOrigin } from '@/lib/request-origin';
import { AnalysisError } from '@/lib/groq';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
function json(value: unknown, status = 200) { return NextResponse.json(value, { status, headers: { 'Cache-Control': 'private, no-store' } }); }
async function guarded(action: () => Promise<unknown>) {
  try {
    if (!cloudEnabled()) throw new AnalysisError('Draft storage requires a signed-in cloud workspace.', 503);
    return json(await action());
  } catch (error) {
    return json({ error: error instanceof AnalysisError ? error.message : error instanceof SyntaxError ? 'Invalid draft request.' : 'Draft could not be saved or loaded. Your current text is unchanged.' }, error instanceof AnalysisError ? error.status : error instanceof SyntaxError ? 400 : 503);
  }
}
export async function GET() {
  return guarded(async () => {
    const row = await ensureWorkspace(await requireOwner());
    if (row.draft_revision === undefined) throw new AnalysisError('Draft storage setup is pending. Keep this page open until setup is complete.', 503);
    return { draft: row.contract_draft, revision: row.draft_revision, savedAt: row.draft_saved_at };
  });
}
export async function PUT(req: NextRequest) {
  return guarded(async () => {
    if (!isSameOrigin(req)) throw new AnalysisError('Cross-origin requests are not allowed.', 403);
    const owner = await requireOwner();
    if (Number(req.headers.get('content-length')) > 80000) throw new AnalysisError('Draft is too large.', 413);
    const text = await req.text();
    if (text.length > 80000) throw new AnalysisError('Draft is too large.', 413);
    const input = JSON.parse(text);
    if (!input || !Number.isSafeInteger(input.revision) || input.revision < 0 || typeof input.draft?.prompt !== 'string' || input.draft.prompt.length > 12000 || typeof input.draft.useTeamRules !== 'boolean') throw new AnalysisError('Invalid contract draft.', 400);
    await ensureWorkspace(owner);
    const { data, error } = await createAdminClient().rpc('creatorpay_save_draft', { p_owner: owner, p_revision: input.revision, p_draft: { prompt: input.draft.prompt, useTeamRules: input.draft.useTeamRules } });
    if (error?.code === '40001') throw new AnalysisError('Draft changed in another tab. Copy any edits you want to keep, then load the saved draft.', 409);
    if (error) databaseError(error);
    return data;
  });
}
