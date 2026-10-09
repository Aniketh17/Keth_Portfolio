import type { ReactNode } from 'react';
import { ui } from '../lib/journey';
import { useStore } from '../lib/store';
import { LiteStage } from './lite/LiteStage';

interface Props {
  id: string;
  titleId: string;
  children: ReactNode;
  /** Sections that should fill the visible area centre their content; long ones just flow. */
  fill?: boolean;
  /** Landing index (0..4). On phones this adds the section's 2D Milo stage above the content. */
  band?: number;
}

/**
 * Content column for a landing. On wide screens the column keeps to the left
 * so Milo has the right-hand side; on narrow screens the scene is a strip
 * above, so the column takes the full width.
 */
export function Section({ id, titleId, children, fill = true, band }: Props) {
  const lite = useStore(ui, (s) => s.view === 'lite');
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className="section-anchor pointer-events-none relative z-10 flex items-center px-5 py-16 sm:px-8 lg:px-[6vw] lg:py-24"
      style={fill ? { minHeight: 'calc(100svh - var(--strip))' } : undefined}
    >
      <div className="pointer-events-auto mx-auto w-full max-w-2xl md:max-w-3xl lg:mx-0 lg:max-w-[min(52vw,760px)]">
        {lite && (band === 0 || band === 4) && <LiteStage landing={band} />}
        {children}
      </div>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-violet-soft">{children}</p>;
}
