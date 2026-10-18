import { Component, Suspense, useEffect, useMemo, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MathUtils, PerspectiveCamera, Vector3 } from 'three';
import { destinations, inspectDest, type Dest } from './layout';
import { Environment } from './scene/Environment';
import { anim, palette } from './scene/common';
import { Conductor, HeroFrames, Stage } from './scene/Stage';
import { Sig } from './scene/Sig';
import { Systems, Terminus, Timeline } from './scene/Zones';
import { frame, world } from './store';
import { useWorldTextures } from './textures';

const lerp = MathUtils.lerp;
const damp = (a: number, b: number, lambda: number, dt: number) => lerp(a, b, 1 - Math.exp(-lambda * dt));

/**
 * The camera. It never jumps: every frame it moves a fraction of the way toward wherever it should be, and
 * "where it should be" is recomputed from the page each frame. That one rule is what makes the journey safe to
 * interrupt: a click, a fast scroll or a reversal just changes the target, and the camera turns toward the new
 * one from wherever it happens to be.
 *
 * The target is an interpolation between two authored destinations (from the scroll waypoints), and while a
 * project is being inspected it is blended toward the inspection viewpoint instead.
 */
function Rig() {
  const { camera, size, invalidate, scene } = useThree();
  const cur = useMemo(() => ({ pos: new Vector3(0, 1.5, 9), target: new Vector3(0, 1.1, 0), fov: 36, sx: 0, sy: 0, ready: false }), []);
  const tmp = useMemo(() => ({ a: new Vector3(), b: new Vector3(), look: new Vector3() }), []);

  // With reduced motion the loop runs on demand, so redraw when the page or the world changes.
  useEffect(() => {
    if (!world.get().reduced) return;
    const redraw = () => invalidate();
    window.addEventListener('scroll', redraw, { passive: true });
    const off = world.subscribe(redraw);
    return () => {
      window.removeEventListener('scroll', redraw);
      off();
    };
  }, [invalidate]);

  useFrame((_, rawDt) => {
    const cam = camera as PerspectiveCamera;
    const s = world.get();
    const dt = Math.min(rawDt, 0.05);
    const aspect = size.width / size.height;
    const dests: Dest[] = destinations(aspect, s.small);
    const a = dests[frame.from];
    const b = dests[frame.to];
    const k = frame.blend;
    const ins = inspectDest(aspect, s.small);
    const w = anim.inspect;
    const want = {
      pos: tmp.a.set(lerp(a.pos[0], b.pos[0], k), lerp(a.pos[1], b.pos[1], k), lerp(a.pos[2], b.pos[2], k)),
      target: tmp.b.set(lerp(a.target[0], b.target[0], k), lerp(a.target[1], b.target[1], k), lerp(a.target[2], b.target[2], k)),
      fov: lerp(a.fov, b.fov, k),
      sx: lerp(a.shift[0], b.shift[0], k),
      sy: lerp(a.shift[1], b.shift[1], k),
    };
    if (w > 0.001) {
      want.pos.set(lerp(want.pos.x, ins.pos[0], w), lerp(want.pos.y, ins.pos[1], w), lerp(want.pos.z, ins.pos[2], w));
      want.target.set(lerp(want.target.x, ins.target[0], w), lerp(want.target.y, ins.target[1], w), lerp(want.target.z, ins.target[2], w));
      want.fov = lerp(want.fov, ins.fov, w);
      want.sx = lerp(want.sx, ins.shift[0], w);
      want.sy = lerp(want.sy, ins.shift[1], w);
    }
    // Pointer parallax: a few centimetres of camera drift, applied to the position only so the subject stays framed.
    const par = s.reduced || s.small ? 0 : 1;
    want.pos.x += frame.pointerX * 0.35 * par;
    want.pos.y += -frame.pointerY * 0.18 * par;

    const snap = s.reduced || !cur.ready;
    const lam = 4.5;
    if (snap) {
      cur.pos.copy(want.pos);
      cur.target.copy(want.target);
      cur.fov = want.fov;
      cur.sx = want.sx;
      cur.sy = want.sy;
      cur.ready = true;
    } else {
      cur.pos.x = damp(cur.pos.x, want.pos.x, lam, dt);
      cur.pos.y = damp(cur.pos.y, want.pos.y, lam, dt);
      cur.pos.z = damp(cur.pos.z, want.pos.z, lam, dt);
      cur.target.x = damp(cur.target.x, want.target.x, lam, dt);
      cur.target.y = damp(cur.target.y, want.target.y, lam, dt);
      cur.target.z = damp(cur.target.z, want.target.z, lam, dt);
      cur.fov = damp(cur.fov, want.fov, lam, dt);
      cur.sx = damp(cur.sx, want.sx, lam, dt);
      cur.sy = damp(cur.sy, want.sy, lam, dt);
    }
    cam.position.copy(cur.pos);
    cam.lookAt(cur.target);
    // Fog is relative to how far the camera is from what it is looking at, so a phone (which stands further
    // back to fit the artifact) sees the subject as clearly as a desktop does, while far zones still dissolve.
    if (scene.fog && 'near' in scene.fog) {
      const d = cur.pos.distanceTo(cur.target);
      scene.fog.near = d * 0.85;
      scene.fog.far = d * 3.4;
    }
    const ox = -cur.sx * size.width;
    const oy = -cur.sy * size.height;
    if (Math.abs(cam.fov - cur.fov) > 0.01 || !cam.view || Math.abs(cam.view.offsetX - ox) > 0.5 || Math.abs(cam.view.offsetY - oy) > 0.5) {
      cam.fov = cur.fov;
      cam.setViewOffset(size.width, size.height, ox, oy, size.width, size.height);
      cam.updateProjectionMatrix();
    }
  }, -10);

  return null;
}

function Scene() {
  const textures = useWorldTextures();
  const small = world.get().small;
  useEffect(() => {
    world.set({ status: 'ready' });
  }, []);
  return (
    <>
      <Conductor />
      <Rig />
      <Environment small={small} />
      <HeroFrames />
      <Stage textures={textures} />
      <Systems textures={textures} />
      <Timeline />
      <Terminus />
      <Sig />
    </>
  );
}

class WorldBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    world.set({ status: 'failed' });
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function World({ small, reduced }: { small: boolean; reduced: boolean }) {
  const pal = useMemo(() => palette(), []);
  return (
    <WorldBoundary>
      <Canvas
        dpr={[1, small ? 1.4 : 1.75]}
        frameloop={reduced ? 'demand' : 'always'}
        gl={{ antialias: !small, powerPreference: 'high-performance' }}
        camera={{ fov: 36, near: 0.1, far: 140, position: [0, 1.5, 9] }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            world.set({ status: 'failed' });
          });
        }}
        style={{ touchAction: 'pan-y' }}
      >
        <color attach="background" args={[pal.canvas]} />
        <fog attach="fog" args={[pal.canvas, 12, 40]} />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </WorldBoundary>
  );
}
