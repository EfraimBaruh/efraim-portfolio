"use client";

import dynamic from "next/dynamic";

// WebGL is client-only; page HTML stays static and crawlable.
const Experience = dynamic(() => import("./Experience"), { ssr: false });

export default function SceneRoot() {
  return <Experience />;
}
