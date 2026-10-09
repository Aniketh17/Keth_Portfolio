import { lazy, Suspense, useEffect } from 'react';
import { hasWebGL } from '../lib/environment';
import { ui } from '../lib/journey';
import { useStore } from '../lib/store';
import { SceneFallback } from './SceneFallback';

// The 3D scene is a separate chunk: text and navigation render and become usable before it arrives.
const ExperienceScene = lazy(() => import('../scene/ExperienceScene'));

export function SceneLayer() {
  const status = useStore(ui, (s) => s.scene);
  const stacked = useStore(ui, (s) => s.stacked);
  const reducedMotion = useStore(ui, (s) => s.reducedMotion);

  useEffect(() => {
    if (!hasWebGL()) ui.set({ scene: 'unsupported' });
    return () => ui.set({ scene: 'loading' });
  }, []);

  const showScene = status === 'loading' || status === 'ready';
  return (
    <div className="scene-layer" aria-hidden="true">
      {showScene && (
        <div className="scene-canvas" data-ready={status === 'ready'}>
          <Suspense fallback={null}>
            <ExperienceScene stacked={stacked} reducedMotion={reducedMotion} />
          </Suspense>
        </div>
      )}
      {status === 'loading' && (
        <div className="shimmer absolute inset-0 flex items-end justify-center pb-6 lg:items-center lg:justify-end lg:pr-[14vw] lg:pb-0">
          <span className="font-mono text-xs uppercase tracking-widest text-violet-soft">Milo is on his way…</span>
        </div>
      )}
      {!showScene && <SceneFallback />}
    </div>
  );
}
