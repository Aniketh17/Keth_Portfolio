import React, { useState, useEffect } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';

interface HeroSectionProps {
  onPillClick?: (label: string) => void;
  onExploreProjects?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onPillClick,
  onExploreProjects,
}) => {
  const [pillsVisible, setPillsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // Typewriter hook tailored to portfolio ethos
  const typewriterText =
    'Building intelligent neural systems that learn and scalable software that endures. What are we building?';
  const { displayed, done } = useTypewriter(typewriterText, 36, 600);

  // Pills become visible 400ms after page load, independent of typewriter
  useEffect(() => {
    const timer = setTimeout(() => {
      setPillsVisible(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText('aniketh123ani@gmail.com');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const whitePills = [
    { label: 'Explore My Work', target: '#projects' },
    { label: 'View Tech Stack', target: '#skills' },
    { label: 'About My Journey', target: '#about' },
    { label: 'Download Resume', download: 'Aniketh_NZ_Resume.pdf' },
  ];

  const handlePillClick = (item: { label: string; target?: string; download?: string }) => {
    if (item.download) {
      const link = document.createElement('a');
      link.href = item.download;
      link.download = item.download;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    if (item.target) {
      const el = document.querySelector(item.target);
      el?.scrollIntoView({ behavior: 'smooth' });
    }

    if (onPillClick) {
      onPillClick(item.label);
    }
  };

  return (
    <section
      id="hero"
      className="relative w-full h-screen flex flex-col justify-end pb-12 md:justify-center md:pb-0 px-5 sm:px-8 md:px-10 overflow-hidden z-[1]"
    >
      {/* Content container: max-w-xl, relative z-10 */}
      <div className="max-w-xl relative z-10 text-left">
        {/* 1. Blurred intro label */}
        <div
          className="pointer-events-none select-none mb-5 sm:mb-6 text-white"
          style={{
            fontSize: 'clamp(18px, 4vw, 26px)',
            lineHeight: 1.3,
            fontWeight: 400,
            color: '#fff',
            filter: 'blur(4px)',
          }}
        >
          Hey there, I'm Aniketh Rao,
          <br />
          AI/ML Engineer &amp; Intelligent Systems Architect
        </div>

        {/* 2. Typewriter text */}
        <p
          className="text-white mb-5 sm:mb-6"
          style={{
            fontSize: 'clamp(18px, 4vw, 26px)',
            lineHeight: 1.35,
            fontWeight: 400,
            minHeight: '54px',
          }}
        >
          {displayed}
          {!done && (
            <span
              className="inline-block w-[2px] h-[1.1em] bg-white align-middle ml-[2px] animate-blink"
              aria-hidden="true"
            />
          )}
        </p>

        {/* 3. Action pill buttons */}
        <div
          className="flex flex-wrap gap-y-1 transition-all"
          style={{
            opacity: pillsVisible ? 1 : 0,
            transform: pillsVisible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}
        >
          {/* 4 white pill buttons */}
          {whitePills.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handlePillClick(item)}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer shadow-sm"
            >
              {item.label}
            </button>
          ))}

          {/* 1 outline pill button: Reach me: aniketh123ani@gmail.com */}
          <button
            type="button"
            onClick={handleCopyEmail}
            title="Click to copy email address"
            className="inline-flex items-center justify-center text-white bg-transparent border border-white rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-white hover:text-black transition-colors duration-200 cursor-pointer gap-2 sm:gap-3 group"
          >
            <span>
              Reach me:{' '}
              <span className="underline underline-offset-1">
                {copied ? 'Copied to clipboard!' : 'aniketh123ani@gmail.com'}
              </span>
            </span>
            {/* Inline SVG of two overlapping rectangles (12x12 copy icon) */}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="inline-block flex-shrink-0 group-hover:stroke-black stroke-white transition-colors"
              strokeWidth="1.2"
              aria-hidden="true"
            >
              <rect x="3.5" y="1" width="7" height="7.5" rx="1" />
              <rect
                x="1.5"
                y="3.5"
                width="7"
                height="7.5"
                rx="1"
                fill="currentColor"
                fillOpacity="0.2"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Down indicator */}
      <div
        onClick={onExploreProjects}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
      >
        <span className="text-[11px] font-mono tracking-widest uppercase text-white/70">
          Scroll for 3D Work Experience
        </span>
        <div className="w-4 h-7 border border-white/40 rounded-full flex justify-center pt-1">
          <div className="w-1 h-1.5 bg-white rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};
