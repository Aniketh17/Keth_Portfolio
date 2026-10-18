import { useEffect, useState } from 'react';
import { BASIS_LABEL, IMAC_REGIONS, JOURNEY } from '../../data/artifacts';
import { REST_STEP, STEPS, type DemoId } from '../../mock/flows';
import { getProjectById } from '../../data/projects';
import { world, useWorld } from '../../world/store';

/**
 * The HTML half of inspection. The 3D scene shows the thing taken apart; these panels say what each part is.
 * Both read and write the same `focus` in the world store, so selecting a chip lifts the part in the scene and
 * clicking the part in the scene selects the chip. All the explanatory text lives here, as normal page content.
 */

const setFocus = (id: string | null) => world.set({ focus: id });
const toggle = (focus: string | null, id: string) => setFocus(focus === id ? null : id);

function Chips({ items, focus, label }: { items: { id: string; label: string; n?: string }[]; focus: string | null; label: string }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label={label}>
      {items.map((it) => (
        <li key={it.id}>
          <button type="button" className="chip" aria-pressed={focus === it.id} onClick={() => toggle(focus, it.id)}>
            {it.n && <span className="font-mono text-xs">{it.n}</span>} {it.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function ImacPanel() {
  const focus = useWorld((s) => s.focus);
  const steps = getProjectById('imac-advisor')?.diagrams?.[0]?.steps ?? [];
  const region = IMAC_REGIONS.find((r) => r.id === focus) ?? null;
  const pickStage = (i: number) => {
    const r = IMAC_REGIONS.find((x) => x.stages.includes(i));
    if (r) setFocus(r.id);
  };
  return (
    <div className="space-y-4">
      <p className="label">The real interface, taken apart. Select a part, or a layer in the scene.</p>
      <Chips label="Regions" focus={focus} items={IMAC_REGIONS.map((r) => ({ id: r.id, label: r.label, n: String(r.n) }))} />
      <div aria-live="polite" className="note min-h-[5.5rem]">
        {region ? (
          <div key={region.id} className="swap">
            <p className="label">{BASIS_LABEL[region.basis]}</p>
            <p className="mt-1 text-lg font-semibold tracking-tight">{region.label}</p>
            <p className="mt-1 text-muted">{region.note}</p>
          </div>
        ) : (
          <p className="text-muted">Four real layers: the framing, the question, the answer and the evidence. Each comes from a different stage of the pipeline.</p>
        )}
      </div>
      <div>
        <p className="label mb-2">The documented flow</p>
        <ol className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
          {steps.map((s, i) => {
            const on = region?.stages.includes(i);
            return (
              <li key={s.label}>
                <button
                  type="button"
                  aria-label={`${s.label}: ${s.detail}`}
                  onClick={() => pickStage(i)}
                  className={`min-h-12 w-full rounded-[4px] border px-2 text-left text-sm transition-colors ${on ? 'border-soda bg-soda' : 'border-line hover:border-blueberry'}`}
                >
                  <span className="font-mono text-[0.7rem] opacity-70">{String(i + 1).padStart(2, '0')}</span>
                  <span className="block font-semibold leading-tight">{s.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/**
 * Playback for the two recreated product demos. The scene shows the frame for the chosen step; this panel
 * owns the controls and says in words what is happening at that step, so nothing depends on watching.
 */
function DemoPanel({ demo, intro }: { demo: DemoId; intro: string }) {
  const focus = useWorld((s) => s.focus);
  const steps = STEPS[demo];
  const m = /^step-(\d+)$/.exec(focus ?? '');
  const step = m ? Number(m[1]) : REST_STEP[demo];
  const [playing, setPlaying] = useState(false);
  const go = (n: number) => world.set({ focus: `step-${Math.max(0, Math.min(steps.length - 1, n))}` });

  useEffect(() => {
    if (!playing) return;
    if (step >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => go(step + 1), world.get().reduced ? 2600 : 1700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, step]);

  return (
    <div className="space-y-4">
      <p className="label">{intro}</p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn btn-solid !min-h-11 text-sm"
          onClick={() => {
            if (playing) setPlaying(false);
            else {
              if (step >= steps.length - 1) go(0);
              else if (!m) go(0);
              setPlaying(true);
            }
          }}
        >
          {playing ? 'Pause' : step >= steps.length - 1 ? 'Replay' : m ? 'Play' : 'Play the flow'}
        </button>
        <button type="button" className="chip" aria-label="Previous step" disabled={step === 0} onClick={() => { setPlaying(false); go(step - 1); }}>
          ←
        </button>
        <button type="button" className="chip" aria-label="Next step" disabled={step >= steps.length - 1} onClick={() => { setPlaying(false); go(step + 1); }}>
          →
        </button>
        <span className="label">
          Step {step + 1} of {steps.length}
        </span>
      </div>
      <div aria-live="polite" className="note min-h-[4.5rem]">
        <p key={step} className="swap text-muted">
          {steps[step].caption}
        </p>
      </div>
      <ol className="flex flex-wrap gap-1" aria-label="Steps">
        {steps.map((_, i) => (
          <li key={i}>
            <button
              type="button"
              aria-label={`Step ${i + 1}`}
              aria-current={i === step}
              onClick={() => {
                setPlaying(false);
                go(i);
              }}
              className="grid h-9 w-7 place-items-center"
            >
              <span className={`block h-2 rounded-full transition-all ${i === step ? 'w-5 bg-soda' : 'w-2 bg-blueberry/30'}`} />
            </button>
          </li>
        ))}
      </ol>
      <p className="text-xs text-muted">Interface recreated from the project description on invented data. Not a screenshot of the product.</p>
    </div>
  );
}

export function FitPanel() {
  return <DemoPanel demo="fit" intro="A job listing, a Should I apply? button, and what happens next." />;
}

export function TriagePanel() {
  return <DemoPanel demo="transactions" intro="A bank feed, an Auto-categorise button, and a review lane." />;
}

export function TinyPanel() {
  const focus = useWorld((s) => s.focus);
  const step = JOURNEY.find((s) => s.id === focus) ?? JOURNEY[0];
  return (
    <div className="space-y-4">
      <p className="label">Real captures of the running prototype. Select a step, or a screen in the scene.</p>
      <Chips label="Steps" focus={step.id} items={JOURNEY.map((s, i) => ({ id: s.id, label: s.label, n: String(i + 1) }))} />
      <div aria-live="polite" className="note min-h-[5.5rem]">
        <div key={step.id} className="swap">
          <ul className="flex flex-wrap gap-2" aria-label="What this is">
            {step.tags.map((t) => (
              <li key={t.text} className={`label rounded-full px-2.5 py-0.5 ${t.kind === 'implemented' ? 'bg-blueberry !text-canvas' : t.kind === 'simulated' ? 'border border-soda !text-blueberry' : 'border border-line !text-blueberry'}`}>
                {t.text}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-muted">{step.note}</p>
        </div>
      </div>
    </div>
  );
}

export function InspectionPanel({ projectId }: { projectId: string }) {
  switch (projectId) {
    case 'imac-advisor':
      return <ImacPanel />;
    case 'fit-check':
      return <FitPanel />;
    case 'transaction-coding':
      return <TriagePanel />;
    default:
      return <TinyPanel />;
  }
}
