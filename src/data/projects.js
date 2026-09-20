import rapsodoLogo from '../assets/images/rapsodo-logo.png';
import scalarVisionLogo from '../assets/images/scalar-vision-logo.png';
import vrLabLogo from '../assets/images/vr-lab-logo.png';

const projects = [
  {
    title: "Golf Simulation",
    description: "An immersive golf simulation experience using Unity, featuring realistic physics and course environments.",
    technologies: ["Unity", "C#", "3D Modeling", "Physics"],
    image: "golf-sim.jpg",
    videoUrl: "https://www.youtube.com/embed/yKx0g9ECHBI",
    company: {
      name: "Rapsodo",
      logo: rapsodoLogo,
      position: "Senior Unity Developer",
      timeInterval: "2023 - Present"
    },
    responsibilities: [
      "Led the development of real-time physics simulation for golf ball trajectory",
      "Implemented advanced 3D modeling and texturing for golf courses",
      "Optimized performance for mobile devices",
      "Collaborated with the design team to create intuitive user interfaces"
    ]
  },
  {
    title: "VR Lab Experiments",
    description: "Virtual reality simulations of university-level laboratory experiments, making science education more accessible.",
    technologies: ["VR", "Unity", "Education", "Interactive Learning"],
    image: "vr-lab.jpg",
    videoUrl: "https://www.youtube.com/embed/4ju-EpsM97Q",
    company: {
      name: "VRLabAcademy",
      logo: vrLabLogo,
      position: "VR Developer",
      timeInterval: "2020 - 2022"
    },
    responsibilities: [
      "Designed and implemented interactive VR laboratory environments",
      "Created realistic physics simulations for chemical reactions",
      "Developed assessment and feedback systems for student learning",
      "Collaborated with educators to ensure educational accuracy"
    ]
  },
  {
    title: "3D Holographic Communication",
    description: "Next-generation communication platform enabling real-time 3D holographic interactions across distances.",
    technologies: ["AR/VR", "Unity", "3D Scanning", "Real-time Networking"],
    image: "hologram.jpg",
    videoUrl: "https://www.youtube.com/embed/KpMGg58Wa2U",
    company: {
      name: "Scalar Vision",
      logo: scalarVisionLogo,
      position: "AR/VR Developer",
      timeInterval: "2019 - 2020"
    },
    responsibilities: [
      "Developed real-time 3D scanning and reconstruction algorithms",
      "Implemented network synchronization for multi-user holographic sessions",
      "Created custom shaders for realistic holographic rendering",
      "Optimized streaming performance for low-latency communication"
    ]
  }
];

export default projects;
