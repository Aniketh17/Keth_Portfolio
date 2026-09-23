import React, { useState, useEffect } from 'react';

interface NavbarProps {
  interactiveMode: boolean;
  onToggleInteractiveMode: () => void;
  onContactClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  interactiveMode,
  onToggleInteractiveMode,
  onContactClick,
}) => {
  const [activeSection, setActiveSection] = useState<'home' | 'works' | 'about' | 'contact'>('home');
  const [nzTime, setNzTime] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Live Auckland, NZ clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-NZ', {
        timeZone: 'Pacific/Auckland',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setNzTime(timeStr);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const projectsEl = document.getElementById('projects');
      const aboutEl = document.getElementById('about');
      const contactEl = document.getElementById('contact');

      if (contactEl && scrollY >= contactEl.offsetTop - 300) {
        setActiveSection('contact');
      } else if (aboutEl && scrollY >= aboutEl.offsetTop - 300) {
        setActiveSection('about');
      } else if (projectsEl && scrollY >= projectsEl.offsetTop - 300) {
        setActiveSection('works');
      } else {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string, section: 'home' | 'works' | 'about' | 'contact') => {
    setMobileMenuOpen(false);
    setActiveSection(section);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { label: 'Home', id: 'hero', key: 'home' as const },
    { label: 'Works', id: 'projects', key: 'works' as const },
    { label: 'About me', id: 'about', key: 'about' as const },
  ];

  return (
    <>
      {/* Top Bar Header */}
      <header className="fixed top-0 left-0 w-full z-40 px-5 sm:px-10 py-4 flex items-center justify-between pointer-events-none">
        {/* Logo (left) */}
        <div
          onClick={() => scrollToSection('hero', 'home')}
          className="flex items-center gap-2 pointer-events-auto cursor-pointer group"
        >
          <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow">
            Aniketh Rao
          </span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 group-hover:scale-150 transition-transform" />
        </div>

        {/* Right Info & CTA */}
        <div className="flex items-center gap-3 sm:gap-5 pointer-events-auto">
          {/* Time badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono text-white/90">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Auckland {nzTime}</span>
          </div>

          {/* Contact Pill CTA */}
          <button
            type="button"
            onClick={onContactClick}
            className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white text-slate-900 font-medium text-xs sm:text-sm hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
          >
            Get in touch ↗
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center gap-1 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <span className={`w-4 h-0.5 bg-white transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`w-4 h-0.5 bg-white transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-4 h-0.5 bg-white transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </header>

      {/* Floating Vertical Left Dock (matching Image 2) */}
      <nav
        aria-label="Primary Navigation"
        className="fixed left-5 sm:left-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-start gap-4 p-3 rounded-2xl glass-panel-light text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all"
      >
        <div className="flex flex-col gap-2 w-full">
          {navItems.map((item) => {
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => scrollToSection(item.id, item.key)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-white/80 hover:text-slate-950'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    isActive ? 'bg-cyan-400 scale-125' : 'bg-slate-400'
                  }`}
                />
                {item.label}
              </button>
            );
          })}

          {/* Resume Download Link */}
          <a
            href="Aniketh_NZ_Resume.pdf"
            download
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-white/80 hover:text-slate-950 transition-all cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Resume
            <span className="text-[10px] text-slate-500 font-mono">↓</span>
          </a>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-slate-200" />

        {/* Interactive Mode Toggle Switch (from Image 2) */}
        <div className="flex items-center justify-between gap-3 px-2 py-1 w-full">
          <span className="text-xs font-semibold text-slate-700 select-none">
            Interactive
            <br />
            mode
          </span>
          <button
            type="button"
            onClick={onToggleInteractiveMode}
            title="Toggle interactive 3D physics"
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 cursor-pointer ${
              interactiveMode ? 'bg-indigo-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                interactiveMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col justify-center items-center gap-6 p-8 md:hidden text-white"
          onClick={() => setMobileMenuOpen(false)}
        >
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg cursor-pointer"
          >
            ✕
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('hero', 'home')}
            className="text-2xl font-serif font-bold cursor-pointer"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('projects', 'works')}
            className="text-2xl font-serif font-bold cursor-pointer"
          >
            Works
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('about', 'about')}
            className="text-2xl font-serif font-bold cursor-pointer"
          >
            About me
          </button>
          <a
            href="Aniketh_NZ_Resume.pdf"
            download
            className="text-2xl font-serif font-bold cursor-pointer flex items-center gap-2"
          >
            Download Resume ↓
          </a>
          <button
            type="button"
            onClick={onContactClick}
            className="px-6 py-2.5 rounded-full bg-white text-slate-900 text-lg font-semibold mt-4 cursor-pointer"
          >
            Get in touch
          </button>
        </div>
      )}
    </>
  );
};
