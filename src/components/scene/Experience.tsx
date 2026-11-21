"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import Avatar from "./Avatar";
import CameraRig from "./CameraRig";
import Loader from "./Loader";
import { useSceneFocus } from "./sceneFocus";
import { palette } from "@/content/palette";
import styles from "./Experience.module.css";

export default function Experience() {
  // Home presents the portrait; the Work list keeps it beside the list; case
  // studies put it faded behind the text so the media column has the right.
  const path = usePathname().replace(/\/$/, "");
  const focus = useSceneFocus() && path === "";
  const mode = focus ? "focus" : path === "" ? "hero" : /^\/work\/[^/]+$/.test(path) ? "detail" : "content";

  return (
    <>
      <div className={styles.canvas} data-mode={mode} aria-hidden="true">
        <Canvas
          dpr={[1, 2]}
          camera={{ fov: 26 }}
          gl={{ antialias: true, alpha: true }}
        >
          {/* Neon trial: transparent canvas, so the page's gradient
              atmosphere sits behind the bust instead of tinting it. */}
          <CameraRig focus={focus} />

          {/* Studio rig: soft key from front-left, thin rim from behind, faint fill. */}
          <directionalLight position={[-2.5, 3, 2.5]} intensity={3} />
          {/* Theme trial: the face keeps neutral light; colour only rims the
              silhouette, from well behind so it doesn't spill onto the front. */}
          <directionalLight position={[3.5, 2.2, -4.5]} intensity={5.2} color={palette.accent2} />
          <directionalLight position={[-2.5, 3.5, -5]} intensity={2.6} color={palette.accent} />
          <hemisphereLight args={[palette.bone, palette.ink, 0.6]} />

          <Environment resolution={256} environmentIntensity={0.8}>
            <Lightformer form="rect" intensity={2} position={[-3, 2, 2]} scale={[2, 3, 1]} />
            <Lightformer form="rect" intensity={3} position={[3, 2, -3]} scale={[0.4, 4, 1]} />
          </Environment>

          <Suspense fallback={null}>
            <Avatar mode={mode} />
          </Suspense>
        </Canvas>
      </div>
      <Loader />
    </>
  );
}
