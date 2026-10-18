import { useEffect, useRef, useState } from 'react';
import { Stage } from '../components/inspectors/shared';
import { FitMock } from './FitMock';
import { ImacMock } from './ImacMock';
import { DEMO_SIZE, REST_STEP, STEPS, type DemoId } from './flows';
import { TransactionMock } from './TransactionMock';

/**
 * The same demo screens the 3D scene shows, rendered live and scaled to fit, with the same controls. Used on case
 * study pages and wherever the 3D world is not running. Being live HTML, its text stays sharp at any size.
 */
export function LiveDemo({ demo }: { demo: DemoId }) {
  const steps = STEPS[demo];
  const [step, setStep] = useState(REST_STEP[demo]);
  const [playing, setPlaying] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setScale(el.clientWidth / DEMO_SIZE.w);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (step >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), 1700);
    return () => window.clearTimeout(t);
  }, [playing, step, steps.length]);

  const title = demo === 'fit' ? 'Fit Check: should I apply?' : demo === 'imac' ? 'IMAC Advisor: question to cited answer' : 'Transaction coding: auto-categorise';
  return (
    <Stage title={title} basis="synthetic">
      <div ref={box} className="relative w-full overflow-hidden rounded-[4px] bg-white" style={{ aspectRatio: `${DEMO_SIZE.w} / ${DEMO_SIZE.h}` }}>
        <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `scale(${scale})` }} aria-hidden="true">
          {demo === 'fit' ? <FitMock step={step} /> : demo === 'imac' ? <ImacMock step={step} /> : <TransactionMock step={step} />}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="chip"
          onClick={() => {
            // Play always starts from the first step, wherever the demo was left.
            if (playing) setPlaying(false);
            else {
              setStep(0);
              setPlaying(true);
            }
          }}
        >
          {playing ? 'Pause' : 'Play from the start'}
        </button>
        <button type="button" className="chip" aria-label="Previous step" disabled={step === 0} onClick={() => { setPlaying(false); setStep(step - 1); }}>
          ←
        </button>
        <button type="button" className="chip" aria-label="Next step" disabled={step >= steps.length - 1} onClick={() => { setPlaying(false); setStep(step + 1); }}>
          →
        </button>
        <span className="label">
          Step {step + 1} of {steps.length}
        </span>
      </div>
      <div aria-live="polite" className="note mt-4 min-h-[3.5rem]">
        <p key={step} className="swap text-canvas/85">
          {steps[step].caption}
        </p>
      </div>
      <p className="mt-3 text-xs text-canvas/60">{demo === 'imac' ? 'Recreated from the real screenshot: the question, answer, sources and scores are the ones visible in it. Not a live system.' : 'Interface recreated from the project description on invented data. Not a screenshot of the product.'}</p>
    </Stage>
  );
}
