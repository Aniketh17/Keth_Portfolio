import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HologramProjectorStage } from './components/HologramProjectorStage';
import { ProjectsSection } from './components/ProjectsSection';
import { SkillsSection } from './components/SkillsSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';

export const App: React.FC = () => {
  const [interactiveMode, setInteractiveMode] = useState(true);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0b0f19] text-slate-100 overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Floating Left Navigation & Top Header Bar */}
      <Navbar
        interactiveMode={interactiveMode}
        onToggleInteractiveMode={() => setInteractiveMode(!interactiveMode)}
        onContactClick={() => scrollToSection('contact')}
      />

      <main>
        {/* Act I: 3D Holographic Projector & Dreamscape Stage (Image 2 + Image 1) */}
        <HologramProjectorStage
          interactiveMode={interactiveMode}
          onExploreProjects={() => scrollToSection('projects')}
        />

        {/* Act II: Projects & Flagship IMAC Clinical Advisor RAG Showcase */}
        <ProjectsSection />

        {/* Act III: About Aniketh & Neural Capabilities */}
        <AboutSection />
        <SkillsSection />

        {/* Act IV: Direct Outreach & Transmission Terminal */}
        <ContactSection />
      </main>
    </div>
  );
};

export default App;
