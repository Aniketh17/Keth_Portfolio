import { useId, useState } from 'react';
import type { Diagram, EvidenceExample, Project } from '../data/types';
import { Screenshot } from './ui';

/**
 * Artifact presentation. Level 1 is the artifact itself with a one-line caption; level 2 is inspection (the
 * exploded flow, with a selectable step); level 3 is the full case study, linked from the caller.
 */

const BASIS_LABEL: Record<Diagram['basis'], string> = {
  documented: 'Documented in the project README',
  conceptual: 'Conceptual flow, from the project brief (not verified against code)',
};

/**
 * A pipeline as stacked layers. "Inspect" separates them; selecting a layer shows what it does. All text is in
 * the DOM at all times and the buttons work by keyboard and touch, so nothing depends on hover or motion.
 */
export function ExplodedFlow({ diagram, compactDefault = false }: { diagram: Diagram; compactDefault?: boolean }) {
  const [exploded, setExploded] = useState(!compactDefault);
  const [active, setActive] = useState(0);
  const panelId = useId();
  const step = diagram.steps[active];

  return (
    <figure className="surface p-5 sm:p-6">
      <figcaption>
        <p className="label">{BASIS_LABEL[diagram.basis]}</p>
        <p className="mt-1 text-lg font-semibold tracking-tight">{diagram.title}</p>
        {diagram.caption && <p className="mt-1 text-sm text-muted">{diagram.caption}</p>}
      </figcaption>

      <div className="mt-5 grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-start">
        <ol className={exploded ? 'exploded' : 'stack'} aria-label={`${diagram.title}, in order`}>
          {diagram.steps.map((s, i) => (
            <li key={s.label} style={{ ['--i' as string]: i }} className="layer-li">
              <button
                type="button"
                className="layer flex min-h-12 w-full items-center gap-3 rounded-[6px] border border-[var(--line)] bg-paper px-4 py-2 text-left"
                aria-pressed={active === i}
                aria-controls={panelId}
                onClick={() => {
                  setActive(i);
                  setExploded(true);
                }}
                style={{ ['--i' as string]: i }}
              >
                <span className="label !text-blueberry">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-semibold">{s.label}</span>
              </button>
            </li>
          ))}
        </ol>

        <div id={panelId} aria-live="polite" className="min-h-[7rem] border-l-2 border-soda pl-4">
          <p className="label">
            Step {active + 1} of {diagram.steps.length}
          </p>
          <p key={active} className="layer-enter mt-1 text-lg font-semibold">
            {step.label}
          </p>
          <p key={`d${active}`} className="layer-enter mt-1 text-muted">
            {step.detail}
          </p>
          <div className="mt-4 flex gap-2">
            <button type="button" className="btn btn-ghost !min-h-10 !px-3 text-sm" onClick={() => setActive((a) => Math.max(0, a - 1))} disabled={active === 0}>
              Previous
            </button>
            <button
              type="button"
              className="btn btn-ghost !min-h-10 !px-3 text-sm"
              onClick={() => setActive((a) => Math.min(diagram.steps.length - 1, a + 1))}
              disabled={active === diagram.steps.length - 1}
            >
              Next
            </button>
            <button type="button" className="btn btn-ghost !min-h-10 !px-3 text-sm" aria-pressed={exploded} onClick={() => setExploded((e) => !e)}>
              {exploded ? 'Stack layers' : 'Separate layers'}
            </button>
          </div>
        </div>
      </div>
    </figure>
  );
}

const STATE_MARK: Record<string, string> = { Direct: '✓', Related: '≈', 'Needs confirmation': '?', 'Not found': '–' };

/** Requirement, evidence, explanation. Used only for the clearly labelled synthetic Fit Check example. */
export function EvidenceTable({ example }: { example: EvidenceExample }) {
  const [open, setOpen] = useState(0);
  return (
    <figure className="surface p-5 sm:p-6">
      <figcaption>
        <p className="label">Illustration</p>
        <p className="mt-1 text-lg font-semibold tracking-tight">{example.title}</p>
        <p className="mt-2 border-l-2 border-soda pl-3 text-sm text-muted">{example.disclaimer}</p>
      </figcaption>
      <ul className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {example.rows.map((r, i) => (
          <li key={r.requirement}>
            <button
              type="button"
              aria-expanded={open === i}
              onClick={() => setOpen(open === i ? -1 : i)}
              className="flex min-h-12 w-full items-center justify-between gap-3 py-3 text-left"
            >
              <span className="font-semibold">{r.requirement}</span>
              <span className="label !text-blueberry whitespace-nowrap rounded-full border border-[var(--line)] px-2.5 py-0.5">
                <span aria-hidden="true">{STATE_MARK[r.state]} </span>
                {r.state}
              </span>
            </button>
            {open === i && (
              <dl className="fade-in grid gap-3 pb-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="label">Evidence found</dt>
                  <dd className="mt-0.5">{r.evidence}</dd>
                </div>
                <div>
                  <dt className="label">Shown to the applicant</dt>
                  <dd className="mt-0.5">{r.explanation}</dd>
                </div>
              </dl>
            )}
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** The best real evidence a project has: a screenshot, else its flow, else the illustrated example. */
export function ProjectArtifact({ project, eager = false, compactDefault = false }: { project: Project; eager?: boolean; compactDefault?: boolean }) {
  if (project.image) {
    return (
      <figure className="surface overflow-hidden">
        <Screenshot project={project} eager={eager} />
        <figcaption className="border-t border-[var(--line)] px-4 py-3 text-sm text-muted">
          <span className="label">Real interface · </span>
          {project.image.alt}
        </figcaption>
      </figure>
    );
  }
  const diagram = project.diagrams?.[0];
  if (diagram) return <ExplodedFlow diagram={diagram} compactDefault={compactDefault} />;
  return null;
}
