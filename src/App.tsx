import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HologramProjectorStage } from './components/HologramProjectorStage';
import { ProjectsSection } from './components/ProjectsSection';
import { SkillsSection } from './components/SkillsSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';

export const App: React.FC = () => {
  const [interactiveMode, setInteractiveMode] = useState(true);
  const [themeOverride, setThemeOverride] = useState<'day' | 'night' | null>(null);
  const [locationCity, setLocationCity] = useState('Auckland');

  // Compute auto day/night from current local hour
  const getAutoIsNight = () => {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6;
  };

  const isNight = themeOverride !== null ? themeOverride === 'night' : getAutoIsNight();

  // Toggle theme manually
  const toggleTheme = () => {
    setThemeOverride(isNight ? 'day' : 'night');
  };

  // Geolocation: fetch city via IP (no API key needed, free service)
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then((r) => r.json())
      .then((data) => {
        if (data?.city) setLocationCity(data.city);
      })
      .catch(() => {
        // Fallback to Auckland on error
      });
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      className="relative min-h-screen text-slate-100 overflow-x-hidden selection:bg-indigo-500 selection:text-white transition-colors duration-700"
      style={{ background: isNight ? '#090d16' : '#0b1628' }}
    >
      <Navbar
        interactiveMode={interactiveMode}
        onToggleInteractiveMode={() => setInteractiveMode((v) => !v)}
        onContactClick={() => scrollToSection('contact')}
        isNight={isNight}
        onToggleTheme={toggleTheme}
        locationCity={locationCity}
      />

      <main>
        <HologramProjectorStage
          interactiveMode={interactiveMode}
          onExploreProjects={() => scrollToSection('projects')}
          isNight={isNight}
        />
        <ProjectsSection />
        <AboutSection />
        <SkillsSection />
        <ContactSection />
      </main>
    </div>
  );
};

export default App;
