import type { CSSProperties } from 'react';

interface Props {
  text: string;
  action?: { label: string; onClick: () => void };
  className?: string;
  style?: CSSProperties;
}

/** Milo's speech bubble. The optional action chip is the interactive part: a real button, not just flavour text. */
export function MiloSay({ text, action, className = '', style }: Props) {
  return (
    <div className={`bubble pointer-events-auto w-max max-w-[13.5rem] ${className}`} style={{ position: 'absolute', ...style }}>
      <p className="!m-0 text-[0.86rem] leading-snug">{text}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-2 inline-flex min-h-10 items-center rounded-full bg-ink px-3.5 text-[0.8rem] font-semibold text-ivory active:scale-95"
        >
          {action.label}
          <span aria-hidden="true" className="ml-1 text-citron">
            →
          </span>
        </button>
      )}
    </div>
  );
}
