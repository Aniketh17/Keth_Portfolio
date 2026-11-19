import { useEffect, useState } from 'react';
import { GRU_SCREENS, JOURNEY } from '../../data/artifacts';
import { REST_STEP, STEPS, type DemoId } from '../../mock/flows';
import { world, useWorld } from '../../world/store';

/**
 * The HTML half of inspection. The 3D scene shows the thing taken apart; these panels say what each part is.
 * Both read and write the same `focus` in the world store, so selecting a chip lifts the part in the scene and
 * clicking the part in the scene selects the chip. All the explanatory text lives here, as normal page content.
 */


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
            // Play always starts from the first step, wherever the demo was left.
            if (playing) setPlaying(false);
            else {
              go(0);
              setPlaying(true);
            }
          }}
        >
          {playing ? 'Pause' : 'Play from the start'}
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
      <p className="text-xs text-muted">{demo === 'imac' ? 'Recreated from the real screenshot: the question, answer, sources and scores are the ones visible in it.' : 'Interface recreated from the project description on invented data. Not a screenshot of the product.'}</p>
    </div>
  );
}

export function ImacPanel() {
  return <DemoPanel demo="imac" intro="A question goes in; a cited answer and a confidence badge come out." />;
}

export function FitPanel() {
  return <DemoPanel demo="fit" intro="A job listing, a Should I apply? button, and what happens next." />;
}

export function TriagePanel() {
  return <DemoPanel demo="transactions" intro="A bank feed, an Auto-categorise button, and a review lane." />;
}

export function GruPanel() {
  const focus = useWorld((s) => s.focus);
  const idx = Math.max(0, GRU_SCREENS.findIndex((s) => s.id === focus));
  const step = GRU_SCREENS[idx];
  const [playing, setPlaying] = useState(false);
  const go = (i: number) => world.set({ focus: GRU_SCREENS[Math.max(0, Math.min(GRU_SCREENS.length - 1, i))].id });

  useEffect(() => {
    if (!playing) return;
    if (idx >= GRU_SCREENS.length - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => go(idx + 1), world.get().reduced ? 2800 : 2400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, idx]);

  return (
    <div className="space-y-4">
      <p className="label">Real captures of the running app on a phone. Names are redacted.</p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn btn-solid !min-h-11 text-sm"
          onClick={() => {
            if (playing) setPlaying(false);
            else {
              go(0);
              setPlaying(true);
            }
          }}
        >
          {playing ? 'Pause' : 'Play from the start'}
        </button>
        <span className="label">
          Screen {idx + 1} of {GRU_SCREENS.length}
        </span>
      </div>
      <ul className="flex flex-wrap gap-2" aria-label="Screens">
        {GRU_SCREENS.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className="chip !text-blueberry"
              aria-pressed={step.id === s.id}
              onClick={() => {
                setPlaying(false);
                go(i);
              }}
            >
              <span className="font-mono text-xs">{i + 1}</span> {s.label}
            </button>
          </li>
        ))}
      </ul>
      <div aria-live="polite" className="note min-h-[5.5rem]">
        <div key={step.id} className="swap">
          <ul className="flex flex-wrap gap-2" aria-label="What this is">
            {step.tags.map((t) => (
              <li key={t.text} className={`label rounded-full px-2.5 py-0.5 ${t.kind === 'implemented' ? 'bg-blueberry !text-canvas' : 'border border-line !text-blueberry'}`}>
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

export function TinyPanel() {
  const focus = useWorld((s) => s.focus);
  const idx = Math.max(0, JOURNEY.findIndex((s) => s.id === focus));
  const step = JOURNEY[idx];
  const [playing, setPlaying] = useState(false);
  const go = (i: number) => world.set({ focus: JOURNEY[Math.max(0, Math.min(JOURNEY.length - 1, i))].id });

  useEffect(() => {
    if (!playing) return;
    if (idx >= JOURNEY.length - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => go(idx + 1), world.get().reduced ? 2600 : 2000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, idx]);

  return (
    <div className="space-y-4">
      <p className="label">Real captures of the running prototype, one step at a time.</p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn btn-solid !min-h-11 text-sm"
          onClick={() => {
            // Play always starts from the first step, wherever it was left.
            if (playing) setPlaying(false);
            else {
              go(0);
              setPlaying(true);
            }
          }}
        >
          {playing ? 'Pause' : 'Play from the start'}
        </button>
        <span className="label">
          Step {idx + 1} of {JOURNEY.length}
        </span>
      </div>
      <ul className="flex flex-wrap gap-2" aria-label="Steps">
        {JOURNEY.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className="chip !text-blueberry"
              aria-pressed={step.id === s.id}
              onClick={() => {
                setPlaying(false);
                go(i);
              }}
            >
              <span className="font-mono text-xs">{i + 1}</span> {s.label}
            </button>
          </li>
        ))}
      </ul>
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
    case 'gru':
      return <GruPanel />;
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
