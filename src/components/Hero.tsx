import { profile } from '../data/profile';
import { getProjectById } from '../data/projects';
import { projectHref } from '../lib/route';
import { ProjectArtifact } from './Artifact';

export function Hero() {
  const featured = getProjectById('imac-advisor');
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="wrap grid gap-12 pb-20 pt-14 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:pb-28 lg:pt-24"
    >
      <div className="fade-in">
        <p className="label">
          {profile.fullName} · Software engineer · {profile.location}
        </p>
        <h1 id="hero-title" className="h-hero mt-5">
          Software that works.{' '}
          <span className="underline decoration-soda decoration-[0.08em] underline-offset-[0.12em]">AI that earns its place.</span>
        </h1>
        <p className="prose-w mt-6 text-lg text-muted">
          I'm Aniketh, a software engineer focused on dependable applications and practical AI systems. I work across backend engineering,
          full-stack development, and applied machine learning, with an emphasis on turning technical ideas into useful, maintainable
          products.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#work" className="btn btn-solid">
            Explore my work <span aria-hidden="true">↓</span>
          </a>
          <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            View resume<span className="sr-only"> (PDF, opens in a new tab)</span>
          </a>
        </div>
        <p className="label mt-10">Master of Artificial Intelligence, University of Auckland</p>
      </div>

      {featured && (
        <div className="fade-in" style={{ animationDelay: '120ms' }}>
          <ProjectArtifact project={featured} eager />
          <p className="mt-3 text-sm text-muted">
            Featured: {featured.title}.{' '}
            <a className="link font-medium text-blueberry" href={projectHref(featured.slug)}>
              Read the case study
            </a>
          </p>
        </div>
      )}
    </section>
  );
}
