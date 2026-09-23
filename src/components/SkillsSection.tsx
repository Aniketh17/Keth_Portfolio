import React from 'react';

interface SkillGroup {
  category: string;
  badge: string;
  skills: string[];
}

const skillGroups: SkillGroup[] = [
  {
    category: 'AI / Machine Learning',
    badge: 'Neural Core',
    skills: [
      'Retrieval-Augmented Generation (RAG)',
      'Cross & Bi-Encoders',
      'PyTorch',
      'TensorFlow',
      'Python',
      'scikit-learn',
      'FastAPI',
      'Vector Search',
      'Pandas & NumPy',
    ],
  },
  {
    category: 'Software Architecture & Development',
    badge: 'Engineering',
    skills: [
      'React.js',
      'TypeScript',
      'Node.js',
      'Spring Boot',
      'Express.js',
      'Java',
      'JavaScript',
      'REST APIs & Microservices',
      'Tailwind CSS',
    ],
  },
  {
    category: 'Data & Cloud Infrastructure',
    badge: 'Operations',
    skills: [
      'Docker Containerization',
      'Supabase & PostgreSQL',
      'MongoDB',
      'Git Version Control',
      'Railway Cloud',
      'CI/CD Pipelines',
      'Data Governance & Grounding',
    ],
  },
];

export const SkillsSection: React.FC = () => {
  return (
    <section
      id="skills"
      className="relative min-h-screen py-28 px-5 sm:px-8 md:px-12 flex flex-col justify-center items-center z-10 bg-slate-900 text-white"
    >
      <div className="relative z-10 max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono tracking-wider uppercase mb-4 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            Neural Stack &amp; Infrastructure
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-white mb-4">
            Capabilities &amp; Tech Matrix.
          </h2>
          <p className="font-sans text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Disciplined software engineering meets state-of-the-art machine learning research.
          </p>
        </div>

        {/* Skill Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {skillGroups.map((group) => (
            <div
              key={group.category}
              className="p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-white/15 backdrop-blur-xl hover:border-white/30 transition-all duration-300 group hover:-translate-y-1 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-mono tracking-wider text-slate-300">
                    {group.badge}
                  </span>
                  <span className="text-slate-500 font-mono text-xs">● READY</span>
                </div>

                <h3 className="font-serif text-xl font-bold text-white mb-6 group-hover:text-cyan-300 transition-colors">
                  {group.category}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-200 font-mono hover:bg-white hover:text-slate-900 transition-all duration-200 cursor-default select-none"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Academic Journey Highlight */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-white/15 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="text-left">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-1">
              Academic Background
            </span>
            <h4 className="font-serif text-2xl font-bold text-white">
              Master's in Artificial Intelligence
            </h4>
            <p className="text-slate-400 text-sm mt-1">
              University of Auckland, New Zealand · 2026 — Present
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="Aniketh_NZ_Resume.pdf"
              download
              className="px-6 py-3 rounded-full bg-white text-slate-900 font-bold text-xs sm:text-sm hover:bg-slate-200 transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
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
              Download NZ Resume
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
