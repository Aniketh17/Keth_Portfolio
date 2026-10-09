import { useEffect, type ReactNode } from 'react';
import { getProjectBySlug, projects } from '../data/projects';
import type { Diagram, EvidenceExample, Project } from '../data/types';
import { closeProject, markRestoreHomeScroll, projectHref } from '../lib/route';
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

function CaseSection({ title, children }: { title: string; children: ReactNode }) {
  const id = `cs-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <section aria-labelledby={id} className="mt-12">
      <h2 id={id} className="font-display text-2xl font-semibold sm:text-3xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[1.05rem] leading-relaxed text-ink/85">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-violet-deep">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}

/** A vertical, numbered flow: reads the same on a phone and a desktop, and is a real ordered list for screen readers. */
function FlowDiagram({ diagram, accent }: { diagram: Diagram; accent: string }) {
  return (
    <figure className="rounded-3xl bg-night p-5 text-ivory sm:p-7">
      <figcaption className="font-display text-xl font-semibold">{diagram.title}</figcaption>
      {diagram.caption && <p className="mt-1 text-sm text-ivory/70">{diagram.caption}</p>}
      <ol className="mt-5 space-y-0">
        {diagram.steps.map((s, i) => (
          <li key={s.label} className="relative flex gap-4 pb-5 last:pb-0">
            {i < diagram.steps.length - 1 && (
              <span aria-hidden="true" className="absolute left-[0.95rem] top-8 h-[calc(100%-1.5rem)] w-px bg-ivory/25" />
            )}
            <span
              aria-hidden="true"
              className="z-10 flex h-8 w-8 flex-none items-center justify-center rounded-full font-mono text-xs font-semibold text-ink"
              style={{ background: accent }}
            >
              {i + 1}
            </span>
            <div>
              <p className="font-semibold">{s.label}</p>
              <p className="text-sm text-ivory/75">{s.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </figure>
  );
}

const STATE_GLYPH: Record<string, string> = { Direct: '✓', Related: '≈', 'Needs confirmation': '?', 'Not found': '–' };

function EvidenceTable({ example }: { example: EvidenceExample }) {
  return (
    <figure>
      <figcaption className="font-display text-xl font-semibold text-ink">{example.title}</figcaption>
      <p className="mt-1 rounded-lg bg-peach/25 px-3 py-2 text-sm text-ink">{example.disclaimer}</p>
      <ul className="mt-4 space-y-3">
        {example.rows.map((r) => (
          <li key={r.requirement} className="rounded-2xl border border-ink/15 bg-white/60 p-4">
            <p className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-0.5 font-mono text-xs uppercase tracking-wide text-ivory">
                <span aria-hidden="true">{STATE_GLYPH[r.state]}</span>
                {r.state}
              </span>
            </p>
            <dl className="mt-3 grid gap-3 text-sm md:grid-cols-3">
              <div>
                <dt className="font-mono text-[0.75rem] uppercase tracking-wider text-ink/60">Job requirement</dt>
                <dd className="mt-0.5 font-medium">{r.requirement}</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.75rem] uppercase tracking-wider text-ink/60">Evidence found</dt>
                <dd className="mt-0.5">{r.evidence}</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.75rem] uppercase tracking-wider text-ink/60">Shown to the applicant</dt>
                <dd className="mt-0.5">{r.explanation}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </figure>
  );
}

function CaseStudy({ project }: { project: Project }) {
  const links = projectLinks(project);
  const others = projects.filter((p) => p.id !== project.id);

  return (
    <article>
      <header className="border-l-8 pl-5" style={{ borderColor: project.accent }}>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink/70">{project.eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] sm:text-5xl">{project.title}</h1>
        <p className="mt-4 font-display text-xl italic text-violet-deep sm:text-2xl">{project.headline}</p>
        <p className="mt-4 max-w-2xl text-lg text-ink/85">{project.summary}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {project.status && (
            <span className="rounded-full bg-ink px-3 py-1 font-mono text-xs uppercase tracking-wide text-ivory">{project.status}</span>
          )}
          {links.map((l) => (
            <ExternalLink
              key={l.url}
              href={l.url}
              className="inline-flex min-h-11 items-center rounded-full border-2 border-ink px-4 text-sm font-semibold hover:bg-ink hover:text-ivory"
            >
              {l.label}
            </ExternalLink>
          ))}
        </div>
      </header>

      {project.image && (
        <figure className="mt-8 overflow-hidden rounded-3xl border border-ink/15 bg-night2">
          <img
            src={`${import.meta.env.BASE_URL}${project.image.src}`}
            alt={project.image.alt}
            className="w-full"
            onError={(e) => (e.currentTarget.parentElement!.hidden = true)}
          />
        </figure>
      )}

      {(project.role || project.technologies.length > 0) && (
        <dl className="mt-8 grid gap-4 rounded-2xl bg-ivory-dim p-5 text-sm sm:grid-cols-2">
          {project.role && (
            <div>
              <dt className="font-mono text-xs uppercase tracking-wider text-ink/60">Role</dt>
              <dd className="mt-1">{project.role}</dd>
            </div>
          )}
          {project.technologies.length > 0 && (
            <div>
              <dt className="font-mono text-xs uppercase tracking-wider text-ink/60">Technologies</dt>
              <dd className="mt-1">{project.technologies.join(' · ')}</dd>
            </div>
          )}
        </dl>
      )}

      {project.problem && (
        <CaseSection title="The problem">
          <p>{project.problem}</p>
          {project.whyItMatters && <p>{project.whyItMatters}</p>}
        </CaseSection>
      )}

      {project.contribution && (
        <CaseSection title="What I built">
          <BulletList items={project.contribution} />
        </CaseSection>
      )}

      {project.approach && (
        <CaseSection title="Technical approach">
          <ol className="list-decimal space-y-2 pl-5 marker:font-semibold marker:text-violet-deep">
            {project.approach.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ol>
        </CaseSection>
      )}

      {project.diagrams?.map((d) => (
        <div key={d.title} className="mt-10">
          <FlowDiagram diagram={d} accent={project.accent} />
        </div>
      ))}

      {project.definitions && (
        <CaseSection title={project.definitions.title}>
          <dl className="grid gap-3 sm:grid-cols-2">
            {project.definitions.rows.map((r) => (
              <div key={r.term} className="rounded-2xl border border-ink/15 bg-white/60 p-4">
                <dt className="flex items-center gap-2 font-semibold">
                  <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full bg-ink font-mono text-xs text-ivory">
                    {STATE_GLYPH[r.term]}
                  </span>
                  {r.term}
                </dt>
                <dd className="mt-1 text-sm">{r.meaning}</dd>
              </div>
            ))}
          </dl>
        </CaseSection>
      )}

      {project.example && (
        <div className="mt-10">
          <EvidenceTable example={project.example} />
        </div>
      )}

      {project.decisions && (
        <CaseSection title="Decisions that shaped it">
          <div className="grid gap-4 sm:grid-cols-2">
            {project.decisions.map((d) => (
              <div key={d.title} className="rounded-2xl border border-ink/15 bg-white/60 p-5">
                <h3 className="font-display text-lg font-semibold">{d.title}</h3>
                <p className="mt-2 text-base">{d.body}</p>
              </div>
            ))}
          </div>
        </CaseSection>
      )}

      {project.features && (
        <CaseSection title="Features">
          <BulletList items={project.features} />
        </CaseSection>
      )}

      {project.principles && (
        <CaseSection title="Principles it follows">
          <BulletList items={project.principles} />
        </CaseSection>
      )}

      {project.achievements && (
        <CaseSection title="Recognition">
          <BulletList items={project.achievements} />
        </CaseSection>
      )}

      {project.outcomes && (
        <CaseSection title="Results">
          <BulletList items={project.outcomes} />
        </CaseSection>
      )}

      {project.limitations && (
        <CaseSection title="Limits and caveats">
          <BulletList items={project.limitations} />
        </CaseSection>
      )}

      <nav aria-label="Other projects" className="mt-16 border-t border-ink/15 pt-8">
        <h2 className="font-display text-2xl font-semibold">Other projects</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {others.map((p) => (
            <li key={p.id}>
              <a
                href={projectHref(p.slug)}
                className="flex min-h-16 flex-col justify-center rounded-2xl border border-ink/20 bg-white/60 p-4 hover:bg-white"
              >
                <span className="font-semibold">{p.shortTitle}</span>
                <span className="text-sm text-ink/70">{p.category}</span>
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
      <h1 className="font-display text-4xl font-semibold">That project isn't here.</h1>
      <p className="mt-3 text-lg">Milo looked everywhere. Try one of these:</p>
      <ul className="mt-4 list-disc space-y-1 pl-5">
        {projects.map((p) => (
          <li key={p.id}>
            <a className="underline" href={projectHref(p.slug)}>
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
    project ? `${project.title} — Aniketh` : 'Project not found — Aniketh',
    project ? project.summary : 'This project does not exist.',
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    return markRestoreHomeScroll;
  }, [slug]);

  return (
    <div className="on-ivory min-h-screen bg-ivory text-ink">
      <header className="bg-night text-ivory">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-2 sm:px-8">
          <button
            type="button"
            onClick={closeProject}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ivory/40 px-4 text-sm font-medium hover:bg-white/10"
          >
            <span aria-hidden="true">←</span> Back to the journey
          </button>
          <span className="font-display text-lg font-semibold">
            Aniketh Rao<span className="text-citron">.</span>
          </span>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-3xl px-5 pb-20 pt-10 sm:px-8">
        {project ? <CaseStudy project={project} /> : <NotFound />}
      </main>
    </div>
  );
}
