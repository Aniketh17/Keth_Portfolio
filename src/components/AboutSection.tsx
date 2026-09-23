import React from 'react';

export const AboutSection: React.FC = () => {
  return (
    <section
      id="about"
      className="relative min-h-screen py-28 px-5 sm:px-8 md:px-12 flex flex-col justify-center items-center z-10 bg-slate-950 text-white"
    >
      <div className="relative z-10 max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left side: Modern Minimal Terminal Card */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-[380px] rounded-3xl p-6 sm:p-7 bg-slate-900/90 border border-white/20 backdrop-blur-xl shadow-2xl">
            {/* Terminal bar */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                aniketh_profile.sys
              </span>
            </div>

            <div className="space-y-4 font-mono text-xs text-slate-300">
              <div>
                <span className="text-cyan-400">name</span>: "Aniketh Rao",
              </div>
              <div>
                <span className="text-cyan-400">role</span>: "AI/ML Engineer & Systems Developer",
              </div>
              <div>
                <span className="text-cyan-400">education</span>: "Master's in AI, University of Auckland",
              </div>
              <div>
                <span className="text-cyan-400">specialization</span>: [
                <div className="pl-4 text-slate-400">
                  "Retrieval-Augmented Generation (RAG)",<br />
                  "Cross &amp; Bi-Encoder Ranking",<br />
                  "FastAPI High-Throughput Services",<br />
                  "Microservices &amp; Full-Stack Scale"
                </div>
                ],
              </div>
              <div>
                <span className="text-cyan-400">status</span>: "Available for High-Impact Roles"
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Auckland, NZ
              </span>
              <a
                href="Aniketh_NZ_Resume.pdf"
                download
                className="text-white underline underline-offset-2 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                Download CV ↗
              </a>
            </div>
          </div>
        </div>

        {/* Right side: Philosophy & Metrics */}
        <div className="lg:col-span-7 text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono tracking-wider uppercase backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Engineering Philosophy
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Building at the convergence of AI research and scalable systems.
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            I am a software engineer focused on machine learning systems, currently pursuing my Master's in Artificial Intelligence at the University of Auckland. My journey began with engineering end-to-end full-stack architectures — shipping high-throughput microservices, integrating payment rails, and managing cloud deployments.
          </p>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            I bring that engineering discipline to AI: building enterprise RAG pipelines, training and fine-tuning dual-stage retrieval encoders (Bi-Encoders paired with Cross-Encoder re-rankers), enforcing strict data governance guardrails, and serving low-latency inference APIs with FastAPI.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div>
              <span className="text-2xl font-bold text-white block">2026</span>
              <span className="text-xs text-slate-400">Master's in AI (UoA)</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-white block">88%+</span>
              <span className="text-xs text-slate-400">RAG Match Precision</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-white block">5+</span>
              <span className="text-xs text-slate-400">Shipped Platforms</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
