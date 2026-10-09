import { routes, getProjectById } from '../data/projects';
import type { RouteId } from '../data/types';
import { ORB_STOP_OFFSET, ORB_U, uToT } from '../scene/geometry';
import { frame, ui } from './journey';

/**
 * Fetch the Proof control surface. The page calls these; the render loop
 * (scene/Choreographer) advances `fetchPhase` as Milo actually reaches the
 * proof object, so the phase reflects what is on screen.
 *
 * Without a running scene (WebGL unavailable, still loading, or reduced
 * motion) the route resolves immediately: the destination is the same, only
 * the walk is skipped.
 */

export const routeProjectSlug = (id: RouteId): string | undefined => {
  const route = routes.find((r) => r.id === id);
  return route ? getProjectById(route.projectId)?.slug : undefined;
};

export function startFetch(routeId: RouteId): void {
  const { scene, reducedMotion, fetchPhase, view, saveData } = ui.get();
  if (fetchPhase === 'travel' || fetchPhase === 'react') return;
  // Phones: the Work stage runs a short sprite dash (see lite/LiteBand); it advances the phase itself.
  if (view === 'lite' && !reducedMotion && !saveData) {
    frame.override = null;
    ui.set({ fetchRoute: routeId, fetchPhase: 'travel' });
    return;
  }
  if (scene !== 'ready' || reducedMotion) {
    frame.override = null;
    ui.set({ fetchRoute: routeId, fetchPhase: 'arrived' });
    return;
  }
  frame.override = { t: uToT(ORB_U[routeId] - ORB_STOP_OFFSET), routeId };
  ui.set({ fetchRoute: routeId, fetchPhase: 'travel' });
}

/** Skip the walk and go straight to the destination. */
export function skipFetch(): void {
  if (ui.get().fetchRoute) {
    frame.override = null;
    ui.set({ fetchPhase: 'arrived' });
  }
}

/** Abandon the route and let Milo return to following the scroll position. */
export function cancelFetch(): void {
  frame.override = null;
  ui.set({ fetchRoute: null, fetchPhase: 'idle' });
}

/** Called once the destination has been shown, so the next visit starts clean. */
export function resetFetch(): void {
  frame.override = null;
  ui.set({ fetchPhase: 'idle' });
}
