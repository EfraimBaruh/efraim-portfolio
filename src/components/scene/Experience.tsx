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
          gl={{ antialias: true }}
        >
          <color attach="background" args={[palette.ink]} />
          <CameraRig focus={focus} />

          {/* Studio rig: soft key from front-left, thin rim from behind, faint fill. */}
          <directionalLight position={[-2.5, 3, 2.5]} intensity={3} />
          <directionalLight position={[2.5, 2.5, -3]} intensity={5} color={palette.accent2} />
          <directionalLight position={[-3, 1.5, -2.5]} intensity={3} color={palette.accent} />
          <hemisphereLight args={[palette.accent, palette.ink, 0.5]} />

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
