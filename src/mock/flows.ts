/**
 * The two product demos, as data. Both are recreated from the projects' descriptions on invented data; neither is
 * a screenshot of the shipped product. A demo is a sequence of steps; the screens render any step on demand, so
 * the live version, the captured frames and the 3D scene all show the same thing.
 */

export type DemoId = 'transactions' | 'fit' | 'imac';

export interface Step {
  /** Short caption shown beside the demo (and read by screen readers). */
  caption: string;
}

export const DEMO_SIZE = { w: 1280, h: 800 };
export const DEMO_ASPECT = DEMO_SIZE.w / DEMO_SIZE.h;
/** The step shown when the demo is at rest, before anyone plays it: the most informative frame. */
export const REST_STEP: Record<DemoId, number> = { transactions: 7, fit: 8, imac: 11 };

export const TRANSACTION_STEPS: Step[] = [
  { caption: 'A bank feed of uncoded transactions, with an Auto-categorise button on top.' },
  { caption: 'Pressing it matches each transaction against previously coded ones.' },
  { caption: 'Familiar merchants start receiving a category automatically.' },
  { caption: 'More familiar merchants are coded; each one is tagged Auto.' },
  { caption: 'Six rows are coded without anyone touching them.' },
  { caption: 'Three rows are not familiar enough to code: they are flagged, with a suggestion where there is one.' },
  { caption: 'The batch splits into what was coded automatically and what needs review.' },
  { caption: 'A summary says exactly how many were coded and how many are waiting for a person.' },
  { caption: 'The reviewer opens the first uncertain row. The suggestion is a button, not a decision.' },
  { caption: 'Confirming it moves the row into the coded group.' },
  { caption: 'A merchant the system has never seen has no suggestion, so the reviewer picks a category.' },
  { caption: 'It is coded. One row is still waiting, because nobody has decided it yet.' },
];

export const FIT_STEPS: Step[] = [
  { caption: 'A job listing, with a Should I apply? button at the bottom.' },
  { caption: 'Pressing it starts the review. Nothing is scored; it will show evidence.' },
  { caption: 'It reads the listing.' },
  { caption: 'It splits compound requirements into individual claims: three bullets become four.' },
  { caption: 'It searches the applicant’s profile for evidence for each claim.' },
  { caption: 'Evidence turns up for three of the four claims.' },
  { caption: 'It checks what that evidence does and does not show.' },
  { caption: 'It writes the report.' },
  { caption: 'The report: each claim is Direct, Related, Needs confirmation or Not found, with the evidence and an explanation.' },
  { caption: 'Where evidence is only partial, it asks a specific question instead of guessing.' },
  { caption: 'The applicant answers, and only then does the claim count as confirmed.' },
  { caption: 'The draft summary uses only claims that were retrieved and used, or confirmed. The unsupported one stays out.' },
];

export const IMAC_STEPS: Step[] = [
  { caption: 'An empty advisor: a question box and a Search button, and nowhere for sources to appear yet.' },
  { caption: 'A clinician starts typing a question.' },
  { caption: 'The full question: the catch-up schedule and dose interval for Gardasil 9 in an immunocompetent 18-year-old.' },
  { caption: 'Search is pressed. First, personal details are redacted and the question is classified.' },
  { caption: 'Candidate passages are recalled from the guidelines quickly, by embedding similarity.' },
  { caption: 'A slower cross-encoder reranks the candidates for precision.' },
  { caption: 'The best passages appear first, each with its source ID and match score: 85% and 84% here.' },
  { caption: 'A gate checks the sources are strong enough to answer. If they were not, the system would say so instead of guessing.' },
  { caption: 'The answer starts to be written, from the retrieved passages only.' },
  { caption: 'The first paragraph is complete.' },
  { caption: 'The structured points follow, ending with "Advisor review required before clinical application."' },
  { caption: 'The confidence badge shows High, 88%: how well the sources matched the question, not a guarantee the answer is right.' },
];

export const STEPS: Record<DemoId, Step[]> = { transactions: TRANSACTION_STEPS, fit: FIT_STEPS, imac: IMAC_STEPS };

/* ----------------------------- Transaction data (fictional, a small farm business) ----------------------------- */

export interface TxRow {
  id: number;
  date: string;
  merchant: string;
  amount: string;
  /** Final category once coded, if the system knew it. */
  category: string | null;
  /** What the system would suggest for an uncertain row. */
  suggestion: string | null;
  confident: boolean;
}

export const TX_ROWS: TxRow[] = [
  { id: 1, date: '12 Aug', merchant: 'Ridgeline Rural Supplies', amount: '482.60', category: 'Farm supplies', suggestion: null, confident: true },
  { id: 2, date: '12 Aug', merchant: 'Kowhai Vet Clinic', amount: '215.00', category: 'Veterinary', suggestion: null, confident: true },
  { id: 3, date: '13 Aug', merchant: 'Hauraki Fuel Stop', amount: '138.40', category: 'Fuel', suggestion: null, confident: true },
  { id: 4, date: '14 Aug', merchant: 'Greenfield Seed & Feed', amount: '1,206.15', category: 'Seed & feed', suggestion: null, confident: true },
  { id: 5, date: '15 Aug', merchant: 'Southern Power Co', amount: '391.20', category: 'Power', suggestion: null, confident: true },
  { id: 6, date: '15 Aug', merchant: 'Paddock Machinery Hire', amount: '640.00', category: 'Machinery hire', suggestion: null, confident: true },
  { id: 7, date: '16 Aug', merchant: 'Marketplace order 7KQ2', amount: '89.99', category: null, suggestion: 'Farm supplies', confident: false },
  { id: 8, date: '17 Aug', merchant: 'TRF J SMITH 3321', amount: '450.00', category: null, suggestion: 'Contract labour', confident: false },
  { id: 9, date: '18 Aug', merchant: 'Harbourview Fencing Ltd', amount: '2,340.00', category: null, suggestion: null, confident: false },
];

export const TX_CATEGORIES = ['Farm supplies', 'Veterinary', 'Fuel', 'Seed & feed', 'Power', 'Machinery hire', 'Contract labour', 'Fencing & repairs', 'Office supplies'];

/** Which rows are in which state at a given step. Steps 0-1 nothing is coded; 2-4 familiar rows fill in. */
export function txState(step: number) {
  const autoCount = step < 2 ? 0 : step === 2 ? 2 : step === 3 ? 4 : 6;
  const flagged = step >= 5;
  const split = step >= 6;
  const confirmed7 = step >= 9;
  const confirmed9 = step >= 11;
  const open9 = step === 10;
  const hover7 = step === 8;
  const coded = (id: number) => (id <= 6 ? id <= autoCount : id === 7 ? confirmed7 : id === 9 ? confirmed9 : false);
  const codedIds = TX_ROWS.filter((r) => coded(r.id)).map((r) => r.id);
  const waitingIds = TX_ROWS.filter((r) => !coded(r.id) && flagged).map((r) => r.id);
  return { autoCount, flagged, split, confirmed7, confirmed9, open9, hover7, coded, codedIds, waitingIds, working: step === 1 };
}
