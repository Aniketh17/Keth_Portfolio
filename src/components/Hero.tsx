import { profile } from '../data/profile';
import { Ticker } from './Ticker';

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="pt-28 lg:pt-36">
      <div className="wrap grid gap-10 lg:items-center">
        <div className="fade-in">
          <p className="label eyebrow">
            Software × AI × a little obsession
          </p>
          <h1 id="hero-title" className="h-hero mt-5">
            From “what if?” <span className="underline decoration-soda decoration-[0.08em] underline-offset-[0.12em]">to “it works.”</span>
          </h1>
          <p className="prose-w mt-6 text-lg text-muted">
            I turn curious ideas into working software, combining engineering fundamentals with AI to solve problems worth solving.
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
