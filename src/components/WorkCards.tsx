import { useState } from 'react';
import { projects } from '../data/projects';
import type { Project } from '../data/types';
import { projectHref } from '../lib/route';
import { Inspector } from './inspectors/Inspector';
import { ExternalLink, projectLinks } from './ui';

const ATLAS: Record<string, string> = {
  'transaction-coding': 'mock/transactions.webp',
  'fit-check': 'mock/fit.webp',
};

/** The first screen of a project, as a poster. Real images where there are any, otherwise the first demo screen. */
function Poster({ project }: { project: Project }) {
  const atlas = ATLAS[project.slug];
  return (
    <div className="poster" style={{ ['--tone' as string]: project.accent }}>
      {project.image ? (
        <img src={project.image.src} alt="" loading="lazy" decoding="async" width={project.image.width} height={project.image.height} />
      ) : atlas ? (
        <div role="img" aria-label="" className="poster-atlas" style={{ backgroundImage: `url(${atlas})` }} />
      ) : null}
    </div>
  );
}

function Card({ project, index }: { project: Project; index: number }) {
  const [open, setOpen] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const links = projectLinks(project);
  return (
    <li className="work-card">
      <Poster project={project} />
      <div className="px-5 pb-6 pt-5">
        <p className="label">
          {String(index + 1).padStart(2, '0')} · {project.category}
          {project.status ? ` · ${project.status}` : ''}
        </p>
        <h3 className="mt-2 text-[1.6rem] font-semibold leading-tight tracking-tight">{project.title}</h3>
        <p className="mt-2 text-muted">{project.hook}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
          {project.technologies.slice(0, 5).map((t) => (
            <li key={t} className="chip">
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1">
          <a href={projectHref(project.slug)} className="btn btn-solid !min-h-12 text-sm">
            Case study <span aria-hidden="true">→</span>
          </a>
          <button type="button" className="link inline-flex min-h-11 items-center text-sm font-medium" aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? 'Close inspection' : 'Inspect system'}
          </button>
        </div>
        {open && (
          <div className="mt-5">
            <Inspector key={project.id} project={project} focusId={focusId} onFocus={setFocusId} />
            <div className="mt-3 flex flex-wrap gap-x-5">
              {links.map((l) => (
                <ExternalLink key={l.url} href={l.url} className="link inline-flex min-h-11 items-center text-sm font-medium">
                  {l.label}
                </ExternalLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

/** The flowing layout's work chapter: one full-width card per project, with the same inspection inside. */
export function WorkCards() {
  return (
    <section id="work" aria-labelledby="work-title" className="wrap scroll-mt-16 pt-14 lg:pt-20">
      <p className="label eyebrow">01 · Selected work</p>
      <h2 id="work-title" className="h-section mt-3">
        Five projects. Five different problems.
      </h2>
      <p className="prose-w mt-3 text-muted">Each one started with a real problem. Open a card to see how it works underneath.</p>
      <ol className="mt-8 grid gap-6 md:grid-cols-2" aria-label="Projects">
        {projects.map((p, i) => (
          <Card key={p.id} project={p} index={i} />
        ))}
      </ol>
    </section>
  );
}
