import { useState } from 'react';
import { TRANSACTIONS, TX_BAND, TX_CATEGORIES } from '../../data/artifacts';
import { Stage, useFocus, type InspectorProps } from './shared';

type Decision = { category: string; by: 'accepted' | 'reviewer' };

/**
 * Transaction Coding, as a triage bench. Familiar patterns come with a suggestion that is quick to confirm;
 * uncertain ones are held, and a new merchant gets no guess at all. You play the reviewer. The transactions are
 * invented and confidence is shown as a plain-language band, not a number, because nothing here is a measured
 * accuracy.
 */
export function TriageInspector(props: InspectorProps) {
  const [focus, setFocus] = useFocus(props);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const tx = TRANSACTIONS.find((t) => t.id === focus) ?? null;
  const decide = (id: string, d: Decision) => setDecisions((m) => ({ ...m, [id]: d }));
  const waiting = TRANSACTIONS.filter((t) => t.band !== 'familiar' && !decisions[t.id]).length;

  return (
    <Stage
      title="Coding a batch of transactions"
      basis="synthetic"
      actions={
        <>
          {tx && (
            <button type="button" className="chip" onClick={() => setFocus(null)}>
              Reset
            </button>
          )}
          {Object.keys(decisions).length > 0 && (
            <button type="button" className="chip" onClick={() => setDecisions({})}>
              Clear decisions
            </button>
          )}
        </>
      }
    >
      <p className="mb-4 max-w-[62ch] text-sm text-canvas/80">
        Illustration on invented transactions, not the product interface. Select one to see how it is routed.
      </p>

      <ul className="divide-y divide-canvas/15 border-y border-canvas/15">
        {TRANSACTIONS.map((t) => {
          const d = decisions[t.id];
          const active = focus === t.id;
          return (
            <li key={t.id}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => setFocus(active ? null : t.id)}
                className="grid min-h-14 w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-0.5 px-2 py-2 text-left transition-colors hover:bg-canvas/5 aria-pressed:bg-canvas/10 sm:grid-cols-[1.3fr_1fr_auto]"
              >
                <span className="font-mono text-sm">{t.description}</span>
                <span className="hidden text-sm text-canvas/80 sm:block">{d ? d.category : (t.suggestion ?? 'No suggestion')}</span>
                <span className="label whitespace-nowrap">
                  {d ? (d.by === 'reviewer' ? 'Decided by you' : 'Accepted') : TX_BAND[t.band].label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div aria-live="polite" className="note mt-5 min-h-[9rem]">
        {tx ? (
          <div key={tx.id} className="swap">
            <ol className="grid gap-3 sm:grid-cols-3">
              <li>
                <p className="label">1 · Transaction</p>
                <p className="mt-1 font-mono text-sm">{tx.description}</p>
              </li>
              <li>
                <p className="label">2 · Pattern match</p>
                <p className="mt-1 text-sm text-canvas/85">{tx.match}</p>
              </li>
              <li>
                <p className="label">3 · Route</p>
                <p className="mt-1 text-sm">
                  <span className="font-semibold">{TX_BAND[tx.band].label}.</span> {TX_BAND[tx.band].route}
                </p>
              </li>
            </ol>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {tx.suggestion && (
                <button type="button" className="chip" aria-pressed={decisions[tx.id]?.category === tx.suggestion} onClick={() => decide(tx.id, { category: tx.suggestion!, by: 'accepted' })}>
                  {tx.band === 'familiar' ? `Accept “${tx.suggestion}”` : `Confirm “${tx.suggestion}”`}
                </button>
              )}
              <label className="flex items-center gap-2 text-sm">
                <span className="label">{tx.suggestion ? 'Or correct to' : 'Choose a category'}</span>
                <select
                  className="min-h-10 rounded-[4px] border border-canvas/35 bg-blueberry px-2 text-canvas"
                  value={decisions[tx.id]?.by === 'reviewer' ? decisions[tx.id].category : ''}
                  onChange={(e) => e.target.value && decide(tx.id, { category: e.target.value, by: 'reviewer' })}
                >
                  <option value="">Select…</option>
                  {TX_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ) : (
          <div className="swap">
            <p className="label">Overview</p>
            <p className="mt-1 text-lg font-semibold tracking-tight">The routine ones are quick. The unclear ones come to a person.</p>
            <p className="mt-1 max-w-[62ch] text-canvas/85">
              {waiting} of {TRANSACTIONS.length} are waiting for a reviewer. A confident-looking suggestion still isn’t treated as proof it is right.
            </p>
          </div>
        )}
      </div>
    </Stage>
  );
}
