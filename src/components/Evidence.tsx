import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getProjectById } from '../data/projects';
import { projectHref } from '../lib/route';
import { showEvidence } from '../world/env';
import { useWorld } from '../world/store';
import { Inspector } from './inspectors/Inspector';

interface Ctx {
  /** Open the evidence behind a claim: the project's inspector, already focused on the relevant part. */
  open: (projectId: string, focusId: string) => void;
}
const EvidenceContext = createContext<Ctx>({ open: () => undefined });
export const useEvidence = (): Ctx => useContext(EvidenceContext);

/**
 * The evidence lens. Any claim on the page (a decision, a skill) can open the same inspector the Work section
 * uses, in a native modal dialog: focus is trapped, Escape closes it, and focus returns to what opened it.
 */
export function EvidenceProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<{ projectId: string; focusId: string } | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const open = useCallback((projectId: string, focus: string) => {
    opener.current = document.activeElement as HTMLElement | null;
    setTarget({ projectId, focusId: focus });
    setFocusId(focus);
  }, []);

  useEffect(() => {
    const d = dialog.current;
    if (target && d && !d.open) d.showModal();
  }, [target]);

  const close = () => {
    dialog.current?.close();
  };
  const project = target ? getProjectById(target.projectId) : undefined;
  const value = useMemo(() => ({ open }), [open]);

  return (
    <EvidenceContext.Provider value={value}>
      {children}
      <dialog
        ref={dialog}
        className="lens"
        aria-label={project ? `Evidence: ${project.title}` : 'Evidence'}
        onClose={() => {
          setTarget(null);
          opener.current?.focus();
        }}
        onClick={(e) => e.target === dialog.current && close()}
      >
        {project && (
          <div className="p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold tracking-tight">
                <span className="label mr-2">Evidence</span>
                {project.title}
              </p>
              <div className="flex gap-2">
                <a href={projectHref(project.slug)} onClick={close} className="btn btn-solid !min-h-10 !px-4 text-sm">
                  Full case study
                </a>
                <button type="button" onClick={close} className="btn btn-ghost !min-h-10 !px-4 text-sm">
                  Close
                </button>
              </div>
            </div>
            <Inspector project={project} focusId={focusId} onFocus={setFocusId} />
          </div>
        )}
      </dialog>
    </EvidenceContext.Provider>
  );
}

/** A small, consistent affordance: "see the evidence for this claim". */
export function EvidenceChip({ projectId, focusId, children }: { projectId: string; focusId: string; children: ReactNode }) {
  const { open } = useEvidence();
  const status = useWorld((s) => s.status);
  // In the 3D world a claim travels to the project and inspects it there; without the world it opens the lens.
  const inWorld = status === 'ready' || status === 'loading';
  return (
    <button type="button" onClick={() => (inWorld ? showEvidence(projectId, focusId) : open(projectId, focusId))} className="link inline-flex min-h-11 items-center gap-1.5 text-sm font-medium">
      <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-soda" />
      {children}
    </button>
  );
}
