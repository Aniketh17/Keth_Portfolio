import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, Color, Float32BufferAttribute, Group, LineSegments, Mesh, MeshBasicMaterial, MeshLambertMaterial, type Texture } from 'three';
import { IMAC_LAYERS, IMAC_REGIONS, JOURNEY, TRANSACTIONS, type LayerId } from '../../data/artifacts';
import { getProjectById } from '../../data/projects';
import { STAGE_ART_W } from '../layout';
import { world } from '../store';
import { labelTexture, textTexture } from '../textures';
import { anim, BOX, damp, dampColor, palette, PLANE, PLANE_EDGES } from './common';

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

const IMAC_ASPECT = 1704 / 1030;
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

/* ---------------------------- Threads: shared by Fit Check and Transaction Coding ---------------------------- */

type ThreadStyle = 'solid' | 'dashed' | 'dotted';

/** A line from a to b built from small boxes, so solid, dashed and dotted all read at any distance. */
function Thread({ a, b, style, color, opacity }: { a: [number, number]; b: [number, number]; style: ThreadStyle; color: Color; opacity: () => number }) {
  const g = useRef<Group>(null);
  const mat = useMemo(() => new MeshBasicMaterial({ color: color.clone(), transparent: true }), [color]);
  useEffect(() => () => mat.dispose(), [mat]);
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const pieces =
    style === 'solid'
      ? [{ u: 0.5, l: len, t: 0.055 }]
      : style === 'dashed'
        ? Array.from({ length: 8 }, (_, i) => ({ u: (i + 0.5) / 8, l: (len / 8) * 0.6, t: 0.055 }))
        : Array.from({ length: 16 }, (_, i) => ({ u: (i + 0.5) / 16, l: 0.07, t: 0.07 }));
  useFrame(() => {
    mat.color.copy(color);
    mat.opacity = opacity();
  });
  return (
    <group ref={g} position={[a[0], a[1], 0]} rotation={[0, 0, ang]}>
      {pieces.map((p, i) => (
        <mesh key={i} geometry={BOX} material={mat} position={[p.u * len, 0, 0]} scale={[p.l, p.t, 0.05]} />
      ))}
    </group>
  );
}

/* ---------------------------- Fit Check: requirements, evidence and the threads between them ---------------------------- */

