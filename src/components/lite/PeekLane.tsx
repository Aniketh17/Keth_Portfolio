import { useEffect, useRef, useState } from 'react';
import { startFetch } from '../../lib/fetchProof';
import { petMilo, ui } from '../../lib/journey';
import { PET_LINES } from '../../lib/miloLines';
import { useStore } from '../../lib/store';
import { MiloSay } from './MiloSay';
import { MiloSprite, useSpritePreload, type SpriteState } from './MiloSprite';

/**
 * A "peek": a short lane under a section's heading where Milo pops in with one line about the section and one
 * thing you can do. Each lane enters differently and sits in a different spot so they never feel repeated:
 *
 *   work     runs in from the right edge and slows to a walk, then stands on the ledge
 *   skills   walks in from the left edge
 *   journey  drops in from above, with a bounce, in the middle
 *
 * The lane reserves its own height in the flow, so nothing overlaps the content around it. It replays its entry
 * each time it scrolls back into view. Tapping Milo pets him.
 */

type Kind = 'work' | 'skills' | 'journey';

const SIZE = 118;

interface LaneConfig {
  line: string;
  /** Horizontal position of Milo as a fraction of the lane's free width. */
  at: number;
  enter: 'run' | 'walk' | 'drop';
}

const LANES: Record<Kind, LaneConfig> = {
  work: { line: "Pick a question. I'll fetch the proof.", at: 0.86, enter: 'run' },
  skills: { line: 'Every skill here has a project behind it.', at: 0.04, enter: 'walk' },
  journey: { line: 'Hackathons count too.', at: 0.8, enter: 'drop' },
};

export function PeekLane({ kind }: { kind: Kind }) {
  const lite = useStore(ui, (s) => s.view === 'lite');
  const reduced = useStore(ui, (s) => s.reducedMotion);
  const saveData = useStore(ui, (s) => s.saveData);
  const fetchPhase = useStore(ui, (s) => s.fetchPhase);
  const fetchRoute = useStore(ui, (s) => s.fetchRoute);
  const skillsAll = useStore(ui, (s) => s.skillsOpenAll);
  const animated = !reduced && !saveData;
  const cfg = LANES[kind];

  const laneRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<SpriteState>('idle');
  const [entry, setEntry] = useState(0);
  const [petLine, setPetLine] = useState<string | null>(null);
  const [hearts, setHearts] = useState(0);
  const [away, setAway] = useState(false);
  const timer = useRef(0);
  useSpritePreload(animated && lite);

  // Replay the entrance every time the lane scrolls into view from out of view.
  useEffect(() => {
    const lane = laneRef.current;
    if (!lane || !lite) return;
    let inView = false;
    const io = new IntersectionObserver(
      ([e]) => {
        const now = e.intersectionRatio > 0.7;
        if (now && !inView) {
          setEntry((n) => n + 1);
          if (animated) {
            window.clearTimeout(timer.current);
            if (cfg.enter === 'drop') {
              setState('happy');
              timer.current = window.setTimeout(() => setState('idle'), 800);
            } else if (cfg.enter === 'run') {
              // Sprints in, then slows to a walk as the entrance eases out.
              setState('run');
              timer.current = window.setTimeout(() => {
                setState('walk');
                timer.current = window.setTimeout(() => setState('idle'), 450);
              }, 450);
            } else {
              setState('walk');
              timer.current = window.setTimeout(() => setState('idle'), 900);
            }
          }
        }
        inView = now;
      },
      { threshold: [0, 0.7, 1] },
    );
    io.observe(lane);
    return () => {
      io.disconnect();
      window.clearTimeout(timer.current);
    };
  }, [lite, animated, cfg.enter]);

  // Work only: Milo runs off to fetch the chosen project, comes back with a hop, and the case study opens.
  useEffect(() => {
    if (kind !== 'work' || !fetchRoute) return;
    if (fetchPhase === 'travel') {
      setAway(true);
      setState('run');
      const arrive = window.setTimeout(() => ui.set({ fetchPhase: 'react' }), 1000);
      return () => window.clearTimeout(arrive);
    }
    if (fetchPhase === 'react') {
      setAway(false);
      setState('happy');
      const done = window.setTimeout(() => ui.set({ fetchPhase: 'arrived' }), 750);
      return () => window.clearTimeout(done);
    }
    if (fetchPhase === 'idle') {
      setAway(false);
      setState('idle');
    }
  }, [kind, fetchRoute, fetchPhase]);

  if (!lite) return null;

  const pet = () => {
    petMilo();
    setPetLine(PET_LINES[(ui.get().petCount - 1) % PET_LINES.length]);
    setHearts((h) => h + 1);
    if (animated) setState('happy');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setState('idle');
      setPetLine(null);
    }, 1800);
  };

  const action =
    kind === 'work'
      ? { label: 'Fetch the AI work', onClick: () => startFetch('ai') }
      : kind === 'skills'
        ? { label: skillsAll ? 'Tuck them in' : 'Show them all', onClick: () => ui.set({ skillsOpenAll: !skillsAll }) }
        : { label: 'See the wins', onClick: () => ui.set({ journeyTab: 'ach' }) };

  const left = `calc(${cfg.at} * (100% - ${SIZE}px))`;
  const bubbleOnRight = cfg.at < 0.4;
  const enterClass = animated ? `peek-${cfg.enter}` : '';

  return (
    <div ref={laneRef} className="relative my-6 h-[8.5rem]" aria-label={`Milo says: ${petLine ?? cfg.line}`} role="group">
      {/* The ledge Milo stands on (or peeks over). */}
      <div className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-gradient-to-r from-violet/70 via-violet/30 to-transparent" aria-hidden="true" />

      <div
        key={entry}
        className="absolute bottom-0 h-full overflow-hidden"
        style={{ left, width: SIZE }}
      >
        {/* Outer wrapper: running off to fetch. Inner wrapper: the entrance animation. Kept apart so they never fight over transform. */}
        <div
          className="absolute left-0"
          style={{
            bottom: '3px',
            width: SIZE,
            height: SIZE,
            transform: away ? 'translateX(170%)' : undefined,
            transition: away ? 'transform 0.9s cubic-bezier(0.3, 0.1, 0.25, 1)' : 'transform 0.4s ease',
          }}
        >
          <div className={`${enterClass} absolute inset-0`}>
            <button type="button" onClick={pet} aria-label="Pet Milo" className="absolute inset-0 block rounded-2xl">
              <MiloSprite state={state} size={SIZE} animated={animated} replayKey={hearts} flip={cfg.at > 0.5 && !away} />
            </button>
          </div>
        </div>
      </div>
      {hearts > 0 && (
        <span
          key={hearts}
          className="hearts pointer-events-none absolute bottom-16"
          style={{ left: `calc(${left} + 2.2rem)` }}
          aria-hidden="true"
        >
          <i>♥</i>
          <i>♥</i>
          <i>♥</i>
        </span>
      )}

      <MiloSay
        text={petLine ?? cfg.line}
        action={petLine ? undefined : action}
        className="absolute bottom-3"
        style={
          bubbleOnRight
            ? { left: `calc(${left} + ${SIZE - 6}px)`, maxWidth: `calc(100% - ${left} - ${SIZE - 6}px)` }
            : { right: `calc(100% - ${left} - 10px)`, maxWidth: `calc(${left} + 4px)` }
        }
      />
    </div>
  );
}
