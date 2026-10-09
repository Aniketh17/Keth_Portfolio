import { Color, Mesh, MeshStandardMaterial, Object3D, TorusGeometry, Vector3 } from 'three';

/** Milo's colours, keyed by the material names in the Quaternius Shiba model. Shared by the live scene and the sprite renderer. */
const PALETTE: Record<string, { color: string; roughness: number }> = {
  Main: { color: '#D9772F', roughness: 0.9 },
  Main_Light: { color: '#F6EAD3', roughness: 0.92 },
  Black: { color: '#2A1B14', roughness: 0.6 },
  Eyes_White: { color: '#3B2417', roughness: 0.25 },
  Eyes_Pupil: { color: '#150C08', roughness: 0.15 },
  Eyes_Black: { color: '#0B0605', roughness: 0.2 },
};

export function recolorMilo(model: Object3D): void {
  model.traverse((o) => {
    if (!(o instanceof Mesh)) return;
    o.frustumCulled = false; // skinned bounds come from the rest pose, so culling would pop him out
    const mat = o.material as MeshStandardMaterial;
    const p = PALETTE[mat.name];
    if (p) {
      mat.color = new Color(p.color);
      mat.roughness = p.roughness;
      mat.metalness = 0;
    }
  });
}

/** Teal collar and silver tag on the neck bone, so they follow every animation. Returns a disposer. */
export function attachCollar(neck: Object3D): () => void {
  const worldScale = neck.getWorldScale(new Vector3());
  const collarGeo = new TorusGeometry(0.14, 0.03, 10, 28);
  const collarMat = new MeshStandardMaterial({ color: '#1F6B73', roughness: 0.45 });
  const collar = new Mesh(collarGeo, collarMat);
  const tagGeo = new TorusGeometry(0.028, 0.012, 8, 16);
  const tagMat = new MeshStandardMaterial({ color: '#D3D9E0', roughness: 0.3, metalness: 0.6 });
  const tag = new Mesh(tagGeo, tagMat);
  collar.add(tag);
  tag.position.set(0, -0.15, 0.02);
  collar.scale.setScalar(1 / worldScale.x);
  collar.rotation.x = Math.PI / 2;
  neck.add(collar);
  return () => {
    neck.remove(collar);
    [collarGeo, collarMat, tagGeo, tagMat].forEach((o) => o.dispose());
  };
}
