import { DECISIONS } from '../data/decisions';
import { inspect, selectProject } from './env';
import { frame, world, type Mood } from './store';

/**
 * Sig's voice. His job is to be the guide: pick a route through the work, explain what you are looking at, say
 * something worth knowing about AI and software, and take you to a project's write-up when a line is about it.
 * Lines are short and never claim more than the projects support. Automatic lines are spaced out and can be muted;
 * poking him always answers.
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

interface Show {
  mood?: Mood;
  ttl?: number;
  offer?: boolean;
  link?: { label: string; slug: string };
}

function show(text: string, { mood = 'idle', ttl = 5200, offer = false, link }: Show = {}): void {
  window.clearTimeout(clear);
  world.set({ say: { id: nextId++, text, mood, offer, link } });
  // Lines with an action stay a little longer so there is time to take it.
  if (!offer) clear = window.setTimeout(() => world.set({ say: null }), link ? Math.max(ttl, 7000) : ttl);
}

let pending: { text: string; opts: Show } | null = null;
let pendingTimer = 0;

/**
 * An automatic line: respects the mute switch and the cooldown. A line that arrives too soon is not lost; the
 * newest one waits for the cooldown to end and is then spoken.
 */
export function sigSay(text: string, mood: Mood = 'idle', ttl = 5200): void {
  if (world.get().quiet) return;
  const wait = COOLDOWN - (performance.now() - lastAuto);
  if (wait > 0) {
    pending = { text, opts: { mood, ttl } };
    window.clearTimeout(pendingTimer);
    pendingTimer = window.setTimeout(() => {
      const next = pending;
      pending = null;
      if (next) sigSay(next.text, next.opts.mood, next.opts.ttl);
    }, wait + 50);
    return;
  }
  lastAuto = performance.now();
  show(text, { mood, ttl });
}

export function sigDismiss(): void {
  window.clearTimeout(clear);
  world.set({ say: null });
}

/* ------------------------------------------------------------------------------------------------ */
/* The deck: about 130 lines, drawn in random order with none repeating until all have been used.    */
/* ------------------------------------------------------------------------------------------------ */

interface Line {
  text: string;
  mood?: Mood;
  /** Offered only in this chapter (0 hero .. 4 contact). */
  zone?: number;
  /** Offered only while this project (index) is the one in front. */
  project?: number;
  link?: { label: string; slug: string };
}

const slugs = ['imac-immunisation-advisor', 'transaction-coding', 'fit-check', 'tiny-paws'];
const open = (i: number, label = 'Open the case study') => ({ label, slug: slugs[i] });

const AI: string[] = [
  "Transformers came from a 2017 paper called 'Attention Is All You Need'. Most modern language models descend from it.",
  "Retrieval-augmented generation was introduced in 2020. It's what the IMAC advisor is built around.",
  'AlexNet won the ImageNet contest in 2012 and kicked off the deep-learning boom in vision.',
  'ELIZA, a chatbot from 1966, mostly rephrased what you typed. Still charming.',
  'AlphaGo beat Lee Sedol at Go in 2016, a game people expected to hold out for years longer.',
  'Deep Blue beat Kasparov at chess in 1997. Then everyone moved the goalposts.',
  "AlphaFold predicted protein structures at a scale biologists hadn't seen. Its creators shared the 2024 Nobel Prize in Chemistry.",
  'BERT, from 2018, made "pretrain, then fine-tune" the default recipe for language tasks.',
  'Embeddings turn text into numbers so similar meanings end up close together. That is the engine of semantic search.',
  'A bi-encoder is quick: it embeds the query and passages separately. A cross-encoder is careful: it reads them together.',
  'LoRA, from 2021, fine-tunes a model by training small add-on matrices instead of every weight.',
  'Learning from human feedback is a big reason chat models follow instructions at all.',
  "Hallucination isn't lying. It's fluent text with nothing real behind it. Retrieval helps; it doesn't cure it.",
  'Context windows have grown from a few thousand tokens to hundreds of thousands in some models.',
  'Diffusion models make images by learning to remove noise, step by step.',
  'Mixture-of-experts models wake only part of the network for each token. Efficient trick.',
  'Tool use lets a model call functions, search, run code. That is most of what "agents" means.',
  'The Model Context Protocol, introduced in late 2024, is an open standard for connecting models to tools and data.',
  'Evaluations are the unglamorous part of AI. They are also the part that tells you the truth.',
  'A confidence score is not a probability of being right unless somebody has checked that it is.',
  'Asking a model to reason step by step can improve some answers. People call it chain-of-thought.',
  "Quantisation stores a model's weights with fewer bits. That is how big models fit on small machines.",
  'Vector databases find nearest neighbours fast. FAISS is a well-known library for it.',
  'How you chunk a document changes what retrieval can find.',
  'Retrieval quality caps answer quality. Weak passages in, confident nonsense out.',
  'Guardrails are boring and essential: redaction, refusals, source checks.',
  'Scaling laws found that performance improves predictably with more data, parameters and compute, up to a point.',
  'Speech recognition went from "barely usable" to everyday in about a decade.',
  "Human review isn't a weakness in an AI system. In health or finance, it is the design.",
  'Open-weight models let people run and inspect models on their own hardware.',
];

