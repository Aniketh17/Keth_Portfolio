import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MeshBasicMaterial, MeshLambertMaterial, type Texture } from 'three';
import { JOURNEY } from '../../data/artifacts';
import { DEMO_ASPECT } from '../../mock/flows';
import { STAGE_ART_W } from '../layout';
import { world } from '../store';
import { atlasView, setAtlasStep } from '../textures';
import { anim, BOX, damp, palette, PLANE } from './common';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** How visible a detail is, given how far into inspection this project is. Zero until inspection is well under way. */
const fadeOf = (insp: number) => clamp01((insp - 0.15) / 0.6);
const inspOf = (index: number) => (world.get().active === index ? anim.inspect : 0);
const setCursor = (c: string) => {
  document.body.style.cursor = c;
};
/** Invisible meshes still receive pointer events, so detail handlers only act while that project is being inspected. */
const live = (index: number) => world.get().mode === 'inspect' && world.get().active === index;

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

/* ---------------------------- Tiny Paws: the journey, one real screen at a time ---------------------------- */

export function TinyDetail({ index, textures }: { index: number; textures: Texture[] }) {
  const pal = palette();
  const groups = useRef<(Group | null)[]>([]);
  const mats = useRef<(MeshBasicMaterial | null)[]>([]);
  const slab = useRef<MeshLambertMaterial[]>([]);

  useFrame((_, dt) => {
    const insp = inspOf(index);
    const f = fadeOf(insp);
    const s = world.get();
    const sel = Math.max(0, JOURNEY.findIndex((j) => j.id === s.focus));
    JOURNEY.forEach((_, j) => {
      const g = groups.current[j];
      if (!g) return;
      const rel = j - sel;
      const tx = rel * 2.25 + (rel === 0 ? 0 : Math.sign(rel) * 0.7);
      const tz = rel === 0 ? 0.8 : -Math.abs(rel) * 0.9;
      const ts = rel === 0 ? 1.38 : 0.82;
      g.position.x = damp(g.position.x, tx, 6, dt);
      g.position.z = damp(g.position.z, tz, 6, dt);
      g.position.y = damp(g.position.y, rel === 0 ? 0.05 : -0.1, 6, dt);
      g.rotation.y = damp(g.rotation.y, -rel * 0.32, 6, dt);
      const sc = damp(g.scale.x, ts, 6, dt);
      g.scale.setScalar(sc);
      const m = mats.current[j];
      if (m) m.opacity = f * (rel === 0 ? 1 : 0.62);
      const sm = slab.current[j];
      if (sm) sm.opacity = f * (rel === 0 ? 1 : 0.62);
    });
  });

  return (
    <group>
      {JOURNEY.map((step, j) => (
        <group
          key={step.id}
          ref={(g) => (groups.current[j] = g)}
          onClick={(e) => {
            if (!live(index)) return;
            e.stopPropagation();
            world.set({ focus: step.id });
          }}
          onPointerOver={() => setCursor('pointer')}
          onPointerOut={() => setCursor('')}
        >
          <mesh geometry={BOX} scale={[3.34, 2.14, 0.08]}>
            <meshLambertMaterial ref={(m) => m && (slab.current[j] = m)} color={pal.blueberry} transparent opacity={0} />
          </mesh>
          <mesh geometry={PLANE} position={[0, 0, 0.045]} scale={[3.2, 2.0, 1]}>
            <meshBasicMaterial ref={(m) => (mats.current[j] = m)} map={textures[j]} transparent opacity={0} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
