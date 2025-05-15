import React from 'react';
import Navbar from './components/Navbar';
import Contact from './components/Contact';
import Projects from './components/Projects';
import './App.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <section id="home" className="hero">
          <div className="hero-content">
            <h1>Efraim Baruh Bolukbasi</h1>
            <h2>Unity Developer | AR & VR Specialist</h2>
            <p>Experienced Unity developer with 5+ years of expertise in AR/VR development, real-time simulations, and mobile game development. Currently working as a Unity Developer at Rapsodo, developing innovative golf-based mini-games.</p>
          </div>
        </section>

        <section id="projects" className="projects">
          <Projects />
        </section>

        <section id="about" className="about">
          <h2>About Me</h2>
          <div className="about-content">
            <p>I am a passionate Unity developer with extensive experience in AR/VR development, real-time simulations, and mobile game development. My journey in technology spans across multiple countries, including Turkey, the UK, and Sweden, giving me a diverse perspective on software development.</p>
            
            <div>
              <h3>Professional Experience</h3>
              <ul>
                <li>Currently working as a Unity Developer at Rapsodo, developing golf-based mini-games</li>
                <li>Previously worked as a Senior VR Developer at Gleechi AB, creating VR training simulations</li>
                <li>Developed multiplayer mobile games at Leke Games, including TDZ: Traffic Driving Zone</li>
                <li>Created autonomous vehicle simulations at ADASTEC using Unity, C#, and ROS</li>
                <li>Developed VR-based university experiments at VRLabAcademy</li>
              </ul>
            </div>

            <div>
              <h3>Technical Skills</h3>
              <ul>
                <li>Unity 3D Development (4+ years) - UWP, WebGL, Android, iOS</li>
                <li>Mobile Application Development (2+ years)</li>
                <li>Machine Vision (C++)</li>
                <li>Version Control: Bitbucket, GitLab</li>
                <li>Project Management: Jira, Slack, MSTeams</li>
              </ul>
            </div>

            <div>
              <h3>Languages</h3>
              <ul>
                <li>Turkish (Native)</li>
                <li>English (C1 Level)</li>
                <li>Russian (A2 Level)</li>
                <li>Chinese (A2 Level)</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="contact" className="contact">
          <Contact />
        </section>
      </main>
    </div>
  );
}

export default App;