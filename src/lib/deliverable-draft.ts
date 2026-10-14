export type DeliverableDraft = { transcript: string; description: string; videoUrl: string };
export const emptyDeliverableDraft: DeliverableDraft = { transcript: '', description: '', videoUrl: '' };
export function hasUnreviewedDraft(draft: DeliverableDraft, reviewed?: DeliverableDraft) {
  return Object.values(draft).some(Boolean) && (!reviewed ||
    draft.transcript !== reviewed.transcript || draft.description !== reviewed.description || draft.videoUrl !== reviewed.videoUrl);
}
