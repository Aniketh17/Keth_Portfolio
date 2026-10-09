import { useState } from 'react';
import { profile } from '../data/profile';
import { Eyebrow, Section } from './Section';
import { ExternalLink } from './ui';

export function ContactSection() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard can be unavailable; the address is still shown and linked.
    }
  };

  return (
    <Section id="contact" titleId="contact-title" band={4}>
      <Eyebrow>Contact</Eyebrow>
      <h2 id="contact-title" className="font-display text-4xl font-semibold leading-tight sm:text-6xl">
        Have something worth building?
      </h2>
      <p className="mt-5 max-w-xl text-lg text-ivory/85">
        I'm open to software engineering and applied AI opportunities, as well as conversations about interesting technical
        problems.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <a
          href={`mailto:${profile.email}`}
          className="inline-flex min-h-12 items-center rounded-full bg-citron px-6 font-semibold text-ink break-all"
        >
          {profile.email}
        </a>
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-12 items-center rounded-full border border-ivory/50 px-5 font-medium text-ivory hover:bg-white/10"
        >
          Copy address
        </button>
        <span role="status" className="text-sm text-citron">
          {copied ? 'Copied.' : ''}
        </span>
      </div>

      <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-1 text-base font-medium">
        {profile.links
          .filter((l) => l.label !== 'ITO Master (live site)')
          .map((l) => (
            <li key={l.url}>
              <ExternalLink href={l.url} className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-citron">
                {l.label}
              </ExternalLink>
            </li>
          ))}
        <li>
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-citron"
          >
            Resume (PDF)<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
      </ul>

      <p className="mt-12 border-t border-white/10 pt-5 font-mono text-xs text-ivory/60">
        {profile.fullName} · {profile.location} · Built with React and Three.js. Milo is a CC0 model by Quaternius.
      </p>
    </Section>
  );
}
