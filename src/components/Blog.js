import React from 'react';
import './Blog.css';

function Blog() {
  const blogPosts = [
    {
      id: 1,
      title: "NPM Package Management for Unity (UPM) with Verdaccio",
      date: "March 15, 2024",
      content: `
        <h3>Introduction</h3>
        <p>Unity Package Manager (UPM) has revolutionized how we manage dependencies in Unity projects. By leveraging NPM and Verdaccio, we can create a robust private package management system for Unity development.</p>

        <h3>Why Use Verdaccio with Unity?</h3>
        <ul>
          <li>Private package hosting for internal tools and libraries</li>
          <li>Version control for custom Unity packages</li>
          <li>Team collaboration without exposing code publicly</li>
          <li>Faster package installation and updates</li>
        </ul>

        <h3>Setting Up Verdaccio</h3>
        <pre>
npm install -g verdaccio
verdaccio
        </pre>

        <h3>Configuring Unity for Custom Registry</h3>
        <p>In your Unity project's manifest.json:</p>
        <pre>
{
  "scopedRegistries": [
    {
      "name": "Your Company",
      "url": "http://localhost:4873",
      "scopes": ["com.yourcompany"]
    }
  ],
  "dependencies": {
    "com.yourcompany.yourpackage": "1.0.0"
  }
}
        </pre>

        <h3>Best Practices</h3>
        <ul>
          <li>Use semantic versioning for your packages</li>
          <li>Maintain clear documentation for each package</li>
          <li>Implement proper package validation</li>
          <li>Set up CI/CD for automated package publishing</li>
        </ul>
      `
    },
    {
      id: 2,
      title: "Scriptable Objects and Events in Unity",
      date: "March 15, 2024",
      content: `
        <h3>Understanding Scriptable Objects</h3>
        <p>Scriptable Objects are powerful Unity assets that allow you to store and share data between scenes and game instances. They're particularly useful for:</p>
        <ul>
          <li>Configuration data management</li>
          <li>Shared game settings</li>
          <li>Asset management</li>
          <li>Event system implementation</li>
        </ul>

        <h3>Scriptable Events System</h3>
        <p>Creating a robust event system using Scriptable Objects:</p>
        <pre>
[CreateAssetMenu(fileName = "GameEvent", menuName = "Events/Game Event")]
public class GameEvent : ScriptableObject
{
    private List<GameEventListener> listeners = new List<GameEventListener>();

    public void Raise()
    {
        for (int i = listeners.Count - 1; i >= 0; i--)
        {
            listeners[i].OnEventRaised();
        }
    }

    public void RegisterListener(GameEventListener listener)
    {
        listeners.Add(listener);
    }

    public void UnregisterListener(GameEventListener listener)
    {
        listeners.Remove(listener);
    }
}
        </pre>

        <h3>Advantages in Development</h3>
        <ul>
          <li><strong>Decoupling:</strong> Components can communicate without direct references</li>
          <li><strong>Reusability:</strong> Event assets can be reused across different scenes</li>
          <li><strong>Maintainability:</strong> Easier to debug and modify event flow</li>
          <li><strong>Performance:</strong> Reduced memory usage compared to traditional approaches</li>
        </ul>

        <h3>Implementation Example</h3>
        <pre>
public class GameEventListener : MonoBehaviour
{
    public GameEvent Event;
    public UnityEvent Response;

    private void OnEnable()
    {
        Event.RegisterListener(this);
    }

    private void OnDisable()
    {
        Event.UnregisterListener(this);
    }

    public void OnEventRaised()
    {
        Response.Invoke();
    }
}
        </pre>

        <h3>Best Practices</h3>
        <ul>
          <li>Use Scriptable Objects for shared data that doesn't need to be instantiated</li>
          <li>Implement proper event cleanup in OnDisable</li>
          <li>Create event categories for better organization</li>
          <li>Use UnityEvents for inspector-friendly responses</li>
        </ul>
      `
    }
  ];

  return (
    <section id="blog" className="blog">
      <h2>Development Blog</h2>
      <div className="blog-posts">
        {blogPosts.map(post => (
          <article key={post.id} className="blog-post">
            <h3>{post.title}</h3>
            <span className="post-date">{post.date}</span>
            <div 
              className="post-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
        ))}
      </div>
    </section>
  );
}

export default Blog; 