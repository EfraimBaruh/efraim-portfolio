import React from 'react';
import { Link } from 'react-router-dom';
import HeroScene from '../components/HeroScene';
import './Home.css';

const EMITTER = {
  modelPath: '/models/R2D2-compressed.glb',
  position: [4.0, -2.45, 4.8],
  scale: [1.5, 1.5, 1.5],
  rotation: [0, -Math.PI / 3, 0],
};

const HOLOGRAM = {
  modelPath: '/models/EfraimBaruh-compressed.glb',
  position: [2.0, -2.1, 4.8],
  scale: [1.5, 1.5, 1.5],
  rotation: [0, -Math.PI / 3, 0],
  isHologram: true,
};

const BEAM = {
  enabled: true,
  emitterOffset: [0, 0.6, 0],
  targetOffset: [0, 0.05, 0],
};

function Home() {
  return (
    <section className="home-hero">
      <HeroScene emitter={EMITTER} hologram={HOLOGRAM} beam={BEAM} />
      <div className="home-hero-content">
        <h1>Efraim Baruh Bolukbasi</h1>
        <h2>Unity Developer | AR & VR Specialist</h2>
        <p>Experienced Unity developer with 5+ years of expertise in AR/VR development, real-time simulations, and mobile game development. Currently working as a Unity Developer at Rapsodo, developing innovative golf-based mini-games.</p>
        <div className="home-hero-actions">
          <Link to="/projects" className="home-btn home-btn-primary">View Projects</Link>
          <Link to="/contact" className="home-btn home-btn-secondary">Get in Touch</Link>
        </div>
      </div>
    </section>
  );
}

export default Home;
