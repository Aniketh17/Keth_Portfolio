import React, { useState, useEffect, useRef } from 'react';

interface HologramProjectorStageProps {
  onExploreProjects?: () => void;
  interactiveMode?: boolean;
  isNight?: boolean;
}

// AI / ML focused marquee items
const marqueeItems = [
  'RETRIEVAL-AUGMENTED GENERATION',
  'NEURAL INFORMATION RETRIEVAL',
  'LARGE LANGUAGE MODELS',
  'MACHINE LEARNING SYSTEMS',
  'COMPUTER VISION PIPELINES',
  'VECTOR DATABASES',
  'TRANSFORMER ARCHITECTURES',
  'AGENTIC AI SYSTEMS',
  'SEMANTIC SEARCH',
  'MLOPS & MODEL DEPLOYMENT',
];

// 50 AI and software words for the typewriter
const typewriterWords = [
  'Embeddings', 'Transformers', 'RAG', 'Fine-tuning', 'Inference',
  'PyTorch', 'Attention', 'Tokenization', 'LangChain', 'Hugging Face',
  'Vector Search', 'FAISS', 'FastAPI', 'Bi-Encoders', 'Cross-Encoders',
  'Reranking', 'Grounding', 'Hallucination Control', 'Chain of Thought', 'Few-Shot',
  'Prompt Engineering', 'Context Window', 'Semantic Similarity', 'RLHF', 'PEFT',
  'LoRA', 'Quantization', 'Distillation', 'Multimodal', 'GPT-4',
  'Claude', 'Gemini', 'OpenAI API', 'Langfuse', 'Weights & Biases',
  'MLflow', 'Docker', 'Kubernetes', 'Cloud Run', 'GitHub Actions',
  'React', 'TypeScript', 'Spring Boot', 'PostgreSQL', 'Redis',
  'REST APIs', 'Microservices', 'Event Queues', 'CI/CD', 'System Design',
];

// Web Audio tone for instant click feedback
const playTone = (type: 'mug' | 'avatar' | 'dial') => {
  try {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxClass) return;
    const ctx = new AudioCtxClass();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    if (type === 'mug') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now); osc.stop(now + 0.35);
    } else if (type === 'avatar') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now); osc.stop(now + 0.4);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now); osc.stop(now + 0.12);
    }
  } catch { /* graceful */ }
};

// Voice synthesis
const speakUtterance = (text: string, pitch = 1.0, rate = 1.05) => {
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.pitch = pitch;
    utter.rate = rate;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Alex'))
    );
    if (preferred) utter.voice = preferred;
    window.speechSynthesis.speak(utter);
  } catch { /* graceful */ }
};

// Typewriter component
const TypewriterWords: React.FC = () => {
  const [displayText, setDisplayText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = typewriterWords[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIndex < word.length) {
      timeout = setTimeout(() => setCharIndex((c) => c + 1), 75);
    } else if (!deleting && charIndex === word.length) {
      timeout = setTimeout(() => setDeleting(true), 1400);
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex((c) => c - 1), 40);
    } else if (deleting && charIndex === 0) {
      setDeleting(false);
      setWordIndex((i) => (i + 1) % typewriterWords.length);
    }

    setDisplayText(word.slice(0, charIndex));
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, wordIndex]);

  return (
    <span className="font-mono text-slate-500 text-[11px] sm:text-xs tracking-wider whitespace-nowrap overflow-hidden">
      {displayText}
      <span className="border-r-2 border-slate-400 ml-0.5 animate-pulse" style={{ height: '0.85em', display: 'inline-block' }} />
    </span>
  );
};

