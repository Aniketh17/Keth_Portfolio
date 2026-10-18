/**
 * The engineering decisions the site surfaces, and where the evidence for each lives. The decision text itself
 * is read from the project data, so it is written once. Used by the Approach section, the systems view in the
 * 3D world and the evidence links.
 */
export interface DecisionRef {
  id: string;
  projectId: string;
  /** Title of the decision in the project's `decisions` list. */
  title: string;
  /** What to inspect to see it: a region, requirement, transaction or step id. */
  focusId: string;
  label: string;
}

export const DECISIONS: DecisionRef[] = [
  { id: 'refuse', projectId: 'imac-advisor', title: 'Refuse rather than guess', focusId: 'confidence', label: 'See the confidence badge' },
  { id: 'two-stage', projectId: 'imac-advisor', title: 'Two stages instead of one', focusId: 'sources', label: 'See the reranked sources' },
  { id: 'suggest-review', projectId: 'transaction-coding', title: 'Suggest, then review', focusId: 'tx-2', label: 'See an uncertain case' },
  { id: 'retrieved-confirmed', projectId: 'fit-check', title: 'Retrieved is not confirmed', focusId: 'req-2', label: 'See it needing confirmation' },
  { id: 'frontend-first', projectId: 'tiny-paws', title: 'Front end first', focusId: 'checkout', label: 'See the simulated checkout' },
];
