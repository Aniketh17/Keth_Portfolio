import { getProjectById, routes } from '../data/projects';
import { cancelFetch, skipFetch, startFetch } from '../lib/fetchProof';
import { ui } from '../lib/journey';
import { useStore } from '../lib/store';

/**
 * Three questions, three real destinations. Choosing one lights a trail on the
 * stairs and sends Milo to the matching proof object; the destination comes
 * from `routes` in the project data, not from this component.
 */
export function FetchTheProof() {
  const fetchRoute = useStore(ui, (s) => s.fetchRoute);
  const phase = useStore(ui, (s) => s.fetchPhase);
  const walking = phase === 'travel' || phase === 'react';
  const active = routes.find((r) => r.id === fetchRoute);
  const destination = active ? getProjectById(active.projectId) : undefined;

  return (
    <div className="panel !border-violet/50 p-5 sm:p-7">
      <h3 className="font-display text-2xl font-semibold text-ivory sm:text-3xl">Fetch the proof</h3>
      <p className="mt-2 max-w-lg text-ivory/80">
        Not sure where to start? Pick a question and Milo will fetch the project that answers it.
      </p>

      <div role="group" aria-label="Choose what you want to see" className="mt-5 grid gap-3">
        {routes.map((r) => {
          const selected = fetchRoute === r.id;
          return (
            <button
              key={r.id}
              type="button"
              aria-pressed={selected}
              disabled={walking}
              onClick={() => startFetch(r.id)}
              className={`group flex min-h-14 flex-col items-start rounded-2xl border px-5 py-3 text-left transition-colors disabled:cursor-wait ${
                selected
                  ? 'border-citron bg-citron/10 text-ivory'
                  : 'border-white/15 bg-night/60 text-ivory hover:border-violet-soft hover:bg-night3'
              }`}
            >
              <span className="flex w-full items-center justify-between gap-3 text-base font-semibold sm:text-lg">
                {r.button}
                <span aria-hidden="true" className="text-citron transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
              <span className="text-sm text-ivory/70">{r.blurb}</span>
            </button>
          );
        })}
      </div>

      <div aria-live="polite" className="mt-4 min-h-6 text-sm text-ivory/85">
        {walking && destination && (
          <div className="flex flex-wrap items-center gap-3">
            <span>Milo is heading to {destination.shortTitle}…</span>
            <button
              type="button"
              onClick={skipFetch}
              className="min-h-11 rounded-full bg-citron px-4 text-sm font-semibold text-ink"
            >
              Skip to the case study
            </button>
            <button
              type="button"
              onClick={cancelFetch}
              className="min-h-11 rounded-full border border-ivory/40 px-4 text-sm font-medium text-ivory"
            >
              Stay here
            </button>
          </div>
        )}
        {!walking && destination && <span>Milo's pick for you: {destination.title}.</span>}
      </div>
      <p className="mt-1 text-xs text-ivory/60">All four projects are listed below if you would rather choose directly.</p>
    </div>
  );
}
