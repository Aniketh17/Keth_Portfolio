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
  { id: 'quote-proof', projectId: 'gru', title: 'The model must quote its proof', focusId: 'activity', label: 'See the tracked statuses' },
  { id: 'suggest-only', projectId: 'gru', title: 'The assistant suggests; I confirm', focusId: 'chat', label: 'See the assistant' },
  { id: 'refuse', projectId: 'imac-advisor', title: 'Refuse rather than guess', focusId: 'confidence', label: 'See the confidence badge' },
  { id: 'two-stage', projectId: 'imac-advisor', title: 'Two stages instead of one', focusId: 'sources', label: 'See the reranked sources' },
  { id: 'suggest-review', projectId: 'transaction-coding', title: 'Suggest, then review', focusId: 'step-5', label: 'See the review lane' },
  { id: 'retrieved-confirmed', projectId: 'fit-check', title: 'Retrieved is not confirmed', focusId: 'step-9', label: 'See the question it asks' },
  { id: 'frontend-first', projectId: 'tiny-paws', title: 'Front end first', focusId: 'checkout', label: 'See the simulated checkout' },
];
