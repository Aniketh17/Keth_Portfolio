import { useState } from 'react';
import { DECISIONS } from '../data/decisions';
import { achievements, education, experience, profile, skillGroups } from '../data/profile';
import { getProjectById } from '../data/projects';
import type { TimelineItem } from '../data/types';
import { projectHref } from '../lib/route';
import { world } from '../world/store';
import { EvidenceChip } from './Evidence';
import { ExternalLink } from './ui';

export function Approach() {
  const items = DECISIONS.flatMap((pick) => {
    const project = getProjectById(pick.projectId);
    const decision = project?.decisions?.find((d) => d.title === pick.title);
    return project && decision ? [{ project, decision, pick }] : [];
  });
  return (
    <section id="approach" aria-labelledby="approach-title" className="pointer-events-none relative scroll-mt-16 py-16 lg:py-24">
      <div className="wrap">
        <div className="sheet">
          <p className="label">02 · Engineering approach</p>
          <h2 id="approach-title" className="h-section mt-3">
            The tools matter. The decisions matter more.
          </h2>
          <p className="prose-w mt-3 text-muted">Five decisions, each tied to a project. Point at one and its project lights up in the scene; open it to see the evidence.</p>
          <ul className="mt-6 border-t border-line">
            {items.map(({ project, decision, pick }) => (
              <li
                key={decision.title}
                className="border-b border-line py-5"
                onPointerEnter={() => world.set({ decision: pick.id })}
                onPointerLeave={() => world.set({ decision: null })}
                onFocus={() => world.set({ decision: pick.id })}
                onBlur={() => world.set({ decision: null })}
              >
                <p className="label">{project.shortTitle}</p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight">{decision.title}</h3>
                <p className="mt-2 text-muted">{decision.body}</p>
                <div className="mt-2 flex flex-wrap gap-x-6">
                  <EvidenceChip projectId={pick.projectId} focusId={pick.focusId}>
                    {pick.label}
                  </EvidenceChip>
                  <a href={projectHref(project.slug)} className="link inline-flex min-h-11 items-center text-sm font-medium">
                    Case study
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Row({ item }: { item: TimelineItem }) {
  const select = () => world.set({ timeline: item.id });
  return (
    <li className="grid gap-1 border-t border-line py-5 md:grid-cols-[9rem_1fr] md:gap-6" onPointerEnter={select} onFocus={select} onClick={select}>
      <p className="label pt-1">{item.period}</p>
      <div>
        <h4 className="text-lg font-semibold tracking-tight">{item.title}</h4>
        <p className="text-sm text-muted">{item.org}</p>
        {item.points.length > 0 && (
          <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-soda">
            {item.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

function Group({ title, items }: { title: string; items: TimelineItem[] }) {
  return (
    <div className="mt-8">
      <h3 className="label !text-blueberry">{title}</h3>
      <ol className="mt-3 border-b border-line">
        {items.map((i) => (
          <Row key={i.id} item={i} />
        ))}
      </ol>
    </div>
  );
}

export function About() {
  const [open, setOpen] = useState<string | null>('ai');
  return (
    <section id="about" aria-labelledby="about-title" className="pointer-events-none relative scroll-mt-16 py-16 lg:py-24">
      <div className="wrap">
        <div className="sheet">
          <p className="label">03 · About and experience</p>
          <h2 id="about-title" className="h-section mt-3">
            The work behind the work.
          </h2>
          <p className="prose-w mt-3 text-muted">Each entry sits on a timeline in the scene, at its real dates. Hover or tap one to lift it forward.</p>
          <Group title="Experience" items={experience} />
          <Group title="Achievements" items={achievements} />
          <Group title="Education" items={education} />

          <div className="mt-8">
            <h3 className="label !text-blueberry">Skills, and where each was used</h3>
            <div className="mt-3 border-b border-line">
              {skillGroups.map((g) => {
                const isOpen = open === g.id;
                return (
                  <div key={g.id} className="border-t border-line">
                    <h4>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`skills-${g.id}`}
                        onClick={() => setOpen(isOpen ? null : g.id)}
                        className="flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left"
                      >
                        <span className="text-lg font-semibold tracking-tight">{g.title}</span>
                        <span aria-hidden="true" className="text-xl text-soda">
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>
                    </h4>
                    {isOpen && (
                      <ul id={`skills-${g.id}`} className="fade-in grid gap-x-8 gap-y-4 pb-5 sm:grid-cols-2">
                        {g.items.map((s) => (
                          <li key={s.name}>
                            <span className="font-medium">{s.name}</span>
                            {s.usedIn && <span className="block text-sm text-muted">Used in: {s.usedIn}</span>}
                            {s.evidence && (
                              <EvidenceChip projectId={s.evidence.projectId} focusId={s.evidence.focusId}>
                                {s.evidence.label}
                              </EvidenceChip>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard can be unavailable; the address is still shown and linked.
    }
  };
  return (
    <section id="contact" aria-labelledby="contact-title" className="contact on-dark pointer-events-none relative mt-8 scroll-mt-16 bg-blueberry text-canvas">
      <div className="wrap py-16 lg:py-24">
        <div className="contact-card pointer-events-auto">
          <p className="label !text-canvas/70">04 · Contact</p>
          <h2 id="contact-title" className="h-section mt-3 max-w-[20ch]">
            Have something worth building?
          </h2>
          <p className="prose-w mt-4 text-lg text-canvas/80">
            I'm open to software engineering and applied AI opportunities, as well as conversations about interesting technical problems.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={`mailto:${profile.email}`} className="btn btn-solid break-all">
              {profile.email}
            </a>
            <button type="button" onClick={copy} className="btn btn-ghost">
              Copy address
            </button>
            <span role="status" className="text-sm text-soda">
              {copied ? 'Copied.' : ''}
            </span>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-1">
            {profile.links
              .filter((l) => l.label !== 'ITO Master (live site)')
              .map((l) => (
                <li key={l.url}>
                  <ExternalLink href={l.url} className="inline-flex min-h-11 items-center font-medium underline decoration-soda decoration-2 underline-offset-4">
                    {l.label}
                  </ExternalLink>
                </li>
              ))}
            <li>
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center font-medium underline decoration-soda decoration-2 underline-offset-4"
              >
                Resume (PDF)<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
          <p className="label mt-10 border-t border-canvas/20 pt-4 !text-canvas/60">
            {profile.fullName} · {profile.location}
          </p>
        </div>
      </div>
    </section>
  );
}
