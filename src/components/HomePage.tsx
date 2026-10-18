import { useEffect, useLayoutEffect } from 'react';
import { takeHomeScroll } from '../lib/route';
import { hasWebGL, watchWorld } from '../world/env';
import { useWorld, world } from '../world/store';
import { SiteNav } from './Chrome';
import { Hero } from './Hero';
import { About, Approach, Contact } from './Sections';
import { Work } from './Work';
import { SignalHero } from './world/SignalHero';
import { SignalStage } from './world/SignalStage';
import { WorldLayer } from './world/WorldLayer';

/**
 * Two presentations of the same content. With WebGL there is one persistent 3D world behind the page and the
 * sections are its destinations. Without it (or if the renderer fails) the page falls back to the plain
 * editorial layout, which carries every project, link and contact action.
 */
export function HomePage() {
  const status = useWorld((s) => s.status);
  const fallback = status === 'unsupported' || status === 'failed';

  useLayoutEffect(() => {
    if (!hasWebGL()) world.set({ status: 'unsupported' });
  }, []);

  useEffect(() => {
    document.body.dataset.world = fallback ? 'off' : 'on';
    return () => {
      delete document.body.dataset.world;
    };
  }, [fallback]);

  useEffect(() => {
    if (fallback) return;
    return watchWorld();
  }, [fallback]);

  useLayoutEffect(() => {
    const y = takeHomeScroll();
    if (y > 0) window.scrollTo(0, y);
  }, []);

  return (
    <>
      {!fallback && <WorldLayer />}
      <SiteNav />
      <main id="main" tabIndex={-1} className="relative z-10 outline-none">
        {fallback ? (
          <>
            <Hero />
            <Work />
          </>
        ) : (
          <>
            <SignalHero />
            <SignalStage />
          </>
        )}
        <Approach />
        <About />
      </main>
      <Contact />
    </>
  );
}
