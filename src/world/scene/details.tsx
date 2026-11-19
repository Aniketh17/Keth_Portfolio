import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshBasicMaterial, MeshLambertMaterial, type Texture } from 'three';
import { GRU_SCREENS, JOURNEY } from '../../data/artifacts';
import { DEMO_ASPECT } from '../../mock/flows';
import { STAGE_ART_W } from '../layout';
import { world } from '../store';
import { atlasView, setAtlasStep } from '../textures';
import { anim, BOX, palette, PLANE } from './common';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** How visible a detail is, given how far into inspection this project is. Zero until inspection is well under way. */
const fadeOf = (insp: number) => clamp01((insp - 0.15) / 0.6);
const inspOf = (index: number) => (world.get().active === index ? anim.inspect : 0);

/* ---------------------------- Fit Check and Transaction Coding: the recreated product, played step by step ---------------------------- */

/** The demo screen at the step the visitor has chosen. The dock owns playback; this just shows the frame. */
export function DemoDetail({ index, atlas, rest }: { index: number; atlas: Texture; rest: number }) {
  const W = STAGE_ART_W * 1.12;
  const H = W / DEMO_ASPECT;
  const view = useMemo(() => atlasView(atlas), [atlas]);
  const mat = useRef<MeshBasicMaterial>(null);
  const slab = useRef<MeshLambertMaterial>(null);
  const pal = palette();
  useEffect(() => () => view.dispose(), [view]);
  useFrame(() => {
    const f = fadeOf(inspOf(index));
    const m = /^step-(\d+)$/.exec(world.get().focus ?? '');
    setAtlasStep(view, m ? Number(m[1]) : rest);
    if (mat.current) mat.current.opacity = f;
    if (slab.current) slab.current.opacity = f;
  });
  return (
    <group>
      <mesh geometry={BOX} scale={[W + 0.14, H + 0.14, 0.08]} position={[0, 0, -0.02]}>
        <meshLambertMaterial ref={slab} color={pal.blueberry} transparent opacity={0} />
      </mesh>
      <mesh geometry={PLANE} scale={[W, H, 1]} position={[0, 0, 0.03]}>
        <meshBasicMaterial ref={mat} map={view} transparent opacity={0} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ---------------------------- GRU: real phone screens, one at a time ---------------------------- */

/** One redacted phone capture, swapped as the step changes. Portrait, so it stands in the middle of the stage. */
export function GruDetail({ index, textures }: { index: number; textures: Texture[] }) {
  const H = (STAGE_ART_W * 1.12) / 1.6;
  const W = H * (640 / 1386);
  const pal = palette();
  const mat = useRef<MeshBasicMaterial>(null);
  const slab = useRef<MeshLambertMaterial>(null);
  const shown = useRef(-1);
  useFrame(() => {
    const f = fadeOf(inspOf(index));
    const i = Math.max(0, GRU_SCREENS.findIndex((j) => j.id === world.get().focus));
    if (mat.current && shown.current !== i) {
      mat.current.map = textures[i];
      mat.current.needsUpdate = true;
      shown.current = i;
    }
    if (mat.current) mat.current.opacity = f;
    if (slab.current) slab.current.opacity = f;
  });
  return (
    <group>
      <mesh geometry={BOX} scale={[W + 0.14, H + 0.14, 0.08]} position={[0, 0, -0.02]}>
        <meshLambertMaterial ref={slab} color={pal.blueberry} transparent opacity={0} />
      </mesh>
      <mesh geometry={PLANE} scale={[W, H, 1]} position={[0, 0, 0.03]}>
        <meshBasicMaterial ref={mat} map={textures[0]} transparent opacity={0} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ---------------------------- Tiny Paws: the journey, one real screen at a time ---------------------------- */

/** One flat, full-size capture of the running prototype, swapped as the step changes. No fan, no overlap. */
export function TinyDetail({ index, textures }: { index: number; textures: Texture[] }) {
  const W = STAGE_ART_W * 1.12;
  const H = W / (1280 / 800);
  const pal = palette();
  const mat = useRef<MeshBasicMaterial>(null);
  const slab = useRef<MeshLambertMaterial>(null);
  const shown = useRef(-1);
  useFrame(() => {
    const f = fadeOf(inspOf(index));
    const i = Math.max(0, JOURNEY.findIndex((j) => j.id === world.get().focus));
    if (mat.current && shown.current !== i) {
      mat.current.map = textures[i];
      mat.current.needsUpdate = true;
      shown.current = i;
    }
    if (mat.current) mat.current.opacity = f;
    if (slab.current) slab.current.opacity = f;
  });
  return (
    <group>
      <mesh geometry={BOX} scale={[W + 0.14, H + 0.14, 0.08]} position={[0, 0, -0.02]}>
        <meshLambertMaterial ref={slab} color={pal.blueberry} transparent opacity={0} />
      </mesh>
      <mesh geometry={PLANE} scale={[W, H, 1]} position={[0, 0, 0.03]}>
        <meshBasicMaterial ref={mat} map={textures[0]} transparent opacity={0} toneMapped={false} />
      </mesh>
    </group>
  );
}
