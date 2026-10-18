import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, Float32BufferAttribute, Group, LineSegments, Mesh, MeshBasicMaterial, MeshLambertMaterial, type Texture } from 'three';
import { IMAC_ASPECT, IMAC_LAYERS, IMAC_REGIONS, JOURNEY, type LayerId } from '../../data/artifacts';
import { DEMO_ASPECT } from '../../mock/flows';
import { STAGE_ART_W } from '../layout';
import { world } from '../store';
import { atlasView, setAtlasStep } from '../textures';
import { anim, BOX, damp, palette, PLANE, PLANE_EDGES } from './common';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** How visible a detail is, given how far into inspection this project is. Zero until inspection is well under way. */
const fadeOf = (insp: number) => clamp01((insp - 0.15) / 0.6);
const inspOf = (index: number) => (world.get().active === index ? anim.inspect : 0);
const setCursor = (c: string) => {
  document.body.style.cursor = c;
};
/** Invisible meshes still receive pointer events, so detail handlers only act while that project is being inspected. */
const live = (index: number) => world.get().mode === 'inspect' && world.get().active === index;

/* ---------------------------- IMAC: the real interface, taken apart ---------------------------- */

/** How far each layer lifts off the interface, and how it drifts, when taken apart. */
const LIFT: Record<LayerId, { z: number; x: number; y: number }> = {
  banner: { z: 1.1, x: 0, y: 0.4 },
  query: { z: 0.8, x: 0, y: 0.2 },
  answer: { z: 0.5, x: -0.4, y: -0.12 },
  evidence: { z: 0.65, x: 0.45, y: -0.12 },
};

