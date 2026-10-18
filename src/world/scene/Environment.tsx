import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BoxGeometry, BufferGeometry, EdgesGeometry, Float32BufferAttribute, Group, MeshBasicMaterial } from 'three';
import { world } from '../store';
import { ZONE } from '../layout';
import { readPalette } from '../palette';

const FLOOR_Y = -1.6;

/** Deterministic pseudo-random, so the architecture is identical on every load. */
function rng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** The coordinate field: a perspective grid that runs the length of the journey and dissolves into the fog. */
function Floor({ density }: { density: number }) {
  const geo = useMemo(() => {
    const pts: number[] = [];
    const z0 = 16;
    const z1 = -125;
    const half = 64;
    for (let x = -half; x <= half; x += density) pts.push(x, FLOOR_Y, z0, x, FLOOR_Y, z1);
    for (let z = z1; z <= z0; z += density) pts.push(-half, FLOOR_Y, z, half, FLOOR_Y, z);
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pts, 3));
    return g;
  }, [density]);
  const color = useMemo(() => readPalette().blueberry, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color={color} transparent opacity={0.13} />
    </lineSegments>
  );
}

/** Slabs and open frames along both sides of the route: they give the camera something to pass, which is what makes the movement legible. */
function Architecture({ count }: { count: number }) {
  const pal = useMemo(() => readPalette(), []);
  const items = useMemo(() => {
    const r = rng(11);
    return Array.from({ length: count }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const z = -8 - (i / count) * 118 + (r() - 0.5) * 3;
      return {
        i,
        x: side * (9.5 + r() * 6),
        z,
        w: 0.3 + r() * 0.5,
        h: 3 + r() * 7,
        d: 0.3 + r() * 0.5,
        frame: i % 3 === 0,
        fw: 2 + r() * 3,
      };
    });
  }, [count]);
  const boxes = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const edges = useMemo(() => new EdgesGeometry(boxes), [boxes]);
  useEffect(
    () => () => {
      boxes.dispose();
      edges.dispose();
    },
    [boxes, edges],
  );
  return (
    <>
      {items.map((it) =>
        it.frame ? (
          <lineSegments key={it.i} geometry={edges} position={[it.x, FLOOR_Y + it.h / 2, it.z]} scale={[it.fw, it.h, 0.01]}>
            <lineBasicMaterial color={pal.blueberry} transparent opacity={0.4} />
          </lineSegments>
        ) : (
          <mesh key={it.i} geometry={boxes} position={[it.x, FLOOR_Y + it.h / 2, it.z]} scale={[it.w, it.h, it.d]}>
            <meshLambertMaterial color={pal.blueberry} />
          </mesh>
        ),
      )}
    </>
  );
}

/** Thin gates at the boundaries between zones. */
function Gates() {
  const pal = useMemo(() => readPalette(), []);
  const boxes = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const edges = useMemo(() => new EdgesGeometry(boxes), [boxes]);
  useEffect(
    () => () => {
      boxes.dispose();
      edges.dispose();
    },
    [boxes, edges],
  );
  const zs = [(ZONE.hero + ZONE.stage) / 2, (ZONE.stage + ZONE.systems) / 2, (ZONE.systems + ZONE.timeline) / 2, (ZONE.timeline + ZONE.contact) / 2];
  return (
    <>
      {zs.map((z) => (
        <lineSegments key={z} geometry={edges} position={[0, 2.2, z]} scale={[17, 7.6, 0.01]}>
          <lineBasicMaterial color={pal.blueberry} transparent opacity={0.28} />
        </lineSegments>
      ))}
    </>
  );
}

/**
 * The route itself: a line down the middle of the floor with a few coral signals travelling along it. It is the
 * one piece of constant ambient activity, and it says the same thing as the camera: this is a path.
 */
function Spine() {
  const pal = useMemo(() => readPalette(), []);
  const dots = useRef<Group>(null);
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute([0, FLOOR_Y + 0.01, 12, 0, FLOOR_Y + 0.01, ZONE.contact - 6], 3));
    return g;
  }, []);
  const dotGeo = useMemo(() => new BoxGeometry(0.16, 0.04, 0.9), []);
  const dotMat = useMemo(() => new MeshBasicMaterial({ color: pal.soda }), [pal]);
  useEffect(
    () => () => {
      geo.dispose();
      dotGeo.dispose();
      dotMat.dispose();
    },
    [geo, dotGeo, dotMat],
  );
  useFrame(({ clock }) => {
    const g = dots.current;
    if (!g || world.get().reduced) return;
    const t = clock.elapsedTime;
    g.children.forEach((c, i) => {
      const u = (t * 0.045 + i / g.children.length) % 1;
      c.position.z = 12 - u * (12 - (ZONE.contact - 6));
    });
  });
  return (
    <>
      <lineSegments geometry={geo}>
        <lineBasicMaterial color={pal.blueberry} transparent opacity={0.38} />
      </lineSegments>
      <group ref={dots}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} geometry={dotGeo} material={dotMat} position={[0, FLOOR_Y + 0.03, 12 - i * 30]} />
        ))}
      </group>
    </>
  );
}

export function Environment({ small }: { small: boolean }) {
  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight position={[6, 10, 8]} intensity={1.1} />
      <Floor density={small ? 4 : 2.5} />
      <Architecture count={small ? 16 : 28} />
      <Gates />
      <Spine />
    </>
  );
}
