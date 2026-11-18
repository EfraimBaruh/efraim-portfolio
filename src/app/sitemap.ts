import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { siteUrl, staticRoutes } from "@/content/seo";

// Static export: generated once at build time.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [...staticRoutes, ...projects.map((p) => `/work/${p.slug}/`)];
  return paths.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
