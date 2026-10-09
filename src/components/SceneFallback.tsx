/**
 * Static stand-in for the 3D scene (no WebGL, context lost, or load failure):
 * a flat illustration of Milo on the stairs in the same palette, so the page
 * keeps its identity without the scene.
 */
export function SceneFallback() {
  const steps = Array.from({ length: 7 }, (_, i) => i);
  return (
    <svg
      viewBox="0 0 400 300"
      role="img"
      aria-label="Illustration of Milo, a Shiba Inu, sitting on a spiral staircase"
      className="absolute inset-0 h-full w-full lg:left-[28%] lg:w-[72%]"
      preserveAspectRatio="xMidYMid meet"
    >
      <rect width="400" height="300" fill="none" />
      <rect x="170" y="10" width="26" height="280" rx="4" fill="#1C2043" />
      {steps.map((i) => (
        <g key={i}>
          <rect x={60 + i * 36} y={90 + i * 28} width={150} height="16" rx="3" fill="#2A2F58" />
          <rect x={60 + i * 36} y={90 + i * 28} width={150} height="3" rx="1.5" fill="#7568FF" />
        </g>
      ))}
      {/* Milo, sitting on the third step */}
      <g transform="translate(150 118)">
        <ellipse cx="34" cy="48" rx="26" ry="5" fill="#000" opacity="0.25" />
        <path d="M10 44 C2 22 14 6 34 8 C54 10 62 28 54 46 Z" fill="#D9772F" />
        <path d="M24 46 C22 32 30 24 38 28 C46 32 46 42 44 46 Z" fill="#F5E8D0" />
        <circle cx="40" cy="12" r="15" fill="#D9772F" />
        <path d="M28 2 L26 -12 L38 -2 Z M52 2 L56 -12 L44 -2 Z" fill="#D9772F" />
        <ellipse cx="44" cy="17" rx="8" ry="6" fill="#F5E8D0" />
        <circle cx="35" cy="10" r="2.6" fill="#F2A33A" />
        <circle cx="46" cy="10" r="2.6" fill="#F2A33A" />
        <circle cx="35.6" cy="10.2" r="1.2" fill="#2A1A14" />
        <circle cx="46.6" cy="10.2" r="1.2" fill="#2A1A14" />
        <ellipse cx="47" cy="14" rx="2.4" ry="1.7" fill="#2A1A14" />
        <path d="M27 22 Q40 30 53 22" stroke="#1F6B73" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M8 36 C-6 30 -4 14 8 14" stroke="#D9772F" strokeWidth="7" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
