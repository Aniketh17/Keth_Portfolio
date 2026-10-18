import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, MeshBasicMaterial, MeshLambertMaterial, type Texture } from 'three';
import { DECISIONS } from '../../data/decisions';
import { achievements, education, experience } from '../../data/profile';
import { projects } from '../../data/projects';
import { ZONE } from '../layout';
import { world } from '../store';
import type { WorldTextures } from '../textures';
import { BOX, BOX_EDGES, damp, dampColor, palette, PLANE } from './common';

const ASPECT: Record<string, number> = { 'imac-advisor': 1704 / 1030, 'transaction-coding': 1600 / 967, 'fit-check': 1600 / 967, 'tiny-paws': 1280 / 800 };
const tex = (id: string, t: WorldTextures): Texture => (id === 'imac-advisor' ? t.imac : id === 'transaction-coding' ? t.tx : id === 'fit-check' ? t.fit : t.tiny[0]);

/* ---------------------------- Systems: projects, and the decisions made in them ---------------------------- */

const NODE_W = 1.45;
const NODE_X = [-3.3, -1.1, 1.1, 3.3];

/**
 * Each project is a node; each engineering decision hangs from the project it was made in. Choosing a decision
 * in the page lights its edge and its node, so the claim and the thing it is about are visibly connected.
 * The edges are the real relationships in the project data, not decoration.
 */
