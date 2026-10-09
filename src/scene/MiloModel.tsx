import { useEffect, useLayoutEffect, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { Box3, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MiloAnimator } from './MiloAnimator';
import { attachCollar, recolorMilo } from './miloPalette';

/**
 * Milo: the rigged "Shiba Inu" by Quaternius (CC0, see public/models/LICENSE.txt).
 *
 * This component loads the model, recolours it to Milo's palette, adds his
 * collar and tag, and hands a ready MiloAnimator to the scene. To use a
 * different rigged dog, change MODEL_URL and the bone and clip names in
 * MiloAnimator; nothing else needs to know how the model is built.
 */

const MODEL_URL = `${import.meta.env.BASE_URL}models/shiba-inu.glb`;
/** Nose-to-tail length the model is scaled to, in world units. */
const TARGET_LENGTH = 1.6;

interface Props {
  onReady: (animator: MiloAnimator) => void;
}

export function MiloModel({ onReady }: Props) {
  const gltf = useLoader(GLTFLoader, MODEL_URL);

  const { model, scale, lift } = useMemo(() => {
    const scene = gltf.scene;
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const s = TARGET_LENGTH / Math.max(size.x, size.z);
    return { model: scene, scale: s, lift: -box.min.y * s };
  }, [gltf]);

  useLayoutEffect(() => {
    recolorMilo(model);
    const animator = new MiloAnimator(model, gltf.animations);
    const detachCollar = animator.neckBone ? attachCollar(animator.neckBone) : undefined;
    onReady(animator);
    return () => {
      detachCollar?.();
      animator.dispose();
    };
  }, [model, gltf.animations, onReady]);

  useEffect(
    () => () => {
      model.traverse((o) => {
        if (o instanceof Mesh) {
          o.geometry.dispose();
          (o.material as MeshStandardMaterial).dispose();
        }
      });
    },
    [model],
  );

  return (
    <group scale={scale} position={[0, lift, 0]}>
      <primitive object={model} />
    </group>
  );
}
