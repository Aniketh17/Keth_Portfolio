import { profile } from '../../data/profile';
import { scrollToId } from '../../world/env';
import { Ticker } from '../Ticker';

/**
 * Arrival. The headline and actions are plain HTML on the left; the featured artifact is the 3D object on the
 * right, and clicking it goes to the work. Nothing here waits for the scene.
 */
export function SignalHero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="pointer-events-none relative flex min-h-[100svh] items-start pt-[calc(4.5rem+36svh)] lg:items-center lg:pt-16">
      <div className="wrap">
        <div className="fade-in max-w-[30rem]">
          <p className="label eyebrow">
            Software engineer · {profile.location}
          </p>
          <h1 id="hero-title" className="h-hero mt-5">
            Software that works. <span className="underline decoration-soda decoration-[0.08em] underline-offset-[0.12em]">AI that earns its place.</span>
          </h1>
          <p className="prose-w pointer-events-auto mt-6 text-lg text-muted">
            I'm Aniketh, a software engineer focused on dependable applications and practical AI systems. I work across backend engineering, full-stack
            development, and applied machine learning, with an emphasis on turning technical ideas into useful, maintainable products.
          </p>
          <div className="pointer-events-auto mt-8 flex flex-wrap gap-3">
            <button type="button" className="btn btn-solid" onClick={() => scrollToId('work')}>
              Explore my work <span aria-hidden="true">→</span>
            </button>
            <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              View resume<span className="sr-only"> (PDF, opens in a new tab)</span>
            </a>
          </div>
          <p className="prose-w pointer-events-auto mt-6 text-sm text-muted">Scroll, or poke the little cube on the right. It knows the way.</p>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-10 hidden lg:block">
        <Ticker />
      </div>
    </section>
  );
}
