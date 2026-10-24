// Case studies. Source: v1 site data (docs/KNOWLEDGE.md). Copy still needs
// Efraim's review — especially roles/dates flagged as open questions there.
export type Project = {
  slug: string;
  title: string;
  summary: string;
  company: { name: string; logo: string };
  role: string;
  period: string;
  stack: string[];
  youtubeId: string;
  responsibilities: string[];
};

export const projects: Project[] = [
  {
    slug: "golf-simulation",
    title: "Golf Simulation",
    summary:
      "An immersive golf simulation built in Unity, with realistic ball physics and course environments, running on mobile.",
    company: { name: "Rapsodo", logo: "/images/logos/rapsodo-logo.png" },
    role: "Senior Unity Developer",
    period: "2023 – present",
    stack: ["Unity", "C#", "Physics", "3D"],
    youtubeId: "yKx0g9ECHBI",
    responsibilities: [
      "Led the real-time physics simulation of golf ball trajectory",
      "Built 3D modeling and texturing workflows for golf courses",
      "Optimized rendering and simulation performance for mobile devices",
      "Worked with the design team on intuitive in-game interfaces",
    ],
  },
  {
    slug: "vr-lab-experiments",
    title: "VR Lab Experiments",
    summary:
      "Virtual-reality versions of university physics and chemistry lab experiments, making hands-on science accessible without a physical lab.",
    company: { name: "VRLabAcademy", logo: "/images/logos/vr-lab-logo.png" },
    role: "VR Developer",
    period: "2020 – 2022",
    stack: ["Unity", "C#", "VR", "Simulation"],
    youtubeId: "4ju-EpsM97Q",
    responsibilities: [
      "Designed and built interactive VR laboratory environments",
      "Simulated chemical reactions and physical experiments in real time",
      "Developed assessment and feedback systems for student learning",
      "Worked with educators to keep every experiment scientifically accurate",
    ],
  },
  {
    slug: "holographic-communication",
    title: "3D Holographic Communication",
    summary:
      "A real-time communication platform that captures people in 3D and streams them as holograms to remote participants in AR and VR.",
    company: { name: "Scalar Vision", logo: "/images/logos/scalar-vision-logo.png" },
    role: "AR/VR Developer",
    period: "2019 – 2020",
    stack: ["Unity", "AR/VR", "3D scanning", "Networking", "Shaders"],
    youtubeId: "KpMGg58Wa2U",
    responsibilities: [
      "Developed real-time 3D scanning and reconstruction",
      "Synchronized multi-user holographic sessions over the network",
      "Wrote custom shaders for holographic rendering",
      "Optimized streaming for low-latency communication",
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
