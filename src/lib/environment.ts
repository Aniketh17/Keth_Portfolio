import { frame, measureAnchors, syncFromScroll, ui } from './journey';

export const STACKED_BREAKPOINT = 1024;

let webglCache: boolean | undefined;
export function hasWebGL(): boolean {
  if (webglCache !== undefined) return webglCache;
  webglCache = detectWebGL();
  return webglCache;
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export const TABLET_MIN = 768;
const TABLET3D_KEY = 'milo-3d';

function wantsTablet3d(): boolean {
  try {
    return window.sessionStorage.getItem(TABLET3D_KEY) === '1';
  } catch {
    return false;
  }
}

/** Tablet visitors can opt in to the 3D scene; the choice lasts for the session. */
export function setTablet3d(on: boolean): void {
  try {
    window.sessionStorage.setItem(TABLET3D_KEY, on ? '1' : '0');
  } catch {
    // Storage can be blocked; the toggle then lasts until reload.
  }
  window.dispatchEvent(new Event('resize'));
}

/** Height (px) of the fixed scene strip on stacked layouts. */
export const stripHeightFor = (viewportHeight: number): number =>
  Math.max(240, Math.min(340, Math.round(viewportHeight * 0.36)));

export function currentStripHeight(): number {
  return ui.get().stacked ? stripHeightFor(window.innerHeight) : 0;
}

/**
 * Decides the view mode (desktop 3D, tablet 3D, or phone sprites) from the viewport. Called before the first
 * render so a phone never requests the 3D bundle, and again whenever the window changes.
 */
export function primeEnvironment(): { stacked: boolean } {
  const width = window.innerWidth;
  const compact = width < STACKED_BREAKPOINT;
  const canTablet3d = compact && width >= TABLET_MIN && hasWebGL();
  const view = !compact ? 'desktop' : canTablet3d && wantsTablet3d() ? 'tablet3d' : 'lite';
  const stacked = view === 'tablet3d';
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  ui.set({ view, stacked, compact, canTablet3d, saveData, reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches });
  return { stacked };
}

/**
 * Keeps layout mode, reduced-motion preference, section anchors and scroll
 * progress in sync with the page. Returns a cleanup function. Everything that
 * depends on page geometry is re-measured here, including when the document's
 * height changes after load (fonts, images, content changes).
 */
export function watchEnvironment(): () => void {
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  let raf = 0;

  const remeasure = () => {
    const { stacked } = primeEnvironment();
    const strip = stacked ? stripHeightFor(window.innerHeight) : 0;
    root.style.setProperty('--strip', `${strip}px`);
    measureAnchors(strip);
    syncFromScroll();
  };

  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      syncFromScroll();
    });
  };

  const onPointer = (e: PointerEvent) => {
    frame.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
    frame.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
  };

  remeasure();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', remeasure);
  window.addEventListener('load', remeasure);
  window.addEventListener('pointermove', onPointer, { passive: true });
  motionQuery.addEventListener('change', remeasure);
  const resizeObserver = new ResizeObserver(remeasure);
  resizeObserver.observe(document.body);
  void document.fonts?.ready.then(remeasure);

  return () => {
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', remeasure);
    window.removeEventListener('load', remeasure);
    window.removeEventListener('pointermove', onPointer);
    motionQuery.removeEventListener('change', remeasure);
    resizeObserver.disconnect();
  };
}

export function scrollToLanding(index: number): void {
  const top = frame.anchors[index] ?? 0;
  window.scrollTo({ top, behavior: ui.get().reducedMotion ? 'auto' : 'smooth' });
}
