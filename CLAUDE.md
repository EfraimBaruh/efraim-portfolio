# Efraim Baruh Bölükbaşı — Portfolio Site

## Purpose

This repository is the personal portfolio website for **Efraim Baruh Bölükbaşı**, a
Senior Software Engineer specializing in Unity, C#/.NET, and AR/VR/mobile game
development (see his résumé for full background). The site exists to showcase his
professional work history, featured projects, and provide a way for recruiters/
collaborators to reach him.

Content on the site is drawn directly from his career:
- **Home / About** — intro, bio, and current role as Senior Software Engineer
  (Remote) at Rapsodo, Singapore, building a MiniApp SDK and the `SuperApp` golf
  application (device communication layers, SIL simulation workflows).
- **Projects** (`src/data/projects.js`) — case studies mirroring his résumé's work
  history, e.g. Golf Simulation (Rapsodo), VR Lab Experiments (VRLabAcademy,
  university physics/chemistry VR), 3D Holographic Communication (Scalar Vision AR/VR).
  Each project entry includes the associated company, role, and time interval.
- **Social** — links (LinkedIn, GitHub, etc.).
- **Blog** — placeholder/section for future posts.
- **Contact** — contact form / direct contact options.

Prior related roles not yet reflected as project cards but part of his background:
Gleechi AB (VR industrial training), Leke Games (mobile multiplayer games — *TDZ:
Traffic Driving Zone*, *Defense of the Kings*), ADASTEC (Unity + ROS2 simulation for
Level 4 autonomous vehicles), and VRLabAcademy/Scalar Vision (AR/VR, already featured).

## Tech Stack

- React 19 (Create React App / `react-scripts`)
- `react-router-dom` v7 for routing (`/`, `/projects`, `/about`, `/social`, `/blog`, `/contact`)
- `three` (Three.js) — used in `src/components/Model3D.js` for interactive 3D
  content on the Home page
- Plain CSS per-component (no CSS framework)

## Structure

```
src/
├── App.js              # Router setup, top-level routes
├── components/
│   ├── Layout.js        # Shared page chrome (nav, wrapper)
│   ├── Navbar.js
│   ├── Model3D.js        # Three.js 3D model viewer (Home page)
│   ├── Projects.js       # Projects listing page
│   ├── ProjectModal.js   # Project detail modal
│   ├── Blog.js
│   └── Contact.js
├── pages/
│   ├── Home.js
│   ├── About.js
│   └── Social.js
├── data/
│   └── projects.js       # Project case-study data (title, company, role, tech, etc.)
└── assets/images/        # Company logos, screenshots
```

## Working in this repo

- Update project case studies in `src/data/projects.js` — this is the canonical
  source of truth for what's shown on the Projects page.
- Theme colors are defined as CSS variables (currently a burgundy theme per
  README; commit history shows an active theme change in progress).
- `npm start` / `npm run build` / `npm test` are the standard CRA scripts.
