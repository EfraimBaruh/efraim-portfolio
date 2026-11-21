"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode, useSyncExternalStore } from "react";
import StaticBust from "./StaticBust";

/**
 * Resolves once the page has loaded and the main thread is idle. The 3D
 * bundle (three, R3F, drei) costs seconds of script evaluation on mid-range
 * phones; waiting keeps it from delaying the text's paint (LCP) and from
 * competing with the page's own images for bandwidth.
 */
function afterPageIdle() {
  return new Promise<void>((resolve) => {
    let waited = false;
    const idle = () => {
      if (waited) return;
      waited = true;
      if ("requestIdleCallback" in window) requestIdleCallback(() => resolve(), { timeout: 1500 });
      else setTimeout(resolve, 200);
    };
    if (document.readyState === "complete") return idle();
    window.addEventListener("load", idle, { once: true });
    // `load` waits for every resource; one that stalls (seen with Safari
    // restoring a page from cache) would otherwise keep the scene from ever
    // starting. Past this cap, start anyway.
    setTimeout(idle, LOAD_CAP_MS);
  });
}

/** Longest the scene waits for the page's `load` event. */
const LOAD_CAP_MS = 4000;

// WebGL is client-only; page HTML stays static and crawlable.
const Experience = dynamic(() => afterPageIdle().then(() => import("./Experience")), { ssr: false });

let webgl: boolean | undefined;

/** Probed once per page load; the probe context is released right away. */
function hasWebGL() {
  if (webgl === undefined) {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      webgl = gl !== null;
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webgl = false;
    }
  }
  return webgl;
}

const subscribe = () => () => {};

/** If the scene throws (context creation, GLB load), fall back to the still. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <StaticBust /> : this.props.children;
  }
}

export default function SceneRoot() {
  // Server snapshot assumes WebGL: the server renders no scene either way.
  const supported = useSyncExternalStore(subscribe, hasWebGL, () => true);
  if (!supported) return <StaticBust />;
  return (
    <SceneBoundary>
      <Experience />
    </SceneBoundary>
  );
}
