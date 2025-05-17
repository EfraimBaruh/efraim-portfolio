import React from 'react';
import './Social.css';

function Social() {
  const socialCards = [
    {
      title: "Cultural Exploration",
      image: "cultural.jpg", // You'll need to add these images to your assets
      description: "Exploring different cultures through travel and local experiences",
      tags: ["Travel", "Culture", "Photography"]
    },
    {
      title: "Language Learning",
      image: "languages.jpg",
      description: "My journey in learning multiple languages",
      tags: ["Turkish", "English", "Russian", "Chinese"]
    },
    {
      title: "Global Perspectives",
      image: "global.jpg",
      description: "Experiences from living in multiple countries",
      tags: ["International", "Diversity", "Experience"]
    }
  ];

  return (
    <div className="social-container">
      <h2 className="social-title">Social & Cultural</h2>
      <div className="social-grid">
        {socialCards.map((card, index) => (
          <div className="social-card" key={index}>
            <div className="social-image">
              <div className="image-overlay">
                <div className="tags">
                  {card.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="social-content">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Social; 