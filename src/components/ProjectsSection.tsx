import { getProjectById, projects, routes } from '../data/projects';
import type { Project } from '../data/types';
import { ui } from '../lib/journey';
import { projectHref } from '../lib/route';
import { useStore } from '../lib/store';
import { FetchTheProof } from './FetchTheProof';
import { PeekLane } from './lite/PeekLane';
import { Eyebrow, Section } from './Section';
import { ExternalLink, ProjectVisual, projectLinks } from './ui';

function ProjectCard({ project, picked }: { project: Project; picked: boolean }) {
  const links = projectLinks(project);
  const chips = project.technologies.length ? project.technologies.slice(0, 5) : [project.category];
  return (
    <article
      className={`on-ivory group relative flex flex-col overflow-hidden rounded-3xl bg-ivory text-ink transition-transform hover:-translate-y-1 ${
        picked ? 'ring-4 ring-citron' : ''
      }`}
    >
      <div className="aspect-[16/9] w-full overflow-hidden bg-night2">
        <ProjectVisual project={project} />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[0.75rem] uppercase tracking-wider text-ink/70">
          <span>{project.category}</span>
          {project.status && <span className="rounded-full bg-ink/10 px-2 py-0.5">{project.status}</span>}
          {picked && <span className="rounded-full bg-citron px-2 py-0.5 font-semibold text-ink">Milo's pick</span>}
        </div>
        <h3 className="mt-2 font-display text-xl font-semibold leading-snug">
          <a
            href={projectHref(project.slug)}
            className="after:absolute after:inset-0 after:content-[''] focus-dark focus-visible:outline-violet-deep"
          >
            {project.title}
          </a>
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink/80">{project.hook}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies and focus">
          {chips.map((c) => (
            <li key={c} className="rounded-full bg-night/8 px-2.5 py-1 text-xs font-medium text-ink/80 ring-1 ring-ink/15">
              {c}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-5 text-sm font-semibold">
          <span className="text-violet-deep">
            Read the case study<span aria-hidden="true"> →</span>
          </span>
          {links.slice(0, 2).map((l) => (
            <ExternalLink key={l.url} href={l.url} className="relative z-10 inline-flex min-h-11 items-center text-ink/80 underline underline-offset-2">
              {l.label}
            </ExternalLink>
          ))}
        </div>
      </div>
    </article>
  );
}

export function ProjectsSection() {
  const fetchRoute = useStore(ui, (s) => s.fetchRoute);
  const pickedId = fetchRoute ? getProjectById(routes.find((r) => r.id === fetchRoute)?.projectId ?? '')?.id : undefined;

  return (
    <Section id="work" titleId="work-title" fill={false} band={1}>
      <Eyebrow>Selected work</Eyebrow>
      <h2 id="work-title" className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
        Four projects. Four different problems.
      </h2>
      <p className="mt-4 max-w-xl text-lg text-ivory/85">A closer look at how I approach the work.</p>

      <PeekLane kind="work" />

      <div className="mt-8">
        <FetchTheProof />
      </div>

      <div className="mt-14 flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
        <h3 className="font-display text-2xl font-semibold">All four projects</h3>
        <span className="font-mono text-xs uppercase tracking-widest text-ivory/55">Case studies</span>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} picked={pickedId === p.id} />
        ))}
      </div>
    </Section>
  );
}
