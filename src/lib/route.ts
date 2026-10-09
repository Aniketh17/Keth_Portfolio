import { useSyncExternalStore } from 'react';

export type Route = { name: 'home' } | { name: 'project'; slug: string };

const PROJECT_PREFIX = '#/projects/';

export function parseHash(hash: string): Route {
  if (hash.startsWith(PROJECT_PREFIX)) {
    const slug = hash.slice(PROJECT_PREFIX.length).split(/[/?]/)[0];
    if (slug) return { name: 'project', slug };
  }
  return { name: 'home' };
}

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
};

/** Routes are hash-based so the site works on any static host without rewrite rules. */
export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash);
  return parseHash(hash);
}

export const projectHref = (slug: string): string => `${PROJECT_PREFIX}${slug}`;

let navigatedInternally = false;
/** True when the visitor came from the home page, so "back" can use history instead of adding an entry. */
export const cameFromHome = (): boolean => navigatedInternally;

export function openProject(slug: string): void {
  navigatedInternally = true;
  window.location.hash = projectHref(slug);
}

export function closeProject(): void {
  if (navigatedInternally && window.history.length > 1) {
    navigatedInternally = false;
    window.history.back();
  } else {
    window.location.hash = '#/';
  }
}

/** Set when a case study is closed so the home page can restore the visitor's scroll position. */
let restoreHomeScroll = false;
export const markRestoreHomeScroll = (): void => {
  restoreHomeScroll = true;
};
export const consumeRestoreHomeScroll = (): boolean => {
  const v = restoreHomeScroll;
  restoreHomeScroll = false;
  return v;
};
