import { lazy, Suspense } from 'react';
import { useWorld } from '../../world/store';

// The 3D world is its own chunk: the page's text, navigation and links are usable before it arrives.
const World = lazy(() => import('../../world/World'));

export function WorldLayer() {
  const status = useWorld((s) => s.status);
  const small = useWorld((s) => s.small);
  const reduced = useWorld((s) => s.reduced);
  return (
    <div className="world-layer" aria-hidden="true" data-ready={status === 'ready'}>
      <Suspense fallback={null}>
        <World small={small} reduced={reduced} />
      </Suspense>
    </div>
  );
}
