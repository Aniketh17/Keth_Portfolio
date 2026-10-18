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

const OPENERS: [string, Mood][] = [
  ['Hey!', 'surprised'],
  ['Okay, okay.', 'happy'],
  ['Ticklish. A bit.', 'happy'],
];

/** Things Sig says about himself and the site. Always honest, never about anything that is not on the page. */
const GENERAL: string[] = [
  "I'm a cube. It's a living.",
  'I only exist while this tab is open.',
  "Nobody asked me to be a mascot. I volunteered.",
  'I run on three.js and good intentions.',
  'Two hands, no pockets. Design constraints.',
  "Everything on this page is real, except me.",
  'Tab to me and press Enter. Keyboard pokes count.',
  'If I get too chatty, there is a Quiet switch bottom-right.',
  "I blink for you, not at you. Slightly different.",
  'Try scrolling really fast. Just a thought.',
  'Move your cursor around. I notice.',
  "Don't tell the other cubes you poked me.",
  "I don't have a favourite project. That's a lie. It's the one you're looking at.",
  'My antenna does nothing. It looks great though.',
  'You can hit Esc to back out of almost anything.',
  'I get dizzy easily. See: fast scrolling.',
  "I can't read your mind, but I can read the room. It's mostly warm white.",
  'Someone had to be the guide. The cube was available.',
  'Press the arrow keys when a project is selected. Neat, right?',
  'If I fall asleep, poke me. It is fine.',
];

/** What Sig says about the chapter you are in. */
const ZONE: string[][] = [
  ['Scroll down. The route is that way.', "The headline says 'software that works'. I'm software too. Mostly works.", 'The strip at the bottom is real, not decoration.', 'Try the buttons. They are friendlier than me.'],
  ['Pick a project, then hit Inspect system.', 'Every demo has a Play button, and it always starts at step one.', 'Arrow keys move between projects.', 'Use Esc to leave an inspection.'],
  ['Hover a decision and I light up the project it came from.', 'These are trade-offs, not slogans.', 'The evidence links jump you to the exact step.', 'Five decisions. Pick your favourite.'],
  ['Mostly backend, mostly PostgreSQL.', 'Hover a bar on the timeline and it lifts forward.', 'Skills list says where each one was actually used.', 'The coloured chapter is the part with the numbers.'],
  ['Email is the fastest way in.', 'Copy address is right there. I would use it.', 'That coral card is the end of the route.', 'Say hello. I will pretend I did not push you.'],
];

/** What Sig says about the project in front of you. */
const PROJECT: string[][] = [
  ['Everything in that demo comes from the real screenshot.', 'It would rather refuse than guess.', 'That confidence badge means sources matched, not that the answer is right.'],
  ['Confidence is a band here, never a promise.', 'A merchant it has never seen gets no suggestion at all.', 'A person always makes the final call.'],
  ['Built independently at a ZEIL hackathon. No team.', 'Retrieved is not the same as confirmed.', 'It asks a question instead of filling a gap.'],
  ['A front-end prototype: mock data, pretend payment.', 'The cart and the vault live in your browser.', 'Four real screens. No backend.'],
];

const recent: string[] = [];
const draw = (pool: string[]): string => {
  const options = pool.filter((l) => !recent.includes(l));
  const pick = options[Math.floor(Math.random() * options.length)] ?? pool[Math.floor(Math.random() * pool.length)];
  recent.push(pick);
  if (recent.length > 12) recent.shift();
  return pick;
};

let pokes = 0;

/** The visitor poked Sig: always answers with a reaction. Fresh lines every time, tuned to where they are. */
export function sigPoke(): void {
  pokes++;
  frame.pokes = pokes;
  lastAuto = performance.now();
  if (pokes <= OPENERS.length) {
    show(OPENERS[pokes - 1][0], OPENERS[pokes - 1][1], 3200);
    return;
  }
  if (pokes === 4 || (pokes > 4 && (pokes - 4) % 14 === 0)) {
    show('Want me to pick something for you?', 'think', 0, true);
    return;
  }
  const s = world.get();
  const roll = Math.random();
  const pool = roll < 0.4 && s.zone === 1 ? PROJECT[s.active] : roll < 0.7 ? ZONE[Math.min(4, s.zone)] : GENERAL;
  const moods: Mood[] = ['happy', 'idle', 'think', 'happy', 'surprised'];
  show(draw(pool), moods[Math.floor(Math.random() * moods.length)], 3800);
}

export const OFFERS = [
  { label: 'AI work', hint: 'Retrieval, sources, refusal', project: 0 },
  { label: 'Software engineering', hint: 'A person stays in the loop', project: 1 },
  { label: 'How I build', hint: 'Decisions and evidence', project: 2 },
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
