import { useEffect, type ReactNode } from 'react';

/**
 * Milo on phones is a sprite strip rendered offline from the 3D model (scripts/sprites/render.mjs): eight frames,
 * stepped with CSS, so playing it costs no JavaScript.
 */

export type SpriteState = 'idle' | 'walk' | 'run' | 'sit' | 'happy';

/** CSS duration for one 8-frame loop of each strip. */
const STRIP_DURATION: Record<SpriteState, string> = { idle: '2.4s', walk: '0.8s', run: '0.5s', sit: '0.7s', happy: '1.1s' };
export const SPRITE_URL = (s: SpriteState): string => `${import.meta.env.BASE_URL}sprites/${s}.webp`;
const ALL_STATES: SpriteState[] = ['idle', 'walk', 'run', 'sit', 'happy'];

/** Starts fetching the other strips once the page has settled, so the first paint only needs the idle one. */
export function useSpritePreload(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    const load = () => ALL_STATES.forEach((s) => (new Image().src = SPRITE_URL(s)));
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const handle = idle ? idle(load) : window.setTimeout(load, 1200);
    return () => {
      if (!idle) window.clearTimeout(handle);
    };
  }, [enabled]);
}

interface Props {
  state: SpriteState;
  size: number;
  /** Play the animation; false shows a still frame (reduced motion or data-saver). */
  animated: boolean;
  flip?: boolean;
  /** Changing this restarts the one-shot "happy" strip. */
  replayKey?: number;
  children?: ReactNode;
}

export function MiloSprite({ state, size, animated, flip = false, replayKey = 0 }: Props) {
  const shown: SpriteState = animated ? state : state === 'sit' ? 'sit' : 'idle';
  return (
    <span className="block" style={{ width: size, height: size, transform: flip ? 'scaleX(-1)' : undefined }}>
      <span
        key={shown === 'happy' ? `h${replayKey}` : shown}
        className={`milo-sprite ${animated ? '' : 'milo-sprite-still'}`}
        style={{
          ['--s' as string]: `${size}px`,
          ['--img' as string]: `url(${SPRITE_URL(shown)})`,
          ['--dur' as string]: STRIP_DURATION[shown],
          animationIterationCount: shown === 'happy' ? 1 : 'infinite',
        }}
      />
    </span>
  );
}
