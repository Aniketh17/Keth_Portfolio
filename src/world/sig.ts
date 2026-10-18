import { IMAC_REGIONS } from '../data/artifacts';
import { DECISIONS } from '../data/decisions';
import { inspect, selectProject } from './env';
import { world, type Mood } from './store';

/**
 * Sig's voice. Lines are short, specific and never claim more than the projects support. Automatic lines are
 * spaced out (one at a time, with a cooldown) and can be muted; poking Sig always answers.
 */

let nextId = 1;
let lastAuto = 0;
let clear = 0;
const COOLDOWN = 2600;
const QUIET_KEY = 'sig-quiet';

export function loadQuiet(): void {
  try {
    if (window.localStorage.getItem(QUIET_KEY) === '1') world.set({ quiet: true });
  } catch {
    // Storage can be blocked; Sig is simply not muted.
  }
}
export function setQuiet(quiet: boolean): void {
  try {
    window.localStorage.setItem(QUIET_KEY, quiet ? '1' : '0');
  } catch {
    // Storage can be blocked; the choice lasts until reload.
  }
  world.set({ quiet, say: quiet ? null : world.get().say });
}

function show(text: string, mood: Mood, ttl: number, offer = false): void {
  window.clearTimeout(clear);
  world.set({ say: { id: nextId++, text, mood, offer } });
  if (!offer) clear = window.setTimeout(() => world.set({ say: null }), ttl);
}

/** An automatic line: respects the mute switch and the cooldown. */
export function sigSay(text: string, mood: Mood = 'idle', ttl = 5200): void {
  const now = performance.now();
  if (world.get().quiet || now - lastAuto < COOLDOWN) return;
  lastAuto = now;
  show(text, mood, ttl);
}

export function sigDismiss(): void {
  window.clearTimeout(clear);
  world.set({ say: null });
}

const POKES: [string, Mood][] = [
  ['Hey!', 'surprised'],
  ['Okay, okay.', 'happy'],
  ["Ticklish. A bit.", 'happy'],
  ['Want me to pick something for you?', 'think'],
];
let pokes = 0;

/** The visitor poked Sig: always answers, and after a few pokes offers a choice. */
export function sigPoke(): void {
  pokes++;
  const [text, mood] = POKES[Math.min(pokes - 1, POKES.length - 1)];
  show(text, mood, 3200, pokes >= 3);
  lastAuto = performance.now();
}

export const OFFERS = [
  { label: 'Show me your AI work', project: 0 },
  { label: 'Show me your software engineering', project: 1 },
  { label: 'Show me how you build', project: 2 },
] as const;

/** Take an offer: travel to the project and inspect it. */
export function sigTake(project: number): void {
  sigDismiss();
  selectProject(project);
  window.setTimeout(() => inspect(), 700);
}

export const ZONE_LINES = [
  "Hi, I'm Sig. I'll point at things as we go.",
  'Four projects. Pick one, then Inspect it.',
  'Point at a decision and its project lights up.',
  'Every entry here sits at its real dates.',
  "That's the route. Email works better than poking me.",
];

export const PROJECT_LINES = [
  'A clinical advisor that shows its sources.',
  'Routine ones are coded. Uncertain ones come to a person.',
  'No score here. Just evidence.',
  'A front-end prototype: mock data, simulated payment.',
];

const REGION_LINES: Record<string, string> = {
  banner: "It says up front it doesn't replace judgement.",
  query: 'Personal details are redacted before this is searched.',
  answer: 'Written from the retrieved passages only.',
  confidence: '88% is how well sources matched, not how right it is.',
  sources: 'The top passages, each traceable to its source.',
  match: 'A weak source shows up as weak.',
};

const DECISION_LINES: Record<string, string> = {
  refuse: 'If sources fall short, it says so instead of guessing.',
  'two-stage': 'Fast recall first, then a slower, sharper rerank.',
  'suggest-review': 'It suggests. A person decides.',
  'retrieved-confirmed': 'Retrieved is not the same as confirmed.',
  'frontend-first': 'Flows first, backend later. Payment is simulated.',
};

export function lineForFocus(projectIndex: number, focus: string | null): [string, Mood] | null {
  if (!focus) return null;
  if (projectIndex === 0 && REGION_LINES[focus]) return [REGION_LINES[focus], 'think'];
  const step = /^step-(\d+)$/.exec(focus);
  if (step) {
    const n = Number(step[1]);
    if (projectIndex === 1 && n === 5) return ["Three didn't fit, so they wait for a person.", 'think'];
    if (projectIndex === 2 && n === 9) return ['Partial evidence means a question, not a guess.', 'think'];
    if (projectIndex === 2 && n === 11) return ['The unsupported claim stays out.', 'happy'];
  }
  return null;
}

export const decisionLine = (id: string | null): string | null => (id ? (DECISION_LINES[id] ?? null) : null);
export const knownDecisions = DECISIONS.map((d) => d.id);
export const regionIds = IMAC_REGIONS.map((r) => r.id);
