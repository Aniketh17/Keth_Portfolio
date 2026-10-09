import { useEffect, useState } from 'react';
import { routes } from '../data/projects';
import { ui } from '../lib/journey';
import { LANDING_LINES, PET_LINES } from '../lib/miloLines';
import { useStore } from '../lib/store';

export function MiloBubble() {
  const landing = useStore(ui, (s) => s.landing);
  const scene = useStore(ui, (s) => s.scene);
  const fetchRoute = useStore(ui, (s) => s.fetchRoute);
  const fetchPhase = useStore(ui, (s) => s.fetchPhase);
  const pets = useStore(ui, (s) => s.petCount);
  const [line, setLine] = useState<string | null>(null);

  const routeLine =
    fetchRoute && (fetchPhase === 'travel' || fetchPhase === 'react') ? routes.find((r) => r.id === fetchRoute)?.miloLine ?? null : null;

  useEffect(() => {
    if (pets === 0) return;
    setLine(PET_LINES[(pets - 1) % PET_LINES.length]);
    const hide = window.setTimeout(() => setLine(null), 2600);
    return () => window.clearTimeout(hide);
  }, [pets]);

  useEffect(() => {
    if (scene !== 'ready') return setLine(null);
    if (routeLine) return setLine(routeLine);
    const next = LANDING_LINES[landing];
    setLine(null);
    if (!next) return;
    const show = window.setTimeout(() => setLine(next), 900);
    const hide = window.setTimeout(() => setLine(null), 6500);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [landing, scene, routeLine]);

  if (!line) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-20 w-max max-w-[14rem]"
      style={{
        left: 'max(0.75rem, calc(var(--milo-x, 70vw) - 3.2rem))',
        top: 'calc(var(--milo-y, 40vh) - 3rem)',
        transform: 'translateY(-100%)',
      }}
    >
      <p className="bubble" key={line}>
        {line}
      </p>
    </div>
  );
}