export function Systems({ textures }: { textures: WorldTextures }) {
  const pal = useMemo(() => palette(), []);
  const nodeMats = useRef<(MeshLambertMaterial | null)[]>([]);
  const slabMats = useRef<(MeshLambertMaterial | null)[]>([]);
  const edgeMats = useRef<(MeshBasicMaterial | null)[]>([]);
  const nodeGroups = useRef<(Group | null)[]>([]);
  const perProject = useMemo(() => projects.map((p) => DECISIONS.filter((d) => d.projectId === p.id)), []);

  useFrame((_, dt) => {
    const s = world.get();
    const sel = DECISIONS.find((d) => d.id === s.decision);
    projects.forEach((p, i) => {
      const lit = sel?.projectId === p.id;
      const m = nodeMats.current[i];
      if (m) dampColor(m.color, lit ? pal.soda : pal.blueberry, 8, dt);
      const g = nodeGroups.current[i];
      if (g) g.position.z = damp(g.position.z, lit ? 0.9 : 0, 6, dt);
    });
    DECISIONS.forEach((d, k) => {
      const lit = s.decision === d.id;
      const sm = slabMats.current[k];
      if (sm) dampColor(sm.color, lit ? pal.soda : pal.paper, 8, dt);
      const em = edgeMats.current[k];
      if (em) {
        dampColor(em.color, lit ? pal.soda : pal.blueberry, 8, dt);
        em.opacity = damp(em.opacity, lit ? 1 : s.decision ? 0.15 : 0.5, 8, dt);
      }
    });
  });

  return (
    <group position={[0, 0, ZONE.systems]}>
      {projects.map((p, i) => {
        const h = NODE_W / ASPECT[p.id];
        return (
          <group key={p.id} ref={(g) => (nodeGroups.current[i] = g)} position={[NODE_X[i], 2.3, 0]}>
            <mesh geometry={BOX} scale={[NODE_W + 0.12, h + 0.12, 0.08]}>
              <meshLambertMaterial ref={(m) => (nodeMats.current[i] = m)} color={pal.blueberry} />
            </mesh>
            <mesh geometry={PLANE} position={[0, 0, 0.05]} scale={[NODE_W, h, 1]}>
              <meshBasicMaterial map={tex(p.id, textures)} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
      {DECISIONS.map((d, k) => {
        const pi = projects.findIndex((p) => p.id === d.projectId);
        const group = perProject[pi];
        const slot = group.findIndex((x) => x.id === d.id);
        const x = NODE_X[pi] + (group.length === 1 ? 0 : (slot - 0.5) * 0.8);
        const y = 0.3;
        const topY = 2.3 - NODE_W / ASPECT[projects[pi].id] / 2 - 0.1;
        return (
          <group key={d.id}>
            <mesh geometry={BOX} position={[x, (topY + y + 0.2) / 2, 0]} scale={[0.05, topY - (y + 0.2), 0.05]}>
              <meshBasicMaterial ref={(m) => (edgeMats.current[k] = m)} color={pal.blueberry} transparent opacity={0.5} />
            </mesh>
            <mesh
              geometry={BOX}
              position={[x, y, 0]}
              scale={[group.length === 1 ? 1.15 : 0.78, 0.4, 0.14]}
              onClick={(e) => {
                e.stopPropagation();
                world.set({ decision: world.get().decision === d.id ? null : d.id });
              }}
              onPointerOver={() => (document.body.style.cursor = 'pointer')}
              onPointerOut={() => (document.body.style.cursor = '')}
            >
              <meshLambertMaterial ref={(m) => (slabMats.current[k] = m)} color={pal.paper} />
            </mesh>
            <lineSegments geometry={BOX_EDGES} position={[x, y, 0]} scale={[group.length === 1 ? 1.15 : 0.78, 0.4, 0.14]}>
              <lineBasicMaterial color={pal.blueberry} />
            </lineSegments>
          </group>
        );
      })}
    </group>
  );
}

/* ---------------------------- Timeline: experience and education laid out by date ---------------------------- */

const T0 = 2021;
const T1 = 2027;
const SPAN = 6.2;
const xOf = (year: number) => ((year - T0) / (T1 - T0) - 0.5) * SPAN;

/**
 * Real dates become real distances. Education and work sit in separate lanes, and the hackathons are markers at
 * year level only, because the source gives no months. Selecting an entry in the page lifts it forward.
 * This zone is deliberately quiet: the page below carries the detail.
 */
export function Timeline() {
  const pal = useMemo(() => palette(), []);
  const bars = useRef<(Group | null)[]>([]);
  const mats = useRef<(MeshLambertMaterial | null)[]>([]);
  const items = useMemo(
    () => [
      ...education.filter((e) => e.span).map((e) => ({ item: e, lane: 1.7, outline: true })),
      ...experience.filter((e) => e.span).map((e) => ({ item: e, lane: 0.8, outline: false })),
      ...achievements.map((e) => ({ item: e, lane: -0.1, outline: false })),
    ],
    [],
  );
  const ticks = useMemo(() => Array.from({ length: T1 - T0 + 1 }, (_, i) => T0 + i), []);

  useFrame((_, dt) => {
    const sel = world.get().timeline;
    items.forEach((it, k) => {
      const on = sel === it.item.id;
      const g = bars.current[k];
      if (g) g.position.z = damp(g.position.z, on ? 0.6 : 0, 7, dt);
      const m = mats.current[k];
      if (m) dampColor(m.color, on ? pal.soda : pal.blueberry, 8, dt);
    });
  });

  return (
    <group position={[0, 0.2, ZONE.timeline]}>
      {ticks.map((y) => (
        <mesh key={y} geometry={BOX} position={[xOf(y), 0.9, -0.1]} scale={[0.02, 3.1, 0.02]}>
          <meshBasicMaterial color={pal.blueberry} transparent opacity={0.25} />
        </mesh>
      ))}
      {items.map((it, k) => {
        const span = it.item.span;
        const x0 = span ? xOf(span[0]) : xOf(it.item.at ?? 2024.5);
        const w = span ? xOf(span[1]) - xOf(span[0]) : 0.34;
        const pick = (e: { stopPropagation: () => void }) => {
          e.stopPropagation();
          world.set({ timeline: world.get().timeline === it.item.id ? null : it.item.id });
        };
        return (
          <group key={it.item.id} ref={(g) => (bars.current[k] = g)} position={[x0 + w / 2, it.lane, 0]} onClick={pick} onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = '')}>
            <mesh geometry={BOX} scale={span ? [w, 0.5, 0.3] : [w, w, 0.2]} rotation={span ? [0, 0, 0] : [0, 0, Math.PI / 4]}>
              <meshLambertMaterial ref={(m) => (mats.current[k] = m)} color={pal.blueberry} transparent opacity={it.outline ? 0.18 : 1} />
            </mesh>
            {it.outline && (
              <lineSegments geometry={BOX_EDGES} scale={[w, 0.5, 0.3]}>
                <lineBasicMaterial color={pal.blueberry} />
              </lineSegments>
            )}
          </group>
        );
      })}
    </group>
  );
}

/* ---------------------------- Contact: the place the route ends ---------------------------- */

/** A quiet frame with one coral signal arriving at its centre. Nothing else moves here. */
export function Terminus() {
  const pal = useMemo(() => palette(), []);
  const dot = useRef<Mesh>(null);
  const ref = useRef<Group>(null);
  useEffect(() => void ref.current, []);
  useFrame(({ clock }) => {
    if (!dot.current || world.get().reduced) return;
    const s = 1 + Math.sin(clock.elapsedTime * 1.4) * 0.12;
    dot.current.scale.setScalar(0.28 * s);
  });
  return (
    <group ref={ref} position={[0, 1.2, ZONE.contact]}>
      <lineSegments geometry={BOX_EDGES} scale={[6.4, 3.6, 0.01]}>
        <lineBasicMaterial color={pal.blueberry} />
      </lineSegments>
      <lineSegments geometry={BOX_EDGES} position={[0, 0, -1.4]} scale={[7.6, 4.3, 0.01]}>
        <lineBasicMaterial color={pal.blueberry} transparent opacity={0.4} />
      </lineSegments>
      <mesh ref={dot} geometry={BOX} scale={[0.28, 0.28, 0.28]} rotation={[0, 0, Math.PI / 4]}>
        <meshBasicMaterial color={pal.soda} />
      </mesh>
    </group>
  );
}
