/**
 * GRU's architecture as one SVG in the site's own colours. The same text is in the SVG's title and description,
 * so it reads the same for a screen reader.
 */
const BOX = 'fill-[var(--paper)] stroke-[var(--blueberry)]';

function Node({ x, y, w, h, title, sub, accent = false }: { x: number; y: number; w: number; h: number; title: string; sub?: string; accent?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} className={BOX} strokeWidth={accent ? 2 : 1.25} style={accent ? { fill: 'var(--canvas)' } : undefined} />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 3 : h / 2 + 5)} textAnchor="middle" className="fill-[var(--blueberry)]" fontSize={14} fontWeight={600}>
        {title}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 15} textAnchor="middle" className="fill-[var(--muted)]" fontSize={11.5}>
          {sub}
        </text>
      )}
    </g>
  );
}

export function GruArchitecture() {
  const line = { className: 'stroke-[var(--blueberry)]', strokeWidth: 1.5, fill: 'none', markerEnd: 'url(#gru-arrow)' } as const;
  return (
    <figure className="surface p-4 sm:p-6">
      <figcaption>
        <p className="label">Conceptual architecture, from the project brief</p>
        <p className="mt-1 text-lg font-semibold tracking-tight">How the pieces connect</p>
      </figcaption>
      <svg viewBox="0 0 760 340" role="img" aria-labelledby="gru-arch-t gru-arch-d" className="mt-4 block h-auto w-full">
        <title id="gru-arch-t">GRU architecture</title>
        <desc id="gru-arch-d">
          A phone web app (React PWA) talks to a Cloudflare Worker (Hono API, cron every 5 minutes). The Worker reads and writes a D1 database, reads Gmail
          through a read-only API, calls Workers AI for chat, speech-to-text and text-to-speech, and sends ntfy alerts.
        </desc>
        <defs>
          <marker id="gru-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" className="fill-[var(--blueberry)]" />
          </marker>
        </defs>
        <Node x={10} y={135} w={170} h={70} title="Phone PWA" sub="React, installable" />
        <Node x={250} y={115} w={200} h={110} title="Cloudflare Worker" sub="Hono API · cron every 5 min" accent />
        <Node x={560} y={10} w={190} h={60} title="D1 database" sub="SQLite" />
        <Node x={560} y={95} w={190} h={60} title="Gmail API" sub="read-only OAuth 2.0" />
        <Node x={560} y={180} w={190} h={60} title="Workers AI" sub="chat · Whisper · TTS" />
        <Node x={560} y={265} w={190} h={60} title="ntfy alerts" />
        <path d="M180 170H248" {...line} />
        <path d="M450 150C500 150 510 40 558 40" {...line} />
        <path d="M450 160C500 160 510 125 558 125" {...line} />
        <path d="M450 180C500 180 510 210 558 210" {...line} />
        <path d="M450 195C500 195 510 295 558 295" {...line} />
      </svg>
    </figure>
  );
}
