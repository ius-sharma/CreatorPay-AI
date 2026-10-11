import type { Deal, TeamSplit } from './types';

export interface Sourced<T> { value: T | null; evidence: string | null }
export interface ContractExtraction {
  brandName: Sourced<string>;
  brandEmail: Sourced<string>;
  totalAmount: Sourced<number>;
  currency: Sourced<string>;
  deadline: Sourced<string>;
  milestones: Array<{ name: string; amount: number | null; percentage: number | null; evidence: string }>;
  deliverables: Array<{ requirement: string; evidence: string }>;
  teamSplits: Array<{ name: string | null; role: string; email: string | null; type: 'percentage' | 'fixed'; value: number; evidence: string }>;
  conflicts: string[];
}
export interface ContractReview {
  extraction: ContractExtraction;
  issues: string[];
  calculatedMilestones: Array<{ name: string; amount: number; percentage: number }>;
  calculatedSplits: TeamSplit[];
  creatorNet: number;
}

const object = (properties: Record<string, unknown>) => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
const nullableString = { type: ['string', 'null'] };
const nullableNumber = { type: ['number', 'null'] };
const sourced = (value: unknown) => object({ value, evidence: nullableString });
export const contractSchema = object({
  brandName: sourced(nullableString), brandEmail: sourced(nullableString),
  totalAmount: sourced(nullableNumber), currency: sourced(nullableString), deadline: sourced(nullableString),
  milestones: { type: 'array', items: object({ name: { type: 'string' }, amount: nullableNumber, percentage: nullableNumber, evidence: { type: 'string' } }) },
  deliverables: { type: 'array', items: object({ requirement: { type: 'string' }, evidence: { type: 'string' } }) },
  teamSplits: { type: 'array', items: object({ name: nullableString, role: { type: 'string' }, email: nullableString, type: { type: 'string', enum: ['percentage', 'fixed'] }, value: { type: 'number' }, evidence: { type: 'string' } }) },
  conflicts: { type: 'array', items: { type: 'string' } },
});

// Runtime validation is independent of the provider's structured-output guarantee.
function checkSchema(value: unknown, schema: any, path = 'contract'): void {
  const types = Array.isArray(schema.type) ? schema.type : [schema.type];
  const actual = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
  if (!types.includes(actual) || (actual === 'number' && !Number.isFinite(value))) throw new Error(`Invalid AI response at ${path}. Please retry.`);
  if (schema.enum && !schema.enum.includes(value)) throw new Error(`Invalid AI response at ${path}.`);
  if (actual === 'object') {
    const record = value as Record<string, unknown>;
    if (Object.keys(record).some(key => !Object.hasOwn(schema.properties, key))) throw new Error(`Unexpected AI field at ${path}.`);
    for (const key of schema.required) checkSchema(record[key], schema.properties[key], `${path}.${key}`);
  }
  if (actual === 'array') {
    if ((value as unknown[]).length > 50) throw new Error('AI returned too many contract terms.');
    (value as unknown[]).forEach((entry, i) => checkSchema(entry, schema.items, `${path}[${i}]`));
  }
  if (actual === 'string' && (value as string).length > 4000) throw new Error('AI returned an oversized contract term.');
}
const emailValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const cents = (value: number) => Math.round(value * 100);
const validMoney = (value: number) => Number.isFinite(value) && value > 0 && value <= 1_000_000 && Math.abs(value * 100 - cents(value)) < 0.00001;
const numberInQuote = (value: number, quote: string | null) => Boolean(quote && (quote.match(/\d+(?:,\d{3})*(?:\.\d+)?/g) || []).some(number => Number(number.replace(/,/g, '')) === value));

