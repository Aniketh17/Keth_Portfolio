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

/** Size of the cropped screenshot (sidebar and scrollbar removed) in source pixels. Boxes below are measured on it. */
const IMG = { w: 1318, h: 805, offsetX: 0 };
export const IMAC_ASPECT = IMG.w / IMG.h;
export type Box = [x: number, y: number, w: number, h: number];
/** Convert a box in source pixels into percentages of the image. */
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
    box: pct(109, 111, 1101, 65),
    layer: 'banner',
    stages: [],
    basis: 'visible',
    note: 'The interface says up front that the system assists clinical advisors by retrieving official guidelines, does not replace clinical judgement, and that every recommendation must be checked against primary sources.',
  },
  {
    id: 'query',
    n: 2,
    label: 'The question',
    box: pct(109, 203, 1101, 70),
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
    box: pct(109, 302, 643, 458),
    layer: 'answer',
    stages: [4, 5],
    basis: 'visible',
    note: 'The answer is written from the retrieved passages only and ends with "Advisor review required before clinical application". A person is meant to review it before acting on it.',
  },
  {
    id: 'confidence',
    n: 4,
    label: 'Confidence badge',
    box: pct(644, 320, 90, 30),
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
    box: pct(780, 296, 430, 509),
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
    box: pct(1128, 346, 70, 20),
    layer: 'evidence',
    stages: [3],
    basis: 'documented',
    note: 'Each source carries its own match score from the cross-encoder reranking stage, so a weak source is visible as weak rather than hidden inside the answer.',
  },
];

export const IMAC_LAYERS: { id: LayerId; box: Box; dx: string; dy: string; regionId: string }[] = [
  { id: 'banner', box: pct(109, 111, 1101, 65), dx: '0%', dy: '-9%', regionId: 'banner' },
  { id: 'query', box: pct(109, 203, 1101, 70), dx: '0%', dy: '-3%', regionId: 'query' },
  { id: 'answer', box: pct(109, 302, 643, 458), dx: '-3.5%', dy: '5%', regionId: 'answer' },
  { id: 'evidence', box: pct(780, 296, 430, 509), dx: '3.5%', dy: '5%', regionId: 'sources' },
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
