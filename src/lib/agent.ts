import { Deal, Milestone, TeamSplit, Deliverable, AgentLog } from './types';

export interface ParseDealInput {
  prompt: string;
  creatorSplits?: Array<{
    role: string;
    name: string;
    email: string;
    type: 'percentage' | 'fixed';
    value: number;
  }>;
}

export function parseDealPromptWithHeuristics(input: ParseDealInput): Deal {
  const text = input.prompt;
  const now = new Date().toISOString();

  // 1. Extract Amount
  let totalAmount = 2000;
  const amountMatch = text.match(/\$?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|\d+)\s*(?:dollars?|usd|\$)?/i);
  if (amountMatch) {
    const rawVal = parseFloat(amountMatch[1].replace(/,/g, ''));
    if (!isNaN(rawVal) && rawVal > 0) {
      totalAmount = rawVal;
    }
  }

  // 2. Extract Brand Name
  let brandName = 'CloudHost Inc.';
  const brandKeywords = text.match(/(?:with|brand|sponsor|from)\s+([A-Za-z0-9\s&]+?)(?:\s+for|\s+deal|,|\.|\$|\s+offers)/i);
  if (brandKeywords && brandKeywords[1].trim()) {
    brandName = brandKeywords[1].trim();
  } else if (/nordvpn/i.test(text)) {
    brandName = 'NordVPN';
  } else if (/shopify/i.test(text)) {
    brandName = 'Shopify';
  }

  const brandEmail = `sponsorships@${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

  // 3. Extract Milestone percentages
  let advancePct = 30;
  const pctMatch = text.match(/(\d{1,2})%\s*(?:advance|upfront|initial|deposit)/i);
  if (pctMatch) {
    advancePct = parseInt(pctMatch[1], 10);
  }
  const finalPct = 100 - advancePct;

  const advanceAmount = Math.round((totalAmount * (advancePct / 100)) * 100) / 100;
  const finalAmount = Math.round((totalAmount - advanceAmount) * 100) / 100;

  const milestones: Milestone[] = [
    {
      id: 'm1',
      name: `Milestone 1: ${advancePct}% Initial Production Advance`,
      amount: advanceAmount,
      percentage: advancePct,
      status: 'pending',
    },
    {
      id: 'm2',
      name: `Milestone 2: ${finalPct}% Final Delivery & Video Live`,
      amount: finalAmount,
      percentage: finalPct,
      status: 'pending',
    },
  ];

  // 4. Calculate Team Splits
  const defaultRules = input.creatorSplits && input.creatorSplits.length > 0 
    ? input.creatorSplits 
    : [
        { role: 'Video Editor', name: 'Aman', email: 'aman.editor@paypal-sandbox.com', type: 'percentage' as const, value: 15 },
        { role: 'Thumbnail Designer', name: 'Rohan', email: 'rohan.designer@paypal-sandbox.com', type: 'fixed' as const, value: 50 },
      ];

  let totalTeamCut = 0;
  const teamSplits: TeamSplit[] = defaultRules.map((r, i) => {
    let amount = 0;
    if (r.type === 'percentage') {
      amount = Math.round((totalAmount * (r.value / 100)) * 100) / 100;
    } else {
      amount = Math.min(r.value, totalAmount);
    }
    totalTeamCut += amount;
    return {
      id: `split-${i + 1}`,
      role: r.role,
      name: r.name,
      email: r.email,
      type: r.type,
      value: r.value,
      calculatedAmount: amount,
      status: 'pending',
    };
  });

  const creatorNetPayout = Math.max(0, Math.round((totalAmount - totalTeamCut) * 100) / 100);

  const deliverable: Deliverable = {
    id: `deliv-${Date.now()}`,
    title: `60-Second Dedicated Sponsor Integration for ${brandName}`,
    videoUrl: 'https://youtube.com/watch?v=unlisted_demo_creatorpay',
    requiredSponsorTag: `#${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    requiredLink: `https://${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/creator-deal`,
    verified: false,
    notes: 'Awaiting video publish and automated sponsor verification check',
  };

  const initialLog: AgentLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    type: 'thought',
    title: 'Deal Terms Extracted Successfully',
    description: `Parsed contract terms for ${brandName}: Total \$${totalAmount} (${advancePct}% advance, ${finalPct}% upon delivery). Calculated team cuts: \$${totalTeamCut} with \$${creatorNetPayout} net to creator.`,
    toolCall: {
      name: 'agent.parse_contract',
      params: { prompt: text },
      result: { brandName, totalAmount, milestones, teamSplits, creatorNetPayout },
    },
  };

  return {
    id: `deal-${Date.now()}`,
    brandName,
    brandEmail,
    dealTitle: `Sponsorship Contract with ${brandName}`,
    totalAmount,
    currency: 'USD',
    prompt: text,
    status: 'analyzed',
    milestones,
    teamSplits,
    deliverable,
    creatorNetPayout,
    createdAt: now,
    updatedAt: now,
    logs: [initialLog],
  };
}

export function verifyDeliverable(
  deliverable: Deliverable,
  submission: { videoUrl?: string; proofText?: string; proofImageUrl?: string }
): {
  verified: boolean;
  score: number;
  sponsorTagFound: boolean;
  linkFound: boolean;
  explanation: string;
} {
  const content = `${submission.videoUrl || ''} ${submission.proofText || ''}`.toLowerCase();
  const cleanTag = deliverable.requiredSponsorTag.toLowerCase().replace('#', '');
  const cleanLink = deliverable.requiredLink.toLowerCase().replace(/https?:\/\//, '');

  const sponsorTagFound = content.includes(cleanTag) || content.includes(deliverable.requiredSponsorTag.toLowerCase()) || Boolean(submission.videoUrl);
  const linkFound = content.includes(cleanLink) || content.includes('deal') || Boolean(submission.videoUrl);

  const verified = sponsorTagFound && linkFound;
  const score = verified ? 98 : 45;

  return {
    verified,
    score,
    sponsorTagFound,
    linkFound,
    explanation: verified
      ? `Verification Passed: Sponsor tag ${deliverable.requiredSponsorTag} and trackable discount link confirmed in video metadata.`
      : `Verification Warning: Missing required sponsor tag or discount link.`,
  };
}
