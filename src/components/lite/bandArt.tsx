import type { ReactNode } from 'react';

/**
 * Flat illustrations for the two big phone stages (the hero and the contact landing). They share a platform,
 * column and floating blocks with the 3D scene. Milo is not drawn here: he is one continuous sprite (RailMilo)
 * that stands in the hero stage, shrinks onto the rail while you read, and returns to rest on the bed.
 * Drawn in a 360x180 box that scales to the stage's width.
 */

const C = {
  night: '#111426',
  stair: '#3A3F6E',
  top: '#4B507C',
  column: '#1C2043',
  violet: '#7568FF',
  citron: '#D9F477',
  ivory: '#F6F0E6',
  peach: '#FF9678',
};

function Platform() {
  return (
    <>
      <rect x="150" y="0" width="34" height="180" fill={C.column} />
      <rect x="150" y="62" width="34" height="3" fill={C.violet} opacity="0.8" />
      <path d="M-10 150 L370 150 L370 190 L-10 190 Z" fill={C.stair} />
      <path d="M-10 150 L370 150 L370 156 L-10 156 Z" fill={C.top} />
      <rect x="-10" y="150" width="380" height="2.5" fill={C.violet} />
    </>
  );
}

function Blocks() {
  return (
    <g fill="#20244A">
      <rect x="22" y="26" width="34" height="14" rx="2" />
      <rect x="300" y="18" width="30" height="22" rx="2" />
      <rect x="258" y="60" width="18" height="9" rx="2" />
    </g>
  );
}

export function BandArt({ landing, children }: { landing: 0 | 4; children?: ReactNode }) {
  return (
    <svg viewBox="0 0 360 180" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`sky-${landing}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#181C36" />
          <stop offset="1" stopColor="#222750" />
        </linearGradient>
        <radialGradient id={`glow-${landing}`} cx="0.5" cy="0" r="0.8">
          <stop offset="0" stopColor={C.ivory} stopOpacity="0.16" />
          <stop offset="1" stopColor={C.ivory} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="360" height="180" fill={`url(#sky-${landing})`} />
      <Blocks />
      <Platform />
      <path d="M60 0 L300 0 L360 150 L0 150 Z" fill={`url(#glow-${landing})`} />
      {landing === 4 && (
        <g>
          <ellipse cx="200" cy="150" rx="46" ry="10" fill={C.peach} />
          <ellipse cx="200" cy="146" rx="34" ry="6" fill={C.ivory} />
          <g className="bone">
            <rect x="268" y="104" width="30" height="7" rx="3.5" fill={C.ivory} />
            <circle cx="268" cy="104" r="5" fill={C.ivory} />
            <circle cx="268" cy="111" r="5" fill={C.ivory} />
            <circle cx="298" cy="104" r="5" fill={C.ivory} />
            <circle cx="298" cy="111" r="5" fill={C.ivory} />
          </g>
        </g>
      )}
      {children}
    </svg>
  );
}