export function ImacDetail({ index, texture }: { index: number; texture: Texture }) {
  const W = STAGE_ART_W;
  const H = W / IMAC_ASPECT;
  const pal = palette();
  const layers = useRef<(Mesh | null)[]>([]);
  const edges = useRef<(LineSegments | null)[]>([]);
  const base = useRef<Mesh>(null);
  const foot = useRef<Mesh>(null);
  const footEdge = useRef<LineSegments>(null);
  const links = useRef<LineSegments>(null);
  const textures = useMemo(
    () =>
      IMAC_LAYERS.map((l) => {
        const t = texture.clone();
        t.repeat.set(l.box[2] / 100, l.box[3] / 100);
        t.offset.set(l.box[0] / 100, 1 - (l.box[1] + l.box[3]) / 100);
        t.needsUpdate = true;
        return t;
      }),
    [texture],
  );
  const linkGeo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(new Array((IMAC_LAYERS.length + 1) * 6).fill(0), 3));
    return g;
  }, []);
  useEffect(
    () => () => {
      textures.forEach((t) => t.dispose());
      linkGeo.dispose();
    },
    [textures, linkGeo],
  );

  useFrame((_, dt) => {
    const insp = inspOf(index);
    const f = fadeOf(insp);
    const s = world.get();
    const region = IMAC_REGIONS.find((r) => r.id === s.focus) ?? null;
    if (base.current) (base.current.material as MeshBasicMaterial).opacity = f * (1 - 0.82 * insp);
    IMAC_LAYERS.forEach((l, k) => {
      const m = layers.current[k];
      const e = edges.current[k];
      if (!m || !e) return;
      const cx = ((l.box[0] + l.box[2] / 2) / 100 - 0.5) * W;
      const cy = (0.5 - (l.box[1] + l.box[3] / 2) / 100) * H;
      const active = region?.layer === l.id;
      const up = LIFT[l.id];
      const tz = 0.05 + insp * (up.z + (active ? 0.55 : 0));
      m.position.x = cx + insp * up.x;
      m.position.y = cy + insp * up.y;
      m.position.z = damp(m.position.z, tz, 9, dt);
      m.scale.x = (l.box[2] / 100) * W * (active ? 1.03 : 1);
      m.scale.y = (l.box[3] / 100) * H * (active ? 1.03 : 1);
      const dimmed = region && !active;
      (m.material as MeshBasicMaterial).opacity = f * (dimmed ? 0.6 : 1);
      e.position.copy(m.position);
      e.scale.copy(m.scale);
      e.position.z += 0.002;
      (e.material as MeshBasicMaterial).color.copy(active ? pal.soda : pal.blueberry);
      (e.material as MeshBasicMaterial).opacity = f * (active ? 1 : 0.5);
    });
    // The footprint of the selected region on the original interface, and a line tying it to the layer it came from.
    const showFoot = !!region && insp > 0.3;
    if (foot.current && footEdge.current) {
      foot.current.visible = showFoot;
      footEdge.current.visible = showFoot;
      if (region) {
        const fx = ((region.box[0] + region.box[2] / 2) / 100 - 0.5) * W;
        const fy = (0.5 - (region.box[1] + region.box[3] / 2) / 100) * H;
        for (const o of [foot.current, footEdge.current]) {
          o.position.set(fx, fy, 0.04);
          o.scale.set((region.box[2] / 100) * W, (region.box[3] / 100) * H, 1);
        }
        (foot.current.material as MeshBasicMaterial).opacity = 0.22 * f;
        (footEdge.current.material as MeshBasicMaterial).opacity = f;
      }
    }
    const pos = linkGeo.getAttribute('position');
    let n = 0;
    IMAC_LAYERS.forEach((_l, k) => {
      const m = layers.current[k];
      if (!m) return;
      pos.setXYZ(n++, m.position.x, m.position.y, 0.02);
      pos.setXYZ(n++, m.position.x, m.position.y, m.position.z - 0.01);
    });
    if (region) {
      const k = IMAC_LAYERS.findIndex((l) => l.id === region.layer);
      const m = layers.current[k];
      const fx = ((region.box[0] + region.box[2] / 2) / 100 - 0.5) * W;
      const fy = (0.5 - (region.box[1] + region.box[3] / 2) / 100) * H;
      pos.setXYZ(n++, fx, fy, 0.05);
      pos.setXYZ(n++, m ? m.position.x : fx, m ? m.position.y : fy, m ? m.position.z : 0.05);
    } else {
      pos.setXYZ(n++, 0, 0, 0);
      pos.setXYZ(n++, 0, 0, 0);
    }
    pos.needsUpdate = true;
    if (links.current) {
      const mat = links.current.material as MeshBasicMaterial;
      mat.opacity = 0.35 * f;
      links.current.visible = f > 0.02;
    }
  });

  return (
    <group>
      <mesh ref={base} geometry={PLANE} scale={[W, H, 1]} position={[0, 0, 0.03]}>
        <meshBasicMaterial map={texture} transparent opacity={0} toneMapped={false} />
      </mesh>
      {IMAC_LAYERS.map((l, k) => (
        <group key={l.id}>
          <mesh
            ref={(m) => (layers.current[k] = m)}
            geometry={PLANE}
            onClick={(e) => {
              if (!live(index)) return;
              e.stopPropagation();
              world.set({ focus: world.get().focus === l.regionId ? null : l.regionId });
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setCursor('pointer');
            }}
            onPointerOut={() => setCursor('')}
          >
            <meshBasicMaterial map={textures[k]} transparent opacity={0} toneMapped={false} />
          </mesh>
          <lineSegments ref={(m) => (edges.current[k] = m)} geometry={PLANE_EDGES}>
            <lineBasicMaterial color={pal.blueberry} transparent opacity={0} />
          </lineSegments>
        </group>
      ))}
      <mesh ref={foot} geometry={PLANE} visible={false}>
        <meshBasicMaterial color={pal.soda} transparent opacity={0} depthWrite={false} />
      </mesh>
      <lineSegments ref={footEdge} geometry={PLANE_EDGES} visible={false}>
        <lineBasicMaterial color={pal.soda} transparent opacity={0} />
      </lineSegments>
      <lineSegments ref={links} geometry={linkGeo} visible={false}>
        <lineBasicMaterial color={pal.soda} transparent opacity={0} />
      </lineSegments>
    </group>
  );
}

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