export function FitDetail({ index }: { index: number }) {
  const rows = getProjectById('fit-check')!.example!.rows;
  const pal = palette();
  const marks = useMemo(() => ['✓', '≈', '?', '–'].map((m) => labelTexture(m, true)), []);
  const leftMats = useRef<MeshLambertMaterial[]>([]);
  const rightMats = useRef<MeshLambertMaterial[]>([]);
  const slabsL = useRef<(Group | null)[]>([]);
  const slabsR = useRef<(Group | null)[]>([]);
  const glyphs = useRef<(MeshBasicMaterial | null)[]>([]);
  const threadColors = useMemo(() => rows.map(() => pal.blueberry.clone()), [rows, pal]);
  const threadOpacity = useRef<number[]>(rows.map(() => 0.8));
  useEffect(() => () => marks.forEach((m) => m.dispose()), [marks]);

  useFrame((_, dt) => {
    const insp = inspOf(index);
    const f = fadeOf(insp);
    const s = world.get();
    rows.forEach((r, i) => {
      const id = `req-${i}`;
      const focused = s.focus === id;
      const other = s.focus !== null && !focused;
      const used = (r.state === 'Needs confirmation' ? s.fitConfirmed[id] : s.fitUsed[id]) && r.state !== 'Not found';
      for (const [list, mats] of [[slabsL, leftMats], [slabsR, rightMats]] as const) {
        const grp = list.current[i];
        const m = mats.current[i];
        if (grp) grp.position.z = damp(grp.position.z, focused ? 0.75 * insp : 0, 8, dt);
        if (m) {
          m.opacity = f * (other ? 0.38 : 1);
          if (mats === rightMats) dampColor(m.color, used ? pal.soda : pal.paper, 8, dt);
        }
      }
      const gl = glyphs.current[i];
      if (gl) gl.opacity = f * (other ? 0.4 : 1);
      dampColor(threadColors[i], focused || used ? pal.soda : pal.blueberry, 8, dt);
      threadOpacity.current[i] = f * (other ? 0.25 : 0.9);
    });
  });

  return (
    <group>
      {rows.map((r, i) => {
        const y = 1.5 - i;
        const style: ThreadStyle | null = r.state === 'Direct' ? 'solid' : r.state === 'Related' ? 'dashed' : r.state === 'Needs confirmation' ? 'dotted' : null;
        const id = `req-${i}`;
        const pick = (e: { stopPropagation: () => void }) => {
          if (!live(index)) return;
          e.stopPropagation();
          world.set({ focus: world.get().focus === id ? null : id });
        };
        return (
          <group key={id}>
            <group ref={(g) => (slabsL.current[i] = g)} position={[-2.3, y, 0]} onClick={pick} onPointerOver={() => setCursor('pointer')} onPointerOut={() => setCursor('')}>
              <mesh geometry={BOX} scale={[2.4, 0.8, 0.2]}>
                <meshLambertMaterial ref={(m) => m && (leftMats.current[i] = m)} color={pal.blueberry} transparent opacity={0} />
              </mesh>
              <mesh geometry={PLANE} position={[-0.75, 0, 0.11]} scale={[0.5, 0.5, 1]}>
                <meshBasicMaterial ref={(m) => (glyphs.current[i] = m)} map={marks[i]} transparent opacity={0} toneMapped={false} />
              </mesh>
            </group>
            <group ref={(g) => (slabsR.current[i] = g)} position={[2.4, y, 0]} onClick={pick} onPointerOver={() => setCursor('pointer')} onPointerOut={() => setCursor('')}>
              <mesh geometry={BOX} scale={[2.2, 0.8, 0.08]}>
                <meshLambertMaterial ref={(m) => m && (rightMats.current[i] = m)} color={pal.paper} transparent opacity={0} />
              </mesh>
            </group>
            {style ? (
              <Thread a={[-1.1, y]} b={[1.3, y]} style={style} color={threadColors[i]} opacity={() => threadOpacity.current[i]} />
            ) : (
              <mesh geometry={BOX} position={[-0.9, y, 0]} scale={[0.06, 0.36, 0.06]}>
                <meshBasicMaterial color={pal.soda} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

/* ---------------------------- Transaction Coding: a batch routed three ways ---------------------------- */

const BIN_Y = [1.05, 0, -1.05];
const BINS = ['SUGGESTED', 'REVIEW', 'A PERSON'];

export function TriageDetail({ index }: { index: number }) {
  const pal = palette();
  const nums = useMemo(() => TRANSACTIONS.map((_, i) => labelTexture(String(i + 1), true)), []);
  const bins = useMemo(() => BINS.map((b, i) => textTexture(b, 512, 128, i === 0, true)), []);
  const slabs = useRef<(Group | null)[]>([]);
  const slabMats = useRef<MeshLambertMaterial[]>([]);
  const labelMats = useRef<(MeshBasicMaterial | null)[]>([]);
  const binMats = useRef<MeshLambertMaterial[]>([]);
  const binLabelMats = useRef<(MeshBasicMaterial | null)[]>([]);
  const colors = useMemo(() => TRANSACTIONS.map(() => pal.blueberry.clone()), [pal]);
  const opac = useRef<number[]>(TRANSACTIONS.map(() => 0.8));
  useEffect(
    () => () => {
      nums.forEach((t) => t.dispose());
      bins.forEach((t) => t.dispose());
    },
    [nums, bins],
  );
  const binOf = (band: string) => (band === 'familiar' ? 0 : band === 'unsure' ? 1 : 2);

  useFrame((_, dt) => {
    const insp = inspOf(index);
    const f = fadeOf(insp);
    const s = world.get();
    TRANSACTIONS.forEach((t, i) => {
      const focused = s.focus === t.id;
      const other = s.focus !== null && !focused;
      const decided = !!s.txDecisions[t.id];
      const g = slabs.current[i];
      if (g) g.position.z = damp(g.position.z, focused ? 0.7 * insp : 0, 8, dt);
      const m = slabMats.current[i];
      if (m) {
        m.opacity = f * (other ? 0.38 : 1);
        dampColor(m.color, decided ? pal.soda : pal.blueberry, 8, dt);
      }
      const lm = labelMats.current[i];
      if (lm) lm.opacity = f * (other ? 0.4 : 1);
      dampColor(colors[i], focused || decided ? pal.soda : pal.blueberry, 8, dt);
      opac.current[i] = f * (other ? 0.22 : 0.85);
    });
    const focusTx = TRANSACTIONS.find((t) => t.id === s.focus);
    BINS.forEach((_, b) => {
      const m = binMats.current[b];
      if (m) m.opacity = f * (focusTx && binOf(focusTx.band) !== b ? 0.5 : 1);
      const lm = binLabelMats.current[b];
      if (lm) lm.opacity = f;
    });
  });

  return (
    <group>
      {TRANSACTIONS.map((t, i) => {
        const y = 1.6 - i * 0.8;
        const b = binOf(t.band);
        const ax = -0.9;
        const bx = 1.55;
        const by = BIN_Y[b];
        const pick = (e: { stopPropagation: () => void }) => {
          if (!live(index)) return;
          e.stopPropagation();
          world.set({ focus: world.get().focus === t.id ? null : t.id });
        };
        // The route is a straight thread from the transaction to the bin it lands in.
        return (
          <group key={t.id}>
            <group ref={(g) => (slabs.current[i] = g)} position={[-2.2, y, 0]} onClick={pick} onPointerOver={() => setCursor('pointer')} onPointerOut={() => setCursor('')}>
              <mesh geometry={BOX} scale={[2.6, 0.62, 0.18]}>
                <meshLambertMaterial ref={(m) => m && (slabMats.current[i] = m)} color={pal.blueberry} transparent opacity={0} />
              </mesh>
              <mesh geometry={PLANE} position={[-1.0, 0, 0.1]} scale={[0.42, 0.42, 1]}>
                <meshBasicMaterial ref={(m) => (labelMats.current[i] = m)} map={nums[i]} transparent opacity={0} toneMapped={false} />
              </mesh>
            </group>
            <Thread a={[ax, y]} b={[bx, by]} style={b === 0 ? 'solid' : b === 1 ? 'dashed' : 'dotted'} color={colors[i]} opacity={() => opac.current[i]} />
          </group>
        );
      })}
      {BINS.map((_, b) => (
        <group key={b} position={[2.45, BIN_Y[b], 0]}>
          <mesh geometry={BOX} scale={[1.8, 0.8, 0.12]}>
            <meshLambertMaterial ref={(m) => m && (binMats.current[b] = m)} color={b === 0 ? pal.blueberry : pal.paper} transparent opacity={0} />
          </mesh>
          <mesh geometry={PLANE} position={[0, 0, 0.07]} scale={[1.55, 0.39, 1]}>
            <meshBasicMaterial ref={(m) => (binLabelMats.current[b] = m)} map={bins[b]} transparent opacity={0} toneMapped={false} />
          </mesh>
        </group>
      ))}
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
