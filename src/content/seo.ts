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

const shared = {
  siteName: profile.name,
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
    alternates: { canonical: path },
    // A page-level openGraph replaces the layout's, so the card is named here.
    openGraph: { ...shared, type: "website", title, description, url: path, images: [card] },
    twitter: { card: "summary_large_image", title, description, images: [card] },
  };
}

/** schema.org Person, rendered as JSON-LD in the root layout. */
export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    alternateName: profile.shortName,
    jobTitle: profile.current.title,
    worksFor: { "@type": "Organization", name: profile.current.company },
    url: `${siteUrl}/`,
    image: `${siteUrl}/opengraph-image.png`,
    email: `mailto:${profile.email}`,
    sameAs: [profile.links.linkedin, profile.links.github],
    knowsAbout: ["Real-time 3D", "Unity", "C#", ".NET", "Augmented reality", "Virtual reality", "Simulation"],
  };
}
