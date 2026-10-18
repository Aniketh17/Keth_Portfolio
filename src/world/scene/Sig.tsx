import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture, CircleGeometry, ConeGeometry, Group, MathUtils, Mesh, MeshBasicMaterial, MeshLambertMaterial, SphereGeometry, SRGBColorSpace, Vector3 } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { frame, world, type Mood } from '../store';
import { readPalette } from '../palette';
import { BOX, damp, palette } from './common';

/**
 * Sig: an original geometric character. A rounded blueberry cube with a flat cream face plate, two small ears,
 * a coral diamond on an antenna and two floating hands. About ten meshes, no skinning, no shadows. Every
 * expression lives in one small texture and is chosen by moving the plate's UV window, so changing mood costs
 * nothing. He is placed relative to the camera, so he keeps the same spot on screen however the camera travels.
 */

const MOODS: Mood[] = ['idle', 'happy', 'think', 'surprised', 'sleepy'];
/** Extra frame for the blink. */
const BLINK = 5;
const CELLS = 3;

function faceTexture(): CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size * CELLS;
  const g = canvas.getContext('2d')!;
  const p = readPalette();
  const rr = (x: number, y: number, w: number, h: number, r: number) => {
    g.beginPath();
    g.roundRect(x, y, w, h, r);
    g.fill();
  };
  const cell = (i: number, draw: (cx: number, cy: number) => void) => {
    const cx = (i % CELLS) * size + size / 2;
    const cy = Math.floor(i / CELLS) * size + size / 2;
    g.fillStyle = p.css.canvas;
    g.fillRect((i % CELLS) * size, Math.floor(i / CELLS) * size, size, size);
    draw(cx, cy);
  };
  const cheeks = (cx: number, cy: number) => {
    g.fillStyle = p.css.soda;
    g.globalAlpha = 0.55;
    g.beginPath();
    g.arc(cx - 78, cy + 28, 15, 0, Math.PI * 2);
    g.arc(cx + 78, cy + 28, 15, 0, Math.PI * 2);
    g.fill();
    g.globalAlpha = 1;
  };
  g.lineCap = 'round';
  g.strokeStyle = p.css.blueberry;
  g.lineWidth = 11;
  // idle
  cell(0, (cx, cy) => {
    g.fillStyle = p.css.blueberry;
    rr(cx - 62, cy - 34, 26, 48, 13);
    rr(cx + 36, cy - 34, 26, 48, 13);
    g.beginPath();
    g.arc(cx, cy + 22, 26, 0.25 * Math.PI, 0.75 * Math.PI);
    g.stroke();
    cheeks(cx, cy);
  });
  // happy
  cell(1, (cx, cy) => {
    g.beginPath();
    g.arc(cx - 49, cy - 4, 22, 1.15 * Math.PI, 1.85 * Math.PI);
    g.stroke();
    g.beginPath();
    g.arc(cx + 49, cy - 4, 22, 1.15 * Math.PI, 1.85 * Math.PI);
    g.stroke();
    g.fillStyle = p.css.blueberry;
    g.beginPath();
    g.arc(cx, cy + 20, 30, 0, Math.PI);
    g.fill();
    cheeks(cx, cy);
  });
  // think
  cell(2, (cx, cy) => {
    g.fillStyle = p.css.blueberry;
    rr(cx - 62, cy - 44, 26, 44, 13);
    rr(cx + 36, cy - 44, 26, 44, 13);
    g.fillRect(cx - 22, cy + 34, 44, 9);
    cheeks(cx, cy);
  });
  // surprised
  cell(3, (cx, cy) => {
    g.fillStyle = p.css.blueberry;
    g.beginPath();
    g.arc(cx - 48, cy - 16, 22, 0, Math.PI * 2);
    g.arc(cx + 48, cy - 16, 22, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.ellipse(cx, cy + 36, 15, 20, 0, 0, Math.PI * 2);
    g.fill();
    cheeks(cx, cy);
  });
  // sleepy
  cell(4, (cx, cy) => {
    g.beginPath();
    g.moveTo(cx - 70, cy - 8);
    g.lineTo(cx - 28, cy - 8);
    g.moveTo(cx + 28, cy - 8);
    g.lineTo(cx + 70, cy - 8);
    g.stroke();
    g.beginPath();
    g.arc(cx, cy + 22, 18, 0.2 * Math.PI, 0.8 * Math.PI);
    g.stroke();
    cheeks(cx, cy);
  });
  // blink
  cell(BLINK, (cx, cy) => {
    g.beginPath();
    g.moveTo(cx - 70, cy - 8);
    g.lineTo(cx - 28, cy - 8);
    g.moveTo(cx + 28, cy - 8);
    g.lineTo(cx + 70, cy - 8);
    g.stroke();
    g.beginPath();
    g.arc(cx, cy + 22, 26, 0.25 * Math.PI, 0.75 * Math.PI);
    g.stroke();
    cheeks(cx, cy);
  });
  const t = new CanvasTexture(canvas);
  t.colorSpace = SRGBColorSpace;
  t.repeat.set(1 / CELLS, 1 / CELLS);
  return t;
}

