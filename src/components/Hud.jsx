import React from 'react';

export default function Hud({ activeStation, scrollToStation }) {
  const sectionLabel = {
    bihar:      'About',
    punjab:     'Projects',
    experience: 'Experience',
    contact:    'Contact',
  };

  return (
    <header className="hud-header interactive">
      <div className="hud-top">
        <div className="logo-container">
          <span className="plane-icon-cartoon" role="img" aria-label="Aeroplane">✈️</span>
          <h1 className="hud-title">Shreya Bajaj</h1>
        </div>
        <span className="hud-subtitle">
          {sectionLabel[activeStation] ?? 'About'}
        </span>
      </div>

      {/* 4 compact nav dots */}
      <div className="flight-path-map">
        <div className="flight-line-bg"></div>
        <div className="flight-line-fill"></div>

        <button
          className={`station-node ${activeStation === 'bihar' ? 'active' : ''}`}
          onClick={() => scrollToStation(0)}
        >
          👩
          <span className="station-tooltip">About</span>
        </button>

        <button
          className={`station-node ${activeStation === 'punjab' ? 'active' : ''}`}
          onClick={() => scrollToStation(1)}
        >
          💻
          <span className="station-tooltip">Projects</span>
        </button>

        <button
          className={`station-node ${activeStation === 'experience' ? 'active' : ''}`}
          onClick={() => scrollToStation(2)}
        >
          💼
          <span className="station-tooltip">Experience</span>
        </button>

        <button
          className={`station-node ${activeStation === 'contact' ? 'active' : ''}`}
          onClick={() => scrollToStation(3)}
        >
          ✉️
          <span className="station-tooltip">Contact</span>
        </button>
      </div>
    </header>
  );
}
