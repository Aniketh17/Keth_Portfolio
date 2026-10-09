import type { RouteId } from '../data/types';
import { createStore } from './store';

/**
 * Journey state, split by who needs it and how often:
 *
 *  - `frame` is plain mutable data. The scroll listener writes it, the render
 *    loop reads it every frame. It never touches React, so scrolling cannot
 *    cause re-renders.
 *  - `ui` is a subscribable store for the handful of values React does care
 *    about (active landing, scene status, Fetch the Proof phase).
 *
 * Three separate concepts live here:
 *  A. progress       -> `frame.targetT`, derived from scroll position
 *  B. velocity       -> derived in the render loop from how fast targetT/t move
 *  C. content state  -> `ui.landing` (which section is current)
 */

export const SECTIONS = [
  { id: 'intro', label: 'Intro' },
  { id: 'work', label: 'Work' },
  { id: 'skills', label: 'Skills' },
  { id: 'journey', label: 'Journey' },
  { id: 'contact', label: 'Contact' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];
export const LANDING_COUNT = SECTIONS.length;

export type FetchPhase = 'idle' | 'travel' | 'react' | 'arrived';
/** desktop: full 3D beside the content. tablet3d: opt-in 3D strip. lite: 2D sprite stages, no WebGL. */
export type ViewMode = 'desktop' | 'tablet3d' | 'lite';
export type SceneStatus = 'loading' | 'ready' | 'failed' | 'unsupported';

export interface FrameState {
  /** Scroll offset (px) at which each landing's section is "current". Monotonic. */
  anchors: number[];
  scrollY: number;
  /** Where Milo should be, 0..1 along the staircase, from scroll alone. */
  targetT: number;
  /** While set, Milo walks here instead of following scroll (Fetch the Proof). */
  override: { t: number; routeId: RouteId } | null;
  /** Pointer in -1..1, for subtle head tracking. */
  pointerX: number;
  pointerY: number;
  /** Petting: incremented on each tap; the scene reads these without going through React. */
  petCount: number;
  lastPet: number;
  hoverMilo: boolean;
}

export const frame: FrameState = {
  anchors: [0, 1, 2, 3, 4],
  scrollY: 0,
  targetT: 0,
  override: null,
  pointerX: 0,
  pointerY: 0,
  petCount: 0,
  lastPet: -1e9,
  hoverMilo: false,
};

export interface UiState {
  landing: number;
  scene: SceneStatus;
  reducedMotion: boolean;
  /** Stacked = the 3D scene is a strip above the content (tablet 3D only). */
  stacked: boolean;
  view: ViewMode;
  /** Narrower than 1024px: compact layouts (accordions, tabs, single column). */
  compact: boolean;
  /** Tablet-sized and WebGL-capable, so the 3D toggle is offered. */
  canTablet3d: boolean;
  /** The browser asked to save data: sprites stay still. */
  saveData: boolean;
  fetchRoute: RouteId | null;
  fetchPhase: FetchPhase;
  /** Mirrors frame.petCount so the page can react (speech bubble, counter). */
  petCount: number;
  /** True while Milo is walking or running; the pet prompt hides then. */
  miloMoving: boolean;
  /** Set by Milo's peek chips on phones: which Journey tab is showing, and whether every skills group is open. */
  journeyTab: 'exp' | 'ach' | 'edu';
  skillsOpenAll: boolean;
}

export const ui = createStore<UiState>({
  landing: 0,
  scene: 'loading',
  reducedMotion: false,
  stacked: false,
  view: 'desktop',
  compact: false,
  canTablet3d: false,
  saveData: false,
  fetchRoute: null,
  fetchPhase: 'idle',
  petCount: 0,
  miloMoving: false,
  journeyTab: 'exp',
  skillsOpenAll: false,
});

export function petMilo(): void {
  frame.petCount += 1;
  frame.lastPet = performance.now();
  ui.set({ petCount: frame.petCount });
}

/** Landing positions along the staircase, as evenly spaced progress values. */
export const landingT = (i: number): number => i / (LANDING_COUNT - 1);

/** Piecewise-linear map from scroll offset to staircase progress through the section anchors. */
export function scrollToProgress(scrollY: number, anchors: number[]): number {
  const last = anchors.length - 1;
  if (scrollY <= anchors[0]) return 0;
  if (scrollY >= anchors[last]) return 1;
  for (let i = 0; i < last; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];
    if (scrollY <= b) return (i + (scrollY - a) / Math.max(1, b - a)) / last;
  }
  return 1;
}

export function nearestLanding(t: number): number {
  return Math.min(LANDING_COUNT - 1, Math.max(0, Math.round(t * (LANDING_COUNT - 1))));
}

/**
 * Measure each section and decide which scroll offset corresponds to "Milo is
 * at this landing". A landing is current when its section is centred in the
 * visible content area (below the scene strip on narrow screens). The first
 * and last landings pin to the top and bottom of the page so they are always
 * reachable.
 */
export function measureAnchors(stripHeight: number): void {
  const vh = window.innerHeight;
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);
  const visibleCentre = stripHeight + (vh - stripHeight) / 2;
  const anchors = SECTIONS.map(({ id }, i) => {
    const el = document.getElementById(id);
    if (!el) return i;
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    return top + rect.height / 2 - visibleCentre;
  });
  anchors[0] = 0;
  anchors[anchors.length - 1] = maxScroll;
  for (let i = 1; i < anchors.length; i++) {
    anchors[i] = Math.min(maxScroll, Math.max(anchors[i], anchors[i - 1] + 1));
  }
  frame.anchors = anchors;
}

export function syncFromScroll(): void {
  frame.scrollY = window.scrollY;
  frame.targetT = scrollToProgress(frame.scrollY, frame.anchors);
  ui.set({ landing: nearestLanding(frame.targetT) });
}
