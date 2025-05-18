import React from 'react';
import Model3D from '../components/Model3D';
import './Home.css';

function Home() {
  return (
    <section className="hero">
      <Model3D 
        modelPath="/models/scene.gltf"
        position={[0.6, -3, 4.2]}
        scale={[1.5, 1.5, 1.5]}
      />
      <Model3D 
        modelPath="/models/R2D2.glb"
        position={[1.8, -3, 4.8]}
        scale={[1.5, 1.5, 1.5]}
        rotation={[0, -Math.PI / 3, 0]}
      />
      
      <Model3D 
        modelPath="/models/R2D2.glb"
        position={[0, -3, 4.8]}
        scale={[1.5, 1.5, 1.5]}
        rotation={[0, -Math.PI / 3, 0]}
        isHologram={true}
        coneProps={{
          showTriangle: true
        }}
      />
      <div className="hero-content">
        <h1>Efraim Baruh Bolukbasi</h1>
        <h2>Unity Developer | AR & VR Specialist</h2>
        <p>Experienced Unity developer with 5+ years of expertise in AR/VR development, real-time simulations, and mobile game development. Currently working as a Unity Developer at Rapsodo, developing innovative golf-based mini-games.</p>
      </div>
    </section>
  );
}

export default Home; 