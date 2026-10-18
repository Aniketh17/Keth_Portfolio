import { useState } from 'react';
import { projects } from '../data/projects';
import type { Project } from '../data/types';
import { projectHref } from '../lib/route';
import { Inspector } from './inspectors/Inspector';
import { ExternalLink, projectLinks, useMedia } from './ui';

function Detail({ project, focusId, onFocus }: { project: Project; focusId: string | null; onFocus: (id: string | null) => void }) {
  const links = projectLinks(project);
  return (
    <div>
      <div key={project.id} className="fade-in">
        <p className="label">{project.eyebrow}</p>
        <p className="mt-2 text-xl font-semibold tracking-tight">{project.headline}</p>
        <p className="prose-w mt-2 text-muted">{project.summary}</p>
        {project.role && (
          <p className="mt-3 text-sm">
            <span className="label">Role · </span>
            {project.role}
          </p>
        )}
      </div>
      <div className="mt-5">
        <Inspector key={project.id} project={project} focusId={focusId} onFocus={onFocus} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1">
        <a href={projectHref(project.slug)} className="btn btn-solid !min-h-12 text-sm">
          Read the case study <span aria-hidden="true">→</span>
        </a>
        {links.map((l) => (
          <ExternalLink key={l.url} href={l.url} className="link inline-flex min-h-11 items-center text-sm font-medium">
            {l.label}
          </ExternalLink>
        ))}
      </div>
    </div>
  );
}

/**
 * Editorial index. On wide screens the list narrows to a rail while a region is being inspected and the stage
 * takes the room; on narrow screens the open project expands in place under its row.
 */
export function Work() {
  const wide = useMedia('(min-width: 1024px)');
  const [activeId, setActiveId] = useState(projects[0].id);
  const [focusId, setFocusId] = useState<string | null>(null);
  const active = projects.find((p) => p.id === activeId) ?? projects[0];
  const select = (id: string) => {
    setActiveId(id);
    setFocusId(null);
  };

  return (
    <section id="work" aria-labelledby="work-title" className="wrap scroll-mt-16 pt-8 lg:pt-16">
      <p className="label">01 · Selected work</p>
      <h2 id="work-title" className="h-section mt-3">
        Four projects. Four different problems.
      </h2>
      <p className="prose-w mt-3 text-muted">A closer look at how I approach the work. Pick a project, then inspect its evidence.</p>

      <div className="work-grid mt-10 grid gap-10" data-engaged={focusId ? 'true' : 'false'}>
        <ol aria-label="Projects" className="self-start border-b border-line">
          {projects.map((p, i) => {
            const open = p.id === activeId;
            return (
              <li key={p.id}>
                <button type="button" className="index-row" aria-pressed={open} aria-expanded={wide ? undefined : open} onClick={() => select(p.id)}>
                  <span className="label">
                    {String(i + 1).padStart(2, '0')} · {p.category}
                    {p.status ? ` · ${p.status}` : ''}
                  </span>
                  <span className="text-xl font-semibold tracking-tight">{p.title}</span>
                  <span className="hook text-sm text-muted">{p.hook}</span>
                </button>
                {!wide && open && (
                  <div className="py-5">
                    <Detail project={p} focusId={focusId} onFocus={setFocusId} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        {wide && (
          <div>
            <Detail project={active} focusId={focusId} onFocus={setFocusId} />
          </div>
        )}
      </div>
    </section>
  );
}
