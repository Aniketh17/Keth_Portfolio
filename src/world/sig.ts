import { DECISIONS } from '../data/decisions';
import { inspect, selectProject } from './env';
import { frame, world, type Mood } from './store';

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

let pending: { text: string; mood: Mood; ttl: number } | null = null;
let pendingTimer = 0;

/**
 * An automatic line: respects the mute switch and the cooldown. A line that arrives too soon is not lost; the
 * newest one waits for the cooldown to end and is then spoken.
 */
export function sigSay(text: string, mood: Mood = 'idle', ttl = 5200): void {
  if (world.get().quiet) return;
  const wait = COOLDOWN - (performance.now() - lastAuto);
  if (wait > 0) {
    pending = { text, mood, ttl };
    window.clearTimeout(pendingTimer);
    pendingTimer = window.setTimeout(() => {
      const next = pending;
      pending = null;
      if (next) sigSay(next.text, next.mood, next.ttl);
    }, wait + 50);
    return;
  }
  lastAuto = performance.now();
  show(text, mood, ttl);
}

export function sigDismiss(): void {
  window.clearTimeout(clear);
  world.set({ say: null });
}

const POKES: [string, Mood][] = [
  ['Hey!', 'surprised'],
  ['Okay, okay.', 'happy'],
  ['Ticklish. A bit.', 'happy'],
  ['Want me to pick something for you?', 'think'],
  ['Still here. Still a cube.', 'idle'],
  ['Careful, I bruise easily. Corners.', 'surprised'],
  ['You really like poking things.', 'happy'],
  ['Fine. Poke away.', 'happy'],
  ['Ten pokes. We should get coffee.', 'happy'],
];
const AGAIN: [string, Mood][] = [
  ['Boop.', 'happy'],
  ['Still counting.', 'think'],
  ['Wheee.', 'happy'],
  ['That tickled.', 'surprised'],
];
let pokes = 0;

/** The visitor poked Sig: always answers with a reaction, and after a few pokes offers a choice. */
export function sigPoke(): void {
  pokes++;
  frame.pokes = pokes;
  const [text, mood] = pokes <= POKES.length ? POKES[pokes - 1] : AGAIN[pokes % AGAIN.length];
  show(text, mood, 3200, pokes === 4);
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
  "Hi, I'm Sig. I'll tag along and point at things.",
  'Four projects, four different problems. Start anywhere.',
  'Five decisions. Point at one and I will show you where it came from.',
  'Now the people part. Mostly backend, mostly PostgreSQL, a fair bit of coffee.',
  "That's the end of the road. Email is quicker than poking me, but poking is more fun.",
];

/** Sub-sections inside a chapter. Each is announced once, as it scrolls into view. */
export const SECTION_LINES: Record<string, [string, Mood]> = {
  experience: ['The proper-jobs part. Aniketh mostly lives in backend land.', 'idle'],
  achievements: ['Hackathons: a couple of wins, one near miss, a lot of caffeine.', 'happy'],
  education: ['And the studying. School, then more school. The AI kind, now.', 'think'],
  skills: ['Skills, with receipts. Each one points at something that got built.', 'happy'],
};

export const PROJECT_LINES = [
  'This one would rather say "I don\'t know" than guess.',
  'The boring work, automated. The odd cases, left to humans.',
  'No score. No verdict. Just receipts.',
  'A prototype, and honest about it: mock data, pretend payments.',
];

const DECISION_LINES: Record<string, string> = {
  refuse: 'If sources fall short, it says so instead of guessing.',
  'two-stage': 'Fast recall first, then a slower, sharper rerank.',
  'suggest-review': 'It suggests. A person decides.',
  'retrieved-confirmed': 'Retrieved is not the same as confirmed.',
  'frontend-first': 'Flows first, backend later. Payment is simulated.',
};

export function lineForFocus(projectIndex: number, focus: string | null): [string, Mood] | null {
  if (!focus) return null;
  const step = /^step-(\d+)$/.exec(focus);
  if (step) {
    const n = Number(step[1]);
    if (projectIndex === 0 && n === 6) return ['Sources first, then the answer.', 'think'];
    if (projectIndex === 0 && n === 11) return ['88% is how well the sources matched. Not how right the answer is.', 'think'];
    if (projectIndex === 1 && n === 5) return ["Three didn't fit, so they wait for a person.", 'think'];
    if (projectIndex === 2 && n === 9) return ['Partial evidence means a question, not a guess.', 'think'];
    if (projectIndex === 2 && n === 11) return ['The unsupported claim stays out.', 'happy'];
  }
  return null;
}

export const decisionLine = (id: string | null): string | null => (id ? (DECISION_LINES[id] ?? null) : null);
export const knownDecisions = DECISIONS.map((d) => d.id);
