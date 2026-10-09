import { useSyncExternalStore } from 'react';

export interface Store<S> {
  get: () => S;
  set: (patch: Partial<S>) => void;
  subscribe: (listener: () => void) => () => void;
}

/** Minimal external store: enough for the few pieces of UI state the 3D scene and the page share. */
export function createStore<S extends object>(initial: S): Store<S> {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set: (patch) => {
      const keys = Object.keys(patch) as (keyof S)[];
      if (keys.every((k) => patch[k] === state[k])) return;
      state = { ...state, ...patch };
      listeners.forEach((l) => l());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function useStore<S extends object, T>(store: Store<S>, selector: (s: S) => T): T {
  return useSyncExternalStore(store.subscribe, () => selector(store.get()));
}
