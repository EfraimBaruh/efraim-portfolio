// Canonical profile data. Open questions (title, public email, location)
// are tracked in docs/KNOWLEDGE.md — confirm before publishing changes.
export const profile = {
  name: "Efraim Baruh Bölükbaşı",
  shortName: "Efraim Baruh",
  title: "Senior Software Engineer",
  focus: "Real-time 3D · Unity · AR/VR",
  current: { title: "Senior Software Engineer", company: "Rapsodo" },
  // DRAFT, built from KNOWLEDGE.md + projects.ts. Needs Efraim's sign-off
  // before it ships to main.
  positioning:
    "I build real-time 3D for mobile, AR and VR, from physics-driven golf simulation at Rapsodo to holographic telepresence.",
  // Public contact address, confirmed by Efraim (2026-10-24).
  email: "efraimbaruh.bolukbasi@yahoo.com",
  links: {
    linkedin: "https://linkedin.com/in/efraimbaruh-bolukbasi",
    github: "https://github.com/EfraimBaruh",
  },
} as const;
