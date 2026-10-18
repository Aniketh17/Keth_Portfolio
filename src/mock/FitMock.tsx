import { DEMO_SIZE } from './flows';

const CLAIMS = [
  { text: 'Built and maintained REST APIs', state: 'Direct', mark: '✓', evidence: '“Designed and shipped REST endpoints for the booking service” · Northwind Logistics, 2023', why: 'The profile states the same activity the requirement asks for.' },
  { text: 'Experience with event-driven systems', state: 'Related', mark: '≈', evidence: '“Wrote nightly jobs that consumed order updates from a queue”', why: 'Working with queues is adjacent to event-driven design, but it does not establish it.' },
  { text: 'Worked with PostgreSQL in production', state: 'Needs confirmation', mark: '?', evidence: '“Wrote SQL for the reporting dashboards”', why: 'This shows SQL work, but not which engine it ran on or whether it was in production.' },
  { text: 'Experience deploying to AWS', state: 'Not found', mark: '–', evidence: 'No evidence in the profile', why: 'Left out of the summary unless you confirm relevant experience.' },
] as const;

const PROCESS = [
  'Reading the job listing',
  'Splitting requirements into individual claims',
  'Searching your profile for evidence',
  'Checking what the evidence does and does not show',
];

function Listing({ dim }: { dim: boolean }) {
  return (
    <div className={`px-[110px] pt-8 transition-opacity ${dim ? 'opacity-40' : ''}`}>
      <p className="text-[14px] font-semibold uppercase tracking-wider text-blueberry/55">Northwind Logistics · Auckland · Hybrid · Full-time</p>
      <h2 className="mt-2 text-[40px] font-semibold leading-tight tracking-tight">Backend Engineer</h2>
      <p className="mt-4 max-w-[760px] text-[18px] leading-relaxed text-blueberry/80">
        We move freight for small and mid-sized exporters, and our booking platform is the part customers see every day. You will help us make it faster to
        change and easier to trust.
      </p>
      <h3 className="mt-7 text-[20px] font-semibold">What you’ll do</h3>
      <ul className="mt-2 max-w-[760px] list-disc space-y-1.5 pl-6 text-[18px] text-blueberry/80 marker:text-soda">
        <li>Design and ship services behind the booking and tracking flows</li>
        <li>Work with the data team on reporting and reliability</li>
      </ul>
      <h3 className="mt-7 text-[20px] font-semibold">What we’re looking for</h3>
      <ul className="mt-2 max-w-[760px] list-disc space-y-1.5 pl-6 text-[18px] text-blueberry/80 marker:text-soda">
        <li>Built and maintained REST APIs</li>
        <li>Experience with event-driven systems</li>
        <li>Worked with PostgreSQL in production, and comfortable deploying to AWS</li>
      </ul>
    </div>
  );
}

