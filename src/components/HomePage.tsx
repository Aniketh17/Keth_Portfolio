import { useEffect, useLayoutEffect, useRef } from 'react';
import { watchEnvironment } from '../lib/environment';
import { resetFetch, routeProjectSlug } from '../lib/fetchProof';
import { SECTIONS, frame, ui } from '../lib/journey';
import { consumeRestoreHomeScroll, openProject } from '../lib/route';
import { useStore } from '../lib/store';
import { ContactSection } from './ContactSection';
import { HeroSection } from './HeroSection';
import { JourneySection } from './JourneySection';
import { MiloBubble } from './MiloBubble';
import { PetButton } from './PetButton';
import { ProjectsSection } from './ProjectsSection';
import { SceneLayer } from './SceneLayer';
import { SiteNav } from './SiteNav';
import { SkillsSection } from './SkillsSection';

export function HomePage() {
  const fetchRoute = useStore(ui, (s) => s.fetchRoute);
  const fetchPhase = useStore(ui, (s) => s.fetchPhase);
  const view = useStore(ui, (s) => s.view);
  const bar = useRef<HTMLDivElement>(null);

  // Scroll progress bar, driven directly on the element: no React state per scroll event.
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  useLayoutEffect(() => {
    const stop = watchEnvironment();
    if (consumeRestoreHomeScroll()) {
      window.scrollTo(0, frame.scrollY);
    } else {
      const index = SECTIONS.findIndex((s) => `#${s.id}` === window.location.hash);
      if (index > 0) window.scrollTo(0, frame.anchors[index]);
    }
    return stop;
  }, []);

  // Milo reached the proof object (or the visitor skipped): open the case study the route points to.
  useEffect(() => {
    if (fetchPhase !== 'arrived' || !fetchRoute) return;
    const slug = routeProjectSlug(fetchRoute);
    resetFetch();
    if (slug) openProject(slug);
  }, [fetchPhase, fetchRoute]);

  return (
    <>
      {view !== 'lite' && <SceneLayer />}
      <SiteNav />
      <div ref={bar} className="progress-bar" aria-hidden="true" />
      {view !== 'lite' && (
        <>
          <MiloBubble />
          <PetButton />
        </>
      )}
      <main id="main" className="content-offset pointer-events-none relative z-10" style={view === 'lite' ? { paddingTop: '3.5rem' } : undefined}>
        <HeroSection />
        <ProjectsSection />
        <SkillsSection />
        <JourneySection />
        <ContactSection />
      </main>
    </>
  );
}
