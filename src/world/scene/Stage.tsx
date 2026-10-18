import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, MeshBasicMaterial, MeshLambertMaterial, type Texture } from 'three';
import { scrollToId, selectProject, inspect } from '../env';
import { CAROUSEL_SPACING, HERO_ART, STAGE_ART_W, ZONE } from '../layout';
import { frame, world } from '../store';
import type { WorldTextures } from '../textures';
import { projects } from '../../data/projects';
import { anim, BOX, BOX_EDGES, damp, palette, PLANE } from './common';
import { FitDetail, ImacDetail, TinyDetail, TriageDetail } from './details';

const ASPECT: Record<string, number> = { 'imac-advisor': 1704 / 1030, 'transaction-coding': 1600 / 967, 'fit-check': 1600 / 967, 'tiny-paws': 1280 / 800 };

function posterTexture(id: string, t: WorldTextures): Texture {
  return id === 'imac-advisor' ? t.imac : id === 'transaction-coding' ? t.tx : id === 'fit-check' ? t.fit : t.tiny[0];
}

const setCursor = (c: string) => {
  document.body.style.cursor = c;
};

/** A framed artifact: a thin blueberry slab carrying the real image or illustration. */
function Poster({ texture, width, aspect, matRef, slabRef }: { texture: Texture; width: number; aspect: number; matRef?: (m: MeshBasicMaterial | null) => void; slabRef?: (m: MeshLambertMaterial | null) => void }) {
  const pal = palette();
  const h = width / aspect;
  return (
    <group>
      <mesh geometry={BOX} scale={[width + 0.16, h + 0.16, 0.1]}>
        <meshLambertMaterial ref={slabRef} color={pal.blueberry} transparent />
      </mesh>
      <mesh geometry={PLANE} position={[0, 0, 0.056]} scale={[width, h, 1]}>
        <meshBasicMaterial ref={matRef} map={texture} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

/**
 * One project in the carousel. Its place is computed every frame from the smoothed carousel position, so the
 * ring of projects glides rather than steps, and any change of target (a click, a scroll, an interruption)
 * simply redirects the glide. In inspection the neighbours back away and this project's interface is taken apart.
 */
function StageProject({ i, textures }: { i: number; textures: WorldTextures }) {
  const project = projects[i];
  const aspect = ASPECT[project.id];
  const group = useRef<Group>(null);
  const poster = useRef<Group>(null);
  const detail = useRef<Group>(null);
  const posterMat = useRef<MeshBasicMaterial | null>(null);
  const slabMat = useRef<MeshLambertMaterial | null>(null);
  const ring = useMemo(() => palette(), []);
  const hover = useRef(false);
  const tex = posterTexture(project.id, textures);

  useFrame(() => {
    const g = group.current;
    const s = world.get();
    if (!g) return;
    const d = i - anim.carousel;
    const ad = Math.abs(d);
    const isActive = s.active === i;
    const w = anim.inspect;
    const insp = isActive ? w : 0;
    const spread = s.small ? 0.66 : 1;
    const push = isActive ? 1 : 1 + w * 0.5;
    g.position.set(d * CAROUSEL_SPACING * spread * push, 1.3, ZONE.stage - Math.min(ad, 2) * 1.5 - (isActive ? 0 : w * 1.4));
    g.rotation.y = -d * 0.32 + (isActive ? -0.1 * w : 0);
    const sc = (1 - Math.min(ad, 2) * 0.15) * (1 + 0.12 * insp) * (hover.current && !isActive ? 1.03 : 1);
    g.scale.setScalar(sc);
    const fade = (1 - Math.min(ad, 1) * 0.5) * (isActive ? 1 - Math.min(1, insp * 4) : 1 - w * 0.7);
    if (posterMat.current) posterMat.current.opacity = fade;
    if (slabMat.current) slabMat.current.opacity = fade;
    if (poster.current) poster.current.visible = fade > 0.01;
    if (detail.current) detail.current.visible = insp > 0.02;
  });

  return (
    <group
      ref={group}
      onClick={(e) => {
        e.stopPropagation();
        const s = world.get();
        if (s.active !== i) selectProject(i);
        else if (s.mode === 'overview') inspect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        hover.current = true;
        setCursor('pointer');
      }}
      onPointerOut={() => {
        hover.current = false;
        setCursor('');
      }}
    >
      <group ref={poster}>
        <Poster texture={tex} width={STAGE_ART_W} aspect={aspect} matRef={(m) => (posterMat.current = m)} slabRef={(m) => (slabMat.current = m)} />
      </group>
      <group ref={detail} visible={false}>
        {project.id === 'imac-advisor' && <ImacDetail index={i} texture={textures.imac} />}
        {project.id === 'fit-check' && <FitDetail index={i} />}
        {project.id === 'transaction-coding' && <TriageDetail index={i} />}
        {project.id === 'tiny-paws' && <TinyDetail index={i} textures={textures.tiny} />}
      </group>
      {/* Active marker: a coral underline beneath whichever project is in front. */}
      <ActiveMark i={i} h={STAGE_ART_W / aspect} color={ring.soda} />
    </group>
  );
}

function ActiveMark({ i, h, color }: { i: number; h: number; color: import('three').Color }) {
  const m = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (!m.current) return;
    const s = world.get();
    const on = s.active === i && s.mode === 'overview';
    const mat = m.current.material as MeshBasicMaterial;
    mat.opacity = damp(mat.opacity, on ? 1 : 0, 8, dt);
    m.current.scale.x = damp(m.current.scale.x, on ? STAGE_ART_W * 0.5 : 0.01, 6, dt);
  });
  return (
    <mesh ref={m} geometry={BOX} position={[0, -h / 2 - 0.3, 0.05]} scale={[0.01, 0.05, 0.05]}>
      <meshBasicMaterial color={color} transparent opacity={0} />
    </mesh>
  );
}

