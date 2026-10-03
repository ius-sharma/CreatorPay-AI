import * as THREE from 'three';

export interface SectionConfig {
  id: string;
  name: string;
  headline: string;
  supporting: string;
  scrollRange: [number, number]; // [start, end] from 0 to 1
  cameraPos: [number, number, number];
  targetPos: [number, number, number];
  nodePos: [number, number, number];
  accent: string;
  badge: string;
}

export const SECTIONS: SectionConfig[] = [
  {
    id: 'hero',
    name: 'Hero',
    headline: 'Get paid once. Everyone gets their share.',
    supporting: 'Turn brand sponsorships into milestone payouts that auto-split to your team.',
    scrollRange: [0, 0.16],
    cameraPos: [0, 0, 7.5],
    targetPos: [0, 0, 0],
    nodePos: [0, 0, 0],
    accent: '#635bff',
    badge: '1. Split Journey',
  },
  {
    id: 'deal',
    name: 'Deal',
    headline: 'Lock in milestones before work begins',
    supporting: 'Split your contract into an advance deposit and delivery balance.',
    scrollRange: [0.16, 0.32],
    cameraPos: [2.8, -2.4, 5.8],
    targetPos: [1.2, -2.0, 0],
    nodePos: [1.2, -2.0, 0],
    accent: '#635bff',
    badge: '2. Contract Milestones',
  },
  {
    id: 'invoice',
    name: 'Invoice',
    headline: 'Send official invoices in seconds',
    supporting: 'Your brand gets a ready-to-pay PayPal invoice with your exact terms.',
    scrollRange: [0.32, 0.48],
    cameraPos: [-2.6, -5.2, 5.2],
    targetPos: [-1.0, -4.8, 0],
    nodePos: [-1.0, -4.8, 0],
    accent: '#003087',
    badge: '3. PayPal Invoicing',
  },
  {
    id: 'payment',
    name: 'Payment',
    headline: 'Know the minute funds clear',
    supporting: 'Live webhooks unlock your payout the moment the sponsor pays.',
    scrollRange: [0.48, 0.64],
    cameraPos: [2.4, -8.0, 5.5],
    targetPos: [0.8, -7.6, 0],
    nodePos: [0.8, -7.6, 0],
    accent: '#00b8d9',
    badge: '4. Webhook Clearance',
  },
  {
    id: 'verify',
    name: 'Verify',
    headline: 'Confirm deliverables automatically',
    supporting: 'AI checks sponsor tags and discount links before any funds move.',
    scrollRange: [0.64, 0.78],
    cameraPos: [-2.2, -10.8, 4.8],
    targetPos: [-0.6, -10.4, 0],
    nodePos: [-0.6, -10.4, 0],
    accent: '#ff7a59',
    badge: '5. AI Deliverable Verification',
  },
  {
    id: 'split',
    name: 'Split payout',
    headline: 'Everyone gets paid simultaneously',
    supporting: 'Your editor, designer, and you receive exact cuts in one transaction.',
    scrollRange: [0.78, 0.90],
    cameraPos: [0, -13.6, 6.2],
    targetPos: [0, -13.2, 0],
    nodePos: [0, -13.2, 0],
    accent: '#635bff',
    badge: '6. PayPal Payouts API',
  },
  {
    id: 'cta',
    name: 'Start',
    headline: 'Ready to automate your sponsor deals?',
    supporting: 'Test the end-to-end PayPal sandbox workflow in real time.',
    scrollRange: [0.90, 1.0],
    cameraPos: [0, -16.8, 8.2],
    targetPos: [0, -16.4, 0],
    nodePos: [0, -16.4, 0],
    accent: '#635bff',
    badge: '7. Sandbox Ready',
  },
];

// Create continuous 3D CatmullRomCurve3 paths for the camera eye and camera lookAt target
export const cameraPath = new THREE.CatmullRomCurve3(
  SECTIONS.map((s) => new THREE.Vector3(...s.cameraPos)),
  false, // closed
  'catmullrom',
  0.4 // tension
);

export const lookAtPath = new THREE.CatmullRomCurve3(
  SECTIONS.map((s) => new THREE.Vector3(...s.targetPos)),
  false, // closed
  'catmullrom',
  0.4 // tension
);

// Coin flight path connecting all landmark stations along the story
export const coinStationPath = new THREE.CatmullRomCurve3(
  SECTIONS.map((s) => new THREE.Vector3(...s.nodePos)),
  false,
  'catmullrom',
  0.4
);
