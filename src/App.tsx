import { useEffect } from 'react';
import { CaseStudyPage } from './components/CaseStudyPage';
import { HomePage } from './components/HomePage';
import { rememberHomeScroll, useRoute } from './lib/route';

export function App() {
  const route = useRoute();

  // Opening a case study remembers where the visitor was, so closing it returns them to the same spot.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest('a');
      if (a?.getAttribute('href')?.startsWith('#/projects/') && !window.location.hash.startsWith('#/projects/')) rememberHomeScroll();
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);
  return (
    <>
      <a
        href="#main"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          const main = document.getElementById('main');
          main?.focus();
          main?.scrollIntoView();
        }}
      >
        Skip to content
      </a>
      {route.name === 'project' ? <CaseStudyPage slug={route.slug} /> : <HomePage />}
    </>
  );
}
