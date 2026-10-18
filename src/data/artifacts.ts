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