const SOFTWARE: string[] = [
  'The first computer "bug" on record was a moth found in a Harvard machine in 1947.',
  'Git was created by Linus Torvalds in 2005 to manage the Linux kernel.',
  "REST comes from Roy Fielding's doctoral dissertation, published in 2000.",
  'PostgreSQL traces back to the POSTGRES project at UC Berkeley in the 1980s.',
  'SQL dates to IBM research in the 1970s and is still everywhere.',
  '"Premature optimisation is the root of all evil" is Knuth. The full quote is more careful than the slogan.',
  'Naming things is one of the hard problems. The other is cache invalidation. And off-by-one errors.',
  'An index makes reads faster and writes slower. Everything is a trade-off.',
  'Idempotent means doing it twice has the same effect as doing it once. Payment APIs love it.',
  "Tests are cheap. Outages aren't.",
  'Microservices buy independent deployment and cost you simplicity. Worth it sometimes.',
  'Most performance wins start with measuring.',
  "Code is read far more often than it's written. Write for the reader.",
  "Spring Boot's big idea: sensible defaults, so you only configure what is unusual.",
  'FastAPI builds interactive API docs from your type hints. Nice trick.',
  'A migration is a database change with a paper trail.',
  'Role-based access control: permissions belong to roles, and people just hold roles.',
  'Caching is remembering. The hard part is forgetting at the right time.',
  'A good error message says what happened and what to do next.',
  'TypeScript catches a whole class of mistakes before the code ever runs.',
  'React in one sentence: describe the UI for a given state and let the library do the updating.',
  "Accessibility isn't a feature. It is part of 'working'.",
  'Feature flags let you ship code without showing it to everyone yet.',
  'Logs say what happened. Metrics say how often. Traces say where.',
  'Rate limiting protects a service from friends and enemies alike.',
  'The easiest code to maintain is the code you deleted.',
  'Continuous integration means every change gets checked before it gets trusted.',
  'Linters catch the boring mistakes so reviewers can discuss the interesting ones.',
  'Docker packages an app with what it needs, so "works on my machine" becomes "works".',
  'A hackathon teaches you what is essential. There is no time for anything else.',
];

/** About Sig and how to use the site. */
const GENERAL: string[] = [
  "I'm Sig, the guide here. I can pick a project for you, explain what you're looking at, or just keep you company.",
  "I'm a cube. It's a living.",
  'I only exist while this tab is open.',
  'Nobody asked me to be a mascot. I volunteered.',
  'I run on three.js and good intentions.',
  'Two hands, no pockets. Design constraints.',
  'Everything on this page is real, except me.',
  'Tab to me and press Enter. Keyboard pokes count.',
  'If I get too chatty, there is a Quiet switch near the bottom.',
  'I blink for you, not at you. Slightly different.',
  'Try scrolling really fast. Just a thought.',
  'Move your cursor around. I notice.',
  "Don't tell the other cubes you poked me.",
  'My antenna does nothing. It looks great though.',
  'You can press Esc to back out of almost anything.',
  'I get dizzy easily. See: fast scrolling.',
  "I can't read your mind, but I can read the room. It's mostly warm white.",
  'Someone had to be the guide. The cube was available.',
  'If I fall asleep, poke me. It is fine.',
  'Ask me for a route and I will take you somewhere good.',
];

/** What Sig says about the chapter you are in. */
const ZONE: Line[] = [
  { text: 'Scroll down. The route is that way.', zone: 0 },
  { text: 'The strip near the bottom is real, not decoration.', zone: 0 },
  { text: 'Try the buttons. They are friendlier than me.', zone: 0 },
  { text: 'Pick a project, then look inside it.', zone: 1 },
  { text: 'Every demo has a Play button, and it always starts at step one.', zone: 1 },
  { text: 'Use Esc to leave an inspection.', zone: 1 },
  { text: 'Hover a decision and I light up the project it came from.', zone: 2 },
  { text: 'These are trade-offs, not slogans.', zone: 2 },
  { text: 'The evidence links jump you to the exact step.', zone: 2 },
  { text: 'Mostly backend, mostly PostgreSQL.', zone: 3 },
  { text: 'The skills list says where each one was actually used.', zone: 3 },
  { text: 'Email is the fastest way in.', zone: 4 },
  { text: 'Copy address is right there. I would use it.', zone: 4 },
  { text: 'Say hello. I will pretend I did not push you.', zone: 4 },
];

