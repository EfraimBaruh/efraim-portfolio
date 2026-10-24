import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML per route — deployable to any static host.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // A stray lockfile in the home directory would otherwise be picked as root.
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
