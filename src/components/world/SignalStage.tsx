import { projects } from '../../data/projects';
import { exitInspect, inspect, selectProject } from '../../world/env';
import { PROJECT_COUNT, useWorld } from '../../world/store';
import { projectHref } from '../../lib/route';
import { ExternalLink, projectLinks } from '../ui';
import { InspectionPanel } from './DockPanels';

/**
 * The projects zone. The stage is pinned for a stretch of the scroll, and scrolling through it is what moves the
 * carousel in the 3D world; nothing is hijacked, it is ordinary scrolling over a tall section. The dock is the
 * readable half: it always says which project is in front and offers the next step, and during inspection it
 * becomes the explanation panel for the part being examined.
 */
export function SignalStage() {
  const active = useWorld((s) => s.active);
  const mode = useWorld((s) => s.mode);
  const project = projects[active];
  const links = projectLinks(project);
  const inspecting = mode === 'inspect';

  const onKey = (e: React.KeyboardEvent) => {
    if (inspecting) return;
    if (e.key === 'ArrowRight') selectProject(active + 1);
    if (e.key === 'ArrowLeft') selectProject(active - 1);
  };

  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="pointer-events-none relative"
      style={{ height: `calc(100svh * ${1 + (PROJECT_COUNT - 1) * 0.85})` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="wrap relative h-full pt-20">
          <div className="max-w-md">
            <p className="label eyebrow">01 · Selected work</p>
            <h2 id="work-title" className="h-section mt-2 !text-[clamp(1.5rem,3vw,2.25rem)]">
              Four projects. Four different problems.
            </h2>
          </div>

          <div
            onKeyDown={onKey}
            className="surface pointer-events-auto absolute inset-x-[var(--gutter)] bottom-4 max-h-[52svh] overflow-auto p-4 shadow-[0_18px_40px_-24px_rgba(23,43,77,0.5)] sm:p-5 lg:inset-x-auto lg:bottom-8 lg:left-[var(--gutter)] lg:max-h-[68svh] lg:w-[min(31rem,42vw)]"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="label">
                {String(active + 1).padStart(2, '0')} / {String(PROJECT_COUNT).padStart(2, '0')} · {project.category}
                {project.status ? ` · ${project.status}` : ''}
              </p>
              {!inspecting && (
                <div className="flex items-center gap-1" role="group" aria-label="Projects">
                  <button type="button" className="chip !min-h-10 !px-3" aria-label="Previous project" disabled={active === 0} onClick={() => selectProject(active - 1)}>
                    ←
                  </button>
                  {projects.map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      aria-label={`${i + 1}. ${p.shortTitle}`}
                      aria-current={active === i}
                      onClick={() => selectProject(i)}
                      className="grid h-10 w-6 place-items-center"
                    >
                      <span className={`block h-2.5 rounded-full transition-all ${active === i ? 'w-6 bg-soda' : 'w-2.5 bg-blueberry/30'}`} />
                    </button>
                  ))}
                  <button type="button" className="chip !min-h-10 !px-3" aria-label="Next project" disabled={active === PROJECT_COUNT - 1} onClick={() => selectProject(active + 1)}>
                    →
                  </button>
                </div>
              )}
            </div>

            <h3 key={project.id} className="swap mt-2 text-3xl leading-tight tracking-tight">
              {project.title}
            </h3>

            {inspecting ? (
              <div className="mt-3">
                <InspectionPanel projectId={project.id} />
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button type="button" className="btn btn-solid !min-h-11 text-sm" onClick={exitInspect}>
                    <span aria-hidden="true">←</span> Back to projects
                  </button>
                  <a href={projectHref(project.slug)} className="link inline-flex min-h-11 items-center text-sm font-medium">
                    Full case study
                  </a>
                </div>
              </div>
            ) : (
              <div key={`o-${project.id}`} className="swap">
                <p className="mt-1 font-medium">{project.headline}</p>
                {project.technologies.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Technologies">
                    {project.technologies.slice(0, 5).map((t) => (
                      <li key={t} className="rounded-[4px] bg-blueberry/[0.07] px-2 py-1 font-mono text-[0.7rem] text-blueberry/80">
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-1 text-sm text-muted">{project.hook}</p>
                {project.role && (
                  <p className="mt-2 text-sm">
                    <span className="label">Role · </span>
                    {project.role}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1">
                  <button type="button" className="btn btn-solid !min-h-11 text-sm" onClick={() => inspect()}>
                    Inspect system <span aria-hidden="true">→</span>
                  </button>
                  <a href={projectHref(project.slug)} className="link inline-flex min-h-11 items-center text-sm font-medium">
                    Case study
                  </a>
                  {links.map((l) => (
                    <ExternalLink key={l.url} href={l.url} className="link inline-flex min-h-11 items-center text-sm font-medium">
                      {l.label}
                    </ExternalLink>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
