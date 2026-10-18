import { useState } from 'react';
import { getProjectById } from '../../data/projects';
import { useMedia } from '../ui';
import { Stage, useFocus, type InspectorProps } from './shared';

const MARK: Record<string, string> = { Direct: '✓', Related: '≈', 'Needs confirmation': '?', 'Not found': '–' };

/**
 * Fit Check, as a relationship you can work through: each requirement is joined to the evidence found for it by
 * a thread whose style says how strong the link is. You decide what goes in the summary, and the summary is
 * built only from what you used or confirmed. That rule is the point of the feature. The profile here is
 * invented; this is an illustration of documented behaviour, not a screenshot of the product.
 */
export function FitInspector(props: InspectorProps) {
  // Rows are fixed-height so the threads line up; narrow screens get taller rows for the wrapped text.
  const ROW_H = useMedia('(min-width: 640px)') ? 76 : 128;
  const example = getProjectById('fit-check')!.example!;
  const rows = example.rows;
  const [focus, setFocus] = useFocus(props);
  const [used, setUsed] = useState<Record<string, boolean>>({ 'req-0': true });
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  const idx = rows.findIndex((_, i) => `req-${i}` === focus);
  const row = idx >= 0 ? rows[idx] : null;
  const id = (i: number) => `req-${i}`;

  const summary = rows.flatMap((r, i) => {
    if (r.state === 'Direct' && used[id(i)]) return [{ text: r.requirement, tag: 'retrieved from profile' }];
    if (r.state === 'Related' && used[id(i)]) return [{ text: `Adjacent experience: ${r.evidence.replace(/^"|"$/g, '')}`, tag: 'retrieved, not a claim of the skill' }];
    if (r.state === 'Needs confirmation' && confirmed[id(i)]) return [{ text: `${r.requirement}`, tag: 'confirmed by you' }];
    return [];
  });
  const left = rows.length - summary.length;

  const thread = (state: string) =>
    state === 'Direct' ? { dash: undefined, w: 2.5 } : state === 'Related' ? { dash: '7 5', w: 2 } : state === 'Needs confirmation' ? { dash: '2 6', w: 2.5 } : null;

  return (
    <Stage
      title="Requirement, evidence, decision"
      basis="synthetic"
      actions={
        row && (
          <button type="button" className="chip" onClick={() => setFocus(null)}>
            Reset
          </button>
        )
      }
    >
      <p className="mb-4 max-w-[62ch] text-sm text-canvas/80">{example.disclaimer} Select a requirement.</p>

      <div className="grid grid-cols-[1fr_2.5rem_1fr] sm:grid-cols-[1fr_4.5rem_1fr]" style={{ gridTemplateRows: `repeat(${rows.length}, ${ROW_H}px)` }}>
        {rows.map((r, i) => (
          <button
            key={r.requirement}
            type="button"
            className="chip !h-[calc(100%-0.5rem)] !items-start !justify-start !rounded-[6px] !py-2 text-left"
            style={{ gridColumn: 1, gridRow: i + 1, alignSelf: 'center' }}
            aria-pressed={focus === id(i)}
            onClick={() => setFocus(focus === id(i) ? null : id(i))}
          >
            <span aria-hidden="true" className="font-mono">
              {MARK[r.state]}
            </span>
            <span>
              <span className="block text-[0.85rem] leading-tight sm:text-[0.95rem]">{r.requirement}</span>
              <span className="label !text-[0.65rem]">{r.state}</span>
            </span>
          </button>
        ))}

        <svg
          className="pointer-events-none h-full w-full"
          style={{ gridColumn: 2, gridRow: `1 / ${rows.length + 1}` }}
          viewBox={`0 0 100 ${rows.length * ROW_H}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {rows.map((r, i) => {
            const t = thread(r.state);
            const y = i * ROW_H + ROW_H / 2;
            const active = focus === id(i);
            if (!t)
              return (
                <g key={r.requirement} opacity={focus && !active ? 0.3 : 1}>
                  <line x1="0" x2="34" y1={y} y2={y} stroke="var(--canvas)" strokeOpacity={0.5} strokeWidth={2} vectorEffect="non-scaling-stroke" />
                  <line x1="26" x2="34" y1={y - 6} y2={y + 6} stroke="var(--pop-soda)" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
                </g>
              );
            return (
              <path
                key={`${r.requirement}-${active}`}
                className={active ? 'draw' : undefined}
                pathLength={1}
                d={`M0 ${y} C 50 ${y}, 50 ${y}, 100 ${y}`}
                fill="none"
                stroke={active ? 'var(--pop-soda)' : 'var(--canvas)'}
                strokeOpacity={focus && !active ? 0.25 : active ? 1 : 0.7}
                strokeWidth={active ? t.w + 1 : t.w}
                strokeDasharray={active ? undefined : t.dash}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        {rows.map((r, i) => (
          <div
            key={`ev-${r.requirement}`}
            className="flex items-center self-center rounded-[6px] border border-dashed border-canvas/25 px-2 text-xs sm:px-3 sm:text-sm"
            style={{ gridColumn: 3, gridRow: i + 1, height: 'calc(100% - 0.5rem)', opacity: focus && focus !== id(i) ? 0.35 : 1, transition: 'opacity 220ms var(--ease)' }}
          >
            <span className={r.state === 'Not found' ? 'italic text-canvas/60' : ''}>{r.state === 'Not found' ? 'No evidence in the profile' : r.evidence}</span>
          </div>
        ))}
      </div>

      <div aria-live="polite" className="note mt-5 min-h-[7rem]">
        {row ? (
          <div key={focus} className="swap">
            <p className="label">{row.state}</p>
            <p className="mt-1 text-lg font-semibold tracking-tight">{row.requirement}</p>
            <p className="mt-1 max-w-[62ch] text-canvas/85">{row.explanation}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {(row.state === 'Direct' || row.state === 'Related') && (
                <button type="button" className="chip" aria-pressed={!!used[focus!]} onClick={() => setUsed((u) => ({ ...u, [focus!]: !u[focus!] }))}>
                  {used[focus!] ? 'In the summary' : 'Use in the summary'}
                </button>
              )}
              {row.state === 'Needs confirmation' && (
                <>
                  <span className="w-full text-sm font-medium">Asks: “{row.question}”</span>
                  <button type="button" className="chip" aria-pressed={!!confirmed[focus!]} onClick={() => setConfirmed((c) => ({ ...c, [focus!]: !c[focus!] }))}>
                    {confirmed[focus!] ? 'Confirmed by you' : 'Yes, confirm this'}
                  </button>
                  <span className="text-sm text-canvas/70">Until you confirm, it stays out.</span>
                </>
              )}
              {row.state === 'Not found' && <span className="text-sm text-canvas/70">Nothing to use. It stays out unless you add evidence.</span>}
            </div>
          </div>
        ) : (
          <div className="swap">
            <p className="label">Overview</p>
            <p className="mt-1 text-lg font-semibold tracking-tight">Solid thread: direct. Dashed: related. Dotted: needs you. No thread: not found.</p>
          </div>
        )}
      </div>

      <div className="mt-5 rounded-[6px] bg-canvas p-4 text-blueberry">
        <p className="label !text-blueberry/70">Application summary, built live</p>
        {summary.length === 0 ? (
          <p className="mt-1 text-sm">Empty. Nothing has been used or confirmed yet.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {summary.map((s) => (
              <li key={s.text} className="swap flex flex-wrap items-baseline gap-x-3 text-sm">
                <span className="font-medium">{s.text}</span>
                <span className="label !text-blueberry/60">{s.tag}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-blueberry/70">{left} of {rows.length} requirements are not in the summary, and nothing unsupported is added to fill the gap.</p>
      </div>
    </Stage>
  );
}
