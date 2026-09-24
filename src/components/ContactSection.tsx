import React, { useState } from 'react';

export const ContactSection: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="contact"
      className="relative min-h-screen py-20 sm:py-28 px-4 sm:px-8 md:px-12 flex flex-col justify-center items-center z-10 bg-slate-950 text-white"
    >
      <div className="relative z-10 max-w-4xl w-full text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono tracking-wider uppercase mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Direct Outreach
        </div>

        <h2 className="font-serif text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white mb-5 sm:mb-6">
          Let's build something exceptional.
        </h2>

        <p className="font-sans text-slate-300 text-sm sm:text-lg max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed">
          Open to AI/ML engineering roles, intelligent RAG systems research, and innovative full-stack collaborations.
        </p>

        {/* Contact Action CTAs — stacked full-width on mobile, row on sm+ */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 mb-10 sm:mb-12 w-full">
          {/* One-click email copy — truncated label on mobile */}
          <button
            type="button"
            onClick={() => copyToClipboard('aniketh123ani@gmail.com')}
            className="touch-target w-full sm:w-auto px-5 sm:px-6 py-3.5 rounded-full bg-white text-slate-900 font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2.5 shadow-xl cursor-pointer hover:scale-105 active:scale-95"
          >
            <span className="sm:hidden flex items-center justify-center gap-2">
              {copied ? (
                'Copied! 🎉'
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="flex-shrink-0"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  Copy Email
                </>
              )}
            </span>
            <span className="hidden sm:inline">{copied ? 'Copied to Clipboard! 🎉' : 'aniketh123ani@gmail.com'}</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              stroke="currentColor"
              strokeWidth="1.2"
              className="flex-shrink-0"
            >
              <rect x="3.5" y="1" width="7" height="7.5" rx="1" />
              <rect x="1.5" y="3.5" width="7" height="7.5" rx="1" fill="currentColor" fillOpacity="0.2" />
            </svg>
          </button>

          {/* Direct mailto */}
          <a
            href="mailto:aniketh123ani@gmail.com"
            className="touch-target w-full sm:w-auto px-5 sm:px-6 py-3.5 rounded-full bg-white/10 hover:bg-white hover:text-slate-900 border border-white/20 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            Send Direct Email
          </a>

          {/* Resume Download */}
          <a
            href="/Aniketh_NZ_Resume.pdf"
            download
            className="touch-target w-full sm:w-auto px-5 sm:px-6 py-3.5 rounded-full bg-white/10 hover:bg-white hover:text-slate-900 border border-white/20 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Resume (PDF)
          </a>
        </div>

        {/* Social Links */}
        <div className="flex items-center justify-center gap-5 sm:gap-8 text-slate-400 font-mono text-sm">
          <a
            href="https://www.linkedin.com/in/anikethk/"
            target="_blank"
            rel="noopener noreferrer"
            className="touch-target hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>LinkedIn</span>
            <span className="text-xs">↗</span>
          </a>
          <span className="text-slate-700">/</span>
          <a
            href="https://github.com/Aniketh17"
            target="_blank"
            rel="noopener noreferrer"
            className="touch-target hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>GitHub</span>
            <span className="text-xs">↗</span>
          </a>
          <span className="text-slate-700">/</span>
          <a
            href="https://www.itomaster.com"
            target="_blank"
            rel="noopener noreferrer"
            className="touch-target hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>ITO Master</span>
            <span className="text-xs">↗</span>
          </a>
        </div>

        {/* Footer info */}
        <div className="mt-16 sm:mt-20 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500 w-full">
          <div>
            Aniketh Rao · AI/ML Engineer
          </div>
          <div className="text-center sm:text-right">
            Designed with 3D Holographic Dynamics &amp; Tactile Physics.
          </div>
        </div>
      </div>
    </section>
  );
};
