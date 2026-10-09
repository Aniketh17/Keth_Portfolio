import type { RouteId } from '../data/types';
import { LANDING_COUNT } from '../lib/journey';

/**
 * Staircase geometry as pure numbers (no three.js import), so the page can use
 * it without pulling the 3D bundle into the main chunk.
 *
 * Coordinates: a tread is indexed by `k`; the continuous coordinate `u` runs
 * along the stairs so that tread k covers u in [k, k+1). The staircase winds
 * with angle phi = u * D_PHI and a world position of (R sin phi, y, R cos phi),
 * which matches how three.js lays out CylinderGeometry.
 */

export const TREADS_PER_TURN = 18;
export const D_PHI = (Math.PI * 2) / TREADS_PER_TURN;
export const TREAD_COUNT = 52;
export const RISER = 0.26;
export const TREAD_THICKNESS = 0.5;

export const R_INNER = 1.1;
export const R_OUTER = 4.4;
export const R_LANDING_OUTER = 5.5;
/** Radius of the line Milo walks along. */
export const R_PATH = 2.7;

/** u at progress t = 0 and the spacing between landings, in treads. */
export const U_START = 2;
export const LANDING_SPACING = 12;
/** Each landing platform replaces this many treads on either side of its centre. */
export const LANDING_HALF = 2;

export const landingU = (i: number): number => U_START + i * LANDING_SPACING;
export const U_END = landingU(LANDING_COUNT - 1);

export const tToU = (t: number): number => U_START + t * (U_END - U_START);
export const uToT = (u: number): number => (u - U_START) / (U_END - U_START);

/** Index of the landing that owns tread k, or -1 for an ordinary tread. */
export function landingOfTread(k: number): number {
  for (let i = 0; i < LANDING_COUNT; i++) {
    const c = landingU(i);
    if (k >= c - LANDING_HALF && k <= c + LANDING_HALF - 1) return i;
  }
  return -1;
}

/** Tread-top height for each tread; landings are flat, ordinary treads step down by one riser. */
export const TREAD_HEIGHT: number[] = (() => {
  const h: number[] = [0];
  for (let k = 1; k < TREAD_COUNT; k++) {
    const own = landingOfTread(k);
    const flat = own !== -1 && own === landingOfTread(k - 1);
    h.push(h[k - 1] - (flat ? 0 : RISER));
  }
  return h;
})();

export const STAIR_BOTTOM = TREAD_HEIGHT[TREAD_COUNT - 1];

const smoothstep = (x: number): number => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

/**
 * Walking surface height at u. Within a tread the height is constant; in the
 * last 30% of the tread it eases down to the next one, so Milo steps down
 * rather than gliding down a ramp.
 */
export function heightAt(u: number): number {
  const k = Math.min(TREAD_COUNT - 1, Math.max(0, Math.floor(u)));
  const next = Math.min(TREAD_COUNT - 1, k + 1);
  const fr = u - k;
  return TREAD_HEIGHT[k] + (TREAD_HEIGHT[next] - TREAD_HEIGHT[k]) * smoothstep((fr - 0.7) / 0.3);
}

export const phiAt = (u: number): number => u * D_PHI;

/** Fetch the Proof: each route has a glowing proof object on the stairs below the Work landing. */
export const ORB_U: Record<RouteId, number> = {
  ai: 18.5,
  engineering: 20.5,
  build: 22.5,
};
export const ORB_RADIUS = 3.9;
/** Milo stops this many treads before the orb. */
export const ORB_STOP_OFFSET = 1.1;
