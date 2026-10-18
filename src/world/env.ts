import { projects } from '../data/projects';
import { frame, PROJECT_COUNT, world } from './store';

export const SMALL_BREAKPOINT = 820;

let webgl: boolean | undefined;
export function hasWebGL(): boolean {
  if (webgl !== undefined) return webgl;
  try {
    const c = document.createElement('canvas');
    webgl = Boolean(c.getContext('webgl2') ?? c.getContext('webgl'));
  } catch {
    webgl = false;
  }
  return webgl;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => x * x * (3 - 2 * x);

const topOf = (id: string): number => {
  const el = document.getElementById(id);
  return el ? el.getBoundingClientRect().top + window.scrollY : 0;
};
const heightOf = (id: string): number => document.getElementById(id)?.offsetHeight ?? 0;

/**
 * Turn the page's real layout into camera waypoints. Each waypoint says "at this scroll offset the camera should
 * be holding this destination", and the camera travels between consecutive waypoints. Holding the same
 * destination across a span (the projects stage, the approach, the timeline) is what keeps the world still
 * while you read.
 *
 * Destinations: 0 arrival, 1 projects, 2 systems, 3 timeline, 4 contact.
 */
export function measureWorld(): void {
  const vh = window.innerHeight;
  const max = Math.max(1, document.documentElement.scrollHeight - vh);
  const work = topOf('work');
  const workH = heightOf('work');
  frame.vh = vh;
  frame.stageStart = work;
  frame.stageRange = Math.max(1, workH - vh);
  const aTop = topOf('approach');
  const aH = heightOf('approach');
  const bTop = topOf('about');
  const bH = heightOf('about');
  const raw: { s: number; d: number }[] = [
    { s: 0, d: 0 },
    { s: Math.max(1, work - vh * 0.9), d: 0 },
    { s: work, d: 1 },
    { s: work + frame.stageRange, d: 1 },
    { s: aTop + aH * 0.15, d: 2 },
    { s: aTop + aH * 0.8, d: 2 },
    { s: bTop + bH * 0.1, d: 3 },
    { s: bTop + bH * 0.8, d: 3 },
    { s: max, d: 4 },
  ];
  // Keep offsets strictly ascending and inside the page, however the layout turns out.
  let prev = -1;
  frame.waypoints = raw.map((w) => {
    const s = Math.min(max, Math.max(prev + 1, w.s));
    prev = s;
    return { s, d: w.d };
  });
}

function updateFromScroll(): void {
  const y = window.scrollY;
  frame.scrollY = y;
  const w = frame.waypoints;
  let i = 0;
  while (i < w.length - 2 && y >= w[i + 1].s) i++;
  const a = w[i];
  const b = w[Math.min(i + 1, w.length - 1)];
  frame.from = a.d;
  frame.to = b.d;
  frame.blend = a.d === b.d ? 0 : smooth(clamp01((y - a.s) / Math.max(1, b.s - a.s)));
  world.set({ zone: frame.blend > 0.5 ? frame.to : frame.from });

  const f = clamp01((y - frame.stageStart) / frame.stageRange) * (PROJECT_COUNT - 1);
  const s = world.get();
  if (s.mode === 'inspect') {
    // Scrolling away from the project being inspected ends the inspection instead of fighting it.
    if (Math.abs(f - s.active) > 0.7 || y < frame.stageStart - frame.vh * 0.5 || y > frame.stageStart + frame.stageRange + frame.vh * 0.5) exitInspect();
  } else {
    frame.carousel = f;
    world.set({ active: Math.round(f) });
  }
  checkIntent();
}

let intent: { index: number; focus: string | null } | null = null;
let intentTimer = 0;

function applyIntent(): void {
  if (!intent) return;
  const { index, focus } = intent;
  intent = null;
  window.clearTimeout(intentTimer);
  frame.carousel = index;
  world.set({ active: index, mode: 'inspect', focus });
}
function checkIntent(): void {
  if (intent && Math.abs(frame.carousel - intent.index) < 0.06) applyIntent();
}

const smoothScroll = (top: number) => window.scrollTo({ top, behavior: world.get().reduced ? 'auto' : 'smooth' });
const stageScroll = (index: number) => frame.stageStart + (index / (PROJECT_COUNT - 1)) * frame.stageRange;

/** Bring a project to the front of the carousel. The scroll position is the source of truth, so this is just a scroll. */
export function selectProject(index: number): void {
  const i = Math.min(PROJECT_COUNT - 1, Math.max(0, index));
  world.set({ mode: 'overview', focus: null });
  smoothScroll(stageScroll(i));
}

export function inspect(focus: string | null = null): void {
  frame.carousel = world.get().active;
  world.set({ mode: 'inspect', focus });
}

export function exitInspect(): void {
  world.set({ mode: 'overview', focus: null });
}

/**
 * Open the evidence for a claim made elsewhere on the page: travel to the project, then inspect it, focused on
 * the part that backs the claim. If the scroll never lands exactly, the timer applies it anyway.
 */
export function showEvidence(projectId: string, focus: string): void {
  const index = projects.findIndex((p) => p.id === projectId);
  if (index < 0) return;
  intent = { index, focus };
  window.clearTimeout(intentTimer);
  intentTimer = window.setTimeout(applyIntent, 1800);
  selectProject(index);
  // Already there: no scroll event will follow.
  window.setTimeout(checkIntent, 60);
}

export function scrollToId(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  const top = id === 'work' ? stageScroll(0) : el.getBoundingClientRect().top + window.scrollY - 56;
  smoothScroll(top);
}

/** Wires scroll, layout, reduced-motion and pointer into the world. Returns a cleanup function. */
export function watchWorld(): () => void {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0;
  const remeasure = () => {
    world.set({ reduced: motion.matches, small: window.innerWidth < SMALL_BREAKPOINT });
    measureWorld();
    updateFromScroll();
  };
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      updateFromScroll();
    });
  };
  const onPointer = (e: PointerEvent) => {
    frame.lookX = e.clientX;
    frame.lookY = e.clientY;
    if (e.pointerType !== 'mouse') return;
    frame.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
    frame.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && world.get().mode === 'inspect') exitInspect();
  };
  remeasure();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', remeasure);
  window.addEventListener('load', remeasure);
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('pointerdown', onPointer, { passive: true });
  window.addEventListener('keydown', onKey);
  motion.addEventListener('change', remeasure);
  const ro = new ResizeObserver(remeasure);
  ro.observe(document.body);
  void document.fonts?.ready.then(remeasure);
  return () => {
    if (raf) cancelAnimationFrame(raf);
    window.clearTimeout(intentTimer);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', remeasure);
    window.removeEventListener('load', remeasure);
    window.removeEventListener('pointermove', onPointer);
    window.removeEventListener('pointerdown', onPointer);
    window.removeEventListener('keydown', onKey);
    motion.removeEventListener('change', remeasure);
    ro.disconnect();
  };
}

