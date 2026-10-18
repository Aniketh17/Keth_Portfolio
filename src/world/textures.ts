import { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { CanvasTexture, SRGBColorSpace, TextureLoader, type Texture } from 'three';
import { JOURNEY } from '../data/artifacts';
import { REST_STEP } from '../mock/flows';
import { readPalette, type Palette } from './palette';

const BASE = import.meta.env.BASE_URL;
const FONT = 'Switzer, system-ui, sans-serif';
const MONO = "'Geist Mono', ui-monospace, monospace";

function prep<T extends Texture>(t: T): T {
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Canvas-drawn texture that redraws once the web fonts have loaded, so labels never bake in a fallback font. */
function drawn(w: number, h: number, draw: (g: CanvasRenderingContext2D, p: Palette) => void): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d')!;
  const tex = prep(new CanvasTexture(canvas));
  const paint = () => {
    g.clearRect(0, 0, w, h);
    draw(g, readPalette());
    tex.needsUpdate = true;
  };
  paint();
  void document.fonts?.ready.then(paint);
  return tex;
}

/** Small label textures: numbers and glyphs for slabs, so essential text stays in the HTML. */
export function labelTexture(text: string, light: boolean, size = 256): CanvasTexture {
  return drawn(size, size, (g, p) => {
    g.fillStyle = light ? p.css.canvas : p.css.blueberry;
    g.font = `600 ${size * 0.5}px ${FONT}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, size / 2, size / 2 + size * 0.03);
  });
}

/** A short label on a transparent background, sized w x h pixels. Used only for a few words on slabs. */
export function textTexture(text: string, w: number, h: number, light: boolean, mono = false): CanvasTexture {
  return drawn(w, h, (g, p) => {
    g.fillStyle = light ? p.css.canvas : p.css.blueberry;
    g.font = mono ? `500 ${h * 0.42}px ${MONO}` : `600 ${h * 0.5}px ${FONT}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, w / 2, h / 2 + h * 0.03);
  });
}

export const ATLAS = { cols: 3, rows: 4 };

/** A view onto one frame of a demo atlas. Cloned so the carousel poster and the inspected view can show different steps. */
export function atlasView(base: Texture): Texture {
  const t = base.clone();
  t.needsUpdate = true;
  t.repeat.set(1 / ATLAS.cols, 1 / ATLAS.rows);
  return t;
}
export function setAtlasStep(t: Texture, step: number): void {
  const i = Math.max(0, Math.min(ATLAS.cols * ATLAS.rows - 1, step));
  t.offset.set((i % ATLAS.cols) / ATLAS.cols, 1 - (Math.floor(i / ATLAS.cols) + 1) / ATLAS.rows);
}

export interface WorldTextures {
  imac: Texture;
  tiny: Texture[];
  fitAtlas: Texture;
  txAtlas: Texture;
  imacAtlas: Texture;
  /** Carousel posters: the demo atlases framed on their most informative step. */
  posters: { fit: Texture; transactions: Texture };
}

/** Loads the real captures and the demo atlases (suspends until ready). */
export function useWorldTextures(): WorldTextures {
  const imac = useLoader(TextureLoader, `${BASE}assets/imac_main.webp`);
  const tiny = useLoader(
    TextureLoader,
    JOURNEY.map((s) => `${BASE}${s.image}`),
  );
  const fitAtlas = useLoader(TextureLoader, `${BASE}mock/fit.webp`);
  const txAtlas = useLoader(TextureLoader, `${BASE}mock/transactions.webp`);
  const imacAtlas = useLoader(TextureLoader, `${BASE}mock/imac.webp`);
  useMemo(() => {
    prep(imac);
    tiny.forEach(prep);
    prep(fitAtlas);
    prep(txAtlas);
    prep(imacAtlas);
  }, [imac, tiny, fitAtlas, txAtlas, imacAtlas]);
  const posters = useMemo(() => {
    const fit = atlasView(fitAtlas);
    const transactions = atlasView(txAtlas);
    setAtlasStep(fit, REST_STEP.fit);
    setAtlasStep(transactions, REST_STEP.transactions);
    return { fit, transactions };
  }, [fitAtlas, txAtlas]);
  return { imac, tiny, fitAtlas, txAtlas, imacAtlas, posters };
}
