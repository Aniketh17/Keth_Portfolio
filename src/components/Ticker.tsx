/** A strip of real facts from the résumé. Under reduced motion it stops scrolling and wraps instead. */
const ITEMS: [string, string][] = [
  ['Ito Master', 'freelance backend'],
  ['Eruna Technologies', 'junior developer'],
  ['WDCC × Figured', 'first place'],
  ['Beyonders Hackathon', 'first of 65+ teams'],
  ['Cicada Hackathon', 'second of 20+ teams'],
  ['University of Auckland', 'Master of AI'],
  ['Atria Institute', 'B.E. Computer Science'],
];

export function Ticker() {
  const row = (hidden: boolean) =>
    ITEMS.map(([a, b]) => (
      <span key={`${a}${hidden}`} className="ticker-item" aria-hidden={hidden || undefined}>
        <span className="font-medium">{a}</span>
        <span className="label">{b}</span>
      </span>
    ));
  return (
    <div className="ticker pointer-events-auto" role="group" aria-label="Where the work has landed">
      <div className="ticker-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