/** Lines about a project, each with a shortcut to its write-up. */
const PROJECT: Line[] = [
  { text: 'The IMAC advisor would rather say "not enough information" than guess.', project: 0, link: open(0), mood: 'think' },
  { text: 'Every IMAC answer comes with sources you can check.', project: 0, link: open(0, 'See how it works'), mood: 'happy' },
  { text: 'Retrieve first, rerank second, answer last. That is the IMAC pipeline.', project: 0, link: open(0), mood: 'think' },
  { text: 'That 88% badge means the sources matched well. It does not promise the answer is right.', project: 0, link: open(0), mood: 'think' },
  { text: 'Transaction coding: automate the routine, flag the odd, let a person decide.', project: 1, link: open(1), mood: 'happy' },
  { text: 'A merchant it has never seen gets no suggestion at all. Honest, if humbling.', project: 1, link: open(1), mood: 'idle' },
  { text: 'In transaction coding, confidence is a band, never a promise.', project: 1, link: open(1, 'See how it works'), mood: 'think' },
  { text: 'The review lane is where the interesting transactions go.', project: 1, link: open(1), mood: 'happy' },
  { text: 'Fit Check shows evidence, not a score.', project: 2, link: open(2), mood: 'think' },
  { text: 'Fit Check asks before it assumes. Revolutionary, apparently.', project: 2, link: open(2), mood: 'happy' },
  { text: 'It was built independently at a ZEIL hackathon. No team, just a deadline.', project: 2, link: open(2), mood: 'idle' },
  { text: 'Retrieved is not the same as confirmed. Fit Check keeps them apart.', project: 2, link: open(2, 'See how it works'), mood: 'think' },
  { text: 'Tiny Paws has a cart, a checkout and a medical vault. All front end.', project: 3, link: open(3), mood: 'happy' },
  { text: 'The Tiny Paws payment is simulated. No money moves. I checked.', project: 3, link: open(3), mood: 'idle' },
  { text: 'Tiny Paws saves its cart and vault in your browser. No backend.', project: 3, link: open(3, 'See how it works'), mood: 'think' },
  { text: 'A prototype that is honest about being a prototype. Tiny Paws.', project: 3, link: open(3), mood: 'happy' },
];

/** Project lines that apply wherever you are, so the shortcuts to the write-ups are never out of reach. */
const PROJECT_ANYWHERE: Line[] = PROJECT.filter((_, i) => i % 4 === 0).map((l) => ({ ...l, project: undefined }));

const DECK: Line[] = [
  ...AI.map((text): Line => ({ text, mood: 'think' })),
  ...SOFTWARE.map((text): Line => ({ text, mood: 'happy' })),
  ...GENERAL.map((text): Line => ({ text, mood: 'idle' })),
  ...ZONE,
  ...PROJECT,
  ...PROJECT_ANYWHERE,
];

let deck: Line[] = [];
const shuffle = <T,>(a: T[]): T[] => {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

/** The next line: sometimes about where you are or what is in front of you, otherwise the next in a shuffled deck. */
function nextLine(): Line {
  if (deck.length === 0) deck = shuffle(DECK);
  const s = world.get();
  const scoped = (l: Line) => l.project !== undefined || l.zone !== undefined;
  const fits = (l: Line) => (l.project !== undefined ? s.zone === 1 && l.project === s.active : l.zone !== undefined ? l.zone === Math.min(4, s.zone) : false);
  const contextual = deck.filter(fits);
  const open = deck.filter((l) => !scoped(l));
  const pool = contextual.length > 0 && Math.random() < 0.5 ? contextual : open.length > 0 ? open : deck;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  deck = deck.filter((l) => l !== pick);
  return pick;
}

let pokes = 0;

/**
 * The visitor poked Sig. The first poke is a plain hello; the second brings up the routes; after that every poke
 * is a fresh line, with the choice card coming back now and then.
 */
export function sigPoke(): void {
  // While muted a tap is the switch: it wakes him up.
  if (world.get().quiet) {
    setQuiet(false);
    lastAuto = performance.now();
    show('Back again.', { mood: 'happy', ttl: 2600 });
    return;
  }
  pokes++;
  frame.pokes = pokes;
  lastAuto = performance.now();
  if (pokes === 1) {
    show('Hi!', { mood: 'happy', ttl: 2600 });
    return;
  }
  if (pokes === 2 || (pokes > 2 && (pokes - 2) % 16 === 0)) {
    show('Want me to pick something for you?', { mood: 'think', offer: true });
    return;
  }
  const l = nextLine();
  show(l.text, { mood: l.mood ?? 'idle', ttl: 5600, link: l.link });
}

export const OFFERS = [
  { label: 'AI work', hint: 'Retrieval, sources, refusal', project: 0 },
  { label: 'Software engineering', hint: 'A person stays in the loop', project: 1 },
  { label: 'How I build', hint: 'Decisions and evidence', project: 2 },
] as const;

/** Take an offer: travel to the project and inspect it (or, without the 3D world, open its write-up). */
export function sigTake(project: number): void {
  sigDismiss();
  if (world.get().lite) {
    window.location.hash = `#/projects/${slugs[project]}`;
    return;
  }
  selectProject(project);
  window.setTimeout(() => inspect(), 700);
}

/** "Surprise me": a random line from anywhere in the deck. */
export function sigSurprise(): void {
  const l = nextLine();
  show(l.text, { mood: l.mood ?? 'happy', ttl: 5600, link: l.link });
}

export function sigGo(slug: string): void {
  sigDismiss();
  window.location.hash = `#/projects/${slug}`;
}

export const ZONE_LINES = [
  "Hello, and welcome. I'm Sig, and I'll keep you company while you look around.",
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
export const lineCount = DECK.length;
