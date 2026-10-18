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

let homeScroll = 0;
/** Remember where the visitor was on the home page so closing a case study returns them there. */
export const rememberHomeScroll = (): void => {
  homeScroll = window.scrollY;
};
export const takeHomeScroll = (): number => {
  const y = homeScroll;
  homeScroll = 0;
  return y;
};

export function closeProject(): void {
  window.location.hash = '#/';
}
