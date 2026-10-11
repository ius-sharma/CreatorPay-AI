import { createHash, randomUUID } from 'crypto';
import type { Deal } from './types';
import { AnalysisError } from './groq';

export interface DeliverableReview {
  id: string;
  transcript: string;
  description: string;
  videoUrl: string;
  checks: Array<{ requirementIndex: number; result: 'met' | 'missing' | 'uncertain'; transcriptQuote: string | null; descriptionQuote: string | null; explanation: string }>;
  verdict: 'changes_required' | 'human_review' | 'ready_for_approval';
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}
const checkProperties = {
  requirementIndex: { type: 'integer' }, result: { type: 'string', enum: ['met', 'missing', 'uncertain'] },
  transcriptQuote: { type: ['string', 'null'] }, descriptionQuote: { type: ['string', 'null'] }, explanation: { type: 'string' },
};
export const deliverableSchema = { type: 'object', additionalProperties: false, properties: {
  checks: { type: 'array', items: { type: 'object', additionalProperties: false, properties: checkProperties, required: Object.keys(checkProperties) } },
}, required: ['checks'] };
export const contractFingerprint = (deal: Deal) => createHash('sha256').update(JSON.stringify(deal.contractExtraction)).digest('hex');
export function validateDeliverableReview(raw: unknown, deal: Deal, input: { transcript: string; description: string; videoUrl: string }): DeliverableReview {
  const value = raw as { checks?: DeliverableReview['checks'] };
  const requirements = deal.contractExtraction?.deliverables || [];
  if (!value || Object.keys(value).length !== 1 || !Array.isArray(value.checks) || !requirements.length || value.checks.length !== requirements.length) throw new AnalysisError('AI returned an incomplete requirement review. Retry; no approval was saved.', 502);
  const seen = new Set<number>();
  for (const check of value.checks) {
    if (!check || Object.keys(check).sort().join(',') !== Object.keys(checkProperties).sort().join(',') || !Number.isInteger(check.requirementIndex) || !requirements[check.requirementIndex] || seen.has(check.requirementIndex) || !['met', 'missing', 'uncertain'].includes(check.result) || typeof check.explanation !== 'string' || !check.explanation.trim() || check.explanation.length > 2000) throw new AnalysisError('AI returned invalid requirement checks. Retry.', 502);
    seen.add(check.requirementIndex);
    const quotes: Array<[string | null, string]> = [[check.transcriptQuote, input.transcript], [check.descriptionQuote, input.description]];
    for (const [quote, source] of quotes) {
      if (quote !== null && (typeof quote !== 'string' || !quote.trim() || !source.includes(quote))) throw new AnalysisError('AI cited evidence that does not exist in your submission. Retry.', 502);
    }
    if (check.result === 'met' && !check.transcriptQuote && !check.descriptionQuote) throw new AnalysisError('AI marked a requirement met without evidence. Retry.', 502);
    if (check.result === 'met' && /\b\d+\s*[- ]?\s*(seconds?|secs?|minutes?|mins?)\b|\bvisual|\bon.screen|\bpublish/i.test(requirements[check.requirementIndex].requirement)) {
      check.result = 'uncertain'; check.explanation += ' Actual video duration, visuals or publication must be checked by the human reviewer.';
    }
  }
  const checks = value.checks.sort((a, b) => a.requirementIndex - b.requirementIndex);
  return { ...input, checks, id: randomUUID(), createdAt: new Date().toISOString(), verdict: checks.some(c => c.result === 'missing') ? 'changes_required' : checks.some(c => c.result === 'uncertain') ? 'human_review' : 'ready_for_approval' };
}
