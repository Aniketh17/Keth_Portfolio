import { useEffect, useState, type ReactNode } from 'react';
import type { Project } from '../data/types';

export function ExternalLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span aria-hidden="true"> ↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** The external links a project actually has. Missing ones are simply not rendered. */
export function projectLinks(p: Project): { label: string; url: string }[] {
  const out: { label: string; url: string }[] = [];
  if (p.demoUrl) out.push({ label: 'Live demo', url: p.demoUrl });
  if (p.repoUrl) out.push({ label: 'Source code', url: p.repoUrl });
  if (p.links) out.push(...p.links);
  return out;
}

/** Real screenshot. If it fails to load the figure disappears rather than leaving a broken image. */
export function Screenshot({ project, eager = false }: { project: Project; eager?: boolean }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [project.image?.src]);
  if (!project.image || broken) return null;
  return (
    <img
      src={`${import.meta.env.BASE_URL}${project.image.src}`}
      alt={project.image.alt}
      width={project.image.width ?? 1024}
      height={project.image.height ?? 515}
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setBroken(true)}
      className="block h-auto w-full"
    />
  );
}

export function useMedia(query: string): boolean {
  const [match, setMatch] = useState(() => (typeof window === 'undefined' ? false : window.matchMedia(query).matches));
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}
