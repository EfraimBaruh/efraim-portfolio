import React, { useState } from 'react';
import ProjectModal from './ProjectModal';
import './Projects.css';

// Import company logos
import rapsodoLogo from '../assets/images/rapsodo-logo.png';
import scalarVisionLogo from '../assets/images/scalar-vision-logo.png';
import vrLabLogo from '../assets/images/vr-lab-logo.png';
import arSolutionsLogo from '../assets/images/vr-lab-logo.png';

function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);

  const projects = [
    {
      title: "Golf Simulation",
      description: "An immersive golf simulation experience using Unity, featuring realistic physics and course environments.",
      technologies: ["Unity", "C#", "3D Modeling", "Physics"],
      image: "golf-sim.jpg",
      videoUrl: "https://www.youtube.com/embed/yKx0g9ECHBI",
      company: {
        name: "Rapsodo",
        logo: rapsodoLogo,
        position: "Senior Unity Developer"
      },
      responsibilities: [
        "Led the development of real-time physics simulation for golf ball trajectory",
        "Implemented advanced 3D modeling and texturing for golf courses",
        "Optimized performance for mobile devices",
        "Collaborated with the design team to create intuitive user interfaces"
      ]
    },
    {
      title: "3D Holographic Communication",
      description: "Next-generation communication platform enabling real-time 3D holographic interactions across distances.",
      technologies: ["AR/VR", "Unity", "3D Scanning", "Real-time Networking"],
      image: "hologram.jpg",
      videoUrl: "https://www.youtube.com/embed/KpMGg58Wa2U",
      company: {
        name: "Scalar Vision",
        logo: scalarVisionLogo,
        position: "AR/VR Developer"
      },
      responsibilities: [
        "Developed real-time 3D scanning and reconstruction algorithms",
        "Implemented network synchronization for multi-user holographic sessions",
        "Created custom shaders for realistic holographic rendering",
        "Optimized streaming performance for low-latency communication"
      ]
    },
    {
      title: "VR Lab Experiments",
      description: "Virtual reality simulations of university-level laboratory experiments, making science education more accessible.",
      technologies: ["VR", "Unity", "Education", "Interactive Learning"],
      image: "vr-lab.jpg",
      videoUrl: "https://www.youtube.com/embed/4ju-EpsM97Q",
      company: {
        name: "VRLabAcademy",
        logo: vrLabLogo,
        position: "VR Developer"
      },
      responsibilities: [
        "Designed and implemented interactive VR laboratory environments",
        "Created realistic physics simulations for chemical reactions",
        "Developed assessment and feedback systems for student learning",
        "Collaborated with educators to ensure educational accuracy"
      ]
    }
  ];

  return (
    <div className="projects-container">
      <h2>Featured Projects</h2>
      <div className="projects-grid">
        {projects.map((project, index) => (
          <div className="project-card" key={index}>
            <div className="project-image">
              <div className="image-overlay">
                <div className="technologies">
                  {project.technologies.map((tech, techIndex) => (
                    <span key={techIndex} className="tech-tag">{tech}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="project-content">
              <div className="company-info">
                <div className="company-logo">
                  <img src={project.company.logo} alt={`${project.company.name} logo`} />
                </div>
                <div className="company-details">
                  <h4>{project.company.name}</h4>
                  <span className="position">{project.company.position}</span>
                </div>
              </div>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <button 
                className="learn-more"
                onClick={() => setSelectedProject(project)}
              >
                Learn More
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}

export default Projects; 