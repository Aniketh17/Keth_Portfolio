import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { BASIS_LABEL, type Basis } from '../../data/artifacts';

export interface InspectorProps {
  /** The region, stage or row being inspected; null is the overview. */
  focusId?: string | null;
  onFocus?: (id: string | null) => void;
  /** The small hero version: fewer controls, no pipeline. */
  compact?: boolean;
}

/** Controlled when the parent passes focusId, otherwise self-contained. Keeps the evidence lens and Work in sync. */
export function useFocus({ focusId, onFocus }: InspectorProps): [string | null, (id: string | null) => void] {
  const [local, setLocal] = useState<string | null>(focusId ?? null);
  useEffect(() => {
    if (focusId !== undefined) setLocal(focusId);
  }, [focusId]);
  const set = useCallback(
    (id: string | null) => {
      setLocal(id);
      onFocus?.(id);
    },
    [onFocus],
  );
  return [local, set];
}

export function BasisTag({ basis }: { basis: Basis }) {
  return <span className="label">{BASIS_LABEL[basis]}</span>;
}

/** The standard stage frame: a label row, the artifact, then the note. Dark by design, so it reads as a lens on the page. */
export function Stage({ title, basis, actions, children, className = '' }: { title: string; basis: Basis; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`stage ${className}`} aria-label={title}>
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <BasisTag basis={basis} />
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </header>
      {children}
    </section>
  );
}
