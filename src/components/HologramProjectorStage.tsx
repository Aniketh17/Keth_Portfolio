import React, { useState, useEffect, useRef } from 'react';

interface HologramProjectorStageProps {
  onExploreProjects?: () => void;
  interactiveMode?: boolean;
}

// Marquee text items — broad AI/ML & Engineering expertise
const marqueeItems = [
  'COMPUTER VISION',
  'NEURAL NETWORKS',
  'WORLD MODELS',
  'RETRIEVAL-AUGMENTED GENERATION',
  'DEEP LEARNING',
  'TRANSFORMERS',
  'REINFORCEMENT LEARNING',
  'MICROSERVICES',
  'FULL-STACK ENGINEERING',
  'DATA GOVERNANCE',
];

export const HologramProjectorStage: React.FC<HologramProjectorStageProps> = ({
  onExploreProjects,
  interactiveMode = true,
}) => {
  const [mousePos, setMousePos] = useState({ normX: 0, normY: 0 });
  const [activeTab, setActiveTab] = useState<'welcome' | 'research' | 'stack'>('welcome');
  const [dialAngle, setDialAngle] = useState(0);
  const [mugSpeech, setMugSpeech] = useState<string | null>(null);
  const [characterSpeech, setCharacterSpeech] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactiveMode) return;
      const { innerWidth, innerHeight } = window;
      setMousePos({
        normX: (e.clientX / innerWidth - 0.5) * 2,
        normY: (e.clientY / innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactiveMode]);

  const handleDialClick = () => {
    setDialAngle((prev) => prev + 90);
    const tabs: ('welcome' | 'research' | 'stack')[] = ['welcome', 'research', 'stack'];
    const nextIdx = (tabs.indexOf(activeTab) + 1) % tabs.length;
    setActiveTab(tabs[nextIdx]);
  };

  const handleMugClick = () => {
    const phrases = [
      'Fuelled by coffee & curiosity! ☕',
      'Currently: Cross-Encoder fine-tuning!',
      'FastAPI → sub-50ms inference!',
      'Vision models trained. Deploying. 🚀',
    ];
    setMugSpeech(phrases[Math.floor(Math.random() * phrases.length)]);
    setTimeout(() => setMugSpeech(null), 3000);
  };

  const handleCharacterClick = () => {
    const phrases = [
      'Welcome to my 3D workspace! 👋',
      'Check out the IMAC RAG system below!',
      "Master's in AI at UoA 🇳🇿",
      'Drop me a line at aniketh123ani@gmail.com!',
    ];
    setCharacterSpeech(phrases[Math.floor(Math.random() * phrases.length)]);
    setTimeout(() => setCharacterSpeech(null), 3000);
  };

  const tiltX = interactiveMode ? -mousePos.normY * 8 : 0;
  const tiltY = interactiveMode ? mousePos.normX * 10 : 0;
  const eyeOffsetX = mousePos.normX * 3;
  const eyeOffsetY = mousePos.normY * 3;

  // Double the marquee items for seamless looping
  const marqueeDouble = [...marqueeItems, ...marqueeItems];

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-screen w-full pt-20 pb-8 px-4 sm:px-8 flex flex-col items-center overflow-hidden select-none"
      style={{
        perspective: '1400px',
        background: 'linear-gradient(180deg, #1d4ed8 0%, #3b82f6 35%, #818cf8 65%, #f9a8d4 100%)',
      }}
    >
      {/* ─── Marquee Background Text ─── */}
      <div
        className="absolute top-1/2 -translate-y-1/2 left-0 w-full pointer-events-none overflow-hidden z-0"
        style={{ opacity: 0.15 }}
        aria-hidden="true"
      >
        {/* Row 1 — scrolls left */}
        <div
          className="flex whitespace-nowrap mb-4"
          style={{ animation: 'marqueeLeft 35s linear infinite' }}
        >
          {marqueeDouble.map((item, i) => (
            <span
              key={`a-${i}`}
              className="font-black uppercase tracking-tighter text-transparent mr-12 shrink-0"
              style={{
                fontSize: 'clamp(3rem, 8vw, 7rem)',
                WebkitTextStroke: '2px rgba(255,255,255,0.7)',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {item} ·
            </span>
          ))}
        </div>

        {/* Row 2 — scrolls right */}
        <div
          className="flex whitespace-nowrap"
          style={{ animation: 'marqueeRight 40s linear infinite' }}
        >
          {[...marqueeItems].reverse().concat([...marqueeItems].reverse()).map((item, i) => (
            <span
              key={`b-${i}`}
              className="font-black uppercase tracking-tighter text-transparent mr-12 shrink-0"
              style={{
                fontSize: 'clamp(3rem, 8vw, 7rem)',
                WebkitTextStroke: '2px rgba(255,255,255,0.5)',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {item} ·
            </span>
          ))}
        </div>
      </div>

      {/* ─── CSS for marquee animation ─── */}
      <style>{`
        @keyframes marqueeLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeRight {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>

      {/* ─── Floating Cloud Layers ─── */}
      <div
        className="absolute top-20 -left-24 w-80 h-36 bg-white/25 rounded-full blur-3xl pointer-events-none"
        style={{
          animation: 'floatSlow 7s ease-in-out infinite',
          transform: `translateX(${mousePos.normX * 12}px)`,
        }}
      />
      <div
        className="absolute top-36 -right-24 w-96 h-44 bg-white/20 rounded-full blur-3xl pointer-events-none"
        style={{
          animation: 'floatSlow 9s ease-in-out infinite',
          animationDelay: '2s',
          transform: `translateX(${mousePos.normX * -16}px)`,
        }}
      />
      <div className="absolute bottom-16 left-1/4 w-72 h-32 bg-pink-300/25 rounded-full blur-3xl pointer-events-none" />

      {/* ─── Stars ─── */}
      {[
        { top: '10%', left: '25%', delay: '0s', size: '1.2rem' },
        { top: '18%', right: '22%', delay: '1.5s', size: '1rem' },
        { top: '30%', left: '8%', delay: '0.8s', size: '1.4rem' },
        { top: '26%', right: '10%', delay: '2.2s', size: '0.9rem' },
      ].map((s, i) => (
        <span
          key={i}
          className="absolute pointer-events-none text-white"
          style={{
            top: s.top,
            left: (s as { left?: string }).left,
            right: (s as { right?: string }).right,
            fontSize: s.size,
            animation: `twinkle 3s ease-in-out infinite`,
            animationDelay: s.delay,
          }}
          aria-hidden="true"
        >
          ✦
        </span>
      ))}

      {/* ─── Header ─── */}
      <div className="relative z-10 max-w-3xl text-center mt-4 mb-8 flex-shrink-0">
        <span className="font-serif italic text-white/90 text-2xl sm:text-3xl block mb-1">
          Hi, I'm
        </span>
        <h1
          className="font-serif font-bold tracking-tight text-white drop-shadow-lg mb-3"
          style={{ fontSize: 'clamp(3.5rem, 10vw, 6rem)' }}
        >
          Aniketh
        </h1>
        <p className="font-sans text-sm sm:text-base text-white/90 max-w-xl mx-auto leading-relaxed">
          An AI/ML Engineer specialising in neural architectures, computer vision systems,
          retrieval-augmented generation, and production-grade intelligent software.
        </p>
      </div>

      {/* ─── 3D Stage ─── */}
      <div
        className="relative z-10 flex flex-col items-center w-full max-w-4xl flex-shrink-0"
        style={{
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.15s ease-out',
        }}
      >
        {/* Floating Hologram Screen */}
        <div
          className="relative mb-4 sm:mb-6 rounded-2xl p-4 sm:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.25),0_0_40px_rgba(255,255,255,0.35)]"
          style={{
            width: 'clamp(300px, 70vw, 560px)',
            transform: 'translateZ(70px)',
            transformStyle: 'preserve-3d',
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.6)',
            borderRadius: '20px',
          }}
        >
          {/* Purple corner clips */}
          {['-top-2 -left-2', '-top-2 -right-2', '-bottom-2 -left-2', '-bottom-2 -right-2'].map((pos) => (
            <span
              key={pos}
              className={`absolute ${pos} w-4 h-4 rounded-md shadow`}
              style={{ background: '#7c3aed' }}
            />
          ))}

          <div className="flex items-start gap-3 sm:gap-4">
            {/* Icon Rail */}
            <div className="flex flex-col gap-2 p-1.5 rounded-xl border border-white/50" style={{ background: 'rgba(255,255,255,0.5)' }}>
              {[
                { key: 'welcome', icon: '👋', color: '#7c3aed', label: 'Overview' },
                { key: 'research', icon: '🧠', color: '#0891b2', label: 'Research' },
                { key: 'stack', icon: '⚡', color: '#059669', label: 'Stack' },
              ].map(({ key, icon, color, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key as 'welcome' | 'research' | 'stack')}
                  title={label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all cursor-pointer hover:scale-110 active:scale-95"
                  style={{
                    background: activeTab === key ? color : 'rgba(255,255,255,0.8)',
                    boxShadow: activeTab === key ? `0 4px 12px ${color}60` : 'none',
                    transform: activeTab === key ? 'scale(1.05)' : '',
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>

            {/* Screen Content */}
            <div className="flex-1 min-w-0 bg-white/90 rounded-xl p-3 sm:p-4 shadow-inner border border-white text-slate-800">
              {activeTab === 'welcome' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">AI Systems Workspace</span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      Active
                    </span>
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 mb-1">
                    Hello There, Visitor 👋
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-600 mb-3 leading-relaxed">
                    I design and build intelligent systems — from neural information retrieval
                    and computer vision pipelines to scalable full-stack platforms.
                  </p>
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-200 mb-3">
                    <div className="text-[10px] font-mono text-slate-400 mb-1">CURRENT RESEARCH FOCUS</div>
                    <div className="text-[11px] font-medium text-slate-700 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                      Neural Retrieval & World Model Architectures · UoA AI Lab
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onExploreProjects}
                    className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-indigo-600 text-white text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer"
                  >
                    View Featured Projects →
                  </button>
                </div>
              )}

              {activeTab === 'research' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-700 font-bold">AI/ML Research Areas</span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-mono font-bold">Master's in AI</span>
                  </div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 mb-2">
                    Deep Learning & Intelligent Systems
                  </h3>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] sm:text-[11px] font-mono">
                    {[
                      { label: 'Computer Vision', color: 'bg-blue-50 border-blue-100 text-blue-900' },
                      { label: 'Retrieval-Augmented Generation', color: 'bg-cyan-50 border-cyan-100 text-cyan-900' },
                      { label: 'Neural Networks', color: 'bg-purple-50 border-purple-100 text-purple-900' },
                      { label: 'World Models', color: 'bg-pink-50 border-pink-100 text-pink-900' },
                      { label: 'Reinforcement Learning', color: 'bg-amber-50 border-amber-100 text-amber-900' },
                      { label: 'Transformer Architecture', color: 'bg-emerald-50 border-emerald-100 text-emerald-900' },
                    ].map(({ label, color }) => (
                      <div key={label} className={`p-1.5 rounded border ${color} leading-tight`}>{label}</div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'stack' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold">Core Technologies</span>
                    <span className="text-[10px] text-slate-400 font-mono">Full-Stack & ML</span>
                  </div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 mb-2">Production Stack</h3>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {['FastAPI', 'PyTorch', 'RAG', 'React', 'TypeScript', 'Spring Boot', 'Docker', 'Supabase'].map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] sm:text-[11px] font-mono text-slate-700">{t}</span>
                    ))}
                  </div>
                  <a
                    href="Aniketh_NZ_Resume.pdf"
                    download
                    className="block w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold text-center transition-colors cursor-pointer"
                  >
                    Download CV (PDF) ↗
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Volumetric Light Cone */}
        <div
          className="w-40 sm:w-52 h-10 pointer-events-none flex-shrink-0"
          style={{
            background: 'linear-gradient(to top, rgba(34,211,238,0.25), rgba(168,85,247,0.15), transparent)',
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
            filter: 'blur(4px)',
          }}
        />

        {/* Projector Console */}
        <div
          className="relative z-20 flex-shrink-0"
          style={{
            width: 'clamp(240px, 55vw, 360px)',
            borderRadius: '28px',
            padding: '14px 16px',
            background: 'linear-gradient(160deg, #c4b5fd 0%, #a78bfa 50%, #8b5cf6 100%)',
            border: '2px solid rgba(255,255,255,0.65)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.3), inset 0 2px 6px rgba(255,255,255,0.9)',
          }}
        >
          {/* Lens slot */}
          <div className="w-20 h-3.5 mx-auto rounded-full mb-3 flex items-center justify-center"
            style={{ background: 'rgba(15,23,42,0.55)', border: '1px solid rgba(255,255,255,0.35)' }}>
            <span
              className="w-10 h-1.5 rounded-full"
              style={{ background: '#67e8f9', boxShadow: '0 0 10px #22d3ee, 0 0 20px #22d3ee60', animation: 'pulseGlow 3s ease-in-out infinite' }}
            />
          </div>

          <div className="flex items-center justify-between px-1">
            {/* Cyan LED strip */}
            <div className="px-3 py-1.5 rounded-full flex items-center"
              style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.3)' }}>
              <span
                className="w-14 h-2 rounded-full"
                style={{ background: '#22d3ee', boxShadow: '0 0 8px #22d3ee', animation: 'pulse 2s ease-in-out infinite' }}
              />
            </div>

            {/* Peach rotary dial */}
            <button
              type="button"
              onClick={handleDialClick}
              title="Click to cycle hologram mode"
              className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 hover:scale-110 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #fb923c, #fbbf24)',
                border: '2px solid rgba(255,255,255,0.9)',
                boxShadow: '0 4px 12px rgba(251,146,60,0.5), inset 0 2px 4px rgba(255,255,255,0.8)',
                transform: `rotate(${dialAngle}deg)`,
                transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              <span className="w-1.5 h-3 rounded-full bg-white shadow" />
            </button>
          </div>
        </div>

        {/* ─── White Podium ─── */}
        <div
          className="relative flex-shrink-0"
          style={{
            width: 'clamp(320px, 80vw, 720px)',
            height: '90px',
            borderRadius: '24px 24px 0 0',
            background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 60%, #cbd5e1 100%)',
            border: '2px solid rgba(255,255,255,0.9)',
            borderBottom: 'none',
            boxShadow: '0 30px 60px rgba(0,0,0,0.22)',
            marginTop: '-20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 40px',
          }}
        >
          {/* ─── 3D Coffee Mug (SVG-based, CSS 3D illusion) ─── */}
          <div
            onClick={handleMugClick}
            className="relative cursor-pointer group"
            style={{ transform: 'translateY(-20px)', zIndex: 30 }}
            title="Click me!"
          >
            {/* Speech bubble — rendered ABOVE the podium, high z-index */}
            {mugSpeech && (
              <div
                className="absolute font-bold shadow-xl animate-bounce"
                style={{
                  bottom: 'calc(100% + 12px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'white',
                  color: '#1e293b',
                  fontSize: '11px',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  whiteSpace: 'nowrap',
                  zIndex: 100,
                  pointerEvents: 'none',
                }}
              >
                {mugSpeech}
                {/* Speech bubble tail */}
                <span
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{
                    bottom: '-8px',
                    width: 0,
                    height: 0,
                    borderLeft: '7px solid transparent',
                    borderRight: '7px solid transparent',
                    borderTop: '8px solid white',
                  }}
                />
              </div>
            )}

            {/* SVG-rendered cute 3D mug */}
            <svg
              width="58"
              height="72"
              viewBox="0 0 58 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-xl transition-transform group-hover:scale-110 group-active:scale-95"
            >
              {/* Mug body */}
              <rect x="4" y="18" width="42" height="46" rx="10" fill="url(#mugGrad)" />
              {/* Mug body highlight */}
              <rect x="7" y="20" width="16" height="30" rx="6" fill="rgba(255,255,255,0.25)" />
              {/* Mug rim (top ellipse gives 3D depth) */}
              <ellipse cx="25" cy="19" rx="21" ry="5" fill="url(#rimGrad)" />
              {/* Mug inner top (dark to show depth) */}
              <ellipse cx="25" cy="19" rx="17" ry="3.5" fill="rgba(220,80,80,0.6)" />
              {/* Handle - outer */}
              <path d="M46 28 C62 28 62 52 46 52" stroke="url(#handleGrad)" strokeWidth="7" strokeLinecap="round" fill="none" />
              {/* Handle - inner (gives roundness) */}
              <path d="M46 31 C57 31 57 49 46 49" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" fill="none" />

              {/* Eyes */}
              <circle cx="18" cy="37" r="4.5" fill="#1e293b" />
              <circle cx="32" cy="37" r="4.5" fill="#1e293b" />
              {/* Eye whites / pupils tracking cursor */}
              <circle
                cx={18 + eyeOffsetX * 0.6}
                cy={37 + eyeOffsetY * 0.6}
                r="1.8"
                fill="white"
              />
              <circle
                cx={32 + eyeOffsetX * 0.6}
                cy={37 + eyeOffsetY * 0.6}
                r="1.8"
                fill="white"
              />
              {/* Smile */}
              <path d="M18 47 Q25 53 32 47" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" fill="none" />

              {/* Steam wisps */}
              <path d="M16 14 Q17 9 16 5" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" fill="none" style={{ animation: 'floatSlow 2s ease-in-out infinite' }} />
              <path d="M25 12 Q26 7 25 2" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" fill="none" style={{ animation: 'floatSlow 2.5s ease-in-out infinite', animationDelay: '0.5s' }} />
              <path d="M34 14 Q35 9 34 5" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" fill="none" style={{ animation: 'floatSlow 2.2s ease-in-out infinite', animationDelay: '1s' }} />

              <defs>
                <linearGradient id="mugGrad" x1="4" y1="18" x2="46" y2="64" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
                <linearGradient id="rimGrad" x1="4" y1="14" x2="46" y2="24" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#fca5a5" />
                  <stop offset="100%" stopColor="#f87171" />
                </linearGradient>
                <linearGradient id="handleGrad" x1="46" y1="28" x2="62" y2="52" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#fca5a5" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* ─── Right Companions ─── */}
          <div
            onClick={handleCharacterClick}
            className="relative cursor-pointer flex items-center gap-3 hover:scale-105 active:scale-95 transition-transform"
            style={{ transform: 'translateY(-16px)', zIndex: 30 }}
            title="Click to interact!"
          >
            {characterSpeech && (
              <div
                className="absolute font-medium shadow-xl animate-bounce"
                style={{
                  bottom: 'calc(100% + 12px)',
                  right: 0,
                  background: '#0f172a',
                  color: 'white',
                  fontSize: '11px',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  whiteSpace: 'nowrap',
                  zIndex: 100,
                  pointerEvents: 'none',
                }}
              >
                {characterSpeech}
                <span
                  className="absolute right-4"
                  style={{
                    bottom: '-8px',
                    width: 0,
                    height: 0,
                    borderLeft: '7px solid transparent',
                    borderRight: '7px solid transparent',
                    borderTop: '8px solid #0f172a',
                  }}
                />
              </div>
            )}

            {/* Glossy Green Sphere */}
            <div
              className="rounded-full flex-shrink-0"
              style={{
                width: '38px',
                height: '38px',
                background: 'radial-gradient(circle at 35% 35%, #86efac, #22c55e 60%, #15803d)',
                boxShadow: 'inset -3px -3px 10px rgba(0,0,0,0.35), 0 8px 20px rgba(34,197,94,0.4)',
                border: '1.5px solid rgba(255,255,255,0.6)',
                transform: `translate(${mousePos.normX * -5}px, ${mousePos.normY * -4}px)`,
                transition: 'transform 0.1s ease-out',
              }}
            />

            {/* Character avatar */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-neutral-900 group"
              style={{ width: '60px', height: '60px' }}>
              <img
                src="/assets/character_claymation.png"
                alt="3D Companion Character"
                className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-110"
                style={{
                  transform: `scale(1.06) translate(${mousePos.normX * 2.5}px, ${mousePos.normY * 2}px)`,
                }}
              />
              <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Scroll Indicator ─── */}
      <div
        onClick={onExploreProjects}
        className="relative z-10 flex flex-col items-center gap-1.5 mt-5 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
      >
        <span className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase text-white font-bold">
          Scroll Down for Works &amp; Architecture
        </span>
        <span className="text-white text-base" style={{ animation: 'floatSlow 1.5s ease-in-out infinite' }}>↓</span>
      </div>
    </section>
  );
};
