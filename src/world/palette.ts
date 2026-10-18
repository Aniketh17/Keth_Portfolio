import { Color } from 'three';

/** Read the brand tokens from the page's CSS so the world and the HTML can never drift apart. */
function channel(name: string): [number, number, number] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const parts = raw.match(/\d+/g)?.map(Number);
  return parts && parts.length >= 3 ? [parts[0], parts[1], parts[2]] : [128, 128, 128];
}

const toColor = ([r, g, b]: [number, number, number]) => new Color(r / 255, g / 255, b / 255);
const toCss = ([r, g, b]: [number, number, number]) => `rgb(${r}, ${g}, ${b})`;

export interface Palette {
  blueberry: Color;
  soda: Color;
  canvas: Color;
  paper: Color;
  css: { blueberry: string; soda: string; canvas: string; paper: string };
}

export function readPalette(): Palette {
  const b = channel('--blueberry-rgb');
  const s = channel('--pop-soda-rgb');
  const c = channel('--canvas-rgb');
  const p = channel('--paper-rgb');
  return {
    blueberry: toColor(b),
    soda: toColor(s),
    canvas: toColor(c),
    paper: toColor(p),
    css: { blueberry: toCss(b), soda: toCss(s), canvas: toCss(c), paper: toCss(p) },
  };
}
