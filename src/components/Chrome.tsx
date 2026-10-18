import { useEffect, useState } from 'react';
import { profile } from '../data/profile';
import { scrollToId } from '../world/env';
import { useWorld } from '../world/store';

const CHAPTERS = [
  { id: 'top', label: 'Intro' },
  { id: 'work', label: 'Work' },
  { id: 'approach', label: 'Approach' },
  { id: 'about', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
] as const;

/** Auckland time, because that's where the person behind this is. */
function useClock(): string {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(t);
  }, []);
  return new Intl.DateTimeFormat('en-NZ', { hour: 'numeric', minute: '2-digit', timeZone: 'Pacific/Auckland' }).format(now);
}

/**
 * The header: name on the left, a pill with the chapter counter and links in the middle, resume on the right.
 * With the 3D world running the counter follows the camera; without it the pill is plain links. On narrow screens
 * the pill collapses to the counter and current chapter, and opens the links.
 */
export function SiteNav() {
  const world = useWorld((s) => s.status === 'ready' || s.status === 'loading');
  const zone = useWorld((s) => s.zone);
  const [open, setOpen] = useState(false);
  const clock = useClock();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    setOpen(false);
    if (world) {
      e.preventDefault();
      scrollToId(id === 'top' ? 'top' : id);
      if (id === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const current = world ? CHAPTERS[Math.min(zone, CHAPTERS.length - 1)] : null;
  const counter = current ? `${String(zone + 1).padStart(2, '0')}/${String(CHAPTERS.length).padStart(2, '0')}` : null;

  const links = CHAPTERS.slice(1).map((c) => (
    <a key={c.id} href={`#${c.id}`} onClick={go(c.id)} aria-current={current?.id === c.id ? 'true' : undefined}>
      {c.label}
    </a>
  ));

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40">
        <div className="wrap flex items-center justify-between gap-3 py-3">
          <a href="#top" onClick={go('top')} className="inline-flex min-h-11 items-center whitespace-nowrap font-medium tracking-tight" aria-label={`${profile.fullName}, back to the top`}>
            {profile.fullName}
            <span className="ml-0.5 text-soda" aria-hidden="true">
              ®
            </span>
          </a>

          <div className="hidden md:block">
          <nav aria-label="Primary" className="pill">
            {counter && (
              <span className="inline-flex items-center gap-2 px-3 font-mono text-[0.72rem] uppercase tracking-wider text-canvas/70">
                <span className="h-1.5 w-1.5 rounded-full bg-soda" aria-hidden="true" />
                {counter}
              </span>
            )}
            {links}
          </nav>
          </div>

          <div className="relative md:hidden">
            <button type="button" className="pill !gap-2 !px-4" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((o) => !o)}>
              {counter && <span className="font-mono text-[0.72rem] text-canvas/70">{counter}</span>}
              <span className="text-sm font-medium">{open ? 'Close' : (current?.label ?? 'Menu')}</span>
            </button>
            {open && (
              <nav id="mobile-nav" aria-label="Primary" className="absolute right-0 top-14 flex w-60 flex-col gap-1 rounded-3xl bg-blueberry p-3 text-canvas shadow-2xl">
                {CHAPTERS.map((c) => (
                  <a
                    key={c.id}
                    href={`#${c.id}`}
                    onClick={go(c.id)}
                    aria-current={current?.id === c.id ? 'true' : undefined}
                    className={`inline-flex min-h-12 items-center rounded-full px-4 font-medium ${current?.id === c.id ? 'bg-canvas text-blueberry' : ''}`}
                  >
                    {c.label}
                  </a>
                ))}
                <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center rounded-full border border-canvas/40 px-4 font-medium">
                  Resume<span className="sr-only"> (PDF, opens in a new tab)</span>
                </a>
              </nav>
            )}
          </div>

          <div className="hidden md:block">
            <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost !min-h-10 !px-4 text-sm">
              Resume<span className="sr-only"> (PDF, opens in a new tab)</span>
            </a>
          </div>
        </div>
      </header>
      <div className="pointer-events-none fixed bottom-3 left-[var(--gutter)] z-30 hidden font-mono text-[0.7rem] uppercase tracking-wider text-muted md:block" aria-hidden="true">
        ©2026 · Auckland {clock}
      </div>
    </>
  );
}
