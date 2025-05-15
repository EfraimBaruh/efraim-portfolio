import React from 'react';
import './ProjectModal.css';

function ProjectModal({ project, onClose }) {
  if (!project) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <div className="modal-company-info">
            <img src={project.company.logo} alt={`${project.company.name} logo`} className="modal-company-logo" />
            <div>
              <h3>{project.company.name}</h3>
              <span className="modal-position">{project.position}</span>
            </div>
          </div>
          <h2>{project.title}</h2>
        </div>

        <div className="modal-body">
          <div className="modal-sections">
            <section className="modal-section">
              <h4>Project Overview</h4>
              <p>{project.description}</p>
            </section>

            <section className="modal-section">
              <h4>My Role & Responsibilities</h4>
              <ul className="responsibilities-list">
                {project.responsibilities.map((responsibility, index) => (
                  <li key={index}>
                    <span className="responsibility-bullet">•</span>
                    {responsibility}
                  </li>
                ))}
              </ul>
            </section>

            <section className="modal-section">
              <h4>Project Demo</h4>
              <div className="modal-video-container">
                <iframe
                  src={project.videoUrl}
                  title={project.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </section>

            <section className="modal-section">
              <h4>Technologies Used</h4>
              <div className="modal-technologies">
                {project.technologies.map((tech, index) => (
                  <span key={index} className="modal-tech-tag">{tech}</span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectModal; 