function Chip({ state, mark }: { state: string; mark: string }) {
  const tone = state === 'Direct' ? 'bg-blueberry text-canvas' : state === 'Not found' ? 'border border-blueberry/40 text-blueberry/70' : state === 'Related' ? 'bg-blueberry/10 text-blueberry' : 'bg-soda text-blueberry';
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[13px] font-semibold ${tone}`}>
      <span>{mark}</span>
      {state}
    </span>
  );
}

function Process({ step }: { step: number }) {
  // Which of the four process lines is done, active or waiting at each step.
  const active = step === 1 ? 0 : step === 2 ? 0 : step === 3 ? 1 : step === 4 ? 2 : step === 5 ? 2 : step === 6 ? 3 : -1;
  const doneN = step === 2 ? 1 : step === 3 ? 2 : step === 4 ? 2 : step === 5 ? 3 : step === 6 ? 3 : step >= 7 ? 4 : 0;
  return (
    <div className="px-10 py-8">
      <div className="flex items-center justify-between">
        <h3 className="text-[26px] font-semibold tracking-tight">{step >= 7 ? 'Writing your report…' : 'Reviewing this listing'}</h3>
        <span className="text-[14px] text-blueberry/55">Nothing is scored. It shows evidence.</span>
      </div>
      <ol className="mt-6 space-y-3">
        {PROCESS.map((p, i) => {
          const isDone = i < doneN;
          const isActive = i === active;
          return (
            <li key={p} className={`flex items-center gap-4 rounded-lg px-4 py-3 text-[18px] ${isActive ? 'bg-white shadow-sm' : ''} ${!isDone && !isActive ? 'text-blueberry/40' : ''}`}>
              <span className={`grid h-7 w-7 place-items-center rounded-full text-[14px] font-bold ${isDone ? 'bg-blueberry text-canvas' : isActive ? 'border-2 border-soda' : 'border border-blueberry/25'}`}>
                {isDone ? '✓' : isActive ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-soda/30 border-t-soda" /> : ''}
              </span>
              <span className="font-medium">{p}</span>
              {i === 1 && isDone && <span className="ml-auto text-[14px] text-blueberry/60">4 claims from 3 bullets</span>}
              {i === 2 && isDone && <span className="ml-auto text-[14px] text-blueberry/60">evidence found for 3 of 4</span>}
            </li>
          );
        })}
      </ol>
      {step >= 3 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {CLAIMS.map((c, i) => (
            <span key={c.text} className={`rounded-full border px-4 py-1.5 text-[15px] ${step >= 5 && i < 3 ? 'border-blueberry bg-white' : 'border-blueberry/25 bg-white/60'}`}>
              {c.text}
              {step >= 5 && i < 3 ? <span className="ml-2 text-soda">●</span> : null}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Report({ step }: { step: number }) {
  const asked = step >= 9;
  const confirmed = step >= 10;
  const summary = step >= 11;
  return (
    <div className="px-10 py-7">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[26px] font-semibold tracking-tight">Your fit review</h3>
        <span className="text-[14px] text-blueberry/55">Backend Engineer · Northwind Logistics</span>
      </div>
      <p className="mt-1 text-[15px] text-blueberry/60">Four claims, checked against your profile. No score, just the evidence.</p>
      <div className="mt-4 space-y-2.5">
        {CLAIMS.map((c, i) => {
          const isConfirm = i === 2;
          const state = isConfirm && confirmed ? 'Confirmed' : c.state;
          const mark = isConfirm && confirmed ? '✓' : c.mark;
          return (
            <div key={c.text} className={`rounded-xl bg-white px-5 py-3 shadow-sm ${isConfirm && asked && !confirmed ? 'ring-2 ring-soda' : ''}`}>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[18px] font-semibold">{c.text}</span>
                <Chip state={state} mark={mark} />
              </div>
              <p className="mt-1 text-[14.5px] text-blueberry/70">
                <span className="font-medium text-blueberry/90">{isConfirm && confirmed ? 'Confirmed by you: PostgreSQL' : c.evidence}</span>
                {' · '}
                {isConfirm && confirmed ? 'Counts as confirmed because you said so.' : c.why}
              </p>
              {isConfirm && asked && !confirmed && (
                <div className="mt-2.5 flex items-center gap-3 rounded-lg bg-soda/15 px-4 py-2.5 text-[15px]">
                  <span className="font-semibold">Which database engine did those dashboards run on?</span>
                  <span className="ml-auto rounded-md border border-blueberry/30 bg-white px-4 py-1 text-blueberry/45">Type your answer</span>
                  <span className="rounded-md bg-blueberry px-3.5 py-1.5 text-[14px] font-semibold text-canvas">Confirm</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {summary && (
        <div className="mt-3 rounded-xl border-2 border-blueberry bg-white px-5 py-3">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-blueberry/60">Draft summary · only claims you used or confirmed</p>
          <p className="mt-1 text-[15px] leading-snug">
            Built and maintained REST APIs <span className="text-blueberry/50">(from profile)</span>. Adjacent experience with queue-driven jobs. SQL for reporting; PostgreSQL{' '}
            <span className="text-blueberry/50">(confirmed by you)</span>. AWS deployment is not claimed.
          </p>
        </div>
      )}
    </div>
  );
}

/** The Fit Check demo, rendered at any step. Fixed 1280x800 so every frame is identical in layout. */
export function FitMock({ step }: { step: number }) {
  const phase = step === 0 ? 'listing' : step <= 7 ? 'process' : 'report';
  return (
    <div className="relative overflow-hidden bg-[#F4F5F8] font-sans text-blueberry" style={{ width: DEMO_SIZE.w, height: DEMO_SIZE.h }}>
      <header className="flex h-[60px] items-center justify-between bg-blueberry px-10 text-canvas">
        <span className="flex items-center gap-3 text-[18px] font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-soda font-bold text-blueberry">J</span>
          Jobs
        </span>
        <span className="text-[14px] text-canvas/65">Signed in as Sam Rivera (fictional)</span>
      </header>

      <div className="relative h-[740px] overflow-hidden">
        {(phase === 'listing' || step === 1) && <Listing dim={step === 1} />}
        {phase === 'process' && step >= 2 && (
          <div className="absolute inset-x-[110px] top-6 rounded-2xl bg-[#F4F5F8]">
            <Process step={step} />
          </div>
        )}
        {step === 1 && (
          <div className="absolute inset-x-[110px] bottom-[90px] rounded-2xl bg-[#F4F5F8] shadow-2xl">
            <Process step={1} />
          </div>
        )}
        {phase === 'report' && <Report step={step} />}

        {(phase === 'listing' || step === 1) && (
          <div className="absolute inset-x-0 bottom-0 flex h-[84px] items-center justify-between border-t border-blueberry/10 bg-white px-[110px]">
            <p className="max-w-[560px] text-[15px] text-blueberry/65">We compare this listing with your profile and show the evidence. It does not score you or predict an outcome.</p>
            <span className={`rounded-lg px-8 py-3.5 text-[18px] font-semibold ${step === 1 ? 'bg-blueberry/80 text-canvas ring-4 ring-soda/50' : 'bg-blueberry text-canvas'}`}>
              Should I apply?
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
