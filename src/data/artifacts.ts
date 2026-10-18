/**
 * Inspectable regions and illustrative specimens. Everything here carries a `basis` so the page can say how
 * much to trust it:
 *   visible     is readable in the real screenshot itself
 *   documented  comes from the project's own README (not visible in the image)
 *   synthetic   an illustration on invented data; not a screenshot of the product
 */

export type Basis = 'visible' | 'documented' | 'synthetic';

export const BASIS_LABEL: Record<Basis, string> = {
  visible: 'Visible in the screenshot',
  documented: 'Documented in the project README',
  synthetic: 'Illustration on synthetic data',
};

/* ---------------- IMAC: annotated and exploded real interface ---------------- */

/** Size of the cropped screenshot (sidebar removed) in source pixels. */
const IMG = { w: 852, h: 515, offsetX: 172 };
export type Box = [x: number, y: number, w: number, h: number];
/** Convert a box measured on the original 1024x515 screenshot into percentages of the cropped image. */
const pct = (x: number, y: number, w: number, h: number): Box => [
  ((x - IMG.offsetX) / IMG.w) * 100,
  (y / IMG.h) * 100,
  (w / IMG.w) * 100,
  (h / IMG.h) * 100,
];

export type LayerId = 'banner' | 'query' | 'answer' | 'evidence';

export interface ImacRegion {
  id: string;
  n: number;
  label: string;
  box: Box;
  layer: LayerId;
  /** Indices into the project's documented flow: 0 Redact, 1 Classify, 2 Recall, 3 Rerank, 4 Gate, 5 Answer. */
  stages: number[];
  basis: Basis;
  note: string;
  /** Shown as a pin in the compact hero view. */
  hero?: boolean;
}

export const IMAC_REGIONS: ImacRegion[] = [
  {
    id: 'banner',
    n: 1,
    label: 'Advisory framing',
    box: pct(241, 72, 704, 40),
    layer: 'banner',
    stages: [],
    basis: 'visible',
    note: 'The interface says up front that the system assists clinical advisors by retrieving official guidelines, does not replace clinical judgement, and that every recommendation must be checked against primary sources.',
  },
  {
    id: 'query',
    n: 2,
    label: 'The question',
    box: pct(241, 130, 704, 43),
    layer: 'query',
    stages: [0, 1],
    basis: 'documented',
    hero: true,
    note: 'A plain-language clinical question. Before retrieval it is redacted for personal information (NHI numbers, phone numbers, emails, dates of birth, names, addresses) and classified by vaccine type, clinical scenario and caller type.',
  },
  {
    id: 'answer',
    n: 3,
    label: 'Clinical summary',
    box: pct(241, 193, 411, 292),
    layer: 'answer',
    stages: [4, 5],
    basis: 'visible',
    note: 'The answer is written from the retrieved passages only and ends with "Advisor review required before clinical application". A person is meant to review it before acting on it.',
  },
  {
    id: 'confidence',
    n: 4,
    label: 'Confidence badge',
    box: pct(583, 204, 58, 20),
    layer: 'answer',
    stages: [3, 4],
    basis: 'documented',
    hero: true,
    note: 'Derived from the reranker scores. It signals how well the retrieved sources matched the question; it is not a guarantee that the answer is correct. Below a threshold the system declines to answer instead of generating one.',
  },
  {
    id: 'sources',
    n: 5,
    label: 'Source grounding',
    box: pct(669, 190, 276, 325),
    layer: 'evidence',
    stages: [2, 3],
    basis: 'visible',
    hero: true,
    note: 'The highest-scoring passages, each with its document ID, section and an excerpt, so the answer can be traced back to the guideline. The bi-encoder recalls candidates quickly; the cross-encoder reranks them for precision.',
  },
  {
    id: 'match',
    n: 6,
    label: 'Per-source match score',
    box: pct(878, 222, 60, 14),
    layer: 'evidence',
    stages: [3],
    basis: 'documented',
    note: 'Each source carries its own match score from the cross-encoder reranking stage, so a weak source is visible as weak rather than hidden inside the answer.',
  },
];

export const IMAC_LAYERS: { id: LayerId; box: Box; dx: string; dy: string; regionId: string }[] = [
  { id: 'banner', box: pct(241, 72, 704, 40), dx: '0%', dy: '-9%', regionId: 'banner' },
  { id: 'query', box: pct(241, 130, 704, 43), dx: '0%', dy: '-3%', regionId: 'query' },
  { id: 'answer', box: pct(241, 193, 411, 322), dx: '-3.5%', dy: '5%', regionId: 'answer' },
  { id: 'evidence', box: pct(669, 190, 276, 325), dx: '3.5%', dy: '5%', regionId: 'sources' },
];

