"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import Avatar from "./Avatar";
import CameraRig from "./CameraRig";
import Loader from "./Loader";
import styles from "./Experience.module.css";

export default function Experience() {
  return (
    <>
      <div className={styles.canvas} aria-hidden="true">
        <Canvas
          dpr={[1, 2]}
          camera={{ fov: 26 }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={["#0b0b0c"]} />
          <CameraRig />

          {/* Studio rig: soft key from front-left, thin rim from behind, faint fill. */}
          <directionalLight position={[-2.5, 3, 2.5]} intensity={3} />
          <directionalLight position={[2.5, 2.5, -3]} intensity={4} color="#edebe6" />
          <hemisphereLight args={["#edebe6", "#0b0b0c", 0.6]} />

          <Environment resolution={256} environmentIntensity={0.8}>
            <Lightformer form="rect" intensity={2} position={[-3, 2, 2]} scale={[2, 3, 1]} />
            <Lightformer form="rect" intensity={3} position={[3, 2, -3]} scale={[0.4, 4, 1]} />
          </Environment>

          <Suspense fallback={null}>
            <Avatar />
            <ContactShadows position={[0, 0, 0]} scale={6} blur={2.4} far={1.2} opacity={0.6} resolution={512} />
          </Suspense>
        </Canvas>
      </div>
      <Loader />
    </>
  );
}
