import { profile } from '../data/profile';
import { scrollToLanding } from '../lib/environment';
import { Eyebrow, Section } from './Section';

export function HeroSection() {
  return (
    <Section id="intro" titleId="hero-title" band={0}>
      <Eyebrow>
        {profile.name} · Software engineer · {profile.location}
      </Eyebrow>
      <h1 id="hero-title" className="font-display text-[2.5rem] font-semibold leading-[1.04] sm:text-6xl lg:text-7xl">
        Software that works. <span className="text-citron">AI that earns its place.</span>
      </h1>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-ivory/85 sm:text-lg">
        I'm Aniketh, a software engineer focused on dependable applications and practical AI systems. I work across backend
        engineering, full-stack development, and applied machine learning, with an emphasis on turning technical ideas into
        useful, maintainable products.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="#work"
          onClick={(e) => {
            e.preventDefault();
            scrollToLanding(1);
          }}
          className="inline-flex min-h-12 items-center rounded-full bg-citron px-6 font-semibold text-ink transition-transform hover:-translate-y-0.5"
        >
          Explore my work
        </a>
        <a
          href={profile.resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center rounded-full border border-ivory/50 px-6 font-semibold text-ivory transition-colors hover:bg-white/10"
        >
          View resume<span className="sr-only"> (PDF, opens in a new tab)</span>
        </a>
      </div>
      <p className="mt-10 font-mono text-xs uppercase tracking-widest text-ivory/60">
        Master of Artificial Intelligence, University of Auckland
      </p>
    </Section>
  );
}
