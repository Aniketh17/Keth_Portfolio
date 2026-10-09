/**
 * Offline sprite stage: renders the exact same Shiba, palette, collar and animator the live scene uses, one pose at
 * a time, on a transparent canvas. Driven by scripts/sprites/render.mjs. Not part of the site bundle.
 */
import {
  ACESFilmicToneMapping,
  Box3,
  DirectionalLight,
  Group,
  HemisphereLight,
  Object3D,
  PerspectiveCamera,
  PointLight,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GALLOP_REF_SPEED, MiloAnimator, WALK_REF_SPEED, type ClipName } from '../../src/scene/MiloAnimator';
import { attachCollar, recolorMilo } from '../../src/scene/miloPalette';

const SIZE = 288;
const renderer = new WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(SIZE, SIZE);
renderer.setClearColor(0x000000, 0);
renderer.toneMapping = ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

const scene = new Scene();
scene.add(new HemisphereLight('#B7B3EE', '#111426', 0.9));
const key = new DirectionalLight('#F6F0E6', 2.4);
key.position.set(2.5, 5, 5);
scene.add(key);
const rim = new PointLight('#7568FF', 6, 12, 2);
rim.position.set(-3, 1.8, -2);
scene.add(rim);

// Three-quarter view: Milo faces screen-right and turns a little toward the camera.
const camera = new PerspectiveCamera(20, 1, 0.1, 50);
camera.position.set(0, 1.3, 7.2);
camera.lookAt(0, 0.62, 0);

const root = new Group();
root.rotation.y = Math.PI / 2 - 0.5;
scene.add(root);

type State = 'idle' | 'walk' | 'run' | 'sit' | 'happy';
interface StateDef {
  speed: number;
  sit: boolean;
  pet: boolean;
  excite: number;
  /** Play the hop clip (the "happy" state). */
  hop?: boolean;
  /** Seconds one loop of the sprite strip lasts in the source animation. */
  period: number;
}

const gltf = await new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}models/shiba-inu.glb`);
const model: Object3D = gltf.scene;
recolorMilo(model);
const box = new Box3().setFromObject(model);
const size = box.getSize(new Vector3());
const scale = 1.6 / Math.max(size.x, size.z);
const holder = new Group();
holder.scale.setScalar(scale);
holder.position.y = -box.min.y * scale;
holder.add(model);
root.add(holder);
const animator = new MiloAnimator(model, gltf.animations);
const neck = animator.neckBone;
if (neck) attachCollar(neck);

const clip = (name: ClipName) => animator.clipDuration(name);
const DEFS: Record<State, StateDef> = {
  idle: { speed: 0, sit: false, pet: false, excite: 0.12, period: clip('Idle') },
  walk: { speed: WALK_REF_SPEED, sit: false, pet: false, excite: 0.25, period: clip('Walk') },
  run: { speed: GALLOP_REF_SPEED, sit: false, pet: false, excite: 0.25, period: clip('Gallop') },
  sit: { speed: 0, sit: true, pet: false, excite: 0.85, period: 0.683 },
  happy: { speed: 0, sit: false, pet: true, excite: 1, period: 1.1, hop: true },
};

let hops = 0;

function pose(state: State, frame: number, frames: number): void {
  const d = DEFS[state];
  const base = { sniff: false, lookDir: null, lookAmount: 0, reactCount: 0, frame: root };
  // First call converges the blend weights to this state, then time is frozen at the exact frame.
  animator.update({ ...base, dt: 10, time: 0, speed: d.speed, sit: d.sit, pet: d.pet, excite: d.excite });
  const t = (frame / frames) * d.period;
  const input = { ...base, time: t, speed: d.speed, sit: d.sit, pet: d.pet, excite: d.excite };
  if (d.hop) {
    // The hop is a one-shot: trigger it, then advance exactly t seconds into it.
    animator.update({ ...input, dt: 1e-4, reactCount: ++hops });
    animator.update({ ...input, dt: Math.max(t, 1e-4), reactCount: hops });
    return;
  }
  animator.setTime(t);
  animator.update({ ...input, dt: 1e-4 });
}

const api = window as unknown as { capture: (s: State, f: number, n: number) => string; ready: boolean };
api.capture = (s, f, n) => {
  pose(s, f, n);
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL('image/png');
};
api.ready = true;
