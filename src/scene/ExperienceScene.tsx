import { Component, Suspense, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import {
  AdditiveBlending,
  DirectionalLight,
  CanvasTexture,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PointLight,
  RingGeometry,
  Shape,
  Vector3,
  type PerspectiveCamera,
} from 'three';
import { frame, landingT, nearestLanding, petMilo, ui } from '../lib/journey';
import { MiloAnimator } from './MiloAnimator';
import { MiloModel } from './MiloModel';
import { BED_LIFT, PALETTE, World, landingFocus, orbPosition, type OrbHandles } from './SpiralStaircase';
import { R_PATH, U_END, U_START, D_PHI, heightAt, phiAt, tToU } from './geometry';

/** Walkable length of the staircase in world units, used to turn progress into real speed. */
const PATH_LENGTH = (U_END - U_START) * R_PATH * D_PHI;
const MAX_SPEED = 14;
const FOLLOW_GAIN = 3;
const ACCEL = 16;
const DECEL = 22;
/** How far round the staircase, ahead of Milo, the camera sits, so we see him three-quarter on. */
const CAMERA_PHI_LEAD = 0.5;

const damp = (a: number, b: number, lambda: number, dt: number): number => MathUtils.lerp(a, b, 1 - Math.exp(-lambda * dt));

const approach = (value: number, target: number, step: number): number =>
  value < target ? Math.min(target, value + step) : Math.max(target, value - step);

const shortestAngle = (from: number, to: number): number => MathUtils.euclideanModulo(to - from + Math.PI, Math.PI * 2) - Math.PI;

const HEART_COUNT = 6;
const HEART_LIFETIME = 1.5;

function makeHeartGeometry() {
  const s = new Shape();
  s.moveTo(0.25, 0.25);
  s.bezierCurveTo(0.25, 0.25, 0.2, 0, 0, 0);
  s.bezierCurveTo(-0.3, 0, -0.3, 0.35, -0.3, 0.35);
  s.bezierCurveTo(-0.3, 0.55, -0.1, 0.77, 0.25, 0.95);
  s.bezierCurveTo(0.6, 0.77, 0.8, 0.55, 0.8, 0.35);
  s.bezierCurveTo(0.8, 0.35, 0.8, 0, 0.5, 0);
  s.bezierCurveTo(0.35, 0, 0.25, 0.25, 0.25, 0.25);
  const g = new ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false });
  g.translate(-0.25, -0.45, -0.06);
  g.scale(0.2, 0.2, 0.2);
  return g;
}

/** A small pool of hearts that float up from Milo's head when he is petted. Reused, never reallocated. */
function useHearts() {
  const hearts = useMemo(() => {
    const geo = makeHeartGeometry();
    const meshes = Array.from({ length: HEART_COUNT }, () => {
      const mat = new MeshBasicMaterial({ color: PALETTE.peach, transparent: true, depthWrite: false });
      const m = new Mesh(geo, mat);
      m.visible = false;
      return m;
    });
    return { geo, meshes, birth: new Array<number>(HEART_COUNT).fill(-1), drift: new Array<number>(HEART_COUNT).fill(0), next: 0 };
  }, []);
  useEffect(
    () => () => {
      hearts.geo.dispose();
      hearts.meshes.forEach((m) => (m.material as MeshBasicMaterial).dispose());
    },
    [hearts],
  );
  return hearts;
}

/** Soft round contact shadow under Milo, drawn once to a small canvas. */
function ContactShadow() {
  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(0,0,0,0.6)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return new CanvasTexture(c);
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} scale={[1.2, 1.8, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}

/** A soft ring on the floor around Milo: the in-world cue that he can be petted. Brightens on hover. */
function PetRing() {
  const ring = useRef<Mesh>(null);
  const geo = useMemo(() => new RingGeometry(0.78, 0.84, 64), []);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame(({ clock }) => {
    const m = ring.current;
    if (!m) return;
    const moving = ui.get().miloMoving;
    const pulse = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 2.2);
    const mat = m.material as MeshBasicMaterial;
    const target = moving ? 0 : frame.hoverMilo ? 0.95 : 0.3 + pulse * 0.25;
    mat.opacity = MathUtils.lerp(mat.opacity, target, 0.15);
    m.scale.setScalar(1 + pulse * 0.06 + (frame.hoverMilo ? 0.08 : 0));
  });
  return (
    <mesh ref={ring} geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
      <meshBasicMaterial color={PALETTE.peach} transparent opacity={0} depthWrite={false} blending={AdditiveBlending} />
    </mesh>
  );
}

