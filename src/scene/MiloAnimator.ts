import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Euler,
  LoopOnce,
  MathUtils,
  Object3D,
  Quaternion,
  Vector3,
  type Mesh,
} from 'three';

/**
 * Pose driver for Milo. This is the only code that animates him.
 *
 * Two layers, in a fixed order every frame:
 *  1. The rigged clips (Idle, Walk, Gallop, head-low, jump) are blended by
 *     weights that are damped toward their targets, so walk to run, moving to
 *     standing and so on all cross-fade. Walk and gallop playback speed follows
 *     the real speed along the stairs, so the feet keep pace with the ground.
 *  2. A few small procedural offsets are applied on top of the finished clip
 *     pose: where the head looks, the tail wag, and the happy head tilt when
 *     he is petted. They rotate bones in the dog's own frame of reference, so
 *     they work whatever the clip is doing.
 */

export interface AnimatorInput {
  dt: number;
  time: number;
  /** Absolute world speed along the stairs, units per second. */
  speed: number;
  sniff: boolean;
  /** Sit down (used on the bed). The rig has no sit clip, so this is a procedural pose on top of Idle. */
  sit: boolean;
  /** Being petted: head tilted up into the hand, fast wag. */
  pet: boolean;
  /** 0..1, drives tail wag energy. */
  excite: number;
  /** Direction to look at, in the dog's local space; null looks straight ahead. */
  lookDir: Vector3 | null;
  /** 0..1 how strongly the head follows lookDir. */
  lookAmount: number;
  /** Increment to play the "discovery" hop. */
  reactCount: number;
  /** The dog's own frame of reference (position and heading); bones are rotated relative to this. */
  frame: Object3D;
}

const damp = (current: number, target: number, lambda: number, dt: number): number =>
  MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));

const smooth01 = (x: number): number => {
  const c = MathUtils.clamp(x, 0, 1);
  return c * c * (3 - 2 * c);
};

/** Ground speed (world units / s) at which each clip plays at its authored rate. Tuned by eye against foot sliding. */
export const WALK_REF_SPEED = 1.3;
export const GALLOP_REF_SPEED = 4.6;

export const CLIPS = ['Idle', 'Idle_2_HeadLow', 'Walk', 'Gallop', 'Jump_ToIdle'] as const;
export type ClipName = (typeof CLIPS)[number];

/** Sit pose, as pitches about the dog's x axis (negative lifts the front). Tuned by eye. */
const SIT = { bodyPitch: -0.5, frontCounter: 0.5, thigh: -1.0, shin: 1.8, drop: 0.28 };

const q = new Quaternion();
const qParent = new Quaternion();
const qFrame = new Quaternion();
const qDelta = new Quaternion();
const euler = new Euler(0, 0, 0, 'YXZ');

export class MiloAnimator {
  private readonly mixer: AnimationMixer;
  private readonly actions = {} as Record<ClipName, AnimationAction>;
  private readonly head: Object3D | undefined;
  private readonly neck: Object3D | undefined;
  private readonly tail: Object3D | undefined;
  private moveW = 0;
  private runW = 0;
  private headLowW = 0;
  private petW = 0;
  private sitW = 0;
  private readonly sitBones: Record<string, Object3D | undefined>;
  private excite = 0;
  private lookYaw = 0;
  private lookPitch = 0;
  private reactTime = Infinity;
  private lastReactCount = 0;
  collar?: Mesh;

  constructor(
    private readonly model: Object3D,
    clips: AnimationClip[],
  ) {
    this.mixer = new AnimationMixer(model);
    for (const name of CLIPS) {
      const clip = AnimationClip.findByName(clips, name);
      if (!clip) continue;
      const action = this.mixer.clipAction(clip);
      if (name === 'Jump_ToIdle') {
        action.setLoop(LoopOnce, 1);
        action.clampWhenFinished = true;
      }
      action.setEffectiveWeight(name === 'Idle' ? 1 : 0);
      action.play();
      this.actions[name] = action;
    }
    this.head = model.getObjectByName('Head');
    this.neck = model.getObjectByName('Neck2');
    this.tail = model.getObjectByName('Tail1');
    this.sitBones = Object.fromEntries(
      ['Body', 'FrontShoulder.L', 'FrontShoulder.R', 'BackUpperLeg.L', 'BackUpperLeg.R', 'BackLowerLeg.L', 'BackLowerLeg.R'].map((n) => [n, model.getObjectByName(n)]),
    );
  }

  /** Jump the clips to an exact time. Used by the offline sprite renderer, never by the live scene. */
  setTime(seconds: number): void {
    this.mixer.setTime(seconds);
  }

  clipDuration(name: ClipName): number {
    return this.actions[name]?.getClip().duration ?? 1;
  }

  get neckBone(): Object3D | undefined {
    return this.neck;
  }

  headWorldPosition(out: Vector3): Vector3 {
    return (this.head ?? this.model).getWorldPosition(out);
  }

