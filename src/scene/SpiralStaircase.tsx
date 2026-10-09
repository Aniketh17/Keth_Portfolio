import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Shape,
  ExtrudeGeometry,
} from 'three';
import { routes } from '../data/projects';
import type { RouteId } from '../data/types';
import { ui } from '../lib/journey';
import {
  D_PHI,
  LANDING_HALF,
  ORB_RADIUS,
  ORB_U,
  R_INNER,
  R_LANDING_OUTER,
  R_OUTER,
  R_PATH,
  TREAD_COUNT,
  TREAD_HEIGHT,
  TREAD_THICKNESS,
  STAIR_BOTTOM,
  heightAt,
  landingOfTread,
  landingU,
} from './geometry';
import { LANDING_COUNT } from '../lib/journey';

export const PALETTE = {
  night: '#111426',
  stair: '#3A3F6E',
  stairTop: '#4B507C',
  column: '#1C2043',
  violet: '#7568FF',
  citron: '#D9F477',
  ivory: '#F6F0E6',
  peach: '#FF9678',
};

/** Annular sector in the XZ plane, top face at y = 0 and extruded downward. Angle 0 points along +z. */
function sectorGeometry(rInner: number, rOuter: number, angle: number, depth: number): BufferGeometry {
  const a0 = -Math.PI / 2;
  const a1 = a0 + angle;
  const s = new Shape();
  s.moveTo(rInner * Math.cos(a0), rInner * Math.sin(a0));
  s.lineTo(rOuter * Math.cos(a0), rOuter * Math.sin(a0));
  s.absarc(0, 0, rOuter, a0, a1, false);
  s.lineTo(rInner * Math.cos(a1), rInner * Math.sin(a1));
  s.absarc(0, 0, rInner, a1, a0, true);
  const g = new ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: Math.max(2, Math.ceil(angle * 6)) });
  // Shape lies in XY with depth along +z; lay it flat so depth runs up, then drop it so the top face is y = 0.
  g.rotateX(-Math.PI / 2);
  g.translate(0, -depth, 0);
  return g;
}

const ORDINARY_TREADS = Array.from({ length: TREAD_COUNT }, (_, k) => k).filter((k) => landingOfTread(k) === -1);

function Treads() {
  const treadRef = useRef<InstancedMesh>(null);
  const stripRef = useRef<InstancedMesh>(null);
  const treadGeo = useMemo(() => sectorGeometry(R_INNER, R_OUTER, D_PHI * 0.96, TREAD_THICKNESS), []);
  const stripGeo = useMemo(() => sectorGeometry(R_OUTER - 0.22, R_OUTER - 0.05, D_PHI * 0.96, 0.05), []);
  const baseColor = useMemo(() => new Color(PALETTE.violet).multiplyScalar(0.75), []);
  const trailColor = useMemo(() => new Color(PALETTE.citron), []);
  const scratch = useMemo(() => new Color(), []);
  const dummy = useMemo(() => new Object3D(), []);
  const dirty = useRef(true);

  useLayoutEffect(() => {
    const treads = treadRef.current;
    const strips = stripRef.current;
    if (!treads || !strips) return;
    ORDINARY_TREADS.forEach((k, idx) => {
      dummy.position.set(0, TREAD_HEIGHT[k], 0);
      dummy.rotation.set(0, k * D_PHI, 0);
      dummy.updateMatrix();
      treads.setMatrixAt(idx, dummy.matrix);
      dummy.position.y += 0.015;
      dummy.updateMatrix();
      strips.setMatrixAt(idx, dummy.matrix);
      strips.setColorAt(idx, baseColor);
    });
    treads.instanceMatrix.needsUpdate = true;
    strips.instanceMatrix.needsUpdate = true;
    if (strips.instanceColor) strips.instanceColor.needsUpdate = true;
  }, [baseColor, dummy]);

  // The lit trail between the Work landing and the selected proof object.
  useEffect(() => ui.subscribe(() => (dirty.current = true)), []);

  useFrame(({ clock }) => {
    const strips = stripRef.current;
    if (!strips || !dirty.current) return;
    const { fetchRoute, fetchPhase } = ui.get();
    const active = fetchRoute && fetchPhase !== 'idle';
    const from = landingU(1) + LANDING_HALF;
    const to = fetchRoute ? ORB_U[fetchRoute] : from;
    const t = clock.elapsedTime;
    ORDINARY_TREADS.forEach((k, idx) => {
      const inTrail = active && k >= from && k <= to;
      if (inTrail) {
        const wave = 0.55 + 0.45 * Math.sin(t * 6 - k * 0.9);
        scratch.copy(baseColor).lerp(trailColor, 0.6 + 0.4 * wave);
      } else {
        scratch.copy(baseColor);
      }
      strips.setColorAt(idx, scratch);
    });
    if (strips.instanceColor) strips.instanceColor.needsUpdate = true;
    // Keep animating only while a trail is lit; otherwise settle after one repaint.
    dirty.current = Boolean(active);
  });

  return (
    <>
      <instancedMesh ref={treadRef} args={[treadGeo, undefined, ORDINARY_TREADS.length]}>
        <meshStandardMaterial color={PALETTE.stair} roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={stripRef} args={[stripGeo, undefined, ORDINARY_TREADS.length]}>
        <meshBasicMaterial />
      </instancedMesh>
    </>
  );
}