/** If the model fails to load, the stairs and the page carry on without him. */
class ModelBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * The single place that moves things. Each frame, in order:
 *   1. Progress: follow the scroll target (or the Fetch the Proof override).
 *   2. Velocity: speed follows how far behind Milo is plus how fast the target
 *      itself is moving, so cadence tracks scroll speed.
 *   3. Placement: Milo's position and heading are computed from progress.
 *   4. Content state: what he does when he stops depends on the landing.
 *   5. Pose: the animator receives intent and writes his bones.
 *   6. Camera and lights follow Milo.
 * Nothing else writes these values.
 */
function Choreographer({ stacked, reducedMotion }: { stacked: boolean; reducedMotion: boolean }) {
  const { camera, size, invalidate } = useThree();
  const rootRef = useRef<Group>(null);
  const orbs = useRef<OrbHandles>({});
  const keyLight = useRef<DirectionalLight>(null);
  const rimLight = useRef<PointLight>(null);
  const animator = useRef<MiloAnimator | null>(null);
  const onModelReady = useCallback((a: MiloAnimator) => {
    animator.current = a;
  }, []);

  const sim = useRef({
    t: frame.override?.t ?? frame.targetT,
    speed: 0,
    prevTarget: frame.targetT,
    scrollRate: 0,
    facing: 1,
    yaw: 0,
    camPhi: 0,
    camY: 0,
    ready: false,
    stoppedFor: 0,
    phaseTimer: 0,
    reactCount: 0,
    seat: 0,
    sx: -1,
    sy: -1,
    seenPets: frame.petCount,
  });

  const v = useMemo(() => ({ look: new Vector3(), head: new Vector3(), cam: new Vector3(), tmp: new Vector3() }), []);
  const keyTarget = useMemo(() => new Object3D(), []);
  const hearts = useHearts();
  const beam = useRef<Mesh>(null);

  // Frame Milo to one side of the screen on wide layouts, near the bottom-right of the strip on narrow ones.
  useEffect(() => {
    const cam = camera as PerspectiveCamera;
    cam.fov = stacked ? 46 : 38;
    const offsetX = stacked ? -0.12 : -0.2;
    const offsetY = stacked ? -0.04 : 0;
    cam.setViewOffset(size.width, size.height, size.width * offsetX, size.height * offsetY, size.width, size.height);
    cam.updateProjectionMatrix();
    invalidate();
    return () => cam.clearViewOffset();
  }, [camera, size.width, size.height, stacked, invalidate]);

  // With reduced motion the loop only runs on demand, so redraw when the page scrolls.
  useEffect(() => {
    if (!reducedMotion) return;
    const redraw = () => invalidate();
    window.addEventListener('scroll', redraw, { passive: true });
    const unsub = ui.subscribe(redraw);
    return () => {
      window.removeEventListener('scroll', redraw);
      unsub();
    };
  }, [reducedMotion, invalidate]);

  useFrame((state, delta) => {
    const root = rootRef.current;
    if (!root) return;
    const s = sim.current;
    const snap = reducedMotion;
    // Floor dt: the first frame reports a delta of 0, which would turn the scroll-rate division into NaN.
    const dt = snap ? 1 / 60 : MathUtils.clamp(delta, 1 / 240, 0.05);
    const uiState = ui.get();
    const override = frame.override;

    // 1 + 2. Progress and velocity.
    const target = override ? override.t : frame.targetT;
    if (snap) {
      s.t = target;
      s.speed = 0;
    } else {
      const scrollRate = (frame.targetT - s.prevTarget) / dt;
      s.prevTarget = frame.targetT;
      s.scrollRate = damp(s.scrollRate, scrollRate, 10, dt);
      const feedForward = override ? 0 : s.scrollRate * PATH_LENGTH * 0.6;
      const err = (target - s.t) * PATH_LENGTH;
      const desired = MathUtils.clamp(err * FOLLOW_GAIN + feedForward, -MAX_SPEED, MAX_SPEED);
      s.speed = approach(s.speed, desired, (Math.abs(desired) > Math.abs(s.speed) ? ACCEL : DECEL) * dt);
      s.t = MathUtils.clamp(s.t + (s.speed * dt) / PATH_LENGTH, 0, 1);
      if (Math.abs(err) < 0.03 && Math.abs(s.speed) < 0.15) {
        s.t = target;
        s.speed = 0;
      }
    }
    const speed = Math.abs(s.speed);
    if (s.speed > 0.35) s.facing = 1;
    else if (s.speed < -0.35) s.facing = -1;

    // 3. Placement along the helix.
    const u = tToU(s.t);
    const phi = phiAt(u);
    const y = heightAt(u);
    root.position.set(Math.sin(phi) * R_PATH, y, Math.cos(phi) * R_PATH);

    // 4. Content state: what Milo is doing, given where he is and what the visitor chose.
    const moving = speed > 0.25;
    // With reduced motion there is no waiting: he takes his resting pose straight away.
    s.stoppedFor = snap ? 100 : moving ? 0 : s.stoppedFor + dt;
    const landing = nearestLanding(s.t);
    const atLanding = Math.abs(s.t - landingT(landing)) < 0.03;
    let sit = false;
    let sniff = false;
    let excite = moving ? 0.25 : 0.1;
    let focus: [number, number, number] | null = null;
    let faceOrb = false;
    const now = performance.now();
    const petting = now - frame.lastPet < 2400;

    if (override) {
      const orb = orbPosition(override.routeId);
      focus = orb;
      if (uiState.fetchPhase === 'travel') {
        s.phaseTimer += dt;
        if (!moving && Math.abs(s.t - override.t) < 0.01) {
          ui.set({ fetchPhase: 'react' });
          s.phaseTimer = 0;
          s.reactCount += 1;
        } else if (s.phaseTimer > 8) {
          ui.set({ fetchPhase: 'arrived' });
        }
      } else if (uiState.fetchPhase === 'react') {
        s.phaseTimer += dt;
        faceOrb = true;
        excite = 1;
        if (s.phaseTimer > 1.8) ui.set({ fetchPhase: 'arrived' });
      } else {
        faceOrb = true;
        excite = 1;
      }
    } else if (!moving && atLanding) {
      sniff = (landing === 1 || landing === 2) && s.stoppedFor > 1 && s.stoppedFor < 3.2;
      sit = landing === 4 && s.stoppedFor > 0.6;
      excite = landing === 4 ? 0.85 : 0.12;
      if (landing >= 1 && s.stoppedFor > 0.4 && s.stoppedFor < (landing === 4 ? 6 : 4.5)) focus = landingFocus(landing);
    }

    if (frame.hoverMilo && !moving) excite = Math.max(excite, 0.6);
    if (petting && !faceOrb) {
      excite = 1;
      focus = null;
    }

    // Heading: along the stairs in the direction of travel, or toward the proof object once he is there.
    let yawTarget = phi + (s.facing > 0 ? Math.PI / 2 : -Math.PI / 2);
    if (faceOrb && override) {
      const orb = orbPosition(override.routeId);
      yawTarget = Math.atan2(orb[0] - root.position.x, orb[2] - root.position.z);
    }
    s.yaw = snap ? yawTarget : s.yaw + shortestAngle(s.yaw, yawTarget) * (1 - Math.exp(-9 * dt));
    root.rotation.y = s.yaw;
    // On the bed at the last landing he stands a little higher, on the cushion.
    const onBed = landing === 4 && atLanding && sit;
    s.seat = snap ? (onBed ? BED_LIFT : 0) : damp(s.seat, onBed ? BED_LIFT : 0, 5, dt);
    root.position.y += s.seat;
    root.updateMatrixWorld(true);

    // Gaze: the focus object if there is one, otherwise the visitor (the camera), with a little cursor drift.
    const dog = animator.current;
    if (dog) dog.headWorldPosition(v.head);
    else v.head.set(root.position.x, root.position.y + 0.7, root.position.z);
    root.worldToLocal(v.head);
    let lookAmount = 0;
    if (!moving || faceOrb) {
      if (focus) v.look.set(focus[0], focus[1], focus[2]);
      else v.look.copy(camera.position);
      root.worldToLocal(v.look).sub(v.head);
      if (!focus) {
        v.look.x += frame.pointerX * v.look.length() * 0.25;
        v.look.y -= frame.pointerY * v.look.length() * 0.2;
      }
      lookAmount = 1;
    }

    // 5. Pose.
    dog?.update({
      dt: snap ? 10 : dt,
      time: snap ? 0 : state.clock.elapsedTime,
      speed: snap ? 0 : speed,
      sniff,
      sit,
      pet: petting,
      excite,
      lookDir: lookAmount ? v.look : null,
      lookAmount,
      reactCount: s.reactCount,
      frame: root,
    });

    // Hearts: spawn on a new pet, then rise, sway and fade. Billboarded to the camera.
    if (frame.petCount !== s.seenPets) {
      s.seenPets = frame.petCount;
      const clock = state.clock.elapsedTime;
      for (let n = 0; n < 3; n++) {
        const i = hearts.next;
        hearts.next = (hearts.next + 1) % HEART_COUNT;
        hearts.birth[i] = clock + n * 0.18;
        hearts.drift[i] = (n - 1) * 0.28 + (Math.random() - 0.5) * 0.1;
      }
    }
    hearts.meshes.forEach((m, i) => {
      const age = state.clock.elapsedTime - hearts.birth[i];
      if (hearts.birth[i] < 0 || age < 0 || age > HEART_LIFETIME) {
        m.visible = false;
        return;
      }
      const k = age / HEART_LIFETIME;
      m.visible = true;
      if (dog) dog.headWorldPosition(v.tmp);
      else v.tmp.copy(root.position);
      v.tmp.y += 0.5;
      m.position.set(v.tmp.x + hearts.drift[i] + Math.sin(age * 4 + i) * 0.05, v.tmp.y + k * 1.1, v.tmp.z);
      m.quaternion.copy(camera.quaternion);
      m.scale.setScalar(Math.min(1, age * 6) * (1 - k * 0.25));
      (m.material as MeshBasicMaterial).opacity = 1 - k * k;
    });
    if (beam.current) beam.current.position.set(root.position.x, y + 3, root.position.z);

    ui.set({ miloMoving: moving });

    // 6. Camera and lights.
    const cam = camera as PerspectiveCamera;
    const radius = stacked ? 8.4 : 9.6;
    const camPhiTarget = phi + CAMERA_PHI_LEAD;
    const camYTarget = y + (stacked ? 2 : 2.5);
    if (!s.ready || snap) {
      s.camPhi = camPhiTarget;
      s.camY = camYTarget;
      s.ready = true;
    } else {
      s.camPhi = damp(s.camPhi, camPhiTarget, 5, dt);
      s.camY = damp(s.camY, camYTarget, 5, dt);
    }
    cam.position.set(Math.sin(s.camPhi) * radius, s.camY, Math.cos(s.camPhi) * radius);
    cam.lookAt(root.position.x * 0.8, y - 0.1, root.position.z * 0.8);
    cam.updateMatrixWorld();

    // Publish Milo's head position in screen pixels so HTML (the pet prompt, his speech bubble) can sit on him.
    if (dog) dog.headWorldPosition(v.tmp);
    else v.tmp.copy(root.position).setY(root.position.y + 0.8);
    v.tmp.project(cam);
    const sx = Math.round((v.tmp.x * 0.5 + 0.5) * size.width);
    const sy = Math.round((-v.tmp.y * 0.5 + 0.5) * size.height);
    if (sx !== s.sx || sy !== s.sy) {
      s.sx = sx;
      s.sy = sy;
      const rootStyle = document.documentElement.style;
      rootStyle.setProperty('--milo-x', `${sx}px`);
      rootStyle.setProperty('--milo-y', `${sy}px`);
    }

    if (keyLight.current) {
      keyLight.current.position.set(cam.position.x + 1.5, cam.position.y + 4, cam.position.z + 1.5);
      keyTarget.position.copy(root.position);
      keyTarget.updateMatrixWorld();
    }
    if (rimLight.current) {
      v.cam.copy(root.position).sub(cam.position).setY(0).normalize();
      rimLight.current.position.copy(root.position).addScaledVector(v.cam, 2.2).add(v.tmp.set(0, 1.4, 0));
    }
  });

  return (
    <>
      <hemisphereLight args={['#B7B3EE', PALETTE.night, 0.7]} />
      <directionalLight ref={keyLight} target={keyTarget} color={PALETTE.ivory} intensity={2.1} />
      <primitive object={keyTarget} />
      <pointLight ref={rimLight} color={PALETTE.violet} intensity={5} distance={9} decay={2} />
      <group
        ref={rootRef}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          petMilo();
        }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
          frame.hoverMilo = true;
        }}
        onPointerOut={() => {
          document.body.style.cursor = '';
          frame.hoverMilo = false;
        }}
      >
        <ContactShadow />
        <PetRing />
        <ModelBoundary>
          <Suspense fallback={null}>
            <MiloModel onReady={onModelReady} />
          </Suspense>
        </ModelBoundary>
      </group>
      {hearts.meshes.map((m) => (
        <primitive key={m.uuid} object={m} />
      ))}
      <mesh ref={beam}>
        <coneGeometry args={[1.5, 6, 28, 1, true]} />
        <meshBasicMaterial color={PALETTE.ivory} transparent opacity={0.045} depthWrite={false} blending={AdditiveBlending} side={DoubleSide} />
      </mesh>
      <World lowPower={stacked} orbs={orbs} />
    </>
  );
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    ui.set({ scene: 'failed' });
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function ExperienceScene({ stacked, reducedMotion }: { stacked: boolean; reducedMotion: boolean }) {
  return (
    <SceneBoundary>
      <Canvas
        dpr={[1, stacked ? 1.25 : 1.5]}
        frameloop={reducedMotion ? 'demand' : 'always'}
        gl={{ antialias: !stacked, powerPreference: 'high-performance' }}
        camera={{ fov: 38, near: 0.1, far: 80, position: [0, 2, 8] }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            ui.set({ scene: 'failed' });
          });
          ui.set({ scene: 'ready' });
        }}
        style={{ touchAction: 'pan-y' }}
      >
        <color attach="background" args={[PALETTE.night]} />
        <fog attach="fog" args={[PALETTE.night, 10, 28]} />
        <Choreographer stacked={stacked} reducedMotion={reducedMotion} />
      </Canvas>
    </SceneBoundary>
  );
}