/** Keeps `small` and `reduced` current. Runs in every layout, since Sig and the nav need them even without the 3D world. */
export function watchViewport(): () => void {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const update = () => world.set({ reduced: motion.matches, small: window.innerWidth < SMALL_BREAKPOINT });
  update();
  window.addEventListener('resize', update);
  motion.addEventListener('change', update);
  const onPointer = (e: PointerEvent) => {
    frame.lookX = e.clientX;
    frame.lookY = e.clientY;
  };
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('pointerdown', onPointer, { passive: true });
  return () => {
    window.removeEventListener('resize', update);
    motion.removeEventListener('change', update);
    window.removeEventListener('pointermove', onPointer);
    window.removeEventListener('pointerdown', onPointer);
  };
}

const CHAPTER_IDS = ['top', 'work', 'approach', 'about', 'contact'];

/** For the flowing layout: which chapter is on screen, tracked from plain scroll position. */
export function watchZones(): () => void {
  let raf = 0;
  const update = () => {
    raf = 0;
    frame.scrollY = window.scrollY;
    const mid = window.innerHeight * 0.4;
    let zone = 0;
    CHAPTER_IDS.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= mid) zone = i;
    });
    world.set({ zone });
  };
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  const ro = new ResizeObserver(onScroll);
  ro.observe(document.body);
  return () => {
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    ro.disconnect();
  };
}
