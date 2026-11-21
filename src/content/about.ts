// About page content. Source: Efraim's CV (2026-11-18). The CV also holds
// private details (birth date, phone, street address); never copy them here.

export type Role = {
  company: string;
  role: string;
  place: string;
  period: string;
  line: string;
  /** Case study on this site, if one exists. */
  caseStudy?: string;
  /** Public proof: shipped apps, videos, product pages. */
  links?: { label: string; href: string }[];
};

export const about = {
  bio: [
    "I'm a software engineer working in Unity and C#, mostly on real-time 3D that has to run on phones and headsets. Since 2019 that has meant AR apps and telepresence in Istanbul, university VR lab experiments for a London company, simulators for level 4 autonomous vehicles, multiplayer mobile games shipped on both app stores, VR training in Stockholm, and, at Rapsodo since 2023, a golf SuperApp that hosts many mini-games.",
    "I studied electrical and electronics engineering at Marmara University. Lately I've been reading toward molecular self-assembly and the simulation tools used to study it, and I want my next work to sit closer to that.",
  ],

  experience: [
    {
      company: "Rapsodo",
      role: "Senior Software Engineer",
      place: "Singapore · remote",
      period: "12.2023 – present",
      line: "Golf mini-games, plus the MiniApp SDK and the Unity SuperApp that hosts them: device communication and SIL simulation workflows.",
      caseStudy: "golf-simulation",
    },
    {
      company: "Gleechi",
      role: "Senior VR Developer",
      place: "Stockholm",
      period: "09.2023 – 11.2023",
      line: "VR training simulations in Unity for headsets. The company closed after three months.",
      links: [{ label: "Video", href: "https://www.youtube.com/watch?v=khqMfDLBmgs" }],
    },
    {
      company: "Leke Games",
      role: "Mid-Senior Game Developer",
      place: "Istanbul",
      period: "06.2022 – 06.2023",
      line: "Multiplayer mobile games: TDZ: Traffic Driving Zone and Defense of the Kings, both on the App Store and Google Play.",
    },
    {
      company: "ADASTEC",
      role: "Unity Developer",
      place: "Istanbul",
      period: "12.2021 – 06.2022",
      line: "Simulations for level 4 autonomous vehicles, built with Unity, C# and ROS.",
    },
    {
      company: "VRLabAcademy",
      role: "Unity VR Developer",
      place: "London",
      period: "09.2020 – 12.2021",
      line: "University-level lab experiments in VR, for PC and headsets.",
      caseStudy: "vr-lab-experiments",
      links: [{ label: "Experiments", href: "https://www.vrlabacademy.com/Experiments.html?ID=491" }],
    },
    {
      company: "Scalar Vision",
      role: "AR & VR Developer",
      place: "Istanbul",
      period: "09.2019 – 09.2020",
      line: "Custom apps for iOS, Android and UWP, AR for the teleporter project, and the front end of the Mismos Design app.",
      caseStudy: "holographic-communication",
      links: [
        { label: "Mismos Design (App Store)", href: "https://apps.apple.com/sa/app/mismos-design/id1519694571" },
        { label: "Google Play", href: "https://play.google.com/store/apps/details?id=scalarvision.mismosdesign" },
      ],
    },
  ] satisfies Role[],

  skills: [
    { area: "Engine & languages", items: ["Unity", "C#", ".NET", "C++"] },
    { area: "Platforms", items: ["iOS", "Android", "PC VR & headsets", "UWP", "WebGL"] },
    { area: "Real-time 3D", items: ["Physics simulation", "Shaders", "3D scanning", "Multiplayer networking"] },
    { area: "Simulation", items: ["Autonomous-vehicle simulation", "ROS", "Machine vision"] },
    { area: "Tools", items: ["Git (GitLab, Bitbucket)", "Jira"] },
  ],

  education: [
    {
      title: "BSc, Electrical and Electronics Engineering",
      place: "Marmara University, Istanbul",
      period: "2015 – 2020",
    },
  ],

  certifications: [
    { title: "Nanotechnology: A Maker's Course", issuer: "Duke University, Coursera", year: "2025" },
    { title: "Unity Certified Professional: Programmer", issuer: "Unity", year: "2023" },
  ],

  languages: [
    { name: "Turkish", level: "Native" },
    { name: "English", level: "C1" },
    { name: "Russian", level: "A2" },
    { name: "Chinese", level: "A2" },
  ],
};
