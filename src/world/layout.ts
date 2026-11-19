/**
 * The authored layout of the world and its camera destinations. Everything is expressed in world units; the
 * camera path runs down the negative z axis through five zones.
 *
 *   0 arrival     z =   0   the featured artifact, off to the right of the headline
 *   1 projects    z = -34   the spatial carousel (a sticky stage; scroll moves along it)
 *   2 systems     z = -62   projects joined to the decisions made in them
 *   3 timeline    z = -84   experience and education laid out by date
 *   4 contact     z = -104  a quiet frame the camera settles into
 */

export type V3 = [number, number, number];

export const ZONE = { hero: 0, stage: -34, systems: -62, timeline: -84, contact: -104 } as const;

export const HERO_ART = { pos: [2.35, 1.15, -1] as V3, width: 3.9, rotY: -0.26 };
/** Artifact size in the carousel (width); height follows the artifact's own aspect ratio. */
export const STAGE_ART_W = 5.4;
export const CAROUSEL_SPACING = 6.4;

export interface Dest {
  pos: V3;
  target: V3;
  fov: number;
  /** Fraction of the viewport to move the whole picture right and down, to leave room for the HTML. */
  shift: [number, number];
}

/** Distance at which an object `width` wide fills `fill` of the viewport width. */
export function fitDistance(width: number, fovDeg: number, aspect: number, fill: number): number {
  const half = Math.tan((fovDeg * Math.PI) / 360);
  return width / fill / (2 * half * aspect);
}

/** The five camera destinations, adapted to the viewport shape. */
export function destinations(aspect: number, small: boolean): Dest[] {
  const fov = small ? 42 : 36;
  const heroDist = small ? fitDistance(HERO_ART.width, fov, aspect, 0.92) : 8.4;
  const stageDist = small ? fitDistance(STAGE_ART_W, fov, aspect, 0.9) : 9.6;
  const sysDist = small ? fitDistance(11.4, fov, aspect, 0.98) : 15;
  const timeDist = small ? fitDistance(10.5, fov, aspect, 0.98) : 15;
  return [
    {
      pos: small ? [HERO_ART.pos[0], 1.5, HERO_ART.pos[2] + heroDist] : [0.5, 1.5, heroDist - 1],
      target: small ? [HERO_ART.pos[0], 1.15, HERO_ART.pos[2]] : [0.2, 1.1, HERO_ART.pos[2]],
      fov,
      shift: small ? [0, -0.2] : [0.0, 0],
    },
    {
      pos: [0, 1.5, ZONE.stage + stageDist],
      target: [0, 1.3, ZONE.stage],
      fov,
      shift: small ? [0, -0.17] : [0.1, 0],
    },
    {
      pos: [0, 1.9, ZONE.systems + sysDist],
      target: [0, 1.3, ZONE.systems],
      fov,
      shift: small ? [0, 0.18] : [0.25, 0],
    },
    {
      pos: [0, 1.5, ZONE.timeline + timeDist],
      target: [0, 1.1, ZONE.timeline],
      fov,
      shift: small ? [0, 0.18] : [0.25, 0],
    },
    {
      pos: [0, 1.4, ZONE.contact + (small ? fitDistance(7, fov, aspect, 0.9) : 8.5)],
      target: [0, 1.2, ZONE.contact],
      fov: small ? 42 : 34,
      shift: small ? [0, 0.22] : [0.16, 0],
    },
  ];
}

/** Where the camera goes to inspect the active artifact: closer, a little to one side, with a narrower view. */
export function inspectDest(aspect: number, small: boolean): Dest {
  const fov = small ? 38 : 33;
  // Wide enough for the widest inspection layout (the threads and routes), not just the interface.
  const dist = small ? fitDistance(7.8, fov, aspect, 0.96) : 12.5;
  return {
    pos: [small ? 0.4 : 0.6, 1.6, ZONE.stage + dist],
    target: [0, 1.3, ZONE.stage],
    fov,
    shift: small ? [0, -0.2] : [0.22, 0],
  };
}
