import { profile } from '../data/profile';
import { Ticker } from './Ticker';

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="pt-28 lg:pt-36">
      <div className="wrap grid gap-10 lg:items-center">
        <div className="fade-in">
          <p className="label eyebrow">
            Software engineer · {profile.location}
          </p>
          <h1 id="hero-title" className="h-hero mt-5">
            Careful software, <span className="underline decoration-soda decoration-[0.08em] underline-offset-[0.12em]">kindly built.</span>
          </h1>
          <p className="prose-w mt-6 text-lg text-muted">
            Hi, I'm Aniketh. I'm a software engineer who enjoys making things that are dependable, easy to use and honest about what they can do. Lately that has meant practical AI: tools that help people with real decisions, and stay out of the way the rest of the time. Come in and have a look around.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#work" className="btn btn-solid">
              Explore my work <span aria-hidden="true">↓</span>
            </a>
            <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              View resume<span className="sr-only"> (PDF, opens in a new tab)</span>
            </a>
          </div>
          <p className="label mt-8">Master of Artificial Intelligence, University of Auckland</p>
        </div>

        </div>
      <div className="mt-14">
        <Ticker />
      </div>
    </section>
  );
}
