import React, { useState } from 'react';

interface Project {
  id: string;
  title: string;
  badge: string;
  category: string;
  image: string;
  description: string;
  highlights: string[];
  techStack: string[];
  liveUrl?: string;
  isFeatured?: boolean;
}

const projectsData: Project[] = [
  {
    id: 'imac-advisor',
    title: 'IMAC Clinical Advisor Agent',
    badge: 'Healthcare AI · RAG',
    category: 'NLP / Retrieval Systems',
    image: '/assets/imac_advisor.png',
    description:
      'A clinical decision-support intelligence system engineered on a dual-stage Retrieval-Augmented Generation (RAG) framework, served via a high-throughput FastAPI microservice. Designed to surface authoritative NZ immunisation guidance to clinical advisors with verifiable source traceability.',
    highlights: [
      'Dual-stage neural retrieval: Bi-Encoder dense embedding search for broad candidate recall, followed by Cross-Encoder semantic re-ranking for precision relevance — achieving 88%+ grounding confidence',
      'Automated multi-document evidence synthesis across NZ IMAC Clinical Practice Notes, Pharmac schedule data, and official health authority publications',
      'Strict clinical data governance pipeline: source attribution, confidence thresholding, and regulatory compliance guardrails built into every inference response',
      'Asynchronous FastAPI REST microservice with sub-100ms embedding index lookups and horizontal scaling support'
    ],
    techStack: [
      'FastAPI',
      'RAG System',
      'Bi-Encoders',
      'Cross-Encoders',
      'Python',
      'Vector DB',
      'Source Grounding'
    ],
    isFeatured: true,
  },
  {
    id: 'ito-master',
    title: 'ITO Master',
    badge: 'Enterprise E-Commerce',
    category: 'Full-Stack / Microservices',
    image: '/ito.png',
    description:
      'Production-grade e-commerce platform engineered with a React frontend and distributed Spring Boot microservices backend. Integrates Razorpay payment rails, automated NimbusPost logistics, and a fully containerised deployment pipeline on Railway.',
    highlights: [
      'Decomposed domain-driven microservices architecture spanning authentication, product catalogue, cart orchestration, and payment state management',
      'Real-time shipment tracking via NimbusPost API integration with automated dispatch webhooks',
      'PostgreSQL persistence layer with Supabase connection pooling, managed via Docker Compose on Railway Cloud'
    ],
    techStack: ['React', 'Spring Boot', 'Supabase', 'Docker', 'Railway', 'Razorpay'],
    liveUrl: 'https://www.itomaster.com',
  },
  {
    id: 'tiny-paws',
    title: 'Tiny Paws',
    badge: 'Pet Care Platform',
    category: 'Full-Stack Web App',
    image: '/tp.png',
    description:
      'A modern pet care and adoption platform engineered with React and Node.js. Features interactive booking calendars, health service catalogs, and responsive user flows.',
    highlights: [
      'Dynamic scheduling engine with instantaneous confirmation and availability filtering',
      'Responsive interface optimized for rapid touch workflows and high visual engagement'
    ],
    techStack: ['React', 'Node.js', 'Express', 'CSS3', 'REST API'],
    liveUrl: 'https://tiny-paaws.netlify.app/',
  },
  {
    id: 'aryan-care',
    title: 'Aryan Care Foundation',
    badge: 'Non-Profit Ecosystem',
    category: 'Accessible Web Platform',
    image: '/ac.png',
    description:
      'Digital charity platform designed for high accessibility and outreach engagement. Emphasizes storytelling to raise community awareness and drive philanthropic contributions.',
    highlights: [
      'WCAG accessibility compliance with optimized semantic markup and screen reader support',
      'Streamlined contribution pathways that boosted donation conversion rates'
    ],
    techStack: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
    liveUrl: 'https://aryancarefoundation.netlify.app/',
  },
  {
    id: 'green-harbor',
    title: 'Green Harbor',
    badge: 'Environmental Hub',
    category: 'Educational Experience',
    image: '/gh.png',
    description:
      'Educational wildlife conservation portal promoting biodiversity awareness through engaging visuals, data-driven habitat stories, and interactive preservation guides.',
    highlights: [
      'Interactive visual modules showcasing endangered ecosystems and conservation metrics',
      'Optimized asset delivery and fluid CSS transitions for immersive storytelling'
    ],
    techStack: ['HTML5', 'CSS3', 'JavaScript', 'Visual Storytelling'],
    liveUrl: 'https://geen-harbour-wildlife.netlify.app/',
  },
];

