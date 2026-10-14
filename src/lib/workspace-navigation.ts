export const workspaceViews = ['overview', 'deals', 'detail', 'new', 'invoicing', 'splits', 'audit', 'diagnostics'] as const;
export type WorkspaceView = typeof workspaceViews[number];
export const dealSections = ['contract', 'invoices', 'deliverable', 'settlement', 'activity'] as const;
export type DealSection = typeof dealSections[number];
export function readDealSection(search: string): DealSection | null {
  const params = new URLSearchParams(search);
  const section = params.get('section');
  return params.get('view') === 'detail' && params.get('deal') && dealSections.includes(section as DealSection) ? section as DealSection : null;
}
export function readWorkspaceLocation(search: string): { view: WorkspaceView; dealId: string | null } {
  const params = new URLSearchParams(search);
  const requested = params.get('view');
  const view = workspaceViews.includes(requested as WorkspaceView) ? requested as WorkspaceView : 'overview';
  const dealId = params.get('deal');
  if (view === 'detail' && !dealId) return { view: 'deals', dealId: null };
  return { view, dealId: view === 'detail' ? dealId : null };
}
export function workspaceUrl(view: WorkspaceView, dealId?: string | null, section?: DealSection | null) {
  const params = new URLSearchParams({ view: view === 'detail' && !dealId ? 'deals' : view });
  if (view === 'detail' && dealId) params.set('deal', dealId);
  if (view === 'detail' && dealId && section) params.set('section', section);
  return `/dashboard?${params.toString()}`;
}
