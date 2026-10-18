import { BoxGeometry, Color, EdgesGeometry, MathUtils, PlaneGeometry } from 'three';
import { readPalette, type Palette } from '../palette';

/** Shared unit geometries. Scaled per object, so the whole world costs a handful of buffers. */
export const BOX = new BoxGeometry(1, 1, 1);
export const PLANE = new PlaneGeometry(1, 1);
export const BOX_EDGES = new EdgesGeometry(BOX);
export const PLANE_EDGES = new EdgesGeometry(PLANE);

let cached: Palette | undefined;
export const palette = (): Palette => (cached ??= readPalette());

export const damp = (a: number, b: number, lambda: number, dt: number): number => MathUtils.lerp(a, b, 1 - Math.exp(-lambda * dt));
export const dampColor = (c: Color, target: Color, lambda: number, dt: number): void => {
  c.lerp(target, 1 - Math.exp(-lambda * dt));
};

/**
 * Animation values that are smoothed once per frame by the Conductor and then read by everything in the scene.
 * They live outside React so a frame never costs a render.
 */
export const anim = {
  /** Smoothed carousel position (float). */
  carousel: 0,
  /** 0 = overview, 1 = inspecting. */
  inspect: 0,
};
