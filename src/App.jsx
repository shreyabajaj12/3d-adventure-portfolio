import React, { useState, useEffect, useRef } from 'react';
import FlightCanvas from './components/FlightCanvas';
import Hud from './components/Hud';
import MilestoneCard from './components/MilestoneCard';

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStation, setActiveStation] = useState('bihar');

  const biharRef      = useRef(null);
  const punjabRef     = useRef(null);
  const experienceRef = useRef(null);
  const contactRef    = useRef(null);

  // Scroll progress → active station (4 sections, each ~25%)
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const totalScrollable = docHeight - winHeight;
      if (totalScrollable <= 0) return;

      const progress = Math.min(Math.max(window.scrollY / totalScrollable, 0), 1);
      setScrollProgress(progress);

      if (progress < 0.25)       setActiveStation('bihar');
      else if (progress < 0.5)   setActiveStation('punjab');
      else if (progress < 0.75)  setActiveStation('experience');
      else                        setActiveStation('contact');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver — trigger slide-in animations for cards
  useEffect(() => {
    const cards = document.querySelectorAll('.milestone-card');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.12 }
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  const scrollToStation = (index) => {
    const refs = [biharRef, punjabRef, experienceRef, contactRef];
    const targetRef = refs[index];
    if (targetRef && targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <>
      {/* 3D Flight Simulation Canvas background */}
      <FlightCanvas scrollProgress={scrollProgress} activeStation={activeStation} />

      {/* Floating compact HUD nav */}
      <Hud activeStation={activeStation} scrollToStation={scrollToStation} />

      {/* Content UI */}
      <main className="ui-layer">
        <div className="card-container">

          {/* Section 1 — About */}
          <section id="bihar" ref={biharRef} className="milestone-section">
            <MilestoneCard station="bihar" />
          </section>

          {/* Section 2 — Projects & Education */}
          <section id="punjab" ref={punjabRef} className="milestone-section">
            <MilestoneCard station="punjab" />
          </section>

          {/* Section 3 — Experience */}
          <section id="experience" ref={experienceRef} className="milestone-section">
            <MilestoneCard station="experience" />
          </section>

          {/* Section 4 — Contact */}
          <section id="contact" ref={contactRef} className="milestone-section">
            <MilestoneCard station="contact" />
          </section>

        </div>

        {/* Scroll hint */}
        {scrollProgress < 0.88 && (
          <div className="scroll-indicator interactive">
            <span style={{ fontSize: '12px' }}>↓</span>
            <span className="scroll-text">
              {scrollProgress < 0.25
                ? "Scroll to explore"
                : scrollProgress < 0.5
                ? "See my projects"
                : scrollProgress < 0.75
                ? "My experience"
                : "Keep scrolling"}
            </span>
          </div>
        )}
      </main>
    </>
  );
}
