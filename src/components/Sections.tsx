import { useState } from 'react';
import { achievements, education, experience, profile, skillGroups, timeline } from '../data/profile';
import { getProjectById } from '../data/projects';
import type { TimelineItem } from '../data/types';
import { projectHref } from '../lib/route';
import { EvidenceChip } from './Evidence';
import { ExternalLink } from './ui';

/** Decisions are read from the project data, so the wording stays in one place. Each points at the part of the evidence that shows it. */
const PICKS: { projectId: string; title: string; focusId: string; label: string }[] = [
  { projectId: 'imac-advisor', title: 'Refuse rather than guess', focusId: 'confidence', label: 'See the confidence badge' },
  { projectId: 'imac-advisor', title: 'Two stages instead of one', focusId: 'sources', label: 'See the reranked sources' },
  { projectId: 'transaction-coding', title: 'Suggest, then review', focusId: 'tx-2', label: 'See an uncertain case' },
  { projectId: 'fit-check', title: 'Retrieved is not confirmed', focusId: 'req-2', label: 'See it needing confirmation' },
  { projectId: 'tiny-paws', title: 'Front end first', focusId: 'checkout', label: 'See the simulated checkout' },
];

export function Approach() {
  const items = PICKS.flatMap((pick) => {
    const project = getProjectById(pick.projectId);
    const decision = project?.decisions?.find((d) => d.title === pick.title);
    return project && decision ? [{ project, decision, pick }] : [];
  });
  return (
    <section id="approach" aria-labelledby="approach-title" className="wrap scroll-mt-16 pt-20 lg:pt-28">
      <p className="label">02 · Engineering approach</p>
      <h2 id="approach-title" className="h-section mt-3">
        The tools matter. The decisions matter more.
      </h2>
      <p className="prose-w mt-3 text-muted">Five decisions from the projects above. Each one opens the evidence that shows it.</p>
      <ul className="mt-8 grid gap-x-12 border-t border-line md:grid-cols-2">
        {items.map(({ project, decision, pick }) => (
          <li key={decision.title} className="border-b border-line py-6">
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
    </section>
  );
}

const DOMAIN: [number, number] = [2021, 2027];
const pos = (y: number) => `${((y - DOMAIN[0]) / (DOMAIN[1] - DOMAIN[0])) * 100}%`;
const wid = (a: number, b: number) => `${((b - a) / (DOMAIN[1] - DOMAIN[0])) * 100}%`;

/**
 * A proportional timeline built from the real dates. Hackathons carry only a year in the source, so they are
 * drawn as year-level markers rather than at an invented month.
 */
function Ruler() {
  const [sel, setSel] = useState<string | null>(null);
  const item = timeline.find((t) => t.id === sel);
  const years = Array.from({ length: DOMAIN[1] - DOMAIN[0] + 1 }, (_, i) => DOMAIN[0] + i);
  const lane = (label: string, children: React.ReactNode) => (
    <div className="grid grid-cols-[5.5rem_1fr] items-center gap-3">
      <span className="label">{label}</span>
      <div className="relative h-10 border-b border-dashed border-line">{children}</div>
    </div>
  );
  const bars = (items: TimelineItem[]) =>
    items
      .filter((t) => t.span)
      .map((t) => (
        <button
          key={t.id}
          type="button"
          className="ruler-bar"
          data-kind={t.kind}
          aria-pressed={sel === t.id}
          onClick={() => setSel(sel === t.id ? null : t.id)}
          style={{ left: pos(t.span![0]), width: wid(t.span![0], t.span![1]), top: '0.25rem' }}
          aria-label={`${t.title}, ${t.period}`}
        >
          <span className="hidden sm:inline">{t.org.split(',')[0]}</span>
        </button>
      ));

  return (
    <div className="hidden md:block" aria-label="Timeline">
      <div className="grid grid-cols-[5.5rem_1fr] gap-3">
        <span />
        <div className="relative h-5">
          {years.map((y) => (
            <span key={y} className="label absolute -translate-x-1/2" style={{ left: pos(y) }}>
              {y}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {lane('Education', bars(education))}
        {lane('Work', bars(experience))}
        {lane(
          'Wins',
          achievements.map((a) => (
            <button
              key={a.id}
              type="button"
              aria-pressed={sel === a.id}
              aria-label={`${a.title}, ${a.period}`}
              onClick={() => setSel(sel === a.id ? null : a.id)}
              className="absolute top-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center"
              style={{ left: pos(a.at ?? 2024.5) }}
            >
              <span className={`block h-3.5 w-3.5 rotate-45 border-2 border-blueberry transition-colors ${sel === a.id ? 'bg-soda' : 'bg-canvas'}`} />
            </button>
          )),
        )}
      </div>
      <div aria-live="polite" className="note mt-4 min-h-[3.5rem]">
        {item ? (
          <p key={item.id} className="swap text-sm">
            <span className="font-semibold">{item.title}</span> · {item.org} · {item.period}
            {item.kind === 'achievement' && <span className="label ml-2">year only</span>}
          </p>
        ) : (
          <p className="text-sm text-muted">Select a bar or marker. Full details are listed below.</p>
        )}
      </div>
    </div>
  );
}

function Row({ item }: { item: TimelineItem }) {
  return (
    <li className="grid gap-1 border-t border-line py-5 md:grid-cols-[11rem_1fr] md:gap-8">
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
    <div className="mt-10">
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
    <section id="about" aria-labelledby="about-title" className="wrap scroll-mt-16 pt-20 lg:pt-28">
      <p className="label">03 · About and experience</p>
      <h2 id="about-title" className="h-section mt-3">
        The work behind the work.
      </h2>
      <div className="mt-8">
        <Ruler />
      </div>
      <Group title="Experience" items={experience} />
      <Group title="Achievements" items={achievements} />
      <Group title="Education" items={education} />

      <div className="mt-10">
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
                  <ul id={`skills-${g.id}`} className="fade-in grid gap-x-10 gap-y-4 pb-5 md:grid-cols-2">
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
    <section id="contact" aria-labelledby="contact-title" className="on-dark mt-20 scroll-mt-16 bg-blueberry text-canvas lg:mt-28">
      <div className="wrap py-20 lg:py-28">
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
        <p className="label mt-14 border-t border-canvas/20 pt-5 !text-canvas/60">
          {profile.fullName} · {profile.location}
        </p>
      </div>
    </section>
  );
}
