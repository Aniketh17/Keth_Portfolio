import { useEffect, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { CanvasTexture, SRGBColorSpace, TextureLoader, type Texture } from 'three';
import { JOURNEY, TRANSACTIONS, TX_BAND } from '../data/artifacts';
import { getProjectById } from '../data/projects';
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

const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
};

/** The shared poster frame: paper surface, blueberry header strip, footer note. Returns the content box. */
function posterFrame(g: CanvasRenderingContext2D, p: Palette, w: number, h: number, kicker: string, footer: string) {
  g.fillStyle = p.css.paper;
  g.fillRect(0, 0, w, h);
  g.fillStyle = p.css.blueberry;
  g.fillRect(0, 0, w, 118);
  g.fillStyle = p.css.canvas;
  g.font = `500 38px ${MONO}`;
  g.textBaseline = 'middle';
  g.fillText(kicker, 56, 60);
  g.fillStyle = p.css.soda;
  g.beginPath();
  g.arc(w - 72, 60, 14, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = 'rgba(23,43,77,0.6)';
  g.font = `500 30px ${MONO}`;
  g.fillText(footer, 56, h - 48);
}

const W = 1600;
const H = 967;

function fitPoster(): CanvasTexture {
  const rows = getProjectById('fit-check')!.example!.rows;
  const short = ['REST APIs', 'Event-driven', 'Led a team', 'Kubernetes'];
  const marks = ['✓', '≈', '?', '–'];
  return drawn(W, H, (g, p) => {
    posterFrame(g, p, W, H, 'FIT CHECK  ·  ILLUSTRATION', 'Synthetic profile. Not a screenshot of the product.');
    rows.forEach((r, i) => {
      const y = 190 + i * 168;
      g.fillStyle = p.css.blueberry;
      rr(g, 56, y, 560, 120, 10);
      g.fill();
      g.fillStyle = p.css.canvas;
      g.font = `600 46px ${FONT}`;
      g.fillText(`${marks[i]}  ${short[i]}`, 92, y + 50);
      g.font = `500 28px ${MONO}`;
      g.globalAlpha = 0.7;
      g.fillText(r.state.toUpperCase(), 92, y + 92);
      g.globalAlpha = 1;
      // the thread
      g.strokeStyle = r.state === 'Needs confirmation' ? p.css.soda : p.css.blueberry;
      g.lineWidth = 8;
      g.setLineDash(r.state === 'Direct' ? [] : r.state === 'Related' ? [26, 18] : [4, 20]);
      if (r.state !== 'Not found') {
        g.beginPath();
        g.moveTo(640, y + 60);
        g.lineTo(980, y + 60);
        g.stroke();
      }
      g.setLineDash([]);
      // the evidence
      g.strokeStyle = 'rgba(23,43,77,0.35)';
      g.lineWidth = 3;
      g.setLineDash([12, 10]);
      rr(g, 1000, y, 544, 120, 10);
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = 'rgba(23,43,77,0.28)';
      if (r.state !== 'Not found') {
        rr(g, 1034, y + 36, 440, 14, 7);
        g.fill();
        rr(g, 1034, y + 66, 320, 14, 7);
        g.fill();
      }
    });
  });
}

function txPoster(): CanvasTexture {
  return drawn(W, H, (g, p) => {
    posterFrame(g, p, W, H, 'TRANSACTION CODING  ·  ILLUSTRATION', 'Invented transactions. Not the product interface.');
    TRANSACTIONS.forEach((t, i) => {
      const y = 180 + i * 134;
      g.fillStyle = p.css.blueberry;
      rr(g, 56, y, 760, 100, 10);
      g.fill();
      g.fillStyle = p.css.canvas;
      g.font = `500 36px ${MONO}`;
      g.textBaseline = 'middle';
      g.fillText(t.description, 90, y + 50);
      const bin = t.band === 'familiar' ? 0 : t.band === 'unsure' ? 1 : 2;
      g.strokeStyle = bin === 0 ? p.css.blueberry : p.css.soda;
      g.lineWidth = 7;
      g.setLineDash(bin === 0 ? [] : bin === 1 ? [24, 16] : [4, 18]);
      g.beginPath();
      g.moveTo(840, y + 50);
      g.lineTo(1040, 250 + bin * 230);
      g.stroke();
      g.setLineDash([]);
    });
    (['familiar', 'unsure', 'new'] as const).forEach((b, i) => {
      const y = 190 + i * 230;
      g.fillStyle = i === 0 ? p.css.blueberry : 'rgba(255,111,79,0.16)';
      rr(g, 1040, y, 504, 120, 10);
      g.fill();
      g.strokeStyle = i === 0 ? p.css.blueberry : p.css.soda;
      g.lineWidth = 4;
      rr(g, 1040, y, 504, 120, 10);
      g.stroke();
      g.fillStyle = i === 0 ? p.css.canvas : p.css.blueberry;
      g.font = `600 40px ${FONT}`;
      g.fillText(TX_BAND[b].label, 1076, y + 48);
      g.font = `500 28px ${MONO}`;
      g.globalAlpha = 0.75;
      g.fillText(i === 0 ? 'SUGGESTED' : i === 1 ? 'HELD FOR REVIEW' : 'NEEDS A PERSON', 1076, y + 90);
      g.globalAlpha = 1;
    });
  });
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

export interface WorldTextures {
  imac: Texture;
  tiny: Texture[];
  fit: Texture;
  tx: Texture;
}

/** Loads the real captures (suspends until ready) and draws the two illustration posters. */
export function useWorldTextures(): WorldTextures {
  const imac = useLoader(TextureLoader, `${BASE}assets/imac_main.webp`);
  const tiny = useLoader(
    TextureLoader,
    JOURNEY.map((s) => `${BASE}${s.image}`),
  );
  const drawnSet = useMemo(() => ({ fit: fitPoster(), tx: txPoster() }), []);
  useMemo(() => {
    prep(imac);
    tiny.forEach(prep);
  }, [imac, tiny]);
  useEffect(
    () => () => {
      drawnSet.fit.dispose();
      drawnSet.tx.dispose();
    },
    [drawnSet],
  );
  return { imac, tiny, fit: drawnSet.fit, tx: drawnSet.tx };
}
