// Canonical profile data. Open question (location wording)
// is tracked in docs/KNOWLEDGE.md — confirm before publishing changes.
export const profile = {
  name: "Efraim Baruh Bölükbaşı",
  shortName: "Efraim Baruh",
  title: "Senior Software Engineer",
  focus: "Real-time 3D · Unity · AR/VR",
  current: { title: "Senior Software Engineer", company: "Rapsodo" },
  // Efraim's own copy (career span counts from 09.2019). Two paragraphs:
  // the lead is the punchline, the second the detail. Edit only in his words.
  positioning: [
    "I've spent seven years building real-time 3D in Unity. Next I want to point that toward molecular self-assembly, where structure builds itself from simple local rules.",
    "So far that has meant golf simulation at Rapsodo, VR training and university lab experiments, AR telepresence, and simulators for self-driving vehicles. Most of it is physics that has to hold frame rate on a phone or a headset, and I want to bring that to the simulation tools that let people see self-assembly and steer it.",
  ],
  // Public contact address, confirmed by Efraim (2026-10-24).
  email: "efraimbaruh.bolukbasi@yahoo.com",
  links: {
    linkedin: "https://linkedin.com/in/efraimbaruh-bolukbasi",
    github: "https://github.com/EfraimBaruh",
  },
} as const;
