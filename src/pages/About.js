import React from 'react';

function About() {
  return (
    <section className="about">
      <h2>Professional Background</h2>
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
            <li>Unity 3D Development (5+ years) - UWP, WebGL, Android, iOS</li>
            <li>Mobile Application Development (2+ years)</li>
            <li>Machine Vision (C++)</li>
            <li>Version Control: Bitbucket, GitLab</li>
            <li>Project Management: Jira, Slack, MSTeams</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default About; 