import React, { useState, useRef, useEffect, useMemo } from 'react';

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
    title: 'IMAC Clinical Advisor Intelligence',
    badge: 'Healthcare AI · Dual-Stage RAG',
    category: 'NLP / Retrieval & Microservices',
    image: './assets/imac_advisor.png',
    description:
      'A mission-critical clinical decision-support intelligence platform engineered on a dual-stage Retrieval-Augmented Generation (RAG) framework, served via high-throughput asynchronous FastAPI microservices. Designed to surface authoritative NZ immunisation guidance to clinicians with verifiable source traceability and zero hallucinations.',
    highlights: [
      'Dual-stage neural retrieval architecture: Bi-Encoder dense semantic search for candidate recall (top-50) paired with Cross-Encoder deep contextual re-ranking for precision relevance (top-5) — achieving 88%+ grounding confidence',
      'Automated multi-document evidence synthesis indexing NZ IMAC Clinical Practice Notes, Pharmac schedules, and Ministry of Health publications',
      'Strict clinical governance & attribution pipeline: source citations, confidence thresholding, and automated medical regulatory guardrails on every generated inference response',
      'Asynchronous FastAPI REST microservice with sub-100ms vector index querying and horizontal container scalability'
    ],
    techStack: [
      'FastAPI',
      'Python',
      'Dual-Stage RAG',
      'Bi-Encoders',
      'Cross-Encoders',
      'Vector DB',
      'Source Grounding',
      'Docker'
    ],
    isFeatured: true,
  },
  {
    id: 'ito-master',
    title: 'ITO Master',
    badge: 'Enterprise E-Commerce',
    category: 'Full-Stack / Microservices',
    image: './ito.png',
    description:
      'Production-grade e-commerce ecosystem engineered with a React frontend and distributed Spring Boot microservices backend. Integrates Razorpay payment rails, automated NimbusPost logistics fulfillment, and a containerised deployment pipeline on Railway Cloud.',
    highlights: [
      'Decomposed domain-driven microservices architecture spanning authentication, product catalogue, order state machines, and payment orchestration',
      'Real-time automated logistics tracking via NimbusPost webhook dispatch pipelines',
      'PostgreSQL persistence layer with Supabase connection pooling and Redis caching for high traffic throughput'
    ],
    techStack: ['React', 'Spring Boot', 'Java', 'Supabase', 'PostgreSQL', 'Docker', 'Railway', 'Razorpay'],
    liveUrl: 'https://www.itomaster.com',
  },
  {
    id: 'tiny-paws',
    title: 'Tiny Paws Care',
    badge: 'Pet Care Platform',
    category: 'Full-Stack Web App',
    image: './tp.png',
    description:
      'A responsive pet care and adoption portal engineered with React and Node.js. Features dynamic interactive booking calendars, health service catalogues, and friction-free user flows with instant database persistence.',
    highlights: [
      'Dynamic scheduling engine with instantaneous confirmation, timezone handling, and availability filtering',
      'Responsive interface optimized for rapid mobile touch workflows and high visual engagement',
      'RESTful backend architecture with secure JWT authentication and data validation'
    ],
    techStack: ['React', 'Node.js', 'Express', 'Tailwind CSS', 'REST API', 'PostgreSQL'],
    liveUrl: 'https://tiny-paaws.netlify.app/',
  },
  {
    id: 'aryan-care',
    title: 'Aryan Care Foundation',
    badge: 'Non-Profit Ecosystem',
    category: 'Accessible Web Platform',
    image: './ac.png',
    description:
      'Digital charity outreach platform engineered for universal accessibility (WCAG 2.1 AA compliant) and high donor engagement. Employs modern narrative design to amplify community initiatives and accelerate philanthropic conversions.',
    highlights: [
      'WCAG 2.1 accessibility compliance with semantic HTML5 markup, ARIA live regions, and screen reader optimization',
      'Streamlined contribution pathways with dynamic donation tiers boosting conversion by 34%',
      'Lightning-fast page load metrics (<0.8s LCP) through optimized asset compression and lazy loading'
    ],
    techStack: ['HTML5', 'CSS3', 'JavaScript', 'Responsive UI', 'WCAG AA', 'Web Performance'],
    liveUrl: 'https://aryancarefoundation.netlify.app/',
  },
  {
    id: 'green-harbor',
    title: 'Green Harbor Wildlife',
    badge: 'Environmental Hub',
    category: 'Educational Experience',
    image: './gh.png',
    description:
      'Interactive biodiversity conservation portal promoting environmental awareness through rich visual modules, dynamic habitat infographics, and actionable preservation guides.',
    highlights: [
      'Interactive visual storytelling modules detailing endangered species metrics and habitat restoration initiatives',
      'Fluid CSS animations and hardware-accelerated transitions providing an immersive user experience',
      'Optimized asset delivery pipeline ensuring smooth rendering across mobile and desktop viewports'
    ],
    techStack: ['HTML5', 'CSS3', 'JavaScript', 'Visual Storytelling', 'Data Infographics'],
    liveUrl: 'https://geen-harbour-wildlife.netlify.app/',
  },
];

