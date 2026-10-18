import { DEMO_SIZE, TX_CATEGORIES, TX_ROWS, txState, type TxRow } from './flows';

const NAV = ['Dashboard', 'Transactions', 'Invoices', 'Reports', 'Settings'];

function Chip({ children, tone = 'solid', tag }: { children: React.ReactNode; tone?: 'solid' | 'ghost' | 'review'; tag?: string }) {
  const cls =
    tone === 'solid'
      ? 'bg-blueberry text-canvas'
      : tone === 'ghost'
        ? 'border border-dashed border-blueberry/50 text-blueberry/70'
        : 'bg-soda/20 text-blueberry';
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[15px] font-medium ${cls}`}>
      {children}
      {tag && <span className="rounded-full bg-canvas/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">{tag}</span>}
    </span>
  );
}

function Row({ r, step, lane }: { r: TxRow; step: number; lane: 'auto' | 'review' | 'none' }) {
  const s = txState(step);
  const coded = s.coded(r.id);
  const filling = !coded && r.id <= 6 && step >= 1 && step < 5 && r.id <= s.autoCount + 2;
  const category = r.category ?? (r.id === 9 ? 'Fencing & repairs' : (r.suggestion ?? ''));
  const isReview = !coded && s.flagged;
  const userDone = (r.id === 7 && s.confirmed7) || (r.id === 9 && s.confirmed9);
  return (
    <div
      className={`relative grid h-[54px] grid-cols-[90px_1fr_130px_300px_190px] items-center border-b border-blueberry/10 px-6 text-[16px] ${
        lane === 'review' ? 'bg-soda/[0.07]' : 'bg-white'
      }`}
    >
      {lane === 'review' && <span className="absolute inset-y-0 left-0 w-1 bg-soda" />}
      <span className="text-blueberry/60">{r.date}</span>
      <span className="font-medium">{r.merchant}</span>
      <span className="text-right tabular-nums">{r.amount}</span>
      <span className="pl-8">
        {coded ? (
          <Chip tag={userDone ? 'You' : 'Auto'}>{category}</Chip>
        ) : isReview ? (
          r.suggestion ? (
            <Chip tone="ghost">{r.suggestion}?</Chip>
          ) : step === 10 ? (
            <span className="inline-flex items-center gap-2 rounded-md border-2 border-blueberry bg-white px-3 py-1.5 text-[15px] font-medium">
              Fencing &amp; repairs <span className="text-soda">▾</span>
            </span>
          ) : (
            <span className="text-[15px] italic text-blueberry/50">No suggestion</span>
          )
        ) : filling ? (
          <span className="inline-block h-7 w-36 animate-pulse rounded-full bg-blueberry/10" />
        ) : (
          <span className="text-blueberry/35">—</span>
        )}
      </span>
      <span className="pl-4">
        {coded ? (
          <span className="text-[14px] text-blueberry/60">{userDone ? 'Confirmed' : 'Coded'}</span>
        ) : isReview ? (
          s.hover7 && r.id === 7 ? (
            <span className="inline-flex gap-2">
              <span className="rounded-md bg-blueberry px-3 py-1.5 text-[14px] font-semibold text-canvas">Confirm</span>
              <span className="rounded-md border border-blueberry/40 px-3 py-1.5 text-[14px]">Change</span>
            </span>
          ) : (
            <span className="rounded-full bg-soda px-3 py-1 text-[13px] font-semibold text-blueberry">Needs review</span>
          )
        ) : (
          <span className="text-[14px] text-blueberry/45">Uncoded</span>
        )}
      </span>
      {step === 10 && r.id === 9 && (
        <div className="absolute right-[170px] top-[48px] z-10 w-[260px] rounded-lg border border-blueberry/15 bg-white p-1.5 shadow-xl">
          {TX_CATEGORIES.slice(0, 6).concat(['Fencing & repairs']).map((c) => (
            <div key={c} className={`rounded px-3 py-1.5 text-[14px] ${c === 'Fencing & repairs' ? 'bg-blueberry text-canvas' : ''}`}>
              {c}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** The transaction-coding demo, rendered at any step. Fixed 1280x800 so every frame is identical in layout. */
export function TransactionMock({ step }: { step: number }) {
  const s = txState(step);
  const order = s.split ? [...s.codedIds, ...s.waitingIds] : TX_ROWS.map((r) => r.id);
  const rows = order.map((id) => TX_ROWS.find((r) => r.id === id)!);
  const codedCount = s.codedIds.length;
  const waitingCount = s.waitingIds.length;
  const toast = step === 7 || step === 11;
  return (
    <div className="relative overflow-hidden bg-[#F4F5F8] font-sans text-blueberry" style={{ width: DEMO_SIZE.w, height: DEMO_SIZE.h }}>
      <aside className="absolute inset-y-0 left-0 w-[220px] bg-blueberry p-6 text-canvas">
        <div className="mb-10 flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-soda font-bold text-blueberry">L</span>
          <span className="text-[20px] font-semibold">Ledger</span>
        </div>
        {NAV.map((n) => (
          <div key={n} className={`mb-1 rounded-lg px-3 py-2.5 text-[16px] ${n === 'Transactions' ? 'bg-canvas/15 font-semibold' : 'text-canvas/70'}`}>
            {n}
          </div>
        ))}
        <div className="absolute bottom-6 left-6 text-[13px] text-canvas/50">Hillside Farm Ltd</div>
      </aside>

      <main className="absolute inset-y-0 left-[220px] right-0 px-10 py-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[30px] font-semibold tracking-tight">Bank feed</h2>
            <p className="mt-1 text-[16px] text-blueberry/60">
              {s.flagged ? `${codedCount} coded · ${waitingCount} need review` : `${TX_ROWS.length} transactions to code`}
            </p>
          </div>
          <div className="relative">
            <div
              className={`inline-flex items-center gap-2.5 rounded-lg px-6 py-3 text-[17px] font-semibold ${
                step === 1 ? 'bg-blueberry/85 text-canvas ring-4 ring-soda/50' : 'bg-blueberry text-canvas'
              }`}
            >
              {step === 1 ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-canvas/40 border-t-canvas" /> : <span className="text-soda">✦</span>}
              {step === 1 ? 'Matching…' : step >= 5 ? 'Auto-categorise again' : 'Auto-categorise'}
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="mt-5 rounded-lg bg-white px-5 py-3 text-[15px] shadow-sm">
            <div className="mb-2 flex justify-between text-blueberry/70">
              <span>Matching 9 transactions against previously coded ones…</span>
              <span>4 of 9</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-blueberry/10">
              <div className="h-full w-[45%] rounded-full bg-soda" />
            </div>
          </div>
        )}

        <div className={`overflow-hidden rounded-xl border border-blueberry/10 bg-white shadow-sm ${step === 1 ? 'mt-4' : 'mt-6'}`}>
          <div className="grid h-[44px] grid-cols-[90px_1fr_130px_300px_190px] items-center border-b border-blueberry/10 bg-[#FAFAFC] px-6 text-[12px] font-semibold uppercase tracking-wider text-blueberry/55">
            <span>Date</span>
            <span>Description</span>
            <span className="text-right">Amount (NZD)</span>
            <span className="pl-8">Category</span>
            <span className="pl-4">Status</span>
          </div>
          {s.split && (
            <div className="flex h-[34px] items-center justify-between bg-blueberry/[0.04] px-6 text-[13px] font-semibold uppercase tracking-wider text-blueberry/70">
              <span>Categorised · {codedCount}</span>
            </div>
          )}
          {rows.map((r, i) => {
            const isFirstWaiting = s.split && i === codedCount;
            return (
              <div key={r.id}>
                {isFirstWaiting && (
                  <div className="flex h-[34px] items-center bg-soda/15 px-6 text-[13px] font-semibold uppercase tracking-wider">
                    <span>Needs review · {waitingCount}</span>
                  </div>
                )}
                <Row r={r} step={step} lane={s.split && i >= codedCount ? 'review' : 'none'} />
              </div>
            );
          })}
        </div>
      </main>

      {toast && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-blueberry px-7 py-3.5 text-[16px] font-medium text-canvas shadow-2xl">
          <span className="mr-2 text-soda">●</span>
          {step === 7 ? `${codedCount} coded automatically · ${waitingCount} waiting for you` : `${codedCount} coded · ${waitingCount} waiting`}
        </div>
      )}
    </div>
  );
}
