// Canonical profile data. Open questions (title, public email, location)
// are tracked in docs/KNOWLEDGE.md — confirm before publishing changes.
export const profile = {
  name: "Efraim Baruh Bölükbaşı",
  shortName: "Efraim Baruh",
  title: "Senior Software Engineer",
  focus: "Real-time 3D · Unity · AR/VR",
  current: { title: "Senior Software Engineer", company: "Rapsodo" },
  // Written from Efraim's CV (2026-11-18). Career span counts from 09.2019.
  positioning:
    "I've spent seven years building real-time 3D in Unity: golf simulation at Rapsodo, VR training and university lab experiments, AR telepresence, and simulators for self-driving vehicles. Most of it is physics that has to hold frame rate on a phone or a headset. Next I want to point that toward molecular self-assembly, where structure builds itself from simple local rules, and toward the simulation tools that let people see it and steer it.",
  // Public contact address, confirmed by Efraim (2026-10-24).
  email: "efraimbaruh.bolukbasi@yahoo.com",
  links: {
    linkedin: "https://linkedin.com/in/efraimbaruh-bolukbasi",
    github: "https://github.com/EfraimBaruh",
  },
} as const;
