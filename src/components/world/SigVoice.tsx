import { lazy, Suspense, useEffect, useRef } from 'react';
import { OFFERS, SECTION_LINES, decisionLine, lineForFocus, loadQuiet, setQuiet, sigDismiss, sigGo, sigPoke, sigSay, sigSurprise, sigTake, PROJECT_LINES, ZONE_LINES } from '../../world/sig';
import { useWorld, world } from '../../world/store';

// Sig has his own small canvas, loaded after the page so text and navigation never wait for him.
const SigCanvas = lazy(() => import('../../world/SigCanvas'));

/**
 * Everything about Sig that is not 3D: the line he is saying (a live region, so it is announced), the tap
 * target over him (a real button, so he is reachable by keyboard and screen reader), and the director that
 * decides when he speaks. Lines are triggered by what the visitor does, are spaced out, and can be muted.
 */
export function SigVoice() {
  const say = useWorld((s) => s.say);
  const quiet = useWorld((s) => s.quiet);
  const zone = useWorld((s) => s.zone);
  const active = useWorld((s) => s.active);
  const mode = useWorld((s) => s.mode);
  const focus = useWorld((s) => s.focus);
  const decision = useWorld((s) => s.decision);
  const timeline = useWorld((s) => s.timeline);
  const seen = useRef<Set<string>>(new Set());
  const idle = useRef(0);

  useEffect(loadQuiet, []);

  // Say something once per trigger, never the same thing twice.
  const once = (key: string, fn: () => void) => {
    if (seen.current.has(key)) return;
    seen.current.add(key);
    fn();
  };

  useEffect(() => {
    const t = window.setTimeout(() => once(`z${zone}`, () => sigSay(ZONE_LINES[zone], zone === 4 ? 'happy' : 'idle')), 900);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone]);

  useEffect(() => {
    if (zone === 1 && mode === 'overview') once(`p${active}`, () => sigSay(PROJECT_LINES[active], 'think'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, zone, mode]);

  useEffect(() => {
    if (mode === 'inspect') once('inspect', () => sigSay('Pulled apart. Poke around, or press Esc to put it back together.', 'surprised'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (mode !== 'inspect') return;
    const l = lineForFocus(active, focus);
    if (l) once(`f${active}:${focus}`, () => sigSay(l[0], l[1]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, mode, active]);

  useEffect(() => {
    const l = decisionLine(decision);
    if (l) once(`d${decision}`, () => sigSay(l, 'think'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decision]);

  useEffect(() => {
    if (timeline) once('timeline', () => sigSay('Every bar is a chapter. Hover one to see where it sits.', 'idle'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeline]);

  // Sub-sections announce themselves as they scroll into view (experience, achievements, education, skills).
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-sig]'));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const key = (e.target as HTMLElement).dataset.sig ?? '';
          const line = SECTION_LINES[key];
          if (e.isIntersecting && line) once(`s${key}`, () => sigSay(line[0], line[1]));
        }
      },
      { rootMargin: '-35% 0px -45% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // One gentle nudge after a long quiet stretch.
  useEffect(() => {
    const reset = () => {
      window.clearTimeout(idle.current);
      idle.current = window.setTimeout(() => once('idle', () => sigSay('Psst. "Inspect system" is where the fun is.', 'sleepy')), 16000);
    };
    reset();
    window.addEventListener('scroll', reset, { passive: true });
    window.addEventListener('pointerdown', reset);
    return () => {
      window.clearTimeout(idle.current);
      window.removeEventListener('scroll', reset);
      window.removeEventListener('pointerdown', reset);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <SigCanvas />
      </Suspense>
      <button
        type="button"
        onClick={sigPoke}
        aria-label="Poke Sig, the guide"
        className="fixed z-[36] -translate-x-1/2 -translate-y-1/2 rounded-2xl"
        style={{ left: 'var(--sig-x, 80vw)', top: 'var(--sig-y, 70vh)', width: 'calc(var(--sig-s, 80px) * 1.3)', height: 'calc(var(--sig-s, 80px) * 1.6)', minWidth: 52, minHeight: 52 }}
      />
      <div
        className="sig-bubble pointer-events-none fixed z-[36] w-max max-w-[min(19.5rem,calc(100vw-1.5rem))]"
      >
        <div aria-live="polite" role="status">
          {say && (
            <div key={say.id} className={`bubble pointer-events-auto !static ${say.offer ? 'bubble-menu' : ''}`}>
              <p className={`!m-0 leading-snug ${say.offer ? 'text-[1rem] font-medium' : 'text-[0.9rem]'}`}>
                <span className="sr-only">Sig says: </span>
                {say.text}
              </p>
              {say.link && (
                <button type="button" className="sig-link pointer-events-auto" onClick={() => sigGo(say.link!.slug)}>
                  {say.link.label} <span aria-hidden="true">→</span>
                </button>
              )}
              {say.offer && (
                <div className="sig-menu pointer-events-auto mt-3">
                  <ul>
                    {OFFERS.map((o, i) => (
                      <li key={o.label}>
                        <button type="button" onClick={() => sigTake(o.project)}>
                          <span className="font-mono text-[0.68rem] text-soda">{String(i + 1).padStart(2, '0')}</span>
                          <span className="min-w-0 flex-1 text-left">
                            <span className="block text-[0.95rem] font-medium leading-tight">{o.label}</span>
                            <span className="block text-[0.74rem] leading-tight text-canvas/60">{o.hint}</span>
                          </span>
                          <span aria-hidden="true" className="arrow">→</span>
                        </button>
                      </li>
                    ))}
                    <li>
                      <button type="button" onClick={sigSurprise}>
                        <span className="font-mono text-[0.68rem] text-soda">04</span>
                        <span className="min-w-0 flex-1 text-left">
                          <span className="block text-[0.95rem] font-medium leading-tight">Surprise me</span>
                          <span className="block text-[0.74rem] leading-tight text-canvas/60">A fact, or a project</span>
                        </span>
                        <span aria-hidden="true" className="arrow">→</span>
                      </button>
                    </li>
                  </ul>
                  <button type="button" className="sig-dismiss" onClick={sigDismiss}>
                    Not now
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        aria-pressed={quiet}
        onClick={() => setQuiet(!quiet)}
        className="fixed bottom-3 right-3 z-[34] hidden min-h-9 items-center rounded-full border border-line bg-canvas/90 px-3 font-mono text-[0.7rem] uppercase tracking-wider text-muted hover:text-blueberry md:inline-flex"
      >
        Sig: {quiet ? 'quiet' : 'on'}
      </button>
    </>
  );
}

export const mute = () => world.get().quiet;