export function reviewContract(raw: unknown, source: string, roster: TeamSplit[] = []): ContractReview {
  checkSchema(raw, contractSchema);
  const extraction = raw as ContractExtraction;
  const issues: string[] = [];
  const quoteValid = (quote: string | null) => Boolean(quote?.trim() && source.includes(quote));
  for (const key of ['brandName', 'brandEmail', 'totalAmount', 'currency', 'deadline'] as const) {
    const field = extraction[key];
    if (field.value === null || field.value === '') issues.push(`Missing ${key}: add it to the contract or clarification.`);
    else if (!quoteValid(field.evidence)) issues.push(`${key}: supporting text does not match the contract.`);
  }
  if (extraction.brandEmail.value && !emailValid(extraction.brandEmail.value)) issues.push('Billing email is invalid.');
  for (const key of ['brandName', 'brandEmail', 'deadline'] as const) {
    const field = extraction[key];
    if (field.value && !field.evidence?.toLowerCase().includes(field.value.toLowerCase())) issues.push(`${key}: value must appear in its supporting quote.`);
  }
  const total = extraction.totalAmount.value;
  // Independently flag conflicting explicit face-value clauses even when AI misses them.
  const totalClauses = /\b(?:offers|total(?:\s+(?:contract|amount|fee))?\s*(?:is|of|:|=)?|contract(?:\s+total)?\s*(?:is|of|:|=)?)\s+(USD|EUR|GBP|CAD|AUD|INR)\s+([0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?)/gi;
  const amountsByCurrency: Record<string, number[]> = {};
  let clause: RegExpExecArray | null;
  while ((clause = totalClauses.exec(source))) {
    const code = clause[1].toUpperCase();
    (amountsByCurrency[code] ||= []).push(Number(clause[2].replace(/,/g, '')));
  }
  if (Object.values(amountsByCurrency).some(amounts => new Set(amounts).size > 1)) issues.push('Conflicting explicit contract totals: edit the contract so only the agreed total remains, then analyse again.');
  if (total !== null && !validMoney(total)) issues.push('Total must be positive, at most 1,000,000, and have at most two decimal places.');
  if (total !== null && !numberInQuote(total, extraction.totalAmount.evidence)) issues.push('Total amount does not appear numerically in its source quote. Use an explicit numeric clarification.');
  const currencyNames: Record<string, string[]> = { USD: ['USD', 'US dollars', 'U.S. dollars'], EUR: ['EUR', 'euros'], GBP: ['GBP', 'British pounds'], CAD: ['CAD', 'Canadian dollars'], AUD: ['AUD', 'Australian dollars'], INR: ['INR', 'Indian rupees'] };
  if (extraction.currency.value && !(currencyNames[extraction.currency.value] || []).some(name => extraction.currency.evidence?.toLowerCase().includes(name.toLowerCase()))) issues.push('Currency needs an explicit currency code or name in its source quote.');
  if (extraction.currency.value && !['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR'].includes(extraction.currency.value)) issues.push('This prototype supports USD, EUR, GBP, CAD, AUD and INR only.');
  issues.push(...extraction.conflicts.map(conflict => `Resolve conflict: ${conflict}`));
  if (!extraction.milestones.length) issues.push('Payment milestones are missing.');
  const calculatedMilestones = extraction.milestones.map((m, i) => {
    if (!m.name.trim() || !quoteValid(m.evidence)) issues.push(`Milestone ${i + 1}: missing name or matching source evidence.`);
    if (m.percentage !== null && (m.percentage <= 0 || m.percentage > 100)) issues.push(`Milestone ${i + 1}: invalid percentage.`);
    if (m.amount !== null && !validMoney(m.amount)) issues.push(`Milestone ${i + 1}: invalid amount.`);
    if (m.amount !== null && !numberInQuote(m.amount, m.evidence)) issues.push(`Milestone ${i + 1}: amount does not appear in source evidence.`);
    if (m.percentage !== null && !numberInQuote(m.percentage, m.evidence)) issues.push(`Milestone ${i + 1}: percentage does not appear in source evidence.`);
    if (m.amount === null && m.percentage === null) issues.push(`Milestone ${i + 1}: specify an amount or percentage.`);
    const computed = total !== null && m.percentage !== null ? cents(total * m.percentage / 100) : null;
    if (m.amount !== null && computed !== null && cents(m.amount) !== computed) issues.push(`Milestone ${i + 1}: amount and percentage disagree.`);
    const amount = m.amount !== null ? cents(m.amount) : computed || 0;
    return { name: m.name, amount: amount / 100, percentage: m.percentage ?? (total ? amount / cents(total) * 100 : 0) };
  });
  if (total !== null && calculatedMilestones.reduce((sum, m) => sum + cents(m.amount), 0) !== cents(total)) issues.push('Milestone amounts must add up to the contract total.');
  if (!extraction.deliverables.length) issues.push('Deliverable requirements are missing.');
  extraction.deliverables.forEach((d, i) => { if (!d.requirement.trim() || !quoteValid(d.evidence)) issues.push(`Deliverable ${i + 1}: missing requirement or matching source evidence.`); });
  // Explicit contract split rules take precedence. Saved rules are never presented as AI-extracted terms.
  const rules = extraction.teamSplits.length ? extraction.teamSplits : roster;
  if (roster.length > 20) issues.push('At most 20 saved collaborators are supported.');
  const calculatedSplits: TeamSplit[] = rules.map((rule, i) => {
    if ('evidence' in rule && !quoteValid(rule.evidence)) issues.push(`Split ${i + 1}: source evidence does not match.`);
    if ('evidence' in rule && (!numberInQuote(rule.value, rule.evidence) || (rule.email && !rule.evidence.toLowerCase().includes(rule.email.toLowerCase())) || (rule.name && !rule.evidence.toLowerCase().includes(rule.name.toLowerCase())))) issues.push(`Split ${i + 1}: value or recipient does not match source evidence.`);
    if (!rule.name?.trim() || !rule.role?.trim() || !rule.email || !emailValid(rule.email)) issues.push(`Split ${i + 1}: collaborator name, role and valid email are required.`);
    if (!['percentage', 'fixed'].includes(rule.type) || !Number.isFinite(rule.value) || rule.value <= 0 || (rule.type === 'percentage' ? rule.value > 100 : !validMoney(rule.value))) issues.push(`Split ${i + 1}: invalid split value.`);
    const amount = rule.type === 'percentage' ? cents((total || 0) * rule.value / 100) : cents(rule.value);
    return { id: `split-${i + 1}`, name: rule.name || '', role: rule.role, email: rule.email || '', type: rule.type, value: rule.value, calculatedAmount: amount / 100, status: 'pending' };
  });
  const teamCents = calculatedSplits.reduce((sum, split) => sum + cents(split.calculatedAmount || 0), 0);
  if (total !== null && teamCents > cents(total)) issues.push('Collaborator splits exceed the contract total.');
  return { extraction, issues: Array.from(new Set(issues)), calculatedMilestones, calculatedSplits, creatorNet: ((total ? cents(total) : 0) - teamCents) / 100 };
}

export function dealFromReview(review: ContractReview, prompt: string, id: string): Deal {
  if (review.issues.length) throw new Error('Resolve all contract issues before confirming.');
  const e = review.extraction;
  const now = new Date().toISOString();
  return {
    id, brandName: e.brandName.value!, brandEmail: e.brandEmail.value!, totalAmount: e.totalAmount.value!, currency: e.currency.value!,
    dealTitle: `Sponsorship Contract with ${e.brandName.value}`, prompt, status: 'analyzed',
    milestones: review.calculatedMilestones.map((m, i) => ({ ...m, id: `m${i + 1}`, status: 'pending' })),
    teamSplits: review.calculatedSplits, creatorNetPayout: review.creatorNet,
    deliverable: { id: `${id}-deliverable`, title: e.deliverables.map(d => d.requirement).join('; '), requiredSponsorTag: '', requiredLink: '', verified: false, notes: `Deadline: ${e.deadline.value}` },
    contractExtraction: e, createdAt: now, updatedAt: now,
    logs: [{ id: `${id}-review`, timestamp: new Date().toLocaleTimeString(), type: 'thought', title: 'Groq contract analysis reviewed and confirmed', description: 'Terms and source evidence reviewed by the user. No invoice or payout has been executed.' }],
  };
}
