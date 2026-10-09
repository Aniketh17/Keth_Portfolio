import { useEffect, useState } from 'react';
import { profile } from '../data/profile';
import { scrollToLanding, setTablet3d } from '../lib/environment';
import { SECTIONS, ui } from '../lib/journey';
import { useStore } from '../lib/store';

export function SiteNav() {
  const landing = useStore(ui, (s) => s.landing);
  const compact = useStore(ui, (s) => s.compact);
  const view = useStore(ui, (s) => s.view);
  const canTablet3d = useStore(ui, (s) => s.canTablet3d);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // On phones the header tucks away while reading and returns on any scroll up, so it never eats reading space.
  useEffect(() => {
    if (view !== 'lite') {
      setHidden(false);
      return;
    }
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 80 || y < last - 4) setHidden(false);
      else if (y > last + 8) setHidden(true);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [view]);

  const go = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    scrollToLanding(index);
  };

  const links = SECTIONS.map((s, i) => (
    <li key={s.id}>
      <a
        href={`#${s.id}`}
        onClick={go(i)}
        aria-current={landing === i ? 'location' : undefined}
        className={`inline-flex min-h-12 w-full items-center rounded-full px-4 text-sm font-medium transition-colors lg:min-h-11 lg:w-auto ${
          landing === i ? 'bg-citron text-ink' : 'text-ivory hover:bg-white/10'
        }`}
      >
        {s.label}
      </a>
    </li>
  ));

  const resume = (
    <a
      href={profile.resumeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-12 w-full items-center rounded-full border border-ivory/40 px-4 text-sm font-medium text-ivory hover:bg-white/10 lg:min-h-11 lg:w-auto"
    >
      Resume<span className="sr-only"> (PDF, opens in a new tab)</span>
    </a>
  );

  const toggle3d =
    canTablet3d && compact ? (
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setTablet3d(view !== 'tablet3d');
        }}
        className="inline-flex min-h-12 w-full items-center rounded-full border border-violet-soft/50 px-4 text-sm font-medium text-violet-soft hover:bg-white/10"
      >
        {view === 'tablet3d' ? 'Switch to light mode' : 'Watch Milo in 3D'}
      </button>
    ) : null;

  const lite = view === 'lite';
  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-transform duration-300 ${hidden && !open ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <div
        className={`mx-auto flex items-center justify-between gap-4 px-4 py-2 sm:px-8 lg:px-[4vw] ${
          lite ? 'border-b border-white/10 bg-night/95' : compact ? '' : 'bg-gradient-to-b from-night via-night/85 to-transparent pb-8 pt-4'
        }`}
      >
        <a
          href="#intro"
          onClick={go(0)}
          className="inline-flex min-h-11 items-center font-display text-xl font-semibold text-ivory"
          aria-label="Aniketh Rao, back to the top"
        >
          Aniketh
          <span className="ml-1.5 font-medium text-ivory/80">
            Rao<span className="text-citron">.</span>
          </span>
        </a>

        {compact ? (
          <div>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen((o) => !o)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ivory/40 bg-night/60 px-5 text-sm font-medium text-ivory"
            >
              {open ? 'Close' : 'Menu'}
            </button>
            {open && (
              <nav
                id="site-menu"
                aria-label="Primary"
                className="absolute inset-x-3 top-[3.6rem] rounded-3xl border border-white/10 bg-night2 p-3 shadow-2xl sm:left-auto sm:right-8 sm:w-72"
              >
                <ul className="flex flex-col gap-1">
                  {links}
                  <li>{resume}</li>
                  {toggle3d && <li>{toggle3d}</li>}
                </ul>
              </nav>
            )}
          </div>
        ) : (
          <nav aria-label="Primary" className="flex items-center gap-1">
            <ul className="flex items-center gap-1">{links}</ul>
            <span className="ml-2">{resume}</span>
          </nav>
        )}
      </div>
    </header>
  );
}
