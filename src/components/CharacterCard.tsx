import React, { useState, useEffect } from 'react';

interface CharacterCardProps {
  onExploreProjects?: () => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ onExploreProjects }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const xPercent = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const yPercent = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1

      // Gentle 3D perspective tilt
      setRotateX(-yPercent * 12);
      setRotateY(xPercent * 16);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="hidden lg:block absolute right-8 xl:right-16 top-1/2 -translate-y-1/2 z-10 select-none pointer-events-auto"
      style={{ perspective: '1200px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative w-[300px] xl:w-[340px] rounded-2xl p-4 bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Glow halo */}
        <div
          className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-red-500/20 via-white/10 to-blue-500/20 opacity-50 blur-lg pointer-events-none transition-opacity duration-300"
          style={{ opacity: isHovered ? 0.8 : 0.4 }}
        />

        {/* Character Portrait with HUD Frame */}
        <div className="relative rounded-xl overflow-hidden aspect-[3/4] bg-neutral-900 border border-white/10">
          <img
            src="/assets/aniketh_character.jpg"
            alt="Aniketh K — AI Systems Character"
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out"
            style={{
              transform: isHovered ? 'scale(1.04)' : 'scale(1)',
            }}
          />

          {/* Cyber scanline overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-black/60 pointer-events-none" />

          {/* Hologram status indicator */}
          <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[11px] font-mono tracking-wider text-neutral-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AGENT 01 · ACTIVE
          </div>

          <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-neutral-400">
            3D SYNC
          </div>

          {/* Bottom badge overlay */}
          <div className="absolute bottom-3 inset-x-3 p-3 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[14px] font-semibold text-white tracking-tight">
                Aniketh K.
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                UoA AI Lab
              </span>
            </div>
            <p className="text-[12px] text-neutral-300 leading-snug line-clamp-2">
              Building RAG intelligence & scalable neural architectures.
            </p>
          </div>
        </div>

        {/* Action button inside card */}
        <div className="mt-3 flex items-center justify-between text-xs text-neutral-300">
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-400">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Mouse Scrub Linked
          </span>
          <button
            type="button"
            onClick={onExploreProjects}
            className="px-3 py-1 rounded-full bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 text-[12px] transition-colors duration-200"
          >
            Explore Work ↓
          </button>
        </div>
      </div>
    </div>
  );
};