export function Stage({ textures }: { textures: WorldTextures }) {
  return (
    <>
      {projects.map((_, i) => (
        <StageProject key={projects[i].id} i={i} textures={textures} />
      ))}
    </>
  );
}

/** The featured artifact at arrival. It drifts a little, answers the pointer, and clicking it goes to the work. */
export function HeroArtifact({ textures }: { textures: WorldTextures }) {
  const g = useRef<Group>(null);
  const hover = useRef(false);
  const pal = useMemo(() => palette(), []);
  useFrame(({ clock }, dt) => {
    const group = g.current;
    if (!group) return;
    const t = world.get().reduced ? 0 : clock.elapsedTime;
    group.position.y = HERO_ART.pos[1] + Math.sin(t * 0.5) * 0.06;
    group.rotation.y = damp(group.rotation.y, HERO_ART.rotY + frame.pointerX * -0.08, 4, dt);
    group.scale.setScalar(damp(group.scale.x, hover.current ? 1.025 : 1, 6, dt));
  });
  const h = HERO_ART.width / (1704 / 1030);
  return (
    <group
      ref={g}
      position={HERO_ART.pos}
      onClick={(e) => {
        e.stopPropagation();
        scrollToId('work');
      }}
      onPointerOver={() => {
        hover.current = true;
        setCursor('pointer');
      }}
      onPointerOut={() => {
        hover.current = false;
        setCursor('');
      }}
    >
      <Poster texture={textures.imac} width={HERO_ART.width} aspect={1704 / 1030} />
      {/* Two quiet ghost frames behind it, to give the arrival depth. */}
      {[1, 2].map((k) => (
        <lineSegments key={k} geometry={BOX_EDGES} position={[0.5 * k, 0.2 * k, -1.6 * k]} scale={[HERO_ART.width, h, 0.01]}>
          <lineBasicMaterial color={pal.blueberry} transparent opacity={0.35 / k} />
        </lineSegments>
      ))}
      <mesh geometry={BOX} position={[-HERO_ART.width / 2 + 0.2, h / 2 + 0.28, 0.06]} scale={[0.14, 0.14, 0.06]}>
        <meshBasicMaterial color={pal.soda} />
      </mesh>
    </group>
  );
}

/** Keeps the shared animation values moving toward their targets once per frame, before anything reads them. */
export function Conductor() {
  useFrame((_, dt) => {
    const s = world.get();
    if (s.reduced) {
      anim.carousel = frame.carousel;
      anim.inspect = s.mode === 'inspect' ? 1 : 0;
      return;
    }
    anim.carousel = damp(anim.carousel, frame.carousel, 5, dt);
    anim.inspect = damp(anim.inspect, s.mode === 'inspect' ? 1 : 0, 4.2, dt);
  }, -20);
  return null;
}
