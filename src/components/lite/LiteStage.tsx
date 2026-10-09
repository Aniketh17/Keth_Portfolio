import { useEffect, useRef, useState } from 'react';
import { scrollToLanding, setTablet3d } from '../../lib/environment';
import { petMilo, ui } from '../../lib/journey';
import { LANDING_LINES, PET_LINES } from '../../lib/miloLines';
import { useStore } from '../../lib/store';
import { PetChip } from '../PetChip';
import { BandArt } from './bandArt';
import { MiloSay } from './MiloSay';
import { MiloSprite, useSpritePreload, type SpriteState } from './MiloSprite';

/**
 * The two full-width phone scenes: the hero, where Milo introduces the page, and the contact landing, where he
 * waits on his bed. They are the bookends; in between he only peeks in (see PeekLane).
 */

const CONFIG = {
  0: { size: 168, rest: 0.72, height: 'h-[17rem]', id: 'stage-hero', state: 'idle' as SpriteState },
  4: { size: 144, rest: 0.58, height: 'h-[13rem]', id: 'stage-contact', state: 'sit' as SpriteState },
};

export function LiteStage({ landing }: { landing: 0 | 4 }) {
  const { size, rest, height, id, state: restState } = CONFIG[landing];
  const reduced = useStore(ui, (s) => s.reducedMotion);
  const saveData = useStore(ui, (s) => s.saveData);
  const pets = useStore(ui, (s) => s.petCount);
  const canTablet3d = useStore(ui, (s) => s.canTablet3d);
  const animated = !reduced && !saveData;
  const [state, setState] = useState<SpriteState>(restState);
  const [petLine, setPetLine] = useState<string | null>(null);
  const [hearts, setHearts] = useState(0);
  const timer = useRef(0);
  useSpritePreload(animated);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const pet = () => {
    petMilo();
    setPetLine(PET_LINES[(ui.get().petCount - 1) % PET_LINES.length]);
    setHearts((h) => h + 1);
    if (animated) setState('happy');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setState(restState);
      setPetLine(null);
    }, 1800);
  };

  const left = `calc(${rest} * (100% - ${size}px))`;
  const line = petLine ?? LANDING_LINES[landing] ?? '';
  const action =
    landing === 0 && !petLine ? { label: 'Show me the work', onClick: () => scrollToLanding(1) } : undefined;

  return (
    <div id={id} className={`relative mb-8 overflow-hidden rounded-3xl border border-white/10 ${height}`}>
      <BandArt landing={landing} />

      <div className="absolute" style={{ left, bottom: '8%', width: size, height: size }}>
        <div className="absolute bottom-[3%] left-[14%] h-3 w-[72%] rounded-[50%] bg-black/45 blur-[3px]" aria-hidden="true" />
        <button type="button" onClick={pet} aria-label="Pet Milo" className="absolute inset-0 block cursor-pointer rounded-2xl">
          <MiloSprite state={state} size={size} animated={animated} replayKey={hearts} />
        </button>
        {hearts > 0 && (
          <span key={hearts} className="hearts pointer-events-none absolute -top-2 left-1/3" aria-hidden="true">
            <i>♥</i>
            <i>♥</i>
            <i>♥</i>
          </span>
        )}
      </div>

      <MiloSay
        text={line}
        action={action}
        className="absolute"
        style={{ left: `clamp(10px, calc(${left} - 24px), calc(100% - 14.5rem))`, bottom: `calc(8% + ${size * 0.8}px)` }}
      />

      <PetChip
        onClick={pet}
        pets={pets}
        side="left"
        short
        className="absolute !min-h-10 !text-[0.8rem]"
        style={{ right: `calc(100% - ${left} - ${size * 0.2}px)`, bottom: `calc(8% + ${size * 0.22}px)` }}
      />

      {landing === 0 && canTablet3d && (
        <button
          type="button"
          onClick={() => setTablet3d(true)}
          className="absolute bottom-3 left-3 z-30 min-h-11 rounded-full border border-ivory/40 bg-night/70 px-4 text-xs font-medium text-ivory"
        >
          Watch Milo in 3D
        </button>
      )}
    </div>
  );
}
