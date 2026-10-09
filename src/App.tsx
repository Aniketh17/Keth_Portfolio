import { CaseStudyPage } from './components/CaseStudyPage';
import { HomePage } from './components/HomePage';
import { useRoute } from './lib/route';

export function App() {
  const route = useRoute();
  return (
    <>
      <a href="#main" className="skip-link" onClick={(e) => {
        e.preventDefault();
        document.getElementById('main')?.focus();
        document.getElementById('main')?.scrollIntoView();
      }}>
        Skip to content
      </a>
      {route.name === 'project' ? <CaseStudyPage slug={route.slug} /> : <HomePage />}
    </>
  );
}