export const ProjectsSection: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'ai' | 'fullstack'>('all');

  const filteredProjects = projectsData.filter((p) => {
    if (activeFilter === 'ai') return p.isFeatured;
    if (activeFilter === 'fullstack') return !p.isFeatured;
    return true;
  });

  return (
    <section
      id="projects"
      className="relative min-h-screen py-28 px-5 sm:px-8 md:px-12 flex flex-col justify-center items-center z-10 bg-slate-900 text-white"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 max-w-4xl text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono tracking-wider uppercase mb-4 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Featured Systems &amp; Software
        </div>
        <h2 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-white mb-4">
          Selected Works.
        </h2>
        <p className="font-sans text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          From clinical AI retrieval agents and computer vision systems to
          neural network research and scalable full-stack platforms.
        </p>

        {/* Filter Pills */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            All Projects
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('ai')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'ai'
                ? 'bg-cyan-400 text-slate-950 shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            AI / ML Systems
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('fullstack')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'fullstack'
                ? 'bg-purple-400 text-slate-950 shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            Full-Stack Platforms
          </button>
        </div>
      </div>

      {/* Featured Flagship Card: IMAC Advisor Agent */}
      <div className="w-full max-w-5xl mb-12">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-slate-950/90 border border-white/20 shadow-2xl p-6 sm:p-10 transition-all hover:border-white/40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Image Preview */}
            <div
              onClick={() => setSelectedProject(projectsData[0])}
              className="lg:col-span-7 rounded-2xl overflow-hidden border border-white/15 bg-black cursor-pointer group shadow-xl"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src="/assets/imac_advisor.png"
                  alt="IMAC Clinical Knowledge Retrieval System"
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  style={{ background: '#0f172a', objectPosition: 'center' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="px-3 py-1 rounded-full bg-white text-slate-900 text-xs font-bold shadow">
                    Click to Open Full Architecture Spec ↗
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Description & Metrics */}
            <div className="lg:col-span-5 text-left">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 text-xs font-mono font-bold">
                  FLAGSHIP AI
                </span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  ● 88% Match Confidence
                </span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3">
                IMAC Advisor Agent
              </h3>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-5">
                Clinical decision-support intelligence platform built with dual-stage retrieval (Bi-Encoder semantic search + Cross-Encoder relevance re-ranking) and FastAPI microservices. Verifies official NZ immunization guidelines with strict medical data governance.
              </p>

              <div className="flex flex-wrap gap-1.5 mb-6">
                {[
                  'FastAPI',
                  'Bi-Encoders',
                  'Cross-Encoders',
                  'RAG',
                  'Vector Search',
                  'Clinical Grounding',
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md bg-white/10 text-xs font-mono text-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedProject(projectsData[0])}
                  className="px-5 py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
                >
                  View Deep Dive Specs →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Other Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {filteredProjects
          .filter((p) => p.id !== 'imac-advisor')
          .map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="rounded-3xl p-6 bg-slate-950/70 border border-white/15 backdrop-blur-xl hover:border-white/30 transition-all hover:-translate-y-1 shadow-xl cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-5 border border-white/10 bg-slate-800">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    style={{ objectPosition: 'top center' }}
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-mono text-white">
                    {project.badge}
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                    {project.category}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2">
                    {project.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.techStack.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded bg-white/10 text-[11px] font-mono text-slate-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-xs font-semibold text-white underline underline-offset-4 group-hover:text-cyan-300 transition-colors">
                    Explore Details →
                  </span>
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1 rounded-full bg-white text-slate-900 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Launch ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Modal Deep Dive Drawer */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-xl"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-white/20 p-6 sm:p-8 text-left shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-slate-900 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono">
                {selectedProject.badge}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {selectedProject.category}
              </span>
            </div>

            <h3 className="font-serif text-2xl sm:text-4xl font-bold text-white mb-4">
              {selectedProject.title}
            </h3>

            {/* Image banner */}
            <div className="rounded-2xl overflow-hidden mb-6 border border-white/10 bg-black">
              <img
                src={selectedProject.image}
                alt={selectedProject.title}
                className="w-full max-h-[380px] object-cover object-top"
              />
            </div>

            {/* Description */}
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
              {selectedProject.description}
            </p>

            {/* Key Technical Highlights */}
            <div className="mb-6">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
                Key Technical Architecture
              </h4>
              <ul className="space-y-2.5">
                {selectedProject.highlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-200">
                    <span className="text-emerald-400 mt-1">✔</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech Stack */}
            <div className="mb-8">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
                Technologies &amp; Modules
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedProject.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-slate-200 font-mono"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-4 pt-4 border-t border-white/10">
              {selectedProject.liveUrl ? (
                <a
                  href={selectedProject.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-full bg-white text-slate-900 font-bold text-sm hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Visit Live Application ↗
                </a>
              ) : (
                <span className="text-xs font-mono text-slate-400">
                  Proprietary Clinical Framework
                </span>
              )}
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="px-6 py-2.5 rounded-full bg-white/10 border border-white/20 text-white font-medium text-sm hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
