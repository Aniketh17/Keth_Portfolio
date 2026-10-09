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

/**
 * Real screenshot when there is one and it loads; otherwise a typographic tile built from the project's own
 * workflow steps, so a missing or broken image never leaves a hole or throws.
 */
export function ProjectVisual({ project, className = '' }: { project: Project; className?: string }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [project.image?.src]);
  const src = project.image && !broken ? `${import.meta.env.BASE_URL}${project.image.src}` : null;

  if (src && project.image) {
    return (
      <img
        src={src}
        alt={project.image.alt}
        loading="lazy"
        onError={() => setBroken(true)}
        className={`h-full w-full object-cover object-top ${className}`}
      />
    );
  }

  const steps = project.diagrams?.[0]?.steps.slice(0, 4);
  return (
    <div
      className={`flex h-full w-full flex-col justify-center gap-2 p-5 ${className}`}
      style={{ background: `linear-gradient(135deg, #181C36 0%, #222750 100%)`, borderTop: `4px solid ${project.accent}` }}
    >
      {steps ? (
        <ol className="flex flex-col gap-1.5 font-mono text-[0.75rem] uppercase tracking-wider text-ivory/90">
          {steps.map((s, i) => (
            <li key={s.label} className="flex items-center gap-2">
              <span aria-hidden="true" className="text-ivory/60">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{s.label}</span>
              {i < steps.length - 1 && (
                <span aria-hidden="true" className="ml-auto text-ivory/40">
                  ↓
                </span>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <span className="font-display text-3xl text-ivory">{project.shortTitle}</span>
      )}
    </div>
  );
}
