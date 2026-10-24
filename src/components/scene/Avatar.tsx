"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// 3D scan of Efraim — static mesh (no rig yet), meshopt + quantized + WebP.
const AVATAR_URL = "/models/EfraimBaruh-compressed.glb";
const TARGET_HEIGHT = 1.8;

export default function Avatar() {
  // useGLTF wires up the meshopt decoder; draco is unused by this asset.
  const { scene } = useGLTF(AVATAR_URL, false);

  // Normalize: feet on the ground, centered, ~1.8 m tall.
  const { scale, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = TARGET_HEIGHT / size.y;
    return {
      scale: s,
      offset: new THREE.Vector3(-center.x * s, -box.min.y * s, -center.z * s),
    };
  }, [scene]);

  return (
    <group position={offset} rotation={[0, -0.35, 0]}>
      <primitive object={scene} scale={scale} />
    </group>
  );
}

useGLTF.preload(AVATAR_URL, false);
