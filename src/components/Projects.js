import React, { useState } from 'react';
import ProjectModal from './ProjectModal';
import './Projects.css';
import projects from '../data/projects';

function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);

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
                  <span className="time-interval">{project.company.timeInterval}</span>
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