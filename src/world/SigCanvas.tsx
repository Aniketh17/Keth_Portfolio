import { useEffect, useMemo, useRef } from 'react';
import { CanvasTexture, CircleGeometry, ConeGeometry, Group, MathUtils, Mesh, MeshBasicMaterial, MeshLambertMaterial, SphereGeometry, SRGBColorSpace } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Canvas, useFrame } from '@react-three/fiber';
import { frame, useWorld, world, type Mood } from './store';
import { readPalette } from './palette';
import { sigSay } from './sig';
import { BOX, damp, palette } from './scene/common';

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
    overview: [[0.86, -0.5], [0.86, -0.62], [0.84, -0.58], [0.84, -0.58], [0.86, -0.3]],
    inspect: [0.86, 0.58],
  },
  narrow: {
    overview: [[0.7, 0.62], [0.7, 0.44], [0.72, -0.6], [0.72, -0.6], [0.72, 0.7]],
    inspect: [0.7, 0.5],
  },
};

/** Cube size on screen, in px, and the canvas that holds him (room for the antenna, hands, a hop and the shadow). */
const SIZE = { wide: { cube: 118, w: 310, h: 430 }, narrow: { cube: 58, w: 152, h: 214 } };

function SigScene({ narrow }: { narrow: boolean }) {
  const pal = useMemo(() => palette(), []);
  const root = useRef<Group>(null);
  const lift = useRef<Group>(null);
  const body = useRef<Group>(null);
  const handL = useRef<Mesh>(null);
  const handR = useRef<Mesh>(null);
  const diamond = useRef<Mesh>(null);
  const plate = useRef<Mesh>(null);
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
  const mats = useMemo(
    () => ({
      blue: new MeshLambertMaterial({ color: pal.blueberry }),
      soda: new MeshBasicMaterial({ color: pal.soda }),
      shadow: new MeshBasicMaterial({ color: pal.blueberry, transparent: true, opacity: 0.16, depthWrite: false }),
    }),
    [pal],
  );
  const st = useRef({
    cx: -1, cy: -1, squash: 0, blinkAt: 2.5, blinkEnd: 0, lastSay: 0, sleepAt: 0,
    yaw: 0, pitch: 0, px: 0, py: 0, pokes: 0, pokeAt: -9, pokeKind: 0, scrollY: 0, fast: 0, hover: 0,
  });

  useEffect(
    () => () => {
      face.dispose();
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [face, geo, mats],
  );

  useFrame(({ clock, size }, dt) => {
    const g = root.current;
    const layer = document.getElementById('sig-layer');
    if (!g || !layer) return;
    const s = world.get();
    const me = st.current;
    const t = s.reduced ? 0 : clock.elapsedTime;
    const dims = narrow ? SIZE.narrow : SIZE.wide;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Where he perches, in screen pixels. Wide screens: a spot per chapter. Phones: one corner, out of the way.
    let tx: number;
    let ty: number;
    if (narrow) {
      tx = vw - dims.cube * 0.95 - 6;
      ty = vh - dims.cube * 1.0 - 4;
    } else {
      const [nx, ny] = s.mode === 'inspect' ? PERCH.wide.inspect : PERCH.wide.overview[Math.min(4, s.zone)];
      tx = ((nx + 1) / 2) * vw;
      ty = ((1 - ny) / 2) * vh;
    }
    if (me.cx < 0 || s.reduced) {
      me.cx = tx;
      me.cy = ty;
    } else {
      me.cx = damp(me.cx, tx, 3.2, dt);
      me.cy = damp(me.cy, ty, 3.2, dt);
    }
    layer.style.transform = `translate3d(${Math.round(me.cx - dims.w / 2)}px, ${Math.round(me.cy - dims.h / 2)}px, 0)`;

    // Pointer: how far from Sig, and close enough to count as hovering over him?
    const haveLook = !Number.isNaN(frame.lookX);
    const dxPx = haveLook ? frame.lookX - me.cx : 0;
    const dyPx = haveLook ? frame.lookY - me.cy : 0;
    const near = haveLook && Math.hypot(dxPx, dyPx) < dims.cube * 0.95;
    me.hover = s.reduced ? (near ? 1 : 0) : damp(me.hover, near ? 1 : 0, 10, dt);
    // Scrolling fast makes him wide-eyed; it fades when the page settles.
    const scrollSpeed = Math.abs(window.scrollY - me.scrollY) / Math.max(dt, 0.001);
    me.scrollY = window.scrollY;
    const wasFast = me.fast > 0.6;
    me.fast = damp(me.fast, scrollSpeed > 2600 ? 1 : 0, scrollSpeed > 2600 ? 12 : 3, dt);
    if (!wasFast && me.fast > 0.6) sigSay('Whoa, slow down. I get dizzy.', 'surprised', 2800);

    // A new poke starts a reaction; each poke plays a different one.
    if (frame.pokes !== me.pokes) {
      me.pokes = frame.pokes;
      me.pokeAt = clock.elapsedTime;
      me.pokeKind = frame.pokes % 4;
    }
    const pokeT = s.reduced ? 1 : (clock.elapsedTime - me.pokeAt) / 0.8;
    const poking = pokeT >= 0 && pokeT < 1;

    const base: Mood = s.say?.mood ?? (performance.now() - me.sleepAt > 0 && me.sleepAt > 0 ? 'sleepy' : 'idle');
    const mood: Mood = !s.say && me.fast > 0.6 ? 'surprised' : !s.say && me.hover > 0.5 ? 'happy' : base;
    if (s.say && s.say.id !== me.lastSay) {
      me.lastSay = s.say.id;
      me.squash = 1;
      me.sleepAt = performance.now() + 22000;
    }
    if (!s.say && me.sleepAt === 0) me.sleepAt = performance.now() + 22000;
    me.squash = s.reduced ? 0 : damp(me.squash, 0, 6, dt);
    const sq = Math.sin(me.squash * Math.PI) * 0.16;

    if (!s.reduced && t > me.blinkAt) {
      me.blinkEnd = t + 0.13;
      me.blinkAt = t + 2.4 + ((Math.sin(t * 12.9898) + 1) / 2) * 3;
    }
    const blinking = t < me.blinkEnd && (mood === 'idle' || mood === 'think');
    setFace(face, blinking ? BLINK : MOODS.indexOf(mood));

    // Look at the pointer from where he actually is, and slide the face across the cube.
    const lx = haveLook ? Math.max(-1, Math.min(1, dxPx / (vw * 0.45))) : 0;
    const ly = haveLook ? Math.max(-1, Math.min(1, dyPx / (vh * 0.45))) : 0;
    const follow = s.reduced ? 1 : 0.18;
    me.yaw = MathUtils.lerp(me.yaw, lx * 0.75, follow);
    me.pitch = MathUtils.lerp(me.pitch, ly * 0.45, follow);
    me.px = MathUtils.lerp(me.px, lx * 0.085, follow);
    me.py = MathUtils.lerp(me.py, -ly * 0.06, follow);

    const e = poking ? Math.sin(pokeT * Math.PI) : 0;
    const spin = poking && me.pokeKind === 1 ? pokeT * Math.PI * 2 : 0;
    const shake = poking && me.pokeKind === 2 ? Math.sin(pokeT * 40) * 0.25 * (1 - pokeT) : 0;
    const hop = poking && me.pokeKind === 0 ? e * 0.55 : poking ? e * 0.12 : 0;
    g.position.y = Math.sin(t * 1.7) * 0.05;
    if (lift.current) lift.current.position.y = hop + me.hover * 0.04;
    if (body.current) {
      body.current.rotation.y = me.yaw + spin;
      body.current.rotation.x = me.pitch - (mood === 'sleepy' ? 0.18 : 0) - me.fast * 0.25;
      body.current.rotation.z = shake + (mood === 'think' ? 0.12 : mood === 'sleepy' ? -0.08 : 0) + me.hover * Math.sin(t * 6) * 0.04;
      body.current.scale.set(1 + sq * 0.8, 1 - sq, 1 + sq * 0.8);
    }
    if (plate.current) plate.current.position.set(me.px, me.py, 0.51);
    const wave = mood === 'happy' || me.hover > 0.5 ? Math.sin(t * 9) * 0.25 : 0;
    const up = poking && me.pokeKind === 3 ? Math.sin(pokeT * Math.PI) * 0.7 : 0;
    if (handL.current) handL.current.position.set(-0.7, -0.12 + Math.sin(t * 1.9) * 0.06 + wave + up, 0.1);
    if (handR.current) handR.current.position.set(0.7, -0.12 + Math.sin(t * 1.9 + 1.6) * 0.06 - wave + up, 0.1);
    if (diamond.current) {
      diamond.current.rotation.y = t * 1.1;
      diamond.current.scale.setScalar(0.18 * (mood === 'think' ? 1.3 : 1));
    }

    // Publish his position for the speech bubble and the tap target.
    const root$ = document.documentElement.style;
    root$.setProperty('--sig-x', `${Math.round(me.cx)}px`);
    root$.setProperty('--sig-y', `${Math.round(me.cy)}px`);
    root$.setProperty('--sig-s', `${dims.cube}px`);
    const low = me.cy > vh * 0.5 ? '1' : '0';
    if (document.documentElement.dataset.sigLow !== low) document.documentElement.dataset.sigLow = low;
    void size;
  });

  return (
    <group ref={root}>
      <mesh geometry={geo.shadow} material={mats.shadow} position={[0, -0.95, 0]} rotation={[-Math.PI / 2.4, 0, 0]} />
      <group ref={lift}>
        <group ref={body}>
          <mesh geometry={geo.body} material={mats.blue} />
          <mesh ref={plate} position={[0, 0, 0.51]}>
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
    </group>
  );
}

/**
 * Sig lives in his own small, transparent canvas that floats above the whole page (above the sheets, the dock and
 * the 3D world), so he is always visible whichever layout is showing. The canvas follows his perch; the 3D world and
 * the flowing phone layout never have to know he exists. The canvas ignores pointer events: the tap target is a
 * real button in SigVoice.
 */
export default function SigCanvas() {
  const small = useWorld((s) => s.small);
  const dims = small ? SIZE.narrow : SIZE.wide;
  // Distance at which a 1-unit cube is `cube` px tall in a canvas `h` px tall, for a 30-degree field of view.
  const d = dims.h / (2 * Math.tan(Math.PI / 12) * dims.cube);
  return (
    <div id="sig-layer" className="pointer-events-none fixed left-0 top-0 z-[35]" style={{ width: dims.w, height: dims.h }} aria-hidden="true">
      <Canvas key={small ? 'n' : 'w'} dpr={[1, 2]} gl={{ alpha: true, antialias: true }} camera={{ fov: 30, near: 0.1, far: 50, position: [0, 0, d] }} style={{ background: 'transparent' }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[2, 3, 4]} intensity={1.5} />
        <SigScene narrow={small} />
      </Canvas>
    </div>
  );
}