  /**
   * Rotate `bone` by a yaw/pitch/roll expressed in the dog's frame, regardless of how the bone is oriented.
   * parent-space delta = parent^-1 * (frame * delta * frame^-1) * parent
   */
  private rotateInFrame(bone: Object3D, frame: Object3D, yaw: number, pitch: number, roll: number): void {
    if (!bone.parent) return;
    euler.set(pitch, yaw, roll, 'YXZ');
    qDelta.setFromEuler(euler);
    frame.getWorldQuaternion(qFrame);
    bone.parent.getWorldQuaternion(qParent);
    q.copy(qFrame).multiply(qDelta).multiply(qFrame.invert()); // world-space delta
    qDelta.copy(qParent).invert().multiply(q).multiply(qParent); // into parent space
    bone.quaternion.premultiply(qDelta);
  }

  /** Sit: pitch the body back on the haunches, keep the front legs upright, fold the hind legs. */
  private applySit(frame: Object3D): void {
    const w = this.sitW;
    if (w < 0.002) {
      this.model.position.y = 0;
      return;
    }
    const b = this.sitBones;
    const rot = (name: string, pitch: number) => {
      const bone = b[name];
      if (bone) this.rotateInFrame(bone, frame, 0, pitch * w, 0);
      this.model.updateMatrixWorld(true);
    };
    rot('Body', SIT.bodyPitch);
    rot('FrontShoulder.L', SIT.frontCounter);
    rot('FrontShoulder.R', SIT.frontCounter);
    rot('BackUpperLeg.L', SIT.thigh);
    rot('BackUpperLeg.R', SIT.thigh);
    rot('BackLowerLeg.L', SIT.shin);
    rot('BackLowerLeg.R', SIT.shin);
    this.model.position.y = -SIT.drop * w;
  }

  update(i: AnimatorInput): void {
    const { dt, time, frame } = i;

    const moving = i.speed > 0.2;
    this.moveW = damp(this.moveW, moving ? 1 : 0, 7, dt);
    this.runW = damp(this.runW, smooth01((i.speed - 2.6) / 2.2), 4, dt);
    this.headLowW = damp(this.headLowW, i.sniff && !moving ? 1 : 0, 5, dt);
    this.petW = damp(this.petW, i.pet ? 1 : 0, 9, dt);
    this.sitW = damp(this.sitW, i.sit && !moving ? 1 : 0, 3, dt);
    this.excite = damp(this.excite, i.excite, 4, dt);

    if (i.reactCount !== this.lastReactCount) {
      this.lastReactCount = i.reactCount;
      this.reactTime = 0;
      this.actions.Jump_ToIdle?.reset().play();
    }
    this.reactTime += dt;
    const jumpW = this.reactTime < 1.1 ? Math.sqrt(Math.sin((Math.PI * this.reactTime) / 1.1)) : 0;

    // Clip weights always sum to 1; the jump takes its share from the rest.
    const still = 1 - this.moveW;
    const headLow = Math.max(this.headLowW, this.petW * 0.55);
    const w: Record<ClipName, number> = {
      Idle: still * (1 - headLow),
      Idle_2_HeadLow: still * headLow,
      Walk: this.moveW * (1 - this.runW),
      Gallop: this.moveW * this.runW,
      Jump_ToIdle: jumpW,
    };
    for (const name of CLIPS) {
      const action = this.actions[name];
      if (!action) continue;
      action.setEffectiveWeight(name === 'Jump_ToIdle' ? jumpW : w[name] * (1 - jumpW));
    }
    this.actions.Walk?.setEffectiveTimeScale(MathUtils.clamp(i.speed / WALK_REF_SPEED, 0.5, 2.2));
    this.actions.Gallop?.setEffectiveTimeScale(MathUtils.clamp(i.speed / GALLOP_REF_SPEED, 0.7, 2.4));

    this.mixer.update(dt);
    this.model.updateMatrixWorld(true);
    this.applySit(frame);

    // Layer 2: gaze, wag and happy tilt on top of the clip pose.
    let yawT = 0;
    let pitchT = 0;
    if (i.lookDir && i.lookAmount > 0) {
      yawT = MathUtils.clamp(Math.atan2(i.lookDir.x, i.lookDir.z), -0.9, 0.9) * i.lookAmount;
      const flat = Math.hypot(i.lookDir.x, i.lookDir.z);
      pitchT = MathUtils.clamp(Math.atan2(i.lookDir.y, flat), -0.45, 0.45) * i.lookAmount;
    }
    this.lookYaw = damp(this.lookYaw, yawT, 6, dt);
    this.lookPitch = damp(this.lookPitch, pitchT, 6, dt);

    // Positive pitch about the frame's x axis tips the nose down, so looking up is negative.
    const tilt = this.petW * (0.16 + Math.sin(time * 6) * 0.03);
    const lookUp = -this.lookPitch - 0.18 * this.petW + 0.4 * this.sitW;
    if (this.neck) this.rotateInFrame(this.neck, frame, this.lookYaw * 0.45, lookUp * 0.45, tilt * 0.5);
    this.model.updateMatrixWorld(true);
    if (this.head) this.rotateInFrame(this.head, frame, this.lookYaw * 0.55, lookUp * 0.55, tilt);

    if (this.tail) {
      const wagAmp = 0.12 + 0.5 * this.excite;
      const wagFreq = 2.4 + 8 * this.excite;
      this.rotateInFrame(this.tail, frame, Math.sin(time * wagFreq) * wagAmp, 0, 0);
    }
  }

  dispose(): void {
    this.mixer.stopAllAction();
    this.mixer.uncacheRoot(this.model);
  }
}
