import type { Metadata } from "next";
import { profile } from "./profile";

/**
 * The public origin, used for canonical URLs, the sitemap and social cards.
 * Set NEXT_PUBLIC_SITE_URL at build time once the domain is decided
 * (docs/LAUNCH.md). Without it, URLs point at localhost.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** Static routes that belong in the sitemap (trailing slash: see next.config). */
export const staticRoutes = ["/", "/work/", "/about/"] as const;

/**
 * Search text (decided 2026-11-21): titles and descriptions name the roles
 * people search for (Unity, AR/VR, real-time 3D, software developer) and
 * both spellings of the surname. Facts only; nothing here may claim more
 * than src/content/about.ts says.
 */
export const search = {
  /** People type the surname without Turkish letters as often as with. */
  nameAscii: "Efraim Baruh Bolukbasi",
  alternateNames: ["Efraim Baruh", "Efraim Baruh Bolukbasi", "Efraim Bölükbaşı", "Efraim Bolukbasi"],
  /** The roles, in the order people search for them. */
  roles: "Unity, AR/VR and Real-Time 3D Developer",
  home: {
    title: `${profile.name}: Unity, AR/VR and Real-Time 3D Developer`,
    description: `${profile.name} (Bolukbasi), senior software engineer and Unity developer at Rapsodo. Seven years of AR/VR, real-time 3D simulation and mobile games.`,
  },
  work: {
    title: `Unity, AR/VR and 3D Simulation Projects | ${profile.name}`,
    description: `Case studies by ${profile.name} (Bolukbasi), Unity and AR/VR developer: golf simulation at Rapsodo, university VR lab experiments and 3D holographic telepresence.`,
  },
  about: {
    title: `About ${profile.name}, Unity and AR/VR Software Engineer`,
    description: `${profile.name} (Bolukbasi): senior software engineer and Unity developer. AR/VR apps, real-time 3D, autonomous-vehicle simulation and multiplayer mobile games since 2019.`,
  },
  /** Ignored by Google; read lightly by Bing and others. */
  keywords: [
    "Efraim Baruh Bölükbaşı",
    "Efraim Baruh Bolukbasi",
    "Efraim Bolukbasi",
    "Unity developer",
    "Unity 3D developer",
    "AR developer",
    "VR developer",
    "AR/VR developer",
    "XR developer",
    "3D developer",
    "real-time 3D developer",
    "software developer",
    "senior software engineer",
    "C# developer",
    ".NET developer",
    "game developer",
    "mobile game developer",
    "simulation engineer",
    "physics simulation",
    "3D scanning",
    "Rapsodo",
    "portfolio",
  ],
} as const;

const shared = {
  siteName: `${profile.name} · ${search.roles}`,
  locale: "en_US",
} as const;

/** src/app/opengraph-image.png, rendered by scripts/capture/stills.mjs. */
const card = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: `${profile.name}, ${profile.title}: real-time render of a 3D-scanned bust.`,
};

/** Metadata for one page: title, description, canonical URL and social card text. */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  /** Route path with trailing slash, e.g. "/work/". */
  path: string;
}): Metadata {
  return {
    title,
    description,
    keywords: [...search.keywords],
    alternates: { canonical: path },
    // A page-level openGraph replaces the layout's, so the card is named here.
    openGraph: { ...shared, type: "website", title, description, url: path, images: [card] },
    twitter: { card: "summary_large_image", title, description, images: [card] },
  };
}

/**
 * schema.org Person + WebSite, rendered as JSON-LD in the root layout. Gives
 * search engines the name in both spellings, the roles and the profiles that
 * belong to the same person (for a knowledge panel and name searches).
 */
export function personJsonLd() {
  const person = {
    "@type": "Person",
    "@id": `${siteUrl}/#person`,
    name: profile.name,
    alternateName: [...search.alternateNames],
    jobTitle: [profile.current.title, "Unity Developer", "AR/VR Developer"],
    description: search.home.description,
    worksFor: { "@type": "Organization", name: profile.current.company },
    alumniOf: { "@type": "CollegeOrUniversity", name: "Marmara University" },
    knowsLanguage: ["Turkish", "English", "Russian", "Chinese"],
    url: `${siteUrl}/`,
    image: `${siteUrl}/opengraph-image.png`,
    email: `mailto:${profile.email}`,
    sameAs: [profile.links.linkedin, profile.links.github],
    knowsAbout: [
      "Unity",
      "C#",
      ".NET",
      "Real-time 3D",
      "Augmented reality",
      "Virtual reality",
      "Extended reality",
      "3D graphics",
      "Shaders",
      "Physics simulation",
      "Game development",
      "Mobile game development",
      "Multiplayer networking",
      "3D scanning",
      "Robot Operating System",
      "Autonomous vehicle simulation",
      "Molecular self-assembly",
    ],
  };
  const website = {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: `${siteUrl}/`,
    name: profile.name,
    alternateName: [search.nameAscii, `${profile.name} portfolio`],
    about: { "@id": `${siteUrl}/#person` },
    inLanguage: "en",
  };
  return { "@context": "https://schema.org", "@graph": [person, website] };
}
