import { DEMO_SIZE } from './flows';

/**
 * The IMAC Advisor demo. The question, the answer, the sources and the scores are the text visible in the project's
 * real screenshot; only the sequence of steps (and the processing stages, which come from the project README) is
 * recreated. Rendered at any step on a fixed 1280x800 canvas so every frame has the same layout.
 */

const QUESTION = 'What is the catch-up schedule and dose interval for the Gardasil 9 (HPV) vaccine for an immunocompetent 18-year-old';
const PARAGRAPH =
  'For an immunocompetent 18-year-old requiring catch-up vaccination with Gardasil 9 (HPV vaccine), a three-dose schedule is required. This schedule applies to individuals who start the series at age 15 or older, or who are immunocompromised at any age. The doses are administered at 0, 2, and 6 months.';
const POINTS: [string, string][] = [
  ['Vaccine:', 'Gardasil 9 (HPV vaccine)'],
  ['Age:', '18 years (immunocompetent)'],
  ['Schedule:', 'Three-dose schedule'],
  ['Dose Intervals:', 'Doses at 0, 2, and 6 months'],
  ['Funding:', 'Gardasil 9 is funded on the NZ National Schedule for individuals up to and including age 26 years who have not completed the series.'],
];
const SOURCES = [
  {
    id: 'IMAC-CPN-10',
    score: '85% Match',
    title: 'IMAC Clinical Practice Note: HPV Catch-up Programme',
    section: 'Section 10: HPV vaccine catch-up for older adolescents',
    excerpt:
      '“Gardasil 9 (HPV vaccine) is funded on the NZ National Schedule for individuals up to and including age 26 years who have not completed the series. For individuals aged 15–26 years (or those who are immunocompromised at any age), a three-dose schedule is required: doses at 0, 2, and 6 months. For immunocompetent individuals who started the series be…”',
  },
  {
    id: 'PHARMAC-SCHED-HPV',
    score: '84% Match',
    title: 'Pharmac Vaccine Schedule and Funding Criteria',
    section: 'Gardasil 9 (HPV) — Funded Criteria',
    excerpt:
      '“Gardasil 9 (nonavalent HPV vaccine) is funded for: females and males aged 9–26 years who have not completed the HPV vaccine series. The two-dose schedule (0 and 6 months) applies to immunocompetent individuals who start the series before their 15th birthday. A three-dose schedule (0, 2, and 6 months) applies to individuals who start at age 15 or ol…”',
    },
];

const STAGES = ['Redacting personal details', 'Classifying the question', 'Recalling candidate passages', 'Reranking with a cross-encoder', 'Checking the sources are strong enough'];

