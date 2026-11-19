import { useSyncExternalStore } from 'react';

/**
 * One source of truth for the world. The scene, the camera rig, the scroll handler and the HTML dock all read
 * and write here, so there is nothing to contradict anything else:
 *
 *  - `frame` is plain mutable data, written by the scroll listener and read by the render loop every frame.
 *    It never triggers a React render.
 *  - `world` is a small subscribable store for the few values React needs (active project, inspection, status).
 */

export const PROJECT_COUNT = 5;

export type WorldStatus = 'loading' | 'ready' | 'failed' | 'unsupported';
export type Mode = 'overview' | 'inspect';
export type Mood = 'idle' | 'happy' | 'think' | 'surprised' | 'sleepy';

export interface Say {
  id: number;
  text: string;
  mood: Mood;
  /** Offer the three "what do you want to see" choices under the line. */
  offer?: boolean;
  /** A shortcut to a project's write-up, shown under the line. */
  link?: { label: string; slug: string };
}

export interface WorldState {
  status: WorldStatus;
  reduced: boolean;
  /** Phones and small tablets. They get the flowing page, with no 3D world. */
  small: boolean;
  /** True when the page is the plain flowing layout (a small screen, or no WebGL). */
  lite: boolean;
  mode: Mode;
  /** Which chapter the camera is in: 0 arrival, 1 work, 2 approach, 3 experience, 4 contact. */
  zone: number;
  /** Sig, the mascot: what it is saying (null is quiet), how it looks, and whether the visitor muted it. */
  say: Say | null;
  quiet: boolean;
  /** Index of the project currently in front. */
  active: number;
  /** The region, requirement, transaction or step being inspected; null is the overview of that project. */
  focus: string | null;
  /** Highlighted decision in the systems view, and highlighted entry on the timeline. */
  decision: string | null;
  timeline: string | null;
}

export interface FrameState {
  scrollY: number;
  vh: number;
  /** Float position of the carousel, 0..PROJECT_COUNT-1. Derived from scroll, frozen while inspecting. */
  carousel: number;
  /** Where the scroll-driven journey is, as a (waypoint, fraction) pair resolved to destination indices. */
  from: number;
  to: number;
  blend: number;
  pointerX: number;
  pointerY: number;
  /** Last pointer position in pixels, from any pointer type (NaN until the first move). Sig looks at it. */
  lookX: number;
  lookY: number;
  /** Incremented on every poke; Sig plays a different reaction each time. */
  pokes: number;
  /** Scroll offsets that bound the sticky project stage. */
  stageStart: number;
  stageRange: number;
  /** Waypoints: scroll offset and the destination the camera should hold there. Ascending. */
  waypoints: { s: number; d: number }[];
}

export const frame: FrameState = {
  scrollY: 0,
  vh: 800,
  carousel: 0,
  from: 0,
  to: 0,
  blend: 0,
  pointerX: 0,
  pointerY: 0,
  lookX: NaN,
  lookY: NaN,
  pokes: 0,
  stageStart: 0,
  stageRange: 1,
  waypoints: [{ s: 0, d: 0 }],
};

type Listener = () => void;
let state: WorldState = {
  status: 'loading',
  reduced: false,
  small: typeof window !== 'undefined' && window.innerWidth < 820,
  lite: typeof window !== 'undefined' && window.innerWidth < 820,
  mode: 'overview',
  zone: 0,
  say: null,
  quiet: false,
  active: 0,
  focus: null,
  decision: null,
  timeline: null,
};
const listeners = new Set<Listener>();

export const world = {
  get: (): WorldState => state,
  set: (patch: Partial<WorldState>): void => {
    const keys = Object.keys(patch) as (keyof WorldState)[];
    if (keys.every((k) => patch[k] === state[k])) return;
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe: (l: Listener): (() => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useWorld<T>(selector: (s: WorldState) => T): T {
  return useSyncExternalStore(world.subscribe, () => selector(world.get()));
}
