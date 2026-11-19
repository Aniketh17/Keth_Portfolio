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

/* ---------------- GRU: real screens of the running app, with names redacted ---------------- */

export interface GruScreen {
  id: string;
  label: string;
  image: string;
  alt: string;
  tags: { text: string; kind: 'implemented' | 'mock' | 'simulated' }[];
  note: string;
}

const GRU_TAGS: GruScreen['tags'] = [
  { text: 'Real app, on a phone', kind: 'implemented' },
  { text: 'Names redacted', kind: 'mock' },
];

export const GRU_SCREENS: GruScreen[] = [
  {
    id: 'today',
    label: 'Today',
    image: 'gru/1.webp',
    alt: 'GRU Today screen on a phone: a morning brief with emails to review and jobs to apply for, and a pipeline of application counts',
    tags: GRU_TAGS,
    note: 'The morning brief: mail waiting for review, new jobs from alerts, and the pipeline from applied to offer. A name in the greeting is redacted.',
  },
  {
    id: 'activity',
    label: 'Recent activity',
    image: 'gru/2.webp',
    alt: 'GRU recent activity list on a phone: applications with Applied and Rejected status chips, company names redacted',
    tags: GRU_TAGS,
    note: 'Each application carries a status that GRU keeps current from the mail it reads. Company names are redacted.',
  },
  {
    id: 'apply',
    label: 'Apply today',
    image: 'gru/3.webp',
    alt: 'GRU Apply today list on a phone: job vacancies scored out of 100 with strong and good labels, employer names redacted',
    tags: GRU_TAGS,
    note: 'Vacancies from job-alert emails, scored out of 100 against my resume and sorted best first. A score is a decision aid; I always apply myself. Employer names are redacted.',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    image: 'gru/4.webp',
    alt: 'GRU calendar on a phone: a month view with today highlighted and an option to subscribe from a phone calendar',
    tags: GRU_TAGS,
    note: 'Interview invites, deadlines and tasks land on a calendar, with meeting links, and can be subscribed to from a phone calendar.',
  },
  {
    id: 'week',
    label: 'Last 7 days',
    image: 'gru/5.webp',
    alt: 'GRU weekly summary on a phone: counts for applications, replies, interviews, rejections, tasks and jobs from alerts',
    tags: GRU_TAGS,
    note: 'A weekly summary of applications, replies, interviews and tasks, so the pipeline is visible at a glance.',
  },
  {
    id: 'chat',
    label: 'Ask GRU',
    image: 'gru/6.webp',
    alt: 'Talk to GRU chat on a phone: an assistant message summarising mail and a top-scored job, with suggestion chips and a microphone button',
    tags: GRU_TAGS,
    note: 'Voice or text chat grounded in a read-only snapshot of my data. It can only suggest steps; every change needs a confirmation tap. Names are redacted.',
  },
];
