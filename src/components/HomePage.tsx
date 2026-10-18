import { useEffect, useLayoutEffect } from 'react';
import { takeHomeScroll } from '../lib/route';
import { hasWebGL, watchViewport, watchWorld, watchZones } from '../world/env';
import { useWorld, world } from '../world/store';
import { SiteNav } from './Chrome';
import { Hero } from './Hero';
import { About, Approach, Contact } from './Sections';
import { WorkCards } from './WorkCards';
import { SignalHero } from './world/SignalHero';
import { SignalStage } from './world/SignalStage';
import { SigVoice } from './world/SigVoice';
import { WorldLayer } from './world/WorldLayer';

/**
 * Two presentations of the same content. Wide screens with WebGL get one persistent 3D world behind the page,
 * with the sections as its destinations. Phones, small tablets and anything without WebGL get a flowing page
 * of full-width chapters, with Sig riding in the corner. Both carry every project, link and contact action.
 */
export function HomePage() {
  const status = useWorld((s) => s.status);
  const small = useWorld((s) => s.small);
  const webgl = hasWebGL();
  const lite = small || !webgl || status === 'failed';

  useLayoutEffect(() => {
    if (!webgl) world.set({ status: 'unsupported' });
  }, [webgl]);

  useLayoutEffect(() => {
    world.set({ lite });
  }, [lite]);

  useEffect(() => {
    document.body.dataset.world = lite ? 'off' : 'on';
    return () => {
      delete document.body.dataset.world;
    };
  }, [lite]);

  useEffect(() => watchViewport(), []);

  useEffect(() => (lite ? watchZones() : watchWorld()), [lite]);

  useLayoutEffect(() => {
    const y = takeHomeScroll();
    if (y > 0) window.scrollTo(0, y);
  }, []);

  return (
    <>
      {!lite && <WorldLayer />}
      {webgl && <SigVoice />}
      <SiteNav />
      <main id="main" tabIndex={-1} className="relative z-10 outline-none">
        {lite ? (
          <>
            <Hero />
            <WorkCards />
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
