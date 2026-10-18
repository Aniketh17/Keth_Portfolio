import { useSyncExternalStore } from 'react';

/**
 * One source of truth for the world. The scene, the camera rig, the scroll handler and the HTML dock all read
 * and write here, so there is nothing to contradict anything else:
 *
 *  - `frame` is plain mutable data, written by the scroll listener and read by the render loop every frame.
 *    It never triggers a React render.
 *  - `world` is a small subscribable store for the few values React needs (active project, inspection, status).
 */

export const PROJECT_COUNT = 4;

export type WorldStatus = 'loading' | 'ready' | 'failed' | 'unsupported';
export type Mode = 'overview' | 'inspect';

export interface WorldState {
  status: WorldStatus;
  reduced: boolean;
  /** Phones and small tablets: portrait camera framing and a lighter scene. */
  small: boolean;
  mode: Mode;
  /** Index of the project currently in front. */
  active: number;
  /** The region, requirement, transaction or step being inspected; null is the overview of that project. */
  focus: string | null;
  /** Fit Check: which claims the visitor has used or confirmed. */
  fitUsed: Record<string, boolean>;
  fitConfirmed: Record<string, boolean>;
  /** Transaction Coding: the reviewer's decisions. */
  txDecisions: Record<string, string>;
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
  stageStart: 0,
  stageRange: 1,
  waypoints: [{ s: 0, d: 0 }],
};

type Listener = () => void;
let state: WorldState = {
  status: 'loading',
  reduced: false,
  small: false,
  mode: 'overview',
  active: 0,
  focus: null,
  fitUsed: { 'req-0': true },
  fitConfirmed: {},
  txDecisions: {},
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
