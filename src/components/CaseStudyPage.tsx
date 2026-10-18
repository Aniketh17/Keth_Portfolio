import { useEffect, type ReactNode } from 'react';
import { getProjectBySlug, projects } from '../data/projects';
import type { Project } from '../data/types';
import { closeProject, projectHref } from '../lib/route';
import { ExplodedFlow } from './Artifact';
import { Inspector } from './inspectors/Inspector';
import { ExternalLink, projectLinks } from './ui';

function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content ?? '';
    document.title = title;
    if (meta) meta.content = description;
    return () => {
      document.title = previousTitle;
      if (meta) meta.content = previousDescription;
    };
  }, [title, description]);
}

function Block({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  const id = `cs-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <section aria-labelledby={id} className="grid gap-3 border-t border-line py-9 md:grid-cols-[11rem_1fr] md:gap-10">
      <div>
        <p className="label">{n}</p>
        <h2 id={id} className="mt-1 text-xl font-semibold tracking-tight">
          {title}
        </h2>
      </div>
      <div className="min-w-0 space-y-4">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="prose-w list-disc space-y-2 pl-5 marker:text-soda">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}

function CaseStudy({ project }: { project: Project }) {
  const links = projectLinks(project);
  const others = projects.filter((p) => p.id !== project.id);
  // Section numbers are assigned in order, so a project with fewer sections never shows a gap.
  let count = 0;
  const next = () => String(++count).padStart(2, '0');

  return (
    <article>
      <header className="fade-in pb-10">
        <p className="label">{project.eyebrow}</p>
        <h1 className="h-hero mt-4 !text-[clamp(2rem,5.5vw,4rem)]">{project.title}</h1>
        <p className="mt-4 text-xl font-medium tracking-tight">{project.headline}</p>
        <p className="prose-w mt-3 text-lg text-muted">{project.summary}</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          {project.status && <span className="label rounded-full border border-line px-3 py-1 !text-blueberry">{project.status}</span>}
          {links.map((l) => (
            <ExternalLink key={l.url} href={l.url} className="btn btn-ghost !min-h-11 text-sm">
              {l.label}
            </ExternalLink>
          ))}
        </div>
      </header>

      <Inspector project={project} />

      {(project.role || project.technologies.length > 0) && (
        <dl className="mt-8 grid gap-6 border-t border-line py-6 sm:grid-cols-2">
          {project.role && (
            <div>
              <dt className="label">Role</dt>
              <dd className="mt-1">{project.role}</dd>
            </div>
          )}
          {project.technologies.length > 0 && (
            <div>
              <dt className="label">Technologies</dt>
              <dd className="mt-1">{project.technologies.join(' · ')}</dd>
            </div>
          )}
        </dl>
      )}

      {project.problem && (
        <Block n={next()} title="Problem and context">
          <p className="prose-w">{project.problem}</p>
          {project.whyItMatters && <p className="prose-w text-muted">{project.whyItMatters}</p>}
        </Block>
      )}

      {project.contribution && (
        <Block n={next()} title="My contribution">
          <Bullets items={project.contribution} />
        </Block>
      )}

      {project.approach && (
        <Block n={next()} title="Approach">
          <ol className="prose-w list-decimal space-y-2 pl-5 marker:font-semibold marker:text-blueberry">
            {project.approach.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ol>
        </Block>
      )}

      {project.diagrams?.map((d) => (
        <Block key={d.title} n={next()} title="Flow">
          <ExplodedFlow diagram={d} />
        </Block>
      ))}

      {project.definitions && (
        <Block n={next()} title={project.definitions.title}>
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {project.definitions.rows.map((r) => (
              <div key={r.term} className="border-t border-line pt-3">
                <dt className="font-semibold">{r.term}</dt>
                <dd className="mt-1 text-muted">{r.meaning}</dd>
              </div>
            ))}
          </dl>
        </Block>
      )}

      {project.decisions && (
        <Block n={next()} title="Decisions and trade-offs">
          <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {project.decisions.map((d) => (
              <div key={d.title} className="border-t border-line pt-3">
                <dt className="font-semibold">{d.title}</dt>
                <dd className="mt-1 text-muted">{d.body}</dd>
              </div>
            ))}
          </dl>
        </Block>
      )}

      {project.features && (
        <Block n={next()} title="Features">
          <Bullets items={project.features} />
        </Block>
      )}

      {project.principles && (
        <Block n={next()} title="Principles">
          <Bullets items={project.principles} />
        </Block>
      )}

      {project.achievements && (
        <Block n={next()} title="Recognition">
          <Bullets items={project.achievements} />
        </Block>
      )}

      {project.outcomes && (
        <Block n={next()} title="Results">
          <Bullets items={project.outcomes} />
        </Block>
      )}

      {project.limitations && (
        <Block n={next()} title="Limits and caveats">
          <Bullets items={project.limitations} />
        </Block>
      )}

      <nav aria-label="Other projects" className="border-t border-line pt-9">
        <h2 className="label !text-blueberry">Other projects</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {others.map((p) => (
            <li key={p.id}>
              <a href={projectHref(p.slug)} className="surface flex min-h-16 flex-col justify-center p-4 transition-colors hover:bg-white">
                <span className="font-semibold">{p.shortTitle}</span>
                <span className="text-sm text-muted">{p.category}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </article>
  );
}

function NotFound() {
  return (
    <div>
      <h1 className="h-section">That project isn't here.</h1>
      <p className="mt-3 text-lg text-muted">Try one of these:</p>
      <ul className="mt-4 list-disc space-y-1 pl-5">
        {projects.map((p) => (
          <li key={p.id}>
            <a className="link" href={projectHref(p.slug)}>
              {p.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CaseStudyPage({ slug }: { slug: string }) {
  const project = getProjectBySlug(slug);
  usePageMeta(
    project ? `${project.title} — Aniketh Rao` : 'Project not found — Aniketh Rao',
    project ? project.summary : 'This project does not exist.',
  );
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  return (
    <>
      <header className="border-b border-line">
        <div className="wrap flex items-center justify-between py-1">
          <button type="button" onClick={closeProject} className="btn btn-ghost !min-h-11 !px-4 text-sm">
            <span aria-hidden="true">←</span> All work
          </button>
          <span className="font-semibold tracking-tight">Aniketh Rao</span>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="wrap py-12 outline-none lg:py-16">
        {project ? <CaseStudy project={project} /> : <NotFound />}
      </main>
    </>
  );
}
