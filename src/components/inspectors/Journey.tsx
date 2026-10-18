import { useEffect, useState } from 'react';
import { JOURNEY } from '../../data/artifacts';
import { Stage, useFocus, type InspectorProps } from './shared';

const BASE = import.meta.env.BASE_URL;
const TAG_STYLE = { implemented: 'bg-canvas text-blueberry', mock: 'border border-canvas/50', simulated: 'border border-soda text-soda' } as const;

/**
 * Tiny Paws, as the user journey it implements. Every frame is a real capture of the running prototype, and
 * each carries tags that keep it identifiable as a front-end prototype: what is real UI, what is mock data,
 * what is a simulated payment.
 */
export function JourneyInspector(props: InspectorProps) {
  const [focus, setFocus] = useFocus(props);
  const step = JOURNEY.find((s) => s.id === focus) ?? JOURNEY[0];
  const idx = JOURNEY.indexOf(step);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    if (idx >= JOURNEY.length - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setFocus(JOURNEY[idx + 1].id), 2000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, idx]);

  return (
    <Stage title="The Tiny Paws journey" basis="visible">
      <div className="mb-3">
        <button
          type="button"
          className="chip"
          onClick={() => {
            // Play always starts from the first step.
            if (playing) setPlaying(false);
            else {
              setFocus(JOURNEY[0].id);
              setPlaying(true);
            }
          }}
        >
          {playing ? 'Pause' : 'Play from the start'}
        </button>
      </div>
      <div role="tablist" aria-label="Steps" className="flex flex-wrap gap-2">
        {JOURNEY.map((s, i) => (
          <button key={s.id} role="tab" type="button" className="chip" aria-selected={step.id === s.id} onClick={() => {
              setPlaying(false);
              setFocus(s.id);
            }}>
            <span className="font-mono text-xs">{i + 1}</span> {s.label}
          </button>
        ))}
      </div>

      <div className="relative mt-4 overflow-hidden rounded-[4px] bg-canvas">
        <img
          key={step.id}
          src={`${BASE}${step.image}`}
          alt={step.alt}
          width={1280}
          height={800}
          loading="lazy"
          className="swap block h-auto w-full"
        />
      </div>

      <div aria-live="polite" role="tabpanel" className="note mt-5 min-h-[6rem]">
        <div key={step.id} className="swap">
          <ul className="flex flex-wrap gap-2" aria-label="What this is">
            {step.tags.map((t) => (
              <li key={t.text} className={`label !text-inherit rounded-full px-2.5 py-0.5 ${TAG_STYLE[t.kind]}`}>
                {t.text}
              </li>
            ))}
          </ul>
          <p className="mt-2 max-w-[62ch] text-canvas/85">{step.note}</p>
        </div>
      </div>
    </Stage>
  );
}
