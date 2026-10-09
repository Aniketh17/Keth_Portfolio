import { petMilo, ui } from '../lib/journey';
import { useStore } from '../lib/store';
import { PetChip } from './PetChip';

/**
 * The 3D scene's pet prompt. It is anchored to Milo's head (the scene publishes his screen position as
 * --milo-x/--milo-y every frame) and hides while he is walking. Tapping Milo himself does the same thing; this is
 * the keyboard and screen-reader route, and the hint that he can be petted.
 */
export function PetButton() {
  const scene = useStore(ui, (s) => s.scene);
  const pets = useStore(ui, (s) => s.petCount);
  const moving = useStore(ui, (s) => s.miloMoving);
  const fetching = useStore(ui, (s) => s.fetchPhase !== 'idle');
  if (scene !== 'ready') return null;
  const hidden = moving || fetching;

  return (
    <div
      className="pointer-events-none fixed z-30"
      style={{
        left: 'min(calc(var(--milo-x, 70vw) + 2.4rem), calc(100vw - 8.6rem))',
        top: 'calc(var(--milo-y, 40vh) - 0.2rem)',
      }}
    >
      <PetChip onClick={petMilo} pets={pets} hidden={hidden} />
    </div>
  );
}
