import { useState } from 'react';
import { BASIS_LABEL, IMAC_LAYERS, IMAC_REGIONS, type Box } from '../../data/artifacts';
import { getProjectById } from '../../data/projects';
import { Stage, useFocus, type InspectorProps } from './shared';

const IMG = `${import.meta.env.BASE_URL}assets/imac_main.webp`;

/** Background settings that make a div show exactly `box` (percent of the full image) of the screenshot. */
const crop = (box: Box) => ({
  left: `${box[0]}%`,
  top: `${box[1]}%`,
  width: `${box[2]}%`,
  height: `${box[3]}%`,
  backgroundImage: `url(${IMG})`,
  backgroundSize: `${10000 / box[2]}% ${10000 / box[3]}%`,
  backgroundPosition: `${(box[0] / (100 - box[2])) * 100}% ${(box[1] / (100 - box[3])) * 100}%`,
});

/**
 * The IMAC Advisor, inspected. The artifact is the real screenshot. Pins mark regions that are genuinely visible
 * in it; "Layers" separates the interface into the parts that come from different stages of the pipeline.
 * Selecting a region lights its stages in the documented flow, and selecting a stage selects a region, so the
 * interface and the architecture are two views of one thing.
 */
export function ImacInspector(props: InspectorProps) {
  const project = getProjectById('imac-advisor')!;
  const steps = project.diagrams?.[0]?.steps ?? [];
  const [focus, setFocus] = useFocus(props);
  const [mode, setMode] = useState<'composed' | 'layers'>('composed');
  const compact = props.compact ?? false;
  const region = IMAC_REGIONS.find((r) => r.id === focus) ?? null;
  const stageOn = (i: number) => (region ? region.stages.includes(i) : false);
  const pinned = compact ? IMAC_REGIONS.filter((r) => r.hero) : IMAC_REGIONS;

  const pickStage = (i: number) => {
    const target = IMAC_REGIONS.find((r) => r.stages.includes(i));
    if (target) setFocus(target.id);
  };

  return (
    <Stage
      title="Inside the IMAC Advisor"
      basis="visible"
      actions={
        <>
          {!compact && (
            <div role="group" aria-label="View" className="flex gap-2">
              <button type="button" className="chip" aria-pressed={mode === 'composed'} onClick={() => setMode('composed')}>
                Interface
              </button>
              <button type="button" className="chip" aria-pressed={mode === 'layers'} onClick={() => setMode('layers')}>
                Layers
              </button>
            </div>
          )}
          {region && (
            <button type="button" className="chip" onClick={() => setFocus(null)}>
              Reset
            </button>
          )}
        </>
      }
    >
      <div className={mode === 'layers' ? 'px-[4%] py-[5%]' : ''} style={{ transition: 'padding 560ms var(--ease)' }}>
        <div className="shot" data-mode={mode} data-has-focus={region ? 'true' : 'false'}>
          <img src={IMG} alt="The IMAC Immunisation Advisor interface: a query, a clinical summary with a confidence badge, and source grounding cards" width={1318} height={805} loading="eager" />

          {IMAC_LAYERS.map((l) => (
            <button
              key={l.id}
              type="button"
              tabIndex={mode === 'layers' ? 0 : -1}
              aria-hidden={mode !== 'layers'}
              aria-label={`Select the ${l.id} layer`}
              className="shot-layer"
              data-active={region?.layer === l.id}
              onClick={() => setFocus(l.regionId)}
              style={{ ...crop(l.box), ['--dx' as string]: l.dx, ['--dy' as string]: l.dy }}
            />
          ))}

          {mode === 'composed' && region && (
            <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <rect
                key={region.id}
                className="draw"
                pathLength={1}
                x={region.box[0]}
                y={region.box[1]}
                width={region.box[2]}
                height={region.box[3]}
                fill="rgba(255,111,79,0.10)"
                stroke="var(--pop-soda)"
                strokeWidth={2.5}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          )}

          {mode === 'composed' &&
            pinned.map((r) => (
              <button
                key={r.id}
                type="button"
                className="pin"
                aria-pressed={focus === r.id}
                aria-label={`${r.n}. ${r.label}`}
                onClick={() => setFocus(focus === r.id ? null : r.id)}
                style={{ left: '1.2%', top: `${r.box[1] + Math.min(r.box[3], 14) / 2}%` }}
              >
                {r.n}
              </button>
            ))}
        </div>
      </div>

      {!compact && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Regions">
          {IMAC_REGIONS.map((r) => (
            <li key={r.id}>
              <button type="button" className="chip" aria-pressed={focus === r.id} onClick={() => setFocus(focus === r.id ? null : r.id)}>
                <span className="font-mono text-xs">{r.n}</span> {r.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div aria-live="polite" className="note mt-5 min-h-[6.5rem]">
        {region ? (
          <div key={region.id} className="swap">
            <p className="label">
              {region.n} · {BASIS_LABEL[region.basis]}
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight">{region.label}</p>
            <p className="mt-1 max-w-[62ch] text-canvas/85">{region.note}</p>
          </div>
        ) : (
          <div className="swap">
            <p className="label">Overview</p>
            <p className="mt-1 text-lg font-semibold tracking-tight">A real interface, with the pipeline behind it.</p>
            <p className="mt-1 max-w-[62ch] text-canvas/85">
              Select a numbered pin{compact ? '' : ', a region below, or a stage of the pipeline'} to see what that part of the screen is doing and where it comes from.
            </p>
          </div>
        )}
      </div>

      {!compact && (
        <div className="mt-5">
          <p className="label mb-2">The documented flow, from question to answer</p>
          <div className="pipe">
            {steps.map((s, i) => (
              <button key={s.label} type="button" data-on={stageOn(i)} onClick={() => pickStage(i)} aria-label={`${s.label}: ${s.detail}`}>
                <span className="font-mono text-[0.7rem] opacity-70">{String(i + 1).padStart(2, '0')}</span>
                <span className="block font-semibold">{s.label}</span>
              </button>
            ))}
          </div>
          {region && region.stages.length > 0 && (
            <p key={region.id} className="swap mt-3 text-sm text-canvas/80">
              {region.stages.map((i) => `${steps[i]?.label}: ${steps[i]?.detail}`).join('  ·  ')}
            </p>
          )}
        </div>
      )}
    </Stage>
  );
}