export const HologramProjectorStage: React.FC<HologramProjectorStageProps> = ({
  onExploreProjects,
  interactiveMode = true,
  isNight = true,
}) => {
  const [mousePos, setMousePos] = useState({ normX: 0, normY: 0 });
  const [activeTab, setActiveTab] = useState<'welcome' | 'research' | 'stack'>('welcome');
  const [dialAngle, setDialAngle] = useState(0);
  const [mugSpeech, setMugSpeech] = useState<string | null>(null);
  const [characterSpeech, setCharacterSpeech] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!interactiveMode) {
      setMousePos({ normX: 0, normY: 0 });
      return;
    }
    // Mouse parallax (desktop)
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      setMousePos({
        normX: (e.clientX / innerWidth - 0.5) * 2,
        normY: (e.clientY / innerHeight - 0.5) * 2,
      });
    };
    // Touch tilt (mobile) — same 3D effect on touch screens
    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches.length) return;
      const touch = e.touches[0];
      const { innerWidth, innerHeight } = window;
      setMousePos({
        normX: (touch.clientX / innerWidth - 0.5) * 2,
        normY: (touch.clientY / innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [interactiveMode]);

  const handleDialClick = () => {
    if (interactiveMode) playTone('dial');
    setDialAngle((prev) => prev + 90);
    const tabs: ('welcome' | 'research' | 'stack')[] = ['welcome', 'research', 'stack'];
    setActiveTab(tabs[(tabs.indexOf(activeTab) + 1) % tabs.length]);
  };

  const handleMugClick = () => {
    if (!interactiveMode) return;
    playTone('mug');
    const phrases = [
      'Running on coffee and curiosity!',
      'Training a new model. Send snacks.',
      'Fine-tuning cross-encoders right now.',
      'FastAPI routes are responding at 42ms.',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    setMugSpeech(phrase);
    speakUtterance(phrase.replace(/[^\w\s.,!'-]/gi, ''), 1.25, 1.05);
    setTimeout(() => setMugSpeech(null), 3500);
  };

  const handleCharacterClick = () => {
    if (!interactiveMode) return;
    playTone('avatar');
    const phrases = [
      'Hey there! Welcome to my AI portfolio.',
      'Check out the IMAC RAG system below.',
      'Master of AI at the University of Auckland.',
      'Let us build something smart together.',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    setCharacterSpeech(phrase);
    speakUtterance(phrase.replace(/[^\w\s.,!'-]/gi, ''), 0.95, 1.0);
    setTimeout(() => setCharacterSpeech(null), 3500);
  };

  const tiltX = interactiveMode ? -mousePos.normY * 6 : 0;
  const tiltY = interactiveMode ? mousePos.normX * 8 : 0;
  const eyeOffsetX = interactiveMode ? mousePos.normX * 3 : 0;
  const eyeOffsetY = interactiveMode ? mousePos.normY * 3 : 0;
  const marqueeDouble = [...marqueeItems, ...marqueeItems];

  const bgGradient = isNight
    ? 'linear-gradient(180deg, #090d16 0%, #1a1040 30%, #2d1b69 60%, #3b0764 100%)'
    : 'linear-gradient(180deg, #0ea5e9 0%, #6366f1 35%, #a855f7 70%, #ec4899 100%)';

  const animOn = interactiveMode;

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative h-screen w-full flex flex-col items-center overflow-hidden select-none"
      style={{
        perspective: '1300px',
        background: bgGradient,
        transition: 'background 0.8s ease-in-out',
        paddingTop: '72px', // clear fixed top navbar
        paddingBottom: '16px',
        gap: 0,
      }}
    >
      {/* CSS Keyframes */}
      <style>{`
        @keyframes marqueeLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeRight {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8) rotate(0deg); }
          50%       { opacity: 1; transform: scale(1.35) rotate(40deg); filter: drop-shadow(0 0 5px rgba(255,255,255,0.9)); }
        }
        @keyframes beamScan {
          0%, 100% { opacity: 0.55; }
          50%       { opacity: 0.95; }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-7px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.7; box-shadow: 0 0 8px #22d3ee; }
          50%       { opacity: 1;   box-shadow: 0 0 20px #38bdf8; }
        }
        @keyframes popInBubble {
          0%   { opacity: 0; transform: scale(0.85) translateY(6px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Marquee background text */}
      <div
        className="absolute top-1/2 -translate-y-1/2 left-0 w-full pointer-events-none overflow-hidden z-0"
        style={{ opacity: isNight ? 0.1 : 0.16 }}
        aria-hidden="true"
      >
        <div
          className="flex whitespace-nowrap mb-3"
          style={{ animation: animOn ? 'marqueeLeft 36s linear infinite' : 'none' }}
        >
          {marqueeDouble.map((item, i) => (
            <span
              key={`a-${i}`}
              className="font-black uppercase tracking-tighter text-transparent mr-10 shrink-0"
              style={{
                fontSize: 'clamp(2rem, 5.5vw, 5rem)',
                WebkitTextStroke: '2px rgba(255,255,255,0.8)',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {item} ·
            </span>
          ))}
        </div>
        <div
          className="flex whitespace-nowrap"
          style={{ animation: animOn ? 'marqueeRight 44s linear infinite' : 'none' }}
        >
          {[...marqueeItems].reverse().concat([...marqueeItems].reverse()).map((item, i) => (
            <span
              key={`b-${i}`}
              className="font-black uppercase tracking-tighter text-transparent mr-10 shrink-0"
              style={{
                fontSize: 'clamp(2rem, 5.5vw, 5rem)',
                WebkitTextStroke: '2px rgba(255,255,255,0.55)',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {item} ·
            </span>
          ))}
        </div>
      </div>

      {/* Clouds */}
      <div
        className="absolute top-16 -left-20 w-72 h-28 bg-white/20 rounded-full blur-3xl pointer-events-none"
        style={{
          animation: animOn ? 'floatSlow 8s ease-in-out infinite' : 'none',
          transform: `translateX(${mousePos.normX * 12}px)`,
        }}
      />
      <div
        className="absolute top-28 -right-20 w-80 h-32 bg-white/15 rounded-full blur-3xl pointer-events-none"
        style={{
          animation: animOn ? 'floatSlow 10s ease-in-out infinite' : 'none',
          animationDelay: '2s',
          transform: `translateX(${mousePos.normX * -14}px)`,
        }}
      />

      {/* Twinkling stars (night only, hidden on small screens to prevent overlapping text) */}
      {isNight && animOn && [
        { top: '8%', left: '3%', delay: '0s', size: '1.2rem' },
        { top: '14%', right: '3%', delay: '1.1s', size: '1.4rem' },
        { top: '28%', left: '4%', delay: '0.5s', size: '1rem' },
        { top: '24%', right: '4%', delay: '1.9s', size: '1.3rem' },
        { top: '42%', left: '5%', delay: '2.3s', size: '0.9rem' },
        { top: '38%', right: '5%', delay: '0.8s', size: '1.1rem' },
      ].map((s, i) => (
        <span
          key={i}
          className="hidden sm:block absolute pointer-events-none text-white/70 select-none z-0"
          style={{
            top: s.top,
            left: (s as { left?: string }).left,
            right: (s as { right?: string }).right,
            fontSize: s.size,
            animation: `twinkle 2.8s ease-in-out infinite`,
            animationDelay: s.delay,
          }}
          aria-hidden="true"
        >
          ✦
        </span>
      ))}

      {/* ── HEADER TEXT ── */}
      <div className="relative z-10 max-w-2xl text-center flex-shrink-0 px-4 mt-1 sm:mt-2 mb-2 sm:mb-4">
        <span className="font-serif italic text-white/90 text-base sm:text-xl block mb-0.5 drop-shadow">
          Hi, I am
        </span>
        <h1
          className="font-serif font-bold tracking-tight text-white drop-shadow-md mb-1 sm:mb-1.5"
          style={{ fontSize: 'clamp(2.2rem, 8vw, 4.2rem)', lineHeight: 1.05 }}
        >
          Aniketh
        </h1>
        <p className="font-sans text-xs sm:text-sm text-white/85 max-w-md mx-auto leading-relaxed drop-shadow-sm">
          An AI Engineer building intelligent retrieval systems, large language model pipelines, and full-stack platforms that ship to production.
        </p>
      </div>

      {/* ── 3D STAGE ── */}
      <div
        className="projector-stage relative z-10 flex flex-col items-center w-full max-w-3xl flex-1 justify-center px-4"
        style={{
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.18s ease-out',
        }}
      >
        {/* 1. Floating Hologram Screen */}
        <div
          className="relative rounded-2xl p-3 sm:p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.3),0_0_40px_rgba(255,255,255,0.35)]"
          style={{
            width: 'clamp(260px, 88vw, 500px)',
            transform: 'translateZ(50px)',
            transformStyle: 'preserve-3d',
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(24px)',
            border: '1.5px solid rgba(255,255,255,0.8)',
            borderRadius: '20px',
          }}
        >
          {/* Purple corner pins */}
          {['-top-2 -left-2', '-top-2 -right-2', '-bottom-2 -left-2', '-bottom-2 -right-2'].map((pos) => (
            <span
              key={pos}
              className={`absolute ${pos} w-4 h-4 rounded-md shadow-md`}
              style={{ background: '#7c3aed', border: '1.5px solid rgba(255,255,255,0.9)', zIndex: 2 }}
            />
          ))}

          <div className="flex items-start gap-3">
            {/* Left icon rail */}
            <div
              className="flex flex-col gap-1.5 p-1.5 rounded-xl border border-white/60 shadow-sm flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.6)' }}
            >
              {[
                { key: 'welcome', icon: '👋', color: '#7c3aed', label: 'Overview' },
                { key: 'research', icon: '🧠', color: '#0891b2', label: 'AI Research' },
                { key: 'stack', icon: '⚡', color: '#059669', label: 'Tech Stack' },
              ].map(({ key, icon, color, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (interactiveMode) playTone('dial');
                    setActiveTab(key as 'welcome' | 'research' | 'stack');
                  }}
                  title={label}
                  className="touch-target w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all cursor-pointer hover:scale-110 active:scale-95"
                  style={{
                    background: activeTab === key ? color : 'rgba(255,255,255,0.85)',
                    boxShadow: activeTab === key ? `0 4px 10px ${color}55` : 'none',
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>

            {/* Screen content */}
            <div className="flex-1 min-w-0 bg-white/95 rounded-xl p-2.5 sm:p-3 shadow-inner border border-white text-slate-800">
              {activeTab === 'welcome' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">AI Engineering Hub</span>
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-mono font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      Active
                    </span>
                  </div>
                  <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 mb-1">Hello, Visitor!</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-600 mb-2 leading-relaxed">
                    I build AI systems that work in production. From RAG pipelines and fine-tuned retrieval models to full-stack platforms and cloud microservices.
                  </p>
                  <div className="bg-slate-50 rounded-lg p-1.5 border border-slate-200 mb-2">
                    <div className="text-[9px] font-mono text-slate-400 font-semibold mb-0.5">CURRENT FOCUS</div>
                    <div className="text-[10px] font-medium text-slate-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block" />
                      Dual-Stage Retrieval Systems and Agentic AI
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onExploreProjects}
                    className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-violet-600 text-white text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer shadow hover:scale-105 active:scale-95"
                  >
                    View Featured Projects
                  </button>
                </div>
              )}

              {activeTab === 'research' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-cyan-700 font-bold">AI Research Areas</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[9px] font-mono font-bold">NLP and Retrieval</span>
                  </div>
                  <h3 className="font-display text-sm font-bold text-slate-900 mb-1.5">Neural Information Retrieval</h3>
                  <div className="grid grid-cols-2 gap-1 text-[9px] sm:text-[10px] font-mono">
                    {[
                      { label: 'Bi-Encoder Retrieval', color: 'bg-blue-50 border-blue-200 text-blue-900' },
                      { label: 'Cross-Encoder Reranking', color: 'bg-cyan-50 border-cyan-200 text-cyan-900' },
                      { label: 'RAG Pipelines', color: 'bg-violet-50 border-violet-200 text-violet-900' },
                      { label: 'LLM Fine-tuning', color: 'bg-pink-50 border-pink-200 text-pink-900' },
                      { label: 'Agentic Workflows', color: 'bg-amber-50 border-amber-200 text-amber-900' },
                      { label: 'Multimodal Systems', color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
                    ].map(({ label, color }) => (
                      <div key={label} className={`p-1 rounded border ${color} leading-tight font-medium`}>{label}</div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'stack' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-700 font-bold">Production Stack</span>
                    <span className="text-[9px] text-slate-500 font-mono font-bold">AI and Full-Stack</span>
                  </div>
                  <h3 className="font-display text-sm font-bold text-slate-900 mb-1.5">Tools and Frameworks</h3>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {['Python', 'PyTorch', 'FastAPI', 'LangChain', 'React', 'TypeScript', 'Docker', 'PostgreSQL', 'Spring Boot'].map((t) => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[9px] font-mono font-medium text-slate-700">{t}</span>
                    ))}
                  </div>
                  <a
                    href="/Aniketh_NZ_Resume.pdf"
                    download="Aniketh_NZ_Resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-semibold text-center transition-colors cursor-pointer shadow"
                  >
                    Download Resume (PDF)
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Hologram Projection Beam */}
        <div className="relative w-full flex flex-col items-center pointer-events-none z-10" style={{ marginTop: '-2px', marginBottom: '-2px' }}>
          <div
            style={{
              width: 'min(220px, 52vw)',
              height: 'clamp(32px, 6vw, 56px)',
              background: 'linear-gradient(to top, rgba(34,211,238,0.7) 0%, rgba(139,92,246,0.35) 50%, rgba(56,189,248,0.05) 100%)',
              clipPath: 'polygon(18% 0%, 82% 0%, 100% 100%, 0% 100%)',
              filter: 'blur(3px)',
              animation: animOn ? 'beamScan 3s ease-in-out infinite' : 'none',
            }}
          />
          <div
            className="absolute bottom-0"
            style={{
              width: 'min(110px, 28vw)',
              height: 'clamp(20px, 4vw, 36px)',
              background: 'linear-gradient(to top, rgba(255,255,255,0.75) 0%, rgba(34,211,238,0.4) 60%, transparent 100%)',
              clipPath: 'polygon(22% 0%, 78% 0%, 100% 100%, 0% 100%)',
              filter: 'blur(2px)',
            }}
          />
        </div>

        {/* 3. Purple Hologram Projector Slab */}
        <div
          className="relative z-20 flex-shrink-0 flex items-center justify-between"
          style={{
            width: 'clamp(240px, 90vw, 400px)',
            borderRadius: '22px',
            padding: 'clamp(8px, 2vw, 12px) clamp(12px, 4vw, 20px)',
            background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)',
            border: '2px solid rgba(255,255,255,0.75)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.4), inset 0 2px 6px rgba(255,255,255,0.9), 0 0 28px rgba(139,92,246,0.55)',
          }}
        >
          {/* Left indicator bar */}
          <div
            className="h-3 rounded-full flex items-center px-1 flex-shrink-0"
            style={{ width: '52px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.4)' }}
          >
            <span
              className="h-1.5 rounded-full flex-1"
              style={{
                background: '#22d3ee',
                boxShadow: '0 0 8px #22d3ee',
                animation: animOn ? 'pulseGlow 2.5s ease-in-out infinite' : 'none',
              }}
            />
          </div>

          {/* Center emitter lens */}
          <div className="flex flex-col items-center gap-0.5">
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: '76px',
                height: '14px',
                background: 'rgba(15,23,42,0.7)',
                border: '1px solid rgba(255,255,255,0.5)',
              }}
            >
              <span
                className="h-1.5 rounded-full"
                style={{
                  width: '48px',
                  background: '#67e8f9',
                  boxShadow: '0 0 10px #22d3ee, 0 0 22px #22d3ee',
                  animation: animOn ? 'pulseGlow 2s ease-in-out infinite' : 'none',
                }}
              />
            </div>
            <span className="text-[7px] font-mono tracking-widest text-white/80 uppercase font-semibold">HOLOGRAM EMITTER</span>
          </div>

          {/* Right orange dial */}
          <button
            type="button"
            onClick={handleDialClick}
            title="Click to cycle hologram mode"
            className="relative w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 hover:scale-110 cursor-pointer flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #fb923c, #f59e0b)',
              border: '2.5px solid rgba(255,255,255,0.95)',
              boxShadow: '0 4px 12px rgba(251,146,60,0.6), inset 0 2px 4px rgba(255,255,255,0.9)',
              transform: `rotate(${dialAngle}deg)`,
              transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            <span className="w-1 h-2.5 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {/* 4. White Curved Stage Podium */}
        <div
          className="relative flex-shrink-0 mt-2.5"
          style={{
            width: 'clamp(300px, 72vw, 540px)',
            borderRadius: '22px',
            padding: '10px 18px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(241,245,249,0.92) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(255,255,255,0.9)',
            boxShadow: '0 14px 36px rgba(0,0,0,0.18)',
            zIndex: 40, // keep podium above the 3D slab but below popups
          }}
        >
          <div className="flex items-center justify-between w-full relative">

            {/* LEFT: Coffee Mug */}
            <div
              onClick={handleMugClick}
              className="relative cursor-pointer group flex-shrink-0"
              title="Click me!"
              style={{ zIndex: 50 }}
            >
              {mugSpeech && (
                <div
                  className="speech-bubble absolute font-bold shadow-2xl"
                  style={{
                    bottom: 'calc(100% + 14px)',
                    left: '0px',
                    background: 'rgba(15, 23, 42, 0.96)',
                    color: '#f8fafc',
                    fontSize: '11px',
                    padding: '8px 12px',
                    borderRadius: '14px',
                    border: '1.5px solid rgba(255, 255, 255, 0.3)',
                    maxWidth: 'clamp(160px, 48vw, 220px)',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    zIndex: 1000,
                    transform: 'translateZ(100px)',
                    animation: 'popInBubble 0.22s ease-out forwards',
                    pointerEvents: 'none',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                  }}
                >
                  {mugSpeech}
                  <span
                    className="absolute left-4"
                    style={{
                      bottom: '-7px',
                      width: 0, height: 0,
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: '7px solid rgba(15, 23, 42, 0.96)',
                    }}
                  />
                </div>
              )}
              <svg width="42" height="50" viewBox="0 0 58 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg transition-transform group-hover:scale-110 group-active:scale-95">
                <rect x="4" y="18" width="42" height="46" rx="10" fill="url(#mugGH)" />
                <rect x="7" y="20" width="16" height="30" rx="6" fill="rgba(255,255,255,0.3)" />
                <ellipse cx="25" cy="19" rx="21" ry="5" fill="url(#rimGH)" />
                <ellipse cx="25" cy="19" rx="17" ry="3.5" fill="rgba(220,80,80,0.6)" />
                <path d="M46 28 C62 28 62 52 46 52" stroke="url(#handleGH)" strokeWidth="7" strokeLinecap="round" fill="none" />
                <path d="M46 31 C57 31 57 49 46 49" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <circle cx="18" cy="37" r="4" fill="#1e293b" />
                <circle cx="32" cy="37" r="4" fill="#1e293b" />
                <circle cx={18 + eyeOffsetX * 0.5} cy={37 + eyeOffsetY * 0.5} r="1.6" fill="white" />
                <circle cx={32 + eyeOffsetX * 0.5} cy={37 + eyeOffsetY * 0.5} r="1.6" fill="white" />
                <path d="M19 47 Q25 53 31 47" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                <path d="M16 14 Q17 9 16 5" stroke="rgba(255,255,255,0.85)" strokeWidth="2.2" strokeLinecap="round" fill="none" style={{ animation: animOn ? 'floatSlow 2s ease-in-out infinite' : 'none' }} />
                <path d="M25 12 Q26 7 25 2" stroke="rgba(255,255,255,0.75)" strokeWidth="2.2" strokeLinecap="round" fill="none" style={{ animation: animOn ? 'floatSlow 2.4s ease-in-out infinite' : 'none', animationDelay: '0.4s' }} />
                <path d="M34 14 Q35 9 34 5" stroke="rgba(255,255,255,0.85)" strokeWidth="2.2" strokeLinecap="round" fill="none" style={{ animation: animOn ? 'floatSlow 2.1s ease-in-out infinite' : 'none', animationDelay: '0.8s' }} />
                <defs>
                  <linearGradient id="mugGH" x1="4" y1="18" x2="46" y2="64" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#f87171" /><stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                  <linearGradient id="rimGH" x1="4" y1="14" x2="46" y2="24" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#fca5a5" /><stop offset="100%" stopColor="#f87171" />
                  </linearGradient>
                  <linearGradient id="handleGH" x1="46" y1="28" x2="62" y2="52" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#fca5a5" /><stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* CENTRE: Typewriter text + Green Orb */}
            <div className="flex-1 flex flex-col items-center justify-center gap-1 px-2 min-w-0 overflow-hidden">
              <TypewriterWords />
              <div
                className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #86efac 0%, #22c55e 50%, #15803d 100%)',
                  boxShadow: '0 3px 12px rgba(34,197,94,0.5), inset 0 1px 4px rgba(255,255,255,0.8)',
                }}
              />
            </div>

            {/* RIGHT: Avatar character */}
            <div
              onClick={handleCharacterClick}
              className="relative cursor-pointer flex-shrink-0"
              title="Click me!"
              style={{ zIndex: 50 }}
            >
              {characterSpeech && (
                <div
                  className="speech-bubble absolute font-semibold shadow-2xl"
                  style={{
                    bottom: 'calc(100% + 14px)',
                    right: '0px',
                    background: 'rgba(15, 23, 42, 0.96)',
                    color: '#f8fafc',
                    fontSize: '11px',
                    padding: '8px 12px',
                    borderRadius: '14px',
                    border: '1.5px solid rgba(255, 255, 255, 0.3)',
                    maxWidth: 'clamp(160px, 48vw, 220px)',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    zIndex: 1000,
                    transform: 'translateZ(100px)',
                    animation: 'popInBubble 0.22s ease-out forwards',
                    pointerEvents: 'none',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                  }}
                >
                  {characterSpeech}
                  <span
                    className="absolute right-4"
                    style={{
                      bottom: '-7px',
                      width: 0, height: 0,
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: '7px solid rgba(15, 23, 42, 0.96)',
                    }}
                  />
                </div>
              )}
              <div
                className="relative rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-neutral-900 group hover:scale-105 active:scale-95 transition-transform"
                style={{ width: '40px', height: '40px' }}
              >
                <img
                  src="./assets/character_claymation.png"
                  alt="AI Companion"
                  className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-110"
                />
                <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-400 border border-white animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator — visible on all screen sizes */}
      <div
        onClick={onExploreProjects}
        className="relative z-10 flex flex-col items-center gap-1 flex-shrink-0 pb-1 sm:pb-0.5 opacity-80 hover:opacity-100 active:opacity-100 transition-opacity cursor-pointer"
      >
        <span className="text-[10px] font-mono tracking-widest uppercase text-white font-bold drop-shadow">
          Scroll Down for Projects
        </span>
        <span
          className="text-white text-sm drop-shadow"
          style={{ animation: animOn ? 'floatSlow 1.8s ease-in-out infinite' : 'none' }}
        >
          ↓
        </span>
      </div>
    </section>
  );
};

export default HologramProjectorStage;
