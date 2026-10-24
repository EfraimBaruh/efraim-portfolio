import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML per route — deployable to any static host.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
