import React from 'react';

function Social() {
  return (
    <section className="social">
      <h2>About Me - Social</h2>
      <div className="social-content">
        <p>Beyond my professional life, I'm passionate about exploring different cultures and languages. Having lived in multiple countries, I've developed a deep appreciation for cultural diversity and global perspectives.</p>
        
        <div>
          <h3>Languages</h3>
          <ul>
            <li>Turkish (Native)</li>
            <li>English (C1 Level)</li>
            <li>Russian (B1 Level)</li>
            <li>Chinese (A2 Level)</li>
          </ul>
        </div>

        {/* Add more social content here, such as:
        - Hobbies and interests
        - Travel experiences
        - Cultural activities
        - Personal achievements
        - Community involvement
        */}
      </div>
    </section>
  );
}

export default Social; 