function Landings() {
  const geos = useMemo(
    () =>
      Array.from({ length: LANDING_COUNT }, () => ({
        top: sectorGeometry(R_INNER - 0.1, R_LANDING_OUTER, D_PHI * LANDING_HALF * 2 * 0.99, TREAD_THICKNESS + 0.1),
        rim: sectorGeometry(R_LANDING_OUTER - 0.2, R_LANDING_OUTER, D_PHI * LANDING_HALF * 2 * 0.99, 0.12),
      })),
    [],
  );
  return (
    <>
      {geos.map((g, i) => {
        const startK = landingU(i) - LANDING_HALF;
        const y = TREAD_HEIGHT[Math.max(0, Math.min(TREAD_COUNT - 1, landingU(i)))];
        return (
          <group key={i} position={[0, y, 0]} rotation={[0, startK * D_PHI, 0]}>
            <mesh geometry={g.top}>
              <meshStandardMaterial color={PALETTE.stairTop} roughness={0.75} />
            </mesh>
            <mesh geometry={g.rim} position={[0, 0.02, 0]}>
              <meshBasicMaterial color={PALETTE.violet} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

function Column() {
  const height = -STAIR_BOTTOM + 14;
  return (
    <group position={[0, STAIR_BOTTOM - 8 + height / 2, 0]}>
      <mesh>
        <cylinderGeometry args={[0.85, 0.85, height, 20]} />
        <meshStandardMaterial color={PALETTE.column} roughness={0.9} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[0, -height / 2 + 1 + i * (height / 7), 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.88, 0.025, 6, 40]} />
          <meshBasicMaterial color={PALETTE.violet} />
        </mesh>
      ))}
    </group>
  );
}

/** Deterministic pseudo-random so the floating pieces are identical on every load. */
function rng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function FloatingPieces({ count }: { count: number }) {
  const group = useRef<Group>(null);
  const pieces = useMemo(() => {
    const r = rng(42);
    const top = 3;
    const span = top - STAIR_BOTTOM + 4;
    return Array.from({ length: count }, (_, i) => {
      const phi = r() * Math.PI * 2;
      const radius = 7 + r() * 7;
      return {
        i,
        pos: [Math.sin(phi) * radius, top - r() * span, Math.cos(phi) * radius] as [number, number, number],
        size: [0.6 + r() * 1.6, 0.25 + r() * 1.1, 0.6 + r() * 1.6] as [number, number, number],
        rot: [r() * 0.5, r() * Math.PI, r() * 0.5] as [number, number, number],
        ring: i % 5 === 0,
      };
    });
  }, [count]);

  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = clock.elapsedTime * 0.01;
  });

  return (
    <group ref={group}>
      {pieces.map((p) =>
        p.ring ? (
          <mesh key={p.i} position={p.pos} rotation={p.rot}>
            <torusGeometry args={[1.2 + p.size[0] * 0.3, 0.05, 6, 40]} />
            <meshBasicMaterial color={PALETTE.violet} transparent opacity={0.7} />
          </mesh>
        ) : (
          <mesh key={p.i} position={p.pos} rotation={p.rot}>
            <boxGeometry args={p.size} />
            <meshStandardMaterial color="#20244A" roughness={0.9} />
          </mesh>
        ),
      )}
    </group>
  );
}

