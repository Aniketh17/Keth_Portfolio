import type { ReactNode } from 'react';
import { achievements, education, experience } from '../data/profile';
import type { TimelineItem } from '../data/types';
import { ui } from '../lib/journey';
import { useStore } from '../lib/store';
import { PeekLane } from './lite/PeekLane';
import { Eyebrow, Section } from './Section';

function Group({ id, title, note, children }: { id: string; title: string; note: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-14 first-of-type:mt-10">
      <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
        <h3 id={id} className="font-display text-2xl font-semibold">
          {title}
        </h3>
        <span className="font-mono text-xs uppercase tracking-widest text-ivory/55">{note}</span>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Bullets({ points }: { points: string[] }) {
  if (!points.length) return null;
  return (
    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ivory/80 marker:text-violet-soft">
      {points.map((p) => (
        <li key={p}>{p}</li>
      ))}
    </ul>
  );
}

function ExperienceTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative space-y-6 border-l border-violet/40 pl-7">
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span aria-hidden="true" className="absolute -left-[2.12rem] top-2 h-3 w-3 rounded-full bg-citron ring-4 ring-night" />
          <p className="font-mono text-xs uppercase tracking-wider text-violet-soft">{item.period}</p>
          <div className="panel mt-2 p-5">
            <h4 className="font-display text-xl font-semibold">{item.title}</h4>
            <p className="text-sm text-ivory/65">{item.org}</p>
            <Bullets points={item.points} />
          </div>
        </li>
      ))}
    </ol>
  );
}

function AchievementCards({ items }: { items: TimelineItem[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((item, i) => (
        <li key={item.id} className={`panel p-5 ${i === 0 ? 'sm:col-span-2 !border-citron/60' : ''}`}>
          <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider">
            <span className="inline-flex items-center gap-2 text-citron">
              <span aria-hidden="true">{i === 0 ? '★' : '◆'}</span>
              {i === 0 ? 'Latest' : 'Hackathon'}
            </span>
            <span className="text-ivory/65">{item.period}</span>
          </div>
          <h4 className="mt-3 font-display text-lg font-semibold leading-snug">{item.title}</h4>
          <Bullets points={item.points} />
        </li>
      ))}
    </ul>
  );
}

function EducationCards({ items }: { items: TimelineItem[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.id} className="panel p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-violet-soft">{item.period}</p>
          <h4 className="mt-2 font-display text-lg font-semibold leading-snug">{item.title}</h4>
          <p className="text-sm text-ivory/65">{item.org}</p>
          <Bullets points={item.points} />
        </li>
      ))}
    </ul>
  );
}

const TABS = [
  { id: 'exp', label: 'Experience' },
  { id: 'ach', label: 'Achievements' },
  { id: 'edu', label: 'Education' },
] as const;

/** Phones: one group at a time, so the section stays short. */
function JourneyTabs() {
  const tab = useStore(ui, (s) => s.journeyTab);
  const setTab = (id: (typeof TABS)[number]['id']) => ui.set({ journeyTab: id });
  return (
    <div className="mt-6">
      <div role="tablist" aria-label="Experience, achievements and education" className="grid grid-cols-3 gap-1 rounded-full bg-night3/60 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => {
              const i = TABS.findIndex((x) => x.id === tab);
              if (e.key === 'ArrowRight') setTab(TABS[(i + 1) % TABS.length].id);
              if (e.key === 'ArrowLeft') setTab(TABS[(i + TABS.length - 1) % TABS.length].id);
            }}
            className={`min-h-11 rounded-full px-1 text-[0.8rem] font-semibold transition-colors ${
              tab === t.id ? 'bg-citron text-ink' : 'text-ivory/80'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-6">
        {tab === 'exp' && <ExperienceTimeline items={experience} />}
        {tab === 'ach' && <AchievementCards items={achievements} />}
        {tab === 'edu' && <EducationCards items={education} />}
      </div>
    </div>
  );
}

export function JourneySection() {
  const compact = useStore(ui, (s) => s.compact);
  return (
    <Section id="journey" titleId="journey-title" fill={false} band={3}>
      <Eyebrow>Experience, achievements, education</Eyebrow>
      <h2 id="journey-title" className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
        The work behind the work.
      </h2>
      {compact ? (
        <>
          <PeekLane kind="journey" />
          <JourneyTabs />
        </>
      ) : (
        <>
          <Group id="exp" title="Experience" note="Work">
            <ExperienceTimeline items={experience} />
          </Group>
          <Group id="ach" title="Achievements" note="Hackathons">
            <AchievementCards items={achievements} />
          </Group>
          <Group id="edu" title="Education" note="Degrees">
            <EducationCards items={education} />
          </Group>
        </>
      )}
    </Section>
  );
}
