import { useEffect, useState } from 'react';
import { profile } from '../data/profile';

const LINKS = [
  { id: 'work', label: 'Work' },
  { id: 'approach', label: 'Approach' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
] as const;

/** Simple header. On narrow screens the links sit behind a labelled button; the page never depends on it. */
export function SiteNav() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const links = LINKS.map((l) => (
    <li key={l.id}>
      <a
        href={`#${l.id}`}
        onClick={() => setOpen(false)}
        className="inline-flex min-h-12 items-center font-medium hover:underline hover:decoration-soda hover:decoration-2 hover:underline-offset-8 md:min-h-11"
      >
        {l.label}
      </a>
    </li>
  ));

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas">
      <div className="wrap flex items-center justify-between py-1">
        <a href="#top" className="inline-flex min-h-11 items-center font-semibold tracking-tight" aria-label={`${profile.fullName}, back to the top`}>
          {profile.fullName}
          <span className="ml-1 text-soda" aria-hidden="true">
            ●
          </span>
        </a>
        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          <ul className="flex items-center gap-7">{links}</ul>
          <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost !min-h-10 !px-4 text-sm">
            Resume<span className="sr-only"> (PDF, opens in a new tab)</span>
          </a>
        </nav>
        <button
          type="button"
          className="btn btn-ghost !min-h-11 !px-4 text-sm md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Primary" className="wrap border-t border-line pb-3 md:hidden">
          <ul>{links}</ul>
          <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-solid mt-2 w-full justify-center">
            Resume<span className="sr-only"> (PDF, opens in a new tab)</span>
          </a>
        </nav>
      )}
    </header>
  );
}