function Dust({ count }: { count: number }) {
  const geo = useMemo(() => {
    const r = rng(7);
    const g = new BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const phi = r() * Math.PI * 2;
      const radius = 1 + r() * 11;
      pos[i * 3] = Math.sin(phi) * radius;
      pos[i * 3 + 1] = 4 - r() * (-STAIR_BOTTOM + 8);
      pos[i * 3 + 2] = Math.cos(phi) * radius;
    }
    g.setAttribute('position', new Float32BufferAttribute(pos, 3));
    return g;
  }, [count]);
  return (
    <points geometry={geo}>
      <pointsMaterial color={PALETTE.ivory} size={0.05} sizeAttenuation transparent opacity={0.45} depthWrite={false} />
    </points>
  );
}

const pathPoint = (u: number, radius = R_PATH, lift = 0): [number, number, number] => {
  const phi = u * D_PHI;
  return [Math.sin(phi) * radius, heightAt(u) + lift, Math.cos(phi) * radius];
};

/** How high Milo sits when he is on the bed at the final landing. */
export const BED_LIFT = 0.17;

const bedPosition = () => pathPoint(landingU(4));
/** The bone floats ahead of the bed along the stairs, where Milo can look at it. */
const bonePosition = (): [number, number, number] => pathPoint(landingU(4) + 1.15, R_PATH, 0.7);
const ballBase = (): [number, number, number] => pathPoint(landingU(3) + 1.1, 3.7);

function DogBed() {
  const p = bedPosition();
  return (
    <group position={[p[0], p[1], p[2]]}>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.66, 0.7, 0.18, 36]} />
        <meshStandardMaterial color={PALETTE.ivory} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.17, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.66, 0.12, 14, 40]} />
        <meshStandardMaterial color={PALETTE.peach} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.04, 32]} />
        <meshStandardMaterial color="#E8DCC8" roughness={1} />
      </mesh>
    </group>
  );
}

function Bone() {
  const ref = useRef<Group>(null);
  const p = bonePosition();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = p[1] + Math.sin(clock.elapsedTime * 1.8) * 0.08;
    ref.current.rotation.y = clock.elapsedTime * 0.9;
    ref.current.rotation.z = 0.5;
  });
  return (
    <group ref={ref} position={p}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.055, 0.055, 0.42, 12]} />
        <meshStandardMaterial color={PALETTE.ivory} roughness={0.6} emissive={PALETTE.ivory} emissiveIntensity={0.2} />
      </mesh>
      {[
        [0.21, 0.06],
        [0.21, -0.06],
        [-0.21, 0.06],
        [-0.21, -0.06],
      ].map(([x, y]) => (
        <mesh key={`${x}${y}`} position={[x, y, 0]}>
          <sphereGeometry args={[0.085, 12, 10]} />
          <meshStandardMaterial color={PALETTE.ivory} roughness={0.6} emissive={PALETTE.ivory} emissiveIntensity={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function Ball() {
  const ref = useRef<Mesh>(null);
  const p = ballBase();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * 2.4;
    const hop = Math.abs(Math.sin(t));
    ref.current.position.y = p[1] + 0.24 + hop * 0.5;
    ref.current.scale.set(1 + (1 - hop) * 0.1, 1 - (1 - hop) * 0.14, 1 + (1 - hop) * 0.1);
  });
  return (
    <mesh ref={ref} position={[p[0], p[1] + 0.24, p[2]]}>
      <sphereGeometry args={[0.24, 20, 16]} />
      <meshStandardMaterial color={PALETTE.citron} roughness={0.5} emissive={PALETTE.citron} emissiveIntensity={0.35} />
    </mesh>
  );
}

/** Things at each landing: a skills mobile, a ball to chase, and a bed, bone and a reason to wag at the end. */
function LandingProps() {
  const cubes = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (cubes.current) cubes.current.rotation.y = clock.elapsedTime * 0.4;
  });
  const skills = pathPoint(landingU(2) + 0.6, 4.6);
  const pillars = [-1.9, -0.9].map((du) => pathPoint(landingU(3) + du, 4.7));

  return (
    <>
      <group ref={cubes} position={[skills[0], skills[1] + 1.4, skills[2]]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[Math.cos((i * Math.PI) / 2) * 0.55, Math.sin(i * 1.7) * 0.2, Math.sin((i * Math.PI) / 2) * 0.55]}>
            <boxGeometry args={[0.28, 0.28, 0.28]} />
            <meshStandardMaterial color={PALETTE.stairTop} emissive={PALETTE.violet} emissiveIntensity={0.5} roughness={0.5} />
          </mesh>
        ))}
      </group>
      {pillars.map((p, i) => (
        <mesh key={i} position={[p[0], p[1] + 0.35 + i * 0.12, p[2]]}>
          <cylinderGeometry args={[0.16, 0.2, 0.7 + i * 0.24, 12]} />
          <meshStandardMaterial color={PALETTE.stairTop} roughness={0.7} />
        </mesh>
      ))}
      <Ball />
      <DogBed />
      <Bone />
    </>
  );
}

