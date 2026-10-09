import type { CSSProperties } from 'react';

interface Props {
  onClick: () => void;
  pets: number;
  /** Which side of Milo the chip sits on; the tether points back at him. */
  side?: 'left' | 'right';
  hidden?: boolean;
  /** Shorter label for tight spaces. */
  short?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * The "Pet Milo" marker, shared by the 3D scene and the phone stages. Styled as a game-world prompt: an ivory
 * pill with a paw badge and a short tether that attaches it to the dog.
 */
export function PetChip({ onClick, pets, side = 'right', hidden = false, short = false, className = '', style }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={hidden ? -1 : 0}
      aria-label={pets > 0 ? `Pet Milo (${pets} so far)` : 'Pet Milo'}
      style={style}
      className={`pet-marker pointer-events-auto group whitespace-nowrap ${className.includes('absolute') ? '' : 'relative'} inline-flex min-h-11 items-center gap-2 rounded-full bg-ivory py-1.5 pl-1.5 pr-4 text-sm font-semibold text-ink shadow-[0_10px_30px_-8px_rgba(0,0,0,0.6)] transition-[transform,opacity] duration-300 hover:scale-105 active:scale-95 ${
        hidden ? 'opacity-0' : 'opacity-100'
      } ${className}`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-peach" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="fill-ink" width="18" height="18">
          <ellipse cx="6.2" cy="10" rx="2.1" ry="2.8" />
          <ellipse cx="10.4" cy="6" rx="2.1" ry="2.8" />
          <ellipse cx="15.6" cy="6" rx="2.1" ry="2.8" />
          <ellipse cx="19.4" cy="10.4" rx="2.1" ry="2.8" />
          <path d="M12.7 11.2c3.1 0 5.9 3 5.3 5.7-.4 1.9-2.1 2.4-3.7 2-.9-.2-1.2-.4-1.6-.4s-.7.2-1.6.4c-1.6.4-3.3-.1-3.7-2-.6-2.7 2.2-5.7 5.3-5.7z" />
        </svg>
      </span>
      {pets > 0 ? (short ? `Pet · ${pets}` : `Pet again · ${pets}`) : 'Pet Milo'}
      <span aria-hidden="true" className={`absolute top-1/2 h-px w-5 bg-ivory/70 ${side === 'right' ? '-left-5' : '-right-5'}`} />
      <span
        aria-hidden="true"
        className={`absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-peach ${side === 'right' ? '-left-6' : '-right-6'}`}
      />
    </button>
  );
}