export const ProjectsSection: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'ai' | 'fullstack'>('all');
  const [scrollIndex, setScrollIndex] = useState(0);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [motionPaused, setMotionPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const carouselViewportRef = useRef<HTMLDivElement>(null);
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const firstLoopRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const segmentWidthRef = useRef(0);
  const cardStepRef = useRef(0);
  const activeIndexRef = useRef(0);
  const dragRef = useRef<{ startX: number; startOffset: number; moved: boolean } | null>(null);

  const filteredProjects = useMemo(() => projectsData.filter((project) => {
    if (activeFilter === 'ai') return project.isFeatured;
    if (activeFilter === 'fullstack') return !project.isFeatured;
    return true;
  }), [activeFilter]);

  const carouselItems = useMemo(
    () => filteredProjects.filter((project) => project.id !== 'imac-advisor'),
    [filteredProjects],
  );

  const shouldPauseMotion = Boolean(
    hoveredProjectId || motionPaused || prefersReducedMotion || !isPageVisible || isDragging,
  );

  const normaliseOffset = (offset: number) => {
    const segmentWidth = segmentWidthRef.current;
    if (!segmentWidth) return 0;
    return ((offset % segmentWidth) + segmentWidth) % segmentWidth;
  };

  const updateActiveIndex = (offset: number) => {
    if (!carouselItems.length || !cardStepRef.current) return;
    const nextIndex = Math.floor((normaliseOffset(offset) + cardStepRef.current / 2) / cardStepRef.current) % carouselItems.length;
    if (nextIndex !== activeIndexRef.current) {
      activeIndexRef.current = nextIndex;
      setScrollIndex(nextIndex);
    }
  };

  const paintTrack = (offset = offsetRef.current) => {
    if (!carouselTrackRef.current) return;
    carouselTrackRef.current.style.transform = `translate3d(${-normaliseOffset(offset)}px, 0, 0)`;
    updateActiveIndex(offset);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);
    return () => mediaQuery.removeEventListener('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    const updateVisibility = () => setIsPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  useEffect(() => {
    const measureTrack = () => {
      const firstLoop = firstLoopRef.current;
      const track = carouselTrackRef.current;
      if (!firstLoop || !track) return;
      const gap = Number.parseFloat(window.getComputedStyle(track).gap) || 0;
      segmentWidthRef.current = firstLoop.getBoundingClientRect().width + gap;
      const firstCard = firstLoop.querySelector<HTMLElement>('[data-carousel-card]');
      cardStepRef.current = firstCard ? firstCard.getBoundingClientRect().width + gap : 0;
      offsetRef.current = 0;
      activeIndexRef.current = 0;
      setScrollIndex(0);
      paintTrack(0);
    };

    measureTrack();
    const observer = new ResizeObserver(measureTrack);
    if (carouselViewportRef.current) observer.observe(carouselViewportRef.current);
    return () => observer.disconnect();
  }, [carouselItems.length]);

  useEffect(() => {
    if (shouldPauseMotion || !carouselItems.length) {
      lastFrameTimeRef.current = null;
      return;
    }

    const animate = (timestamp: number) => {
      if (lastFrameTimeRef.current !== null) {
        const elapsed = Math.min(timestamp - lastFrameTimeRef.current, 64);
        offsetRef.current += elapsed * 0.024;
        paintTrack();
      }
      lastFrameTimeRef.current = timestamp;
      frameRef.current = window.requestAnimationFrame(animate);
    };

    frameRef.current = window.requestAnimationFrame(animate);
    return () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [shouldPauseMotion, carouselItems.length]);

  useEffect(() => {
    if (!selectedProject) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedProject(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedProject]);

  const moveCarousel = (direction: 'left' | 'right') => {
    const step = cardStepRef.current || 400;
    offsetRef.current += direction === 'left' ? -step : step;
    paintTrack();
  };

  const goToProject = (index: number) => {
    offsetRef.current = index * (cardStepRef.current || 400);
    paintTrack();
  };

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = { startX: event.clientX, startOffset: offsetRef.current, moved: false };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const dragCarousel = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const distance = dragRef.current.startX - event.clientX;
    dragRef.current.moved ||= Math.abs(distance) > 6;
    offsetRef.current = dragRef.current.startOffset + distance;
    paintTrack();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
    setIsDragging(false);
    lastFrameTimeRef.current = null;
  };

  const renderProjectCard = (project: Project, isDuplicate = false) => (
    <article
      key={`${project.id}-${isDuplicate ? 'loop' : 'source'}`}
      data-carousel-card
      aria-hidden={isDuplicate || undefined}
      onMouseEnter={() => setHoveredProjectId(project.id)}
      onMouseLeave={() => setHoveredProjectId(null)}
      onFocusCapture={() => setHoveredProjectId(project.id)}
      onBlurCapture={() => setHoveredProjectId(null)}
      className="project-carousel-card group w-[84vw] max-w-[420px] sm:w-[380px] md:w-[420px] shrink-0 rounded-[1.75rem] p-5 sm:p-6 bg-slate-950/85 border border-white/15 backdrop-blur-xl shadow-[0_18px_50px_rgba(2,6,23,0.45)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-cyan-300/60 hover:shadow-[0_22px_60px_rgba(34,211,238,0.14)] flex flex-col justify-between"
    >
      <div>
        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-5 border border-white/10 bg-slate-950">
          <img
            src={project.image}
            alt={isDuplicate ? '' : project.title}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.035]"
            style={{ objectPosition: 'center' }}
          />
          <div className="absolute top-3 left-3 max-w-[calc(100%-1.5rem)] px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/20 text-[10px] font-mono text-white font-semibold truncate">
            {project.badge}
          </div>
        </div>

        <div className="text-left">
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 block mb-1 font-semibold">
            {project.category}
          </span>
          <h4 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-cyan-200 transition-colors">
            {project.title}
          </h4>
          <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 mb-4 leading-relaxed">
            {project.description}
          </p>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.techStack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-mono text-slate-200"
            >
              {tech}
            </span>
          ))}
          {project.techStack.length > 4 && (
            <span className="px-2.5 py-1 rounded-full bg-white/5 text-[10px] font-mono text-slate-400">
              +{project.techStack.length - 4} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            tabIndex={isDuplicate ? -1 : undefined}
            onClick={() => setSelectedProject(project)}
            className="min-h-10 text-left text-xs font-semibold text-white underline underline-offset-4 hover:text-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 transition-colors"
          >
            Explore Specs <span aria-hidden="true">→</span>
          </button>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={isDuplicate ? -1 : undefined}
              className="min-h-10 shrink-0 inline-flex items-center px-3.5 py-1.5 rounded-full bg-white text-slate-900 text-xs font-bold hover:bg-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 transition-colors shadow"
            >
              Launch <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );

  return (
    <section
      id="projects"
      className="relative min-h-screen py-20 sm:py-28 px-4 sm:px-8 md:px-12 flex flex-col justify-center items-center z-10 bg-slate-900 text-white"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 max-w-4xl w-full text-center mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono tracking-wider uppercase mb-4 backdrop-blur-md shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Featured Systems &amp; Software
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
          Selected Works.
        </h2>
        <p className="font-sans text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed px-2">
          From clinical AI retrieval agents and high-throughput microservices to
          distributed e-commerce systems and accessible web platforms.
        </p>

        {/* Filter Pills — horizontal scroll on mobile to prevent wrapping */}
        <div className="flex items-center gap-2.5 mt-6 overflow-x-auto hide-scrollbar pb-1 justify-start sm:justify-center px-1">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            aria-pressed={activeFilter === 'all'}
            className={`min-h-10 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 flex-shrink-0 ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-md scale-105'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            All Systems ({projectsData.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('fullstack')}
            aria-pressed={activeFilter === 'fullstack'}
            className={`min-h-10 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 flex-shrink-0 ${
              activeFilter === 'fullstack'
                ? 'bg-purple-400 text-slate-950 shadow-md scale-105'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            Full-Stack &amp; Platforms (4)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('ai')}
            aria-pressed={activeFilter === 'ai'}
            className={`min-h-10 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 flex-shrink-0 ${
              activeFilter === 'ai'
                ? 'bg-cyan-400 text-slate-950 shadow-md scale-105'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            AI &amp; RAG Systems (1)
          </button>
        </div>
      </div>

      {/* Flagship Card: IMAC Advisor Agent (Shown if 'all' or 'ai') */}
      {(activeFilter === 'all' || activeFilter === 'ai') && (
        <div className="w-full max-w-5xl mb-10 sm:mb-12 px-0">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-950/95 border border-white/20 shadow-2xl p-5 sm:p-8 lg:p-10 transition-all hover:border-white/40">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              {/* Image Preview — full width on mobile, 7 cols on desktop */}
              <div
                onClick={() => setSelectedProject(projectsData[0])}
                className="lg:col-span-7 rounded-2xl overflow-hidden border border-white/15 bg-black cursor-pointer group shadow-xl relative"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src="./assets/imac_advisor.png"
                    alt="IMAC Clinical Knowledge Retrieval System"
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    style={{ background: '#0f172a', objectPosition: 'center' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity flex items-end p-4">
                    <span className="px-3 py-1 rounded-full bg-white text-slate-900 text-xs font-bold shadow-md">
                      Tap to Open Full Spec ↗
                    </span>
                  </div>
                </div>
              </div>

              {/* Description & Metrics */}
              <div className="lg:col-span-5 text-left">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 text-xs font-mono font-bold">
                    FLAGSHIP RAG SYSTEM
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    88%+ Confidence
                  </span>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3">
                  IMAC Advisor Agent
                </h3>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5">
                  Clinical decision-support intelligence platform built with dual-stage retrieval (Bi-Encoder semantic search + Cross-Encoder contextual re-ranking) and high-throughput FastAPI microservices. Enforces rigorous NZ healthcare data governance.
                </p>

                <div className="flex flex-wrap gap-1.5 mb-5 sm:mb-6">
                  {[
                    'FastAPI',
                    'Dual-Stage RAG',
                    'Bi-Encoders',
                    'Cross-Encoders',
                    'Vector DB',
                    'Docker',
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md bg-white/10 text-xs font-mono text-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProject(projectsData[0])}
                  className="touch-target w-full sm:w-auto px-5 py-3 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center sm:justify-start gap-2"
                >
                  View Deep Dive Specs →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Horizontal Carousel Showcase for Other Projects ─── */}
      {carouselItems.length > 0 && (
        <div className="w-full max-w-6xl relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-5 px-1 sm:px-2">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                Full-Stack &amp; Enterprise Platforms
              </h3>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => moveCarousel('left')}
                aria-label="Previous project"
                className="touch-target w-11 h-11 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white text-white hover:text-slate-900 border border-white/25 hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 transition-all shadow-md"
              >
                <span aria-hidden="true">←</span>
              </button>
              <button
                type="button"
                onClick={() => moveCarousel('right')}
                aria-label="Next project"
                className="touch-target w-11 h-11 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white text-white hover:text-slate-900 border border-white/25 hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 transition-all shadow-md"
              >
                <span aria-hidden="true">→</span>
              </button>
              <button
                type="button"
                onClick={() => setMotionPaused((paused) => !paused)}
                aria-pressed={motionPaused}
                className="hidden sm:flex touch-target min-h-11 px-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-mono font-semibold text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 transition-colors items-center"
              >
                {motionPaused ? 'Resume motion' : 'Pause motion'}
              </button>
            </div>
          </div>

          <div
            ref={carouselViewportRef}
            className="project-carousel-viewport relative overflow-hidden py-2"
            onPointerDown={startDrag}
            onPointerMove={dragCarousel}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <div ref={carouselTrackRef} className="project-carousel-track flex w-max gap-5 will-change-transform">
              <div ref={firstLoopRef} className="flex shrink-0 gap-5">
                {carouselItems.map((project) => renderProjectCard(project))}
              </div>
              <div className="flex shrink-0 gap-5">
                {carouselItems.map((project) => renderProjectCard(project, true))}
              </div>
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-14 bg-gradient-to-r from-slate-900 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-14 bg-gradient-to-l from-slate-900 to-transparent" />
          </div>

          <div className="flex items-center justify-center gap-2 mt-5" aria-label="Project carousel position">
            {carouselItems.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goToProject(idx)}
                aria-label={`Show ${item.title}`}
                aria-current={scrollIndex === idx ? 'true' : undefined}
                className={`min-h-8 px-1 rounded-full transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
                  scrollIndex === idx ? 'w-8 bg-cyan-400' : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
              ><span className="sr-only">{item.title}</span></button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Modal Deep Dive — bottom-sheet on mobile, centered on desktop ─── */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-slate-950/85 backdrop-blur-xl"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="mobile-bottom-sheet sm:[animation:none] relative w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-white/20 sm:border-white/25 p-5 sm:p-8 text-left shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle — mobile only */}
            <div className="sm:hidden flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              className="touch-target absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-slate-900 text-white flex items-center justify-center transition-colors cursor-pointer text-base"
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="flex flex-wrap items-center gap-2 mb-3 pr-12">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold">
                {selectedProject.badge}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {selectedProject.category}
              </span>
            </div>

            <h3 className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 pr-8">
              {selectedProject.title}
            </h3>

            {/* Image banner */}
            <div className="rounded-2xl overflow-hidden mb-5 border border-white/10 bg-black">
              <img
                src={selectedProject.image}
                alt={selectedProject.title}
                className="w-full max-h-[240px] sm:max-h-[360px] object-cover object-top"
              />
            </div>

            {/* Description */}
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-5">
              {selectedProject.description}
            </p>

            {/* Key Technical Architecture */}
            <div className="mb-5">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 font-semibold">
                Key Technical Architecture &amp; Implementation
              </h4>
              <ul className="space-y-2.5">
                {selectedProject.highlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                    <span className="text-emerald-400 mt-0.5 flex-shrink-0">✔</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech Stack */}
            <div className="mb-6 sm:mb-8">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 font-semibold">
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

            {/* Action buttons — stacked on mobile */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-white/10">
              {selectedProject.liveUrl ? (
                <a
                  href={selectedProject.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="touch-target flex items-center justify-center px-6 py-3 rounded-full bg-white text-slate-900 font-bold text-sm hover:bg-cyan-300 transition-colors cursor-pointer shadow-md"
                >
                  Visit Live Application ↗
                </a>
              ) : (
                <span className="text-xs font-mono text-slate-400 py-2">
                  Proprietary Architecture Specification
                </span>
              )}
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="touch-target flex items-center justify-center px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-medium text-sm hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
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

export default ProjectsSection;
