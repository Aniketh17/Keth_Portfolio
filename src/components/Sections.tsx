import { useState } from 'react';
import { DECISIONS } from '../data/decisions';
import { achievements, education, experience, profile, skillGroups } from '../data/profile';
import { getProjectById, projects } from '../data/projects';
import type { TimelineItem } from '../data/types';
import { projectHref } from '../lib/route';
import { useWorld, world } from '../world/store';
import { EvidenceChip } from './Evidence';
import { ExternalLink } from './ui';

/** Only numbers that are in the résumé. */
const STATS: [string, string][] = [
  ['2', 'first places: WDCC × Figured, Beyonders'],
  ['1', 'runner-up: Cicada Hackathon'],
  ['65+', 'teams in the larger field it won'],
  ['8.17', 'CGPA out of 10, B.E. Computer Science'],
];

export function Approach() {
  const lite = useWorld((s) => s.lite);
  const items = DECISIONS.flatMap((pick) => {
    const project = getProjectById(pick.projectId);
    const decision = project?.decisions?.find((d) => d.title === pick.title);
    return project && decision ? [{ project, decision, pick }] : [];
  });
  return (
    <section id="approach" aria-labelledby="approach-title" className="pointer-events-none relative scroll-mt-16 py-16 lg:py-24">
      <div className="wrap">
        <div className="sheet">
          <p className="label eyebrow">02 · Engineering approach</p>
          <div className="mt-4 grid gap-4 lg:items-end">
            <h2 id="approach-title" className="h-section">
              The tools matter. The decisions matter more.
            </h2>
            <p className="text-muted">{lite ? 'Five decisions, each tied to a project. Open one to see the evidence behind it.' : 'Five decisions, each tied to a project. Point at one and its project lights up in the scene; open it to see the evidence.'}</p>
          </div>
          <ol className="mt-8 border-t border-line">
            {items.map(({ project, decision, pick }, i) => (
              <li
                key={decision.title}
                className="grid gap-x-6 gap-y-1 border-b border-line py-6 md:grid-cols-[4rem_1fr]"
                onPointerEnter={() => world.set({ decision: pick.id })}
                onPointerLeave={() => world.set({ decision: null })}
                onFocus={() => world.set({ decision: pick.id })}
                onBlur={() => world.set({ decision: null })}
              >
                <span className="font-mono text-sm text-soda">#{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p className="label">{project.shortTitle}</p>
                  <h3 className="mt-1 text-2xl tracking-tight">{decision.title}</h3>
                  <p className="prose-w mt-2 text-muted">{decision.body}</p>
                  <div className="mt-2 flex flex-wrap gap-x-6">
                    <EvidenceChip projectId={pick.projectId} focusId={pick.focusId}>
                      {pick.label} <span aria-hidden="true">→</span>
                    </EvidenceChip>
                    <a href={projectHref(project.slug)} className="link inline-flex min-h-11 items-center text-sm font-medium">
                      Case study
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Row({ item }: { item: TimelineItem }) {
  const active = useWorld((s) => s.timeline === item.id);
  const select = () => world.set({ timeline: item.id });
  return (
    <li
      className="timeline-row grid gap-1 border-t border-line py-5 md:grid-cols-[9rem_1fr] md:gap-6"
      data-active={active ? 'true' : 'false'}
      onPointerEnter={select}
      onPointerLeave={() => world.set({ timeline: null })}
      onFocus={select}
      onClick={select}
    >
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
  const lite = useWorld((s) => s.lite);
  const [open, setOpen] = useState<string | null>('ai');
  return (
    <section id="about" aria-labelledby="about-title" className="pointer-events-none relative scroll-mt-16 py-16 lg:py-24">
      <div className="wrap">
        <div className="sheet sheet-dark">
          <p className="label eyebrow">03 · About and experience</p>
          <h2 id="about-title" className="h-section mt-4">
            The work behind the work.
          </h2>
          <p className="prose-w mt-3 text-muted">{lite ? 'Experience, achievements, education and the tools I reach for.' : 'Each entry sits on a timeline in the scene, at its real dates. Hover or tap one to lift it forward.'}</p>
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
            {STATS.map(([n, label]) => (
              <div key={label} className="stat">
                <dd>
                  <b>{n}</b>
                </dd>
                <dt className="mt-2 text-sm text-canvas/70">{label}</dt>
              </div>
            ))}
          </dl>
          <div data-sig="experience">
            <Group title="Experience" items={experience} />
          </div>
          <div data-sig="achievements">
            <Group title="Achievements" items={achievements} />
          </div>
          <div data-sig="education">
            <Group title="Education" items={education} />
          </div>

          <div className="mt-8" data-sig="skills">
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
    <section id="contact" aria-labelledby="contact-title" className="pointer-events-auto relative z-10 scroll-mt-16">
      <div className="wrap pb-10 pt-20 lg:pt-28">
        <p className="label eyebrow">04 · Contact</p>
        <h2 id="contact-title" className="h-mega mt-4 text-blueberry">
          Say <span className="underline decoration-soda decoration-[0.06em] underline-offset-[0.1em]">hello</span>
          <span className="text-soda">.</span>
        </h2>
        <p className="mt-6 max-w-[34rem] text-xl">
          Have something worth building? I'm open to software engineering and applied AI opportunities, and to conversations about interesting technical problems.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href={`mailto:${profile.email}`} className="btn btn-solid break-all">
            {profile.email}
          </a>
          <button type="button" onClick={copy} className="btn btn-ghost">
            Copy address
          </button>
          <span role="status" className="text-sm font-medium">
            {copied ? 'Copied.' : ''}
          </span>
        </div>
        <div className="mt-12 grid gap-8 border-t border-line pt-6 sm:grid-cols-3">
          <div>
            <p className="label">Elsewhere</p>
            <ul className="mt-2">
              {profile.links
                .filter((l) => l.label !== 'ITO Master (live site)')
                .map((l) => (
                  <li key={l.url}>
                    <ExternalLink href={l.url} className="link inline-flex min-h-11 items-center font-medium">
                      {l.label}
                    </ExternalLink>
                  </li>
                ))}
              <li>
                <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="link inline-flex min-h-11 items-center font-medium">
                  Resume (PDF)<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="label">Work</p>
            <ul className="mt-2">
              {projects.map((p) => (
                <li key={p.id}>
                  <a href={projectHref(p.slug)} className="inline-flex min-h-11 items-center font-medium">
                    {p.shortTitle}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label">Credits</p>
            <p className="mt-2 text-sm text-muted">Built by hand in Auckland with React and three.js. Sig is an original character.</p>
          </div>
        </div>
        <p className="mt-12 text-[clamp(2.2rem,8vw,6rem)] leading-none tracking-tight text-blueberry">{profile.fullName}</p>
        <p className="label mt-4">© 2026 · {profile.location}</p>
      </div>
    </section>
  );
}