/** World-space focus points Milo looks at when he stops on a landing. */
export function landingFocus(landing: number): [number, number, number] | null {
  if (landing === 1) return pathPoint(ORB_U.ai, ORB_RADIUS, 0.55);
  if (landing === 2) return pathPoint(landingU(2) + 0.6, 4.6, 1.4);
  if (landing === 3) {
    const b = ballBase();
    return [b[0], b[1] + 0.5, b[2]];
  }
  if (landing === 4) return bonePosition();
  return null;
}

export function orbPosition(routeId: RouteId): [number, number, number] {
  const u = ORB_U[routeId];
  const phi = u * D_PHI;
  return [Math.sin(phi) * ORB_RADIUS, heightAt(u) + 0.6, Math.cos(phi) * ORB_RADIUS];
}

export type OrbHandles = Partial<Record<RouteId, Mesh | null>>;

/** The three proof objects. The selected one lights up and swells when Milo reaches it. */
function Orbs({ handles }: { handles: React.MutableRefObject<OrbHandles> }) {
  const glow = useRef<Partial<Record<RouteId, Mesh | null>>>({});
  const colors = useMemo(() => ({ idle: new Color(PALETTE.violet), live: new Color(PALETTE.citron), mix: new Color() }), []);

  useFrame(({ clock }) => {
    const { fetchRoute, fetchPhase } = ui.get();
    const t = clock.elapsedTime;
    routes.forEach((r, i) => {
      const core = handles.current[r.id];
      const halo = glow.current[r.id];
      if (!core || !halo) return;
      const selected = fetchRoute === r.id && fetchPhase !== 'idle';
      const burst = selected && fetchPhase === 'arrived' ? 1.6 : selected && fetchPhase === 'react' ? 1.25 : 1;
      const pulse = 1 + 0.08 * Math.sin(t * 2.2 + i * 1.7);
      const base = selected ? 1.25 : 0.8;
      core.scale.setScalar(base * pulse * burst);
      core.position.y = orbPosition(r.id)[1] + Math.sin(t * 1.6 + i) * 0.06;
      halo.position.y = core.position.y;
      halo.scale.setScalar(base * pulse * burst * (selected ? 2.4 : 1.8));
      const coreMat = core.material as MeshBasicMaterial;
      const haloMat = halo.material as MeshBasicMaterial;
      coreMat.color.copy(colors.mix.copy(colors.idle).lerp(colors.live, selected ? 1 : 0));
      haloMat.color.copy(coreMat.color);
      haloMat.opacity = selected ? 0.32 : 0.14;
    });
  });

  return (
    <>
      {routes.map((r) => {
        const p = orbPosition(r.id);
        return (
          <group key={r.id}>
            <mesh ref={(m) => (handles.current[r.id] = m)} position={p}>
              <sphereGeometry args={[0.2, 20, 16]} />
              <meshBasicMaterial color={PALETTE.violet} />
            </mesh>
            <mesh ref={(m) => (glow.current[r.id] = m)} position={p}>
              <sphereGeometry args={[0.2, 16, 12]} />
              <meshBasicMaterial color={PALETTE.violet} transparent opacity={0.14} depthWrite={false} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

export function World({ lowPower, orbs }: { lowPower: boolean; orbs: React.MutableRefObject<OrbHandles> }) {
  return (
    <>
      <Column />
      <Treads />
      <Landings />
      <LandingProps />
      <Orbs handles={orbs} />
      <FloatingPieces count={lowPower ? 10 : 18} />
      <Dust count={lowPower ? 90 : 220} />
    </>
  );
}
