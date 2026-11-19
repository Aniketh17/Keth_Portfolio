import { useEffect, useState } from 'react';
import { GRU_SCREENS } from '../../data/artifacts';
import { Stage, useFocus, type InspectorProps } from './shared';

const BASE = import.meta.env.BASE_URL;
const TAG_STYLE = { implemented: 'bg-canvas !text-blueberry', mock: 'border border-canvas/50 !text-canvas', simulated: 'border border-soda !text-soda' } as const;

/**
 * GRU, as the phone app it is. Every frame is a real capture of the running app on a phone, with names
 * redacted. Same pattern as the Tiny Paws journey, but portrait.
 */
export function GruInspector(props: InspectorProps) {
  const [focus, setFocus] = useFocus(props);
  const step = GRU_SCREENS.find((s) => s.id === focus) ?? GRU_SCREENS[0];
  const idx = GRU_SCREENS.indexOf(step);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    if (idx >= GRU_SCREENS.length - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setFocus(GRU_SCREENS[idx + 1].id), 2400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, idx]);

  return (
    <Stage title="GRU on a phone" basis="visible">
      <div className="mb-3">
        <button
          type="button"
          className="chip"
          onClick={() => {
            if (playing) setPlaying(false);
            else {
              setFocus(GRU_SCREENS[0].id);
              setPlaying(true);
            }
          }}
        >
          {playing ? 'Pause' : 'Play from the start'}
        </button>
      </div>
      <div role="tablist" aria-label="Screens" className="flex flex-wrap gap-2">
        {GRU_SCREENS.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            type="button"
            className="chip"
            aria-selected={step.id === s.id}
            onClick={() => {
              setPlaying(false);
              setFocus(s.id);
            }}
          >
            <span className="font-mono text-xs">{i + 1}</span> {s.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-5 sm:grid-cols-[minmax(0,15rem)_1fr] sm:items-start">
        <div className="mx-auto w-full max-w-[15rem] overflow-hidden rounded-[22px] border border-canvas/30 bg-canvas">
          <img key={step.id} src={`${BASE}${step.image}`} alt={step.alt} width={640} height={1386} loading="lazy" className="swap block h-auto w-full" />
        </div>
        <div aria-live="polite" role="tabpanel" className="note min-h-[6rem]">
          <div key={step.id} className="swap">
            <ul className="flex flex-wrap gap-2" aria-label="What this is">
              {step.tags.map((t) => (
                <li key={t.text} className={`label rounded-full px-2.5 py-0.5 ${TAG_STYLE[t.kind]}`}>
                  {t.text}
                </li>
              ))}
            </ul>
            <p className="mt-2 max-w-[62ch] text-canvas/85">{step.note}</p>
          </div>
        </div>
      </div>
    </Stage>
  );
}