function Stages({ step }: { step: number }) {
  // Steps 3-7 walk through the five documented stages.
  const doneN = step === 3 ? 1 : step === 4 ? 3 : step === 5 ? 3 : step === 6 ? 4 : step >= 7 ? 5 : 0;
  const active = step === 3 ? 1 : step === 4 ? 2 : step === 5 ? 3 : step === 6 ? 3 : step === 7 ? 4 : -1;
  return (
    <div className="rounded-xl bg-white px-6 py-4 shadow-sm">
      <p className="text-[12px] font-semibold uppercase tracking-wider text-blueberry/55">Processing</p>
      <ol className="mt-2 grid grid-cols-5 gap-3">
        {STAGES.map((s, i) => {
          const done = i < doneN;
          const on = i === active && step < 7;
          return (
            <li key={s} className={`rounded-lg border px-3 py-2 text-[14px] leading-tight ${on ? 'border-soda bg-soda/10' : done ? 'border-blueberry/30 bg-blueberry/[0.04]' : 'border-blueberry/10 text-blueberry/40'}`}>
              <span className={`mb-1 block text-[12px] font-bold ${done ? 'text-blueberry' : on ? 'text-soda' : ''}`}>{done ? '✓' : on ? '…' : i + 1}</span>
              {s}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function ImacMock({ step }: { step: number }) {
  const typed = step === 0 ? '' : step === 1 ? QUESTION.slice(0, 46) : QUESTION;
  const searching = step >= 3;
  const showStages = step >= 3 && step <= 7;
  const showSources = step >= 6;
  const chars = step < 8 ? 0 : step === 8 ? 150 : PARAGRAPH.length;
  const showPoints = step >= 10;
  const showBadge = step >= 11;
  return (
    <div className="relative overflow-hidden bg-[#F2F5FB] font-sans text-blueberry" style={{ width: DEMO_SIZE.w, height: DEMO_SIZE.h }}>
      <div className="px-[90px] pt-8">
        <h2 className="text-[34px] font-semibold tracking-tight">Advisor Operations</h2>
        <p className="text-[16px] text-blueberry/65">IMAC Clinical Knowledge Retrieval System</p>
        <div className="mt-4 rounded-md border-l-[6px] border-[#0E6B66] bg-[#06203F] px-5 py-3 text-[14.5px] leading-snug text-white">
          <b>Proof of Concept:</b> This system assists clinical advisors by retrieving official guidelines. It does not replace clinical judgement. All
          recommendations must be verified against primary sources.
        </div>
        <div className="mt-4 flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex h-[46px] flex-1 items-center rounded-md bg-[#E8EEFB] px-4 text-[16px]">
            {typed ? (
              <span>
                {typed}
                {step <= 2 && <span className="ml-0.5 inline-block h-5 w-[2px] translate-y-1 bg-blueberry" />}
              </span>
            ) : (
              <span className="text-blueberry/45">Ask a clinical question…</span>
            )}
          </div>
          <div className={`rounded-md px-7 py-3 text-[15px] font-semibold text-white ${step === 3 ? 'bg-[#06203F]/80 ring-4 ring-soda/50' : 'bg-[#06203F]'}`}>{searching && step === 3 ? 'Searching…' : 'Search'}</div>
        </div>

        {showStages && (
          <div className="mt-4">
            <Stages step={step} />
          </div>
        )}

        <div className={`grid grid-cols-[1fr_400px] gap-6 ${showStages ? 'mt-4' : 'mt-5'}`}>
          <div className="rounded-xl bg-white p-6 shadow-sm" style={{ minHeight: showStages ? 250 : 480 }}>
            <div className="flex items-center justify-between border-b border-blueberry/10 pb-3">
              <h3 className="text-[22px] font-semibold">Clinical Summary</h3>
              <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-blueberry/60">
                Confidence:
                {showBadge ? (
                  <span className="rounded-full border border-[#1B9A5B]/40 bg-[#E2F6EA] px-3 py-1 text-[13px] normal-case tracking-normal text-[#0E6B3B]">High | 88%</span>
                ) : (
                  <span className="rounded-full border border-blueberry/15 px-3 py-1 text-[13px] normal-case tracking-normal text-blueberry/35">—</span>
                )}
              </div>
            </div>
            {chars === 0 ? (
              <p className="mt-4 text-[15.5px] italic text-blueberry/40">{step >= 7 ? 'Sources passed the check. Writing the answer from them…' : 'The answer will be written from the retrieved passages.'}</p>
            ) : (
              <p className="mt-4 text-[15.5px] leading-[1.7]">
                {PARAGRAPH.slice(0, chars)}
                {chars < PARAGRAPH.length && <span className="inline-block h-4 w-[2px] translate-y-0.5 bg-soda" />}
              </p>
            )}
            {showPoints && (
              <ul className="mt-3 space-y-1.5 text-[14.5px]">
                {POINTS.map(([k, v]) => (
                  <li key={k}>
                    <b>{k}</b> {v}
                  </li>
                ))}
              </ul>
            )}
            {showPoints && <p className="mt-3 text-[14.5px] font-medium">Advisor review required before clinical application.</p>}
          </div>

          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-blueberry/65">Source grounding</p>
            <div className="mt-2 space-y-3">
              {showSources ? (
                SOURCES.map((src) => (
                  <div key={src.id} className="rounded-xl border-l-[5px] border-[#0E6B66] bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-[#E8EEFB] px-2 py-0.5 font-mono text-[11px]">{src.id}</span>
                      <span className="text-[12.5px] font-semibold text-[#0E6B66]">{src.score}</span>
                    </div>
                    <p className="mt-2 text-[15px] font-semibold leading-snug">{src.title}</p>
                    <p className="text-[12.5px] text-blueberry/65">{src.section}</p>
                    <p className="mt-2 line-clamp-4 rounded-md bg-[#F1F4FA] p-2.5 text-[12px] leading-snug text-blueberry/65">{src.excerpt}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-blueberry/20 p-6 text-[14px] text-blueberry/45">{searching ? 'Retrieving…' : 'Sources will appear here.'}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
