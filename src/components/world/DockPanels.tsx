import { BASIS_LABEL, IMAC_REGIONS, JOURNEY, TRANSACTIONS, TX_BAND, TX_CATEGORIES } from '../../data/artifacts';
import { getProjectById } from '../../data/projects';
import { world, useWorld } from '../../world/store';

/**
 * The HTML half of inspection. The 3D scene shows the thing taken apart; these panels say what each part is.
 * Both read and write the same `focus` in the world store, so selecting a chip lifts the part in the scene and
 * clicking the part in the scene selects the chip. All the explanatory text lives here, as normal page content.
 */

const setFocus = (id: string | null) => world.set({ focus: id });
const toggle = (focus: string | null, id: string) => setFocus(focus === id ? null : id);

function Chips({ items, focus, label }: { items: { id: string; label: string; n?: string }[]; focus: string | null; label: string }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label={label}>
      {items.map((it) => (
        <li key={it.id}>
          <button type="button" className="chip" aria-pressed={focus === it.id} onClick={() => toggle(focus, it.id)}>
            {it.n && <span className="font-mono text-xs">{it.n}</span>} {it.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function ImacPanel() {
  const focus = useWorld((s) => s.focus);
  const steps = getProjectById('imac-advisor')?.diagrams?.[0]?.steps ?? [];
  const region = IMAC_REGIONS.find((r) => r.id === focus) ?? null;
  const pickStage = (i: number) => {
    const r = IMAC_REGIONS.find((x) => x.stages.includes(i));
    if (r) setFocus(r.id);
  };
  return (
    <div className="space-y-4">
      <p className="label">The real interface, taken apart. Select a part, or a layer in the scene.</p>
      <Chips label="Regions" focus={focus} items={IMAC_REGIONS.map((r) => ({ id: r.id, label: r.label, n: String(r.n) }))} />
      <div aria-live="polite" className="note min-h-[5.5rem]">
        {region ? (
          <div key={region.id} className="swap">
            <p className="label">{BASIS_LABEL[region.basis]}</p>
            <p className="mt-1 text-lg font-semibold tracking-tight">{region.label}</p>
            <p className="mt-1 text-muted">{region.note}</p>
          </div>
        ) : (
          <p className="text-muted">Four real layers: the framing, the question, the answer and the evidence. Each comes from a different stage of the pipeline.</p>
        )}
      </div>
      <div>
        <p className="label mb-2">The documented flow</p>
        <ol className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
          {steps.map((s, i) => {
            const on = region?.stages.includes(i);
            return (
              <li key={s.label}>
                <button
                  type="button"
                  aria-label={`${s.label}: ${s.detail}`}
                  onClick={() => pickStage(i)}
                  className={`min-h-12 w-full rounded-[4px] border px-2 text-left text-sm transition-colors ${on ? 'border-soda bg-soda' : 'border-line hover:border-blueberry'}`}
                >
                  <span className="font-mono text-[0.7rem] opacity-70">{String(i + 1).padStart(2, '0')}</span>
                  <span className="block font-semibold leading-tight">{s.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export function FitPanel() {
  const focus = useWorld((s) => s.focus);
  const used = useWorld((s) => s.fitUsed);
  const confirmed = useWorld((s) => s.fitConfirmed);
  const rows = getProjectById('fit-check')!.example!.rows;
  const idx = rows.findIndex((_, i) => `req-${i}` === focus);
  const row = idx >= 0 ? rows[idx] : null;
  const summary = rows.flatMap((r, i) => {
    const id = `req-${i}`;
    if (r.state === 'Direct' && used[id]) return [{ text: r.requirement, tag: 'retrieved from profile' }];
    if (r.state === 'Related' && used[id]) return [{ text: `Adjacent experience: ${r.evidence.replace(/^"|"$/g, '')}`, tag: 'retrieved, not a claim of the skill' }];
    if (r.state === 'Needs confirmation' && confirmed[id]) return [{ text: r.requirement, tag: 'confirmed by you' }];
    return [];
  });
  return (
    <div className="space-y-4">
      <p className="label">Synthetic profile. Select a requirement, or its slab in the scene.</p>
      <Chips label="Requirements" focus={focus} items={rows.map((r, i) => ({ id: `req-${i}`, label: r.requirement, n: String(i + 1) }))} />
      <div aria-live="polite" className="note min-h-[6rem]">
        {row && focus ? (
          <div key={focus} className="swap">
            <p className="label">{row.state}</p>
            <p className="mt-1 text-muted">{row.explanation}</p>
            {row.state === 'Not found' ? (
              <p className="mt-2 text-sm">Nothing to use. It stays out unless evidence is added.</p>
            ) : (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {row.state === 'Needs confirmation' && <span className="w-full text-sm font-medium">Asks: “{row.question}”</span>}
                <button
                  type="button"
                  className="chip"
                  aria-pressed={row.state === 'Needs confirmation' ? !!confirmed[focus] : !!used[focus]}
                  onClick={() =>
                    row.state === 'Needs confirmation'
                      ? world.set({ fitConfirmed: { ...confirmed, [focus]: !confirmed[focus] } })
                      : world.set({ fitUsed: { ...used, [focus]: !used[focus] } })
                  }
                >
                  {row.state === 'Needs confirmation' ? (confirmed[focus] ? 'Confirmed by you' : 'Yes, confirm this') : used[focus] ? 'In the summary' : 'Use in the summary'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted">Solid thread: direct. Dashed: related. Dotted: needs you. No thread: not found.</p>
        )}
      </div>
      <div className="surface p-3">
        <p className="label">Application summary, built live</p>
        {summary.length === 0 ? (
          <p className="mt-1 text-sm">Empty. Nothing has been used or confirmed yet.</p>
        ) : (
          <ul className="mt-1 space-y-1">
            {summary.map((s) => (
              <li key={s.text} className="swap text-sm">
                <span className="font-medium">{s.text}</span> <span className="label">· {s.tag}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-muted">
          {rows.length - summary.length} of {rows.length} requirements are not in the summary, and nothing unsupported fills the gap.
        </p>
      </div>
    </div>
  );
}

export function TriagePanel() {
  const focus = useWorld((s) => s.focus);
  const decisions = useWorld((s) => s.txDecisions);
  const tx = TRANSACTIONS.find((t) => t.id === focus) ?? null;
  const decide = (id: string, category: string) => world.set({ txDecisions: { ...decisions, [id]: category } });
  const waiting = TRANSACTIONS.filter((t) => t.band !== 'familiar' && !decisions[t.id]).length;
  return (
    <div className="space-y-4">
      <p className="label">Invented transactions. Select one, or its slab in the scene.</p>
      <Chips label="Transactions" focus={focus} items={TRANSACTIONS.map((t, i) => ({ id: t.id, label: t.description, n: String(i + 1) }))} />
      <div aria-live="polite" className="note min-h-[6.5rem]">
        {tx ? (
          <div key={tx.id} className="swap space-y-2">
            <p className="text-muted">{tx.match}</p>
            <p className="text-sm">
              <span className="font-semibold">{TX_BAND[tx.band].label}.</span> {TX_BAND[tx.band].route}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {tx.suggestion && (
                <button type="button" className="chip" aria-pressed={decisions[tx.id] === tx.suggestion} onClick={() => decide(tx.id, tx.suggestion!)}>
                  {tx.band === 'familiar' ? 'Accept' : 'Confirm'} “{tx.suggestion}”
                </button>
              )}
              <label className="flex items-center gap-2 text-sm">
                <span className="label">{tx.suggestion ? 'Or correct to' : 'Choose'}</span>
                <select
                  className="min-h-10 rounded-[4px] border border-line bg-paper px-2"
                  value={decisions[tx.id] && decisions[tx.id] !== tx.suggestion ? decisions[tx.id] : ''}
                  onChange={(e) => e.target.value && decide(tx.id, e.target.value)}
                >
                  <option value="">Select…</option>
                  {TX_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ) : (
          <p className="text-muted">The routine ones are quick; the unclear ones come to a person. {waiting} of {TRANSACTIONS.length} are waiting for a reviewer.</p>
        )}
      </div>
    </div>
  );
}

export function TinyPanel() {
  const focus = useWorld((s) => s.focus);
  const step = JOURNEY.find((s) => s.id === focus) ?? JOURNEY[0];
  return (
    <div className="space-y-4">
      <p className="label">Real captures of the running prototype. Select a step, or a screen in the scene.</p>
      <Chips label="Steps" focus={step.id} items={JOURNEY.map((s, i) => ({ id: s.id, label: s.label, n: String(i + 1) }))} />
      <div aria-live="polite" className="note min-h-[5.5rem]">
        <div key={step.id} className="swap">
          <ul className="flex flex-wrap gap-2" aria-label="What this is">
            {step.tags.map((t) => (
              <li key={t.text} className={`label rounded-full px-2.5 py-0.5 ${t.kind === 'implemented' ? 'bg-blueberry !text-canvas' : t.kind === 'simulated' ? 'border border-soda !text-blueberry' : 'border border-line !text-blueberry'}`}>
                {t.text}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-muted">{step.note}</p>
        </div>
      </div>
    </div>
  );
}

export function InspectionPanel({ projectId }: { projectId: string }) {
  switch (projectId) {
    case 'imac-advisor':
      return <ImacPanel />;
    case 'fit-check':
      return <FitPanel />;
    case 'transaction-coding':
      return <TriagePanel />;
    default:
      return <TinyPanel />;
  }
}
