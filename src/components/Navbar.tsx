import React, { useState, useEffect } from 'react';

interface NavbarProps {
  interactiveMode: boolean;
  onToggleInteractiveMode: () => void;
  onContactClick: () => void;
  isNight?: boolean;
  onToggleTheme?: () => void;
  locationCity?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  interactiveMode,
  onToggleInteractiveMode,
  onContactClick,
  isNight = true,
  onToggleTheme,
  locationCity = 'Auckland',
}) => {
  const [activeSection, setActiveSection] = useState<'home' | 'works' | 'about' | 'contact'>('home');
  const [nzTime, setNzTime] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Live local time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], {
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

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

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
      {/* ── Top Bar Header ── */}
      <header className="fixed top-0 left-0 w-full z-40 px-4 sm:px-10 py-3 sm:py-4 flex items-center justify-between pointer-events-none">
        {/* Logo (left) */}
        <div
          onClick={() => scrollToSection('hero', 'home')}
          className="flex items-center gap-2 pointer-events-auto cursor-pointer group"
        >
          <span className="font-serif text-lg sm:text-3xl font-bold tracking-tight text-white drop-shadow whitespace-nowrap">
            Aniketh Rao
          </span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 group-hover:scale-150 transition-transform" />
        </div>

        {/* Right Info & CTA */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* Day / Night Mode Toggle — hidden on mobile (in drawer) */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              title={`Switch to ${isNight ? 'Day' : 'Night'} Mode`}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-xs font-mono text-white transition-all cursor-pointer shadow"
            >
              <span>{isNight ? '🌙 Night' : '☀️ Day'}</span>
            </button>
          )}

          {/* Time badge — hidden on mobile (in drawer) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono text-white/90">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{locationCity} {nzTime}</span>
          </div>

          {/* Contact Pill CTA — hidden on mobile (in drawer) */}
          <button
            type="button"
            onClick={onContactClick}
            className="hidden sm:inline-flex px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white text-slate-900 font-medium text-xs sm:text-sm hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
          >
            Get in touch ↗
          </button>

          {/* Hamburger — visible on all sizes below lg */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden touch-target w-10 h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center gap-1 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 transition-colors hover:bg-white/25"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className={`w-4 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`w-4 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`w-4 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </header>

      {/* ── Floating Vertical Left Dock (desktop only) ── */}
      <nav
        aria-label="Primary Navigation"
        className="fixed left-5 xl:left-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-start gap-3.5 p-3 rounded-2xl glass-panel-light text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all"
      >
        <div className="flex flex-col gap-1.5 w-full">
          {navItems.map((item) => {
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => scrollToSection(item.id, item.key)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-white/80 hover:text-slate-950'
                  }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-all ${isActive ? 'bg-cyan-400 scale-125' : 'bg-slate-400'
                    }`}
                />
                {item.label}
              </button>
            );
          })}

          {/* Resume Download Link */}
          <a
            href="/Aniketh_NZ_Resume.pdf"
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

        {/* Interactive Mode Toggle Switch */}
        <div className="flex items-center justify-between gap-3 px-2 py-1 w-full">
          <span className="text-xs font-semibold text-slate-700 select-none">
            Interactive<br />mode
          </span>
          <button
            type="button"
            onClick={onToggleInteractiveMode}
            title="Toggle interactive 3D physics"
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 cursor-pointer ${interactiveMode ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
          >
            <span
              className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${interactiveMode ? 'translate-x-6' : 'translate-x-0'
                }`}
            />
          </button>
        </div>

        {/* Theme Mode Toggle in Dock */}
        {onToggleTheme && (
          <div className="flex items-center justify-between gap-3 px-2 py-1 w-full border-t border-slate-200/80 pt-2">
            <span className="text-xs font-semibold text-slate-700 select-none">
              {isNight ? 'Night' : 'Day'} theme
            </span>
            <button
              type="button"
              onClick={onToggleTheme}
              title={`Switch to ${isNight ? 'Day' : 'Night'} Mode`}
              className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-xs font-mono font-bold transition-colors cursor-pointer"
            >
              {isNight ? '🌙' : '☀️'}
            </button>
          </div>
        )}
      </nav>

      {/* ── Mobile Drawer — Premium Slide-In Panel ── */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="mobile-drawer-overlay fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel — slides in from right */}
          <div
            className="mobile-drawer fixed top-0 right-0 h-full w-[min(340px,90vw)] z-50 lg:hidden flex flex-col"
            style={{
              background: 'linear-gradient(160deg, #0d1526 0%, #0f1a30 50%, #0a1020 100%)',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold text-white">Aniketh Rao</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="touch-target w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm transition-colors cursor-pointer"
                aria-label="Close navigation"
              >
                ✕
              </button>
            </div>

            {/* Time & Location badge */}
            <div className="px-6 pt-4 pb-3">
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/6 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-mono text-white/90 block">{locationCity}</span>
                  <span className="text-[11px] font-mono text-white/50">{nzTime}</span>
                </div>

                {/* Theme toggle inline */}
                {onToggleTheme && (
                  <button
                    type="button"
                    onClick={onToggleTheme}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono text-white transition-all cursor-pointer flex-shrink-0"
                  >
                    {isNight ? '🌙' : '☀️'} {isNight ? 'Night' : 'Day'}
                  </button>
                )}
              </div>
            </div>

            {/* Nav links */}
            <nav aria-label="Mobile navigation" className="px-4 flex-1 overflow-y-auto">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const isActive = activeSection === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => scrollToSection(item.id, item.key)}
                      className={`mobile-drawer-item touch-target w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left font-semibold transition-all cursor-pointer ${isActive
                          ? 'bg-white/12 text-white border border-white/15'
                          : 'text-white/70 hover:text-white hover:bg-white/8'
                        }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all ${isActive ? 'bg-cyan-400 scale-125' : 'bg-white/30'
                          }`}
                      />
                      <span className="text-base">{item.label}</span>
                      {isActive && (
                        <span className="ml-auto text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Resume */}
                <a
                  href="/Aniketh_NZ_Resume.pdf"
                  download
                  className="mobile-drawer-item touch-target flex items-center gap-3 px-4 py-3.5 rounded-2xl text-white/70 hover:text-white hover:bg-white/8 font-semibold transition-all cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30 flex-shrink-0" />
                  <span className="text-base">Resume</span>
                  <span className="ml-auto text-xs font-mono text-white/40">PDF ↓</span>
                </a>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/10 my-4" />

              {/* Interactive Mode Toggle */}
              <div className="mobile-drawer-item px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-white block">Interactive Mode</span>
                    <span className="text-[11px] font-mono text-white/40">
                      {interactiveMode ? '3D physics enabled' : '3D physics disabled'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleInteractiveMode}
                    title="Toggle interactive 3D physics"
                    className={`w-14 h-7 rounded-full transition-colors relative flex items-center px-1 cursor-pointer flex-shrink-0 ${interactiveMode ? 'bg-indigo-500' : 'bg-slate-600'
                      }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${interactiveMode ? 'translate-x-7' : 'translate-x-0'
                        }`}
                    />
                  </button>
                </div>
              </div>
            </nav>

            {/* CTA at bottom */}
            <div className="px-4 pb-8 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onContactClick();
                }}
                className="w-full py-4 rounded-2xl bg-white text-slate-900 font-bold text-base hover:bg-slate-100 active:scale-95 transition-all cursor-pointer shadow-lg"
              >
                Get in touch ↗
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
