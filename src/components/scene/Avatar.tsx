"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import PointCloudIntro from "./PointCloudIntro";
import { applyReveal } from "./revealMaterial";
import { localBounds } from "./sampleSurface";
import { markIntroSeen, shouldPlayIntro } from "./introState";

// 3D scan of Efraim — static mesh (no rig yet), meshopt + quantized + WebP.
const AVATAR_URL = "/models/EfraimBaruh-compressed.glb";
const TARGET_HEIGHT = 1.8;
const SWEEP_DURATION = 1.7;
const REVEAL_HIDDEN = -0.2;
const REVEAL_SHOWN = 100;

function particleBudget() {
  const small = window.innerWidth < 768;
  const weak = (navigator.hardwareConcurrency ?? 4) <= 4;
  return small || weak ? 60000 : 140000;
}

function setUniforms(uniforms: { value: number }[], value: number) {
  for (const u of uniforms) u.value = value;
}

export default function Avatar() {
  // useGLTF wires up the meshopt decoder; draco is unused by this asset.
  const { scene } = useGLTF(AVATAR_URL, false);
  // Desktop: portrait sits right of the name. Mobile: centered behind it.
  const wide = useThree((state) => state.size.width >= 768);

  const [playIntro] = useState(shouldPlayIntro);
  const [introFinished, setIntroFinished] = useState(!playIntro);
  const [count] = useState(particleBudget);
  // Dissolve height in world Y; copied into the shader uniforms every frame.
  const reveal = useRef(playIntro ? REVEAL_HIDDEN : REVEAL_SHOWN);
  const revealUniforms = useRef<{ value: number }[]>([]);
  const sweepElapsed = useRef<number | null>(null);

  // Normalize: feet on the ground, centered, ~1.8 m tall.
  const { scale, offset } = useMemo(() => {
    const box = localBounds(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = TARGET_HEIGHT / size.y;
    return {
      scale: s,
      offset: new THREE.Vector3(-center.x * s, -box.min.y * s, -center.z * s),
    };
  }, [scene]);

  useEffect(() => {
    const uniforms: { value: number }[] = [];
    scene.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((m) => uniforms.push(applyReveal(m, reveal.current)));
    });
    revealUniforms.current = uniforms;
  }, [scene]);

  useFrame((_, delta) => {
    setUniforms(revealUniforms.current, reveal.current);
    if (sweepElapsed.current === null) return;
    sweepElapsed.current += Math.min(delta, 1 / 30);
    const t = Math.min(sweepElapsed.current / SWEEP_DURATION, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    reveal.current = THREE.MathUtils.lerp(REVEAL_HIDDEN, TARGET_HEIGHT + 0.1, eased);
    if (t >= 1) {
      sweepElapsed.current = null;
      reveal.current = REVEAL_SHOWN;
      setIntroFinished(true);
      markIntroSeen();
    }
  });

  return (
    <group position={[offset.x + (wide ? 0.6 : 0), offset.y, offset.z]} rotation={[0, -0.35, 0]}>
      <primitive object={scene} scale={scale} />
      {!introFinished && (
        <group scale={scale}>
          <PointCloudIntro
            source={scene}
            count={count}
            revealRef={reveal}
            onAssembled={() => {
              sweepElapsed.current = 0;
            }}
          />
        </group>
      )}
    </group>
  );
}

useGLTF.preload(AVATAR_URL, false);
