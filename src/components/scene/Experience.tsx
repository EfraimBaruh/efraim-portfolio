"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import Avatar from "./Avatar";
import styles from "./Experience.module.css";

export default function Experience() {
  return (
    <div className={styles.canvas} aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 1.55, 3.2], fov: 30 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#0b0b0c"]} />

        {/* Studio rig: one soft key, one thin rim from behind, no fill. */}
        <directionalLight position={[-2.5, 3, 2.5]} intensity={1.6} />
        <directionalLight position={[2.5, 2.5, -3]} intensity={2.2} color="#edebe6" />

        <Environment resolution={256}>
          <Lightformer form="rect" intensity={1.2} position={[-3, 2, 2]} scale={[2, 3, 1]} />
          <Lightformer form="rect" intensity={2} position={[3, 2, -3]} scale={[0.4, 4, 1]} />
        </Environment>

        <Suspense fallback={null}>
          <Avatar />
        </Suspense>
      </Canvas>
    </div>
  );
}