/* ---------------- Transaction Coding: triage bench (synthetic) ---------------- */

export type Band = 'familiar' | 'unsure' | 'new';

export interface Tx {
  id: string;
  description: string;
  /** What the pattern match found, in words. No numbers: nothing here implies a measured accuracy. */
  match: string;
  suggestion: string | null;
  band: Band;
}

export const TX_CATEGORIES = ['Groceries', 'Subscriptions', 'Fuel', 'Office supplies', 'Contractor payments', 'Travel', 'Equipment'];

export const TX_BAND: Record<Band, { label: string; route: string }> = {
  familiar: { label: 'Familiar pattern', route: 'Suggested. Quick to confirm.' },
  unsure: { label: 'Unsure', route: 'Held for review.' },
  new: { label: 'New to the system', route: 'Needs a category from a person.' },
};

export const TRANSACTIONS: Tx[] = [
  { id: 'tx-0', description: 'COUNTDOWN AKL 0412', match: 'Matches earlier transactions from the same merchant, all coded as Groceries.', suggestion: 'Groceries', band: 'familiar' },
  { id: 'tx-1', description: 'SPOTIFY P1F3A9', match: 'Matches a recurring monthly charge coded as Subscriptions.', suggestion: 'Subscriptions', band: 'familiar' },
  { id: 'tx-2', description: 'AMZN MKTP *7KQ2', match: 'The merchant appears under two categories in the history, Office supplies and Equipment.', suggestion: 'Office supplies', band: 'unsure' },
  { id: 'tx-3', description: 'TRF J SMITH 3321', match: 'A bank transfer to a person. Earlier transfers to this name were coded inconsistently.', suggestion: 'Contractor payments', band: 'unsure' },
  { id: 'tx-4', description: 'HARBOURVIEW ENG LTD', match: 'No earlier transaction resembles this merchant.', suggestion: null, band: 'new' },
];

/* ---------------- Tiny Paws: real captures of the running prototype ---------------- */

export interface JourneyStep {
  id: string;
  label: string;
  image: string;
  alt: string;
  /** What kind of thing the visitor is looking at, kept explicit so a prototype stays identifiable as one. */
  tags: { text: string; kind: 'implemented' | 'mock' | 'simulated' }[];
  note: string;
}

export const JOURNEY: JourneyStep[] = [
  {
    id: 'store',
    label: 'Browse',
    image: 'tinypaws/store.webp',
    alt: 'The Tiny Paws store with category filters and product cards',
    tags: [
      { text: 'Implemented UI', kind: 'implemented' },
      { text: 'Mock data', kind: 'mock' },
    ],
    note: 'Dogs and cats toggle, category filters and product cards. The catalogue is mock data kept in the repository; there is no backend.',
  },
  {
    id: 'cart',
    label: 'Basket',
    image: 'tinypaws/cart.webp',
    alt: 'The Tiny Paws basket drawer with two items and a total',
    tags: [
      { text: 'Implemented UI', kind: 'implemented' },
      { text: 'Persists in the browser', kind: 'implemented' },
    ],
    note: 'An off-canvas basket with quantity controls and a running total. Cart state lives in a shared React context and is saved to localStorage.',
  },
  {
    id: 'checkout',
    label: 'Checkout',
    image: 'tinypaws/checkout.webp',
    alt: 'The Tiny Paws two-step checkout, shipping details step',
    tags: [
      { text: 'Implemented UI', kind: 'implemented' },
      { text: 'Simulated payment', kind: 'simulated' },
    ],
    note: 'A two-step flow: shipping details with validation, then payment. The payment step is a simulation; no money moves and nothing is sent to a server.',
  },
  {
    id: 'vault',
    label: 'Medical vault',
    image: 'tinypaws/vault.webp',
    alt: 'The Tiny Paws profile page with companion cards and the medical vault upload area',
    tags: [
      { text: 'Implemented UI', kind: 'implemented' },
      { text: 'Stored in the browser', kind: 'mock' },
    ],
    note: 'Companion profiles and an upload area that links each document to a specific pet. Records are kept in browser storage, not on a server.',
  },
];
