import { useLayoutEffect } from 'react';
import { takeHomeScroll } from '../lib/route';
import { SiteNav } from './Chrome';
import { Hero } from './Hero';
import { About, Approach, Contact } from './Sections';
import { Work } from './Work';

export function HomePage() {
  useLayoutEffect(() => {
    const y = takeHomeScroll();
    if (y > 0) window.scrollTo(0, y);
  }, []);

  return (
    <>
      <SiteNav />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Work />
        <Approach />
        <About />
      </main>
      <Contact />
    </>
  );
}
