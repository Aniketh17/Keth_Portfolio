import { skillGroups } from '../data/profile';
import { ui } from '../lib/journey';
import { useStore } from '../lib/store';
import { PeekLane } from './lite/PeekLane';
import { Eyebrow, Section } from './Section';

function SkillList({ group }: { group: (typeof skillGroups)[number] }) {
  return (
    <ul className="space-y-3 px-5 pb-5 pt-1 lg:px-0 lg:pb-0 lg:pt-4">
      {group.items.map((item) => (
        <li key={item.name}>
          <span className="block font-medium text-ivory">{item.name}</span>
          {item.usedIn && <span className="block text-sm text-ivory/65">Used in: {item.usedIn}</span>}
        </li>
      ))}
    </ul>
  );
}

export function SkillsSection() {
  const compact = useStore(ui, (s) => s.compact);
  const openAll = useStore(ui, (s) => s.skillsOpenAll);
  return (
    <Section id="skills" titleId="skills-title" band={2}>
      <Eyebrow>Skills and approach</Eyebrow>
      <h2 id="skills-title" className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
        The tools matter. The decisions matter more.
      </h2>
      <p className="mt-4 max-w-xl text-ivory/80">Each skill is listed with the place I actually used it.</p>
      <PeekLane kind="skills" />
      {compact ? (
        <div className="mt-6 space-y-3">
          {skillGroups.map((g, i) => (
            <details key={`${g.id}-${openAll}`} open={openAll || i === 0} className="panel group p-0">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 [&::-webkit-details-marker]:hidden">
                <span>
                  <span className="block font-display text-lg font-semibold">{g.title}</span>
                  <span className="block text-xs text-ivory/65">{g.blurb}</span>
                </span>
                <span aria-hidden="true" className="text-citron transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <SkillList group={g} />
            </details>
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {skillGroups.map((g) => (
            <section key={g.id} aria-labelledby={`skill-${g.id}`} className="panel p-5">
              <h3 id={`skill-${g.id}`} className="font-display text-xl font-semibold">
                {g.title}
              </h3>
              <p className="mt-1 text-sm text-ivory/70">{g.blurb}</p>
              <SkillList group={g} />
            </section>
          ))}
        </div>
      )}
    </Section>
  );
}