const setFace = (t: CanvasTexture, index: number) => t.offset.set((index % CELLS) / CELLS, 1 - (Math.floor(index / CELLS) + 1) / CELLS);

/** Where Sig sits on screen (-1..1 on each axis) for each zone, on wide and narrow screens. */
const PERCH: Record<'wide' | 'narrow', { overview: [number, number][]; inspect: [number, number] }> = {
  wide: {
    overview: [[0.64, -0.12], [0.84, -0.62], [0.84, -0.58], [0.84, -0.58], [0.72, 0.18]],
    inspect: [0.86, 0.58],
  },
  narrow: {
    overview: [[0.74, 0.62], [0.8, 0.44], [0.8, -0.6], [0.8, -0.6], [0.8, 0.7]],
    inspect: [0.8, 0.5],
  },
};

export function Sig() {
  const pal = useMemo(() => palette(), []);
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const handL = useRef<Mesh>(null);
  const handR = useRef<Mesh>(null);
  const diamond = useRef<Mesh>(null);
  const face = useMemo(faceTexture, []);
  const geo = useMemo(
    () => ({
      body: new RoundedBoxGeometry(1, 1, 1, 4, 0.2),
      ear: new ConeGeometry(0.15, 0.3, 4),
      hand: new SphereGeometry(0.12, 12, 10),
      shadow: new CircleGeometry(0.55, 24),
    }),
    [],
  );
  const mats = useMemo(() => ({ blue: new MeshLambertMaterial({ color: pal.blueberry }), soda: new MeshBasicMaterial({ color: pal.soda }), shadow: new MeshBasicMaterial({ color: pal.blueberry, transparent: true, opacity: 0.16, depthWrite: false }) }), [pal]);
  const st = useRef({ nx: 0.7, ny: 0, squash: 0, mood: 'idle' as Mood, blinkAt: 2.5, blinkEnd: 0, lastSay: 0, sleepAt: 0 });
  const tmp = useMemo(() => ({ fwd: new Vector3(), right: new Vector3(), up: new Vector3(), pos: new Vector3(), ndc: new Vector3() }), []);

  useEffect(
    () => () => {
      face.dispose();
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [face, geo, mats],
  );

  useFrame(({ camera, clock, size }, dt) => {
    const g = root.current;
    if (!g) return;
    const s = world.get();
    const me = st.current;
    const t = s.reduced ? 0 : clock.elapsedTime;
    const wide = !s.small;
    const set = wide ? PERCH.wide : PERCH.narrow;
    const [tx, ty] = s.mode === 'inspect' ? set.inspect : set.overview[Math.min(4, s.zone)];
    me.nx = s.reduced ? tx : damp(me.nx, tx, 3.2, dt);
    me.ny = s.reduced ? ty : damp(me.ny, ty, 3.2, dt);

    // Mood, with a squash-and-stretch kick whenever it changes or he is given a new line.
    const mood: Mood = s.say?.mood ?? (performance.now() - me.sleepAt > 0 && me.sleepAt > 0 ? 'sleepy' : 'idle');
    if (s.say && s.say.id !== me.lastSay) {
      me.lastSay = s.say.id;
      me.squash = 1;
      me.sleepAt = performance.now() + 22000;
    }
    if (!s.say && me.sleepAt === 0) me.sleepAt = performance.now() + 22000;
    me.mood = mood;
    me.squash = s.reduced ? 0 : damp(me.squash, 0, 6, dt);
    const sq = Math.sin(me.squash * Math.PI) * 0.16;

    // Blink on an irregular rhythm.
    if (!s.reduced && t > me.blinkAt) {
      me.blinkEnd = t + 0.13;
      me.blinkAt = t + 2.4 + ((Math.sin(t * 12.9898) + 1) / 2) * 3;
    }
    const blinking = t < me.blinkEnd && (mood === 'idle' || mood === 'think');
    const idx = blinking ? BLINK : MOODS.indexOf(mood);
    setFace(face, idx);

    // Place him relative to the camera so his screen position is stable.
    const fov = (camera as import('three').PerspectiveCamera).fov;
    const d = 6;
    const halfH = d * Math.tan(MathUtils.degToRad(fov) / 2);
    const halfW = halfH * (size.width / size.height);
    camera.getWorldDirection(tmp.fwd);
    tmp.right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    tmp.up.set(0, 1, 0).applyQuaternion(camera.quaternion);
    const bob = Math.sin(t * 1.7) * 0.05;
    // The camera's view offset slides the whole picture sideways or down to make room for the HTML; undo it here
    // so Sig lands where the perch table says, in screen terms.
    const vo = (camera as import('three').PerspectiveCamera).view;
    const offX = vo ? (2 * vo.offsetX) / size.width : 0;
    const offY = vo ? (2 * vo.offsetY) / size.height : 0;
    tmp.pos
      .copy(camera.position)
      .addScaledVector(tmp.fwd, d)
      .addScaledVector(tmp.right, (me.nx + offX) * halfW)
      .addScaledVector(tmp.up, (me.ny - offY) * halfH + bob);
    g.position.copy(tmp.pos);
    g.quaternion.copy(camera.quaternion);
    const frac = s.small ? 0.1 : 0.125;
    const scale = halfH * 2 * frac;
    g.scale.setScalar(scale);

    if (body.current) {
      body.current.rotation.y = MathUtils.lerp(body.current.rotation.y, frame.pointerX * 0.35, 0.08);
      body.current.rotation.x = MathUtils.lerp(body.current.rotation.x, frame.pointerY * 0.18 - (mood === 'sleepy' ? 0.18 : 0), 0.08);
      body.current.rotation.z = mood === 'think' ? 0.12 : mood === 'sleepy' ? -0.08 : 0;
      body.current.scale.set(1 + sq * 0.8, 1 - sq, 1 + sq * 0.8);
    }
    const wave = mood === 'happy' ? Math.sin(t * 9) * 0.25 : 0;
    if (handL.current) handL.current.position.set(-0.7, -0.12 + Math.sin(t * 1.9) * 0.06 + wave, 0.1);
    if (handR.current) handR.current.position.set(0.7, -0.12 + Math.sin(t * 1.9 + 1.6) * 0.06 - wave, 0.1);
    if (diamond.current) {
      diamond.current.rotation.y = t * 1.1;
      diamond.current.scale.setScalar(0.18 * (mood === 'think' ? 1.3 : 1));
    }

    // Publish his screen position for the bubble and the tap target.
    tmp.ndc.copy(g.position).project(camera);
    const sx = Math.round((tmp.ndc.x * 0.5 + 0.5) * size.width);
    const sy = Math.round((-tmp.ndc.y * 0.5 + 0.5) * size.height);
    const px = Math.round((scale * (size.height / (halfH * 2))) * 1);
    const root$ = document.documentElement.style;
    root$.setProperty('--sig-x', `${sx}px`);
    root$.setProperty('--sig-y', `${sy}px`);
    root$.setProperty('--sig-s', `${px}px`);
    // The bubble opens upward when Sig is low on screen and downward when he is high, so it never leaves the viewport.
    const low = sy > size.height * 0.5 ? '1' : '0';
    if (document.documentElement.dataset.sigLow !== low) document.documentElement.dataset.sigLow = low;
  });

  return (
    <group ref={root}>
      <mesh geometry={geo.shadow} material={mats.shadow} position={[0, -0.95, 0]} rotation={[-Math.PI / 2.4, 0, 0]} />
      <group ref={body}>
        <mesh geometry={geo.body} material={mats.blue} />
        <mesh position={[0, 0, 0.51]}>
          <planeGeometry args={[0.76, 0.76]} />
          <meshBasicMaterial map={face} toneMapped={false} />
        </mesh>
        <mesh geometry={geo.ear} material={mats.blue} position={[-0.3, 0.58, 0]} rotation={[0, Math.PI / 4, 0.18]} />
        <mesh geometry={geo.ear} material={mats.blue} position={[0.3, 0.58, 0]} rotation={[0, Math.PI / 4, -0.18]} />
        <mesh geometry={BOX} material={mats.blue} position={[0, 0.66, 0]} scale={[0.04, 0.36, 0.04]} />
        <mesh ref={diamond} geometry={BOX} material={mats.soda} position={[0, 0.96, 0]} scale={[0.18, 0.18, 0.18]} rotation={[0, 0, Math.PI / 4]} />
        <mesh ref={handL} geometry={geo.hand} material={mats.blue} />
        <mesh ref={handR} geometry={geo.hand} material={mats.blue} />
      </group>
    </group>
  );
}
