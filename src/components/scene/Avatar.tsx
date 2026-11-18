"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import PointCloudIntro from "./PointCloudIntro";
import { applyReveal } from "./revealMaterial";
import { localBounds } from "./sampleSurface";
import { markIntroSeen, shouldPlayIntro } from "./introState";
import { useHostBehavior } from "./useHostBehavior";
import { useTurntable } from "./useTurntable";
import { BUST_CUT, FIGURE_HEIGHT } from "./bust";

// Efraim's 3D scan, rigged by scripts/avatar/rig_avatar.py: relaxed rest pose,
// 22-bone skeleton, "Idle" loop. Meshopt + quantized + WebP.
const AVATAR_URL = "/models/EfraimBaruh-rigged.glb";
const TARGET_HEIGHT = FIGURE_HEIGHT;
const SWEEP_DURATION = 1.4;
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

// Placement per page mode (desktop), sized for the bust framing in
// CameraRig. Content pages: a touch further right, turned toward the text
// column. Mobile stays centered and dims via CSS.
const POSES = {
  hero: { x: 0.42, rotY: -0.3 },
  content: { x: 0.36, rotY: -0.6 },
} as const;

export type AvatarMode = keyof typeof POSES;

export default function Avatar({ mode }: { mode: AvatarMode }) {
  // useGLTF wires up the meshopt decoder; draco is unused by this asset.
  const { scene, animations } = useGLTF(AVATAR_URL, false);
  // Desktop: portrait sits right of the name. Mobile: centered behind it.
  const wide = useThree((state) => state.size.width >= 768);

  const [playIntro] = useState(shouldPlayIntro);
  const [introFinished, setIntroFinished] = useState(!playIntro);
  const [count] = useState(particleBudget);
  // Dissolve height in world Y; copied into the shader uniforms every frame.
  const reveal = useRef(playIntro ? REVEAL_HIDDEN : REVEAL_SHOWN);
  const revealUniforms = useRef<{ value: number }[]>([]);
  const sweepElapsed = useRef<number | null>(null);
  const rig = useRef<THREE.Group>(null);
  // Initial placement only; afterwards useFrame damps toward the active pose,
  // so props must not change with `mode` (R3F would snap them).
  const [initialPose] = useState(() => POSES[mode]);

  // Idle + head tracking start once the scan has fully assembled.
  useHostBehavior({ scene, animations, body: rig, active: introFinished });
  // Visitor can drag to turn the bust (±45°), once it has assembled.
  const { turn, dragging } = useTurntable(rig, introFinished);

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

  // Layout effect, not a passive one: it must run before the first frame is
  // drawn, or slow devices briefly show the full bust before the intro hides it.
  useLayoutEffect(() => {
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
    if (rig.current) {
      const pose = POSES[mode];
      const targetX = offset.x + (wide ? pose.x : 0);
      // Phones: square to the viewer, no three-quarter turn.
      const targetRot = (wide ? pose.rotY : 0) + turn.current;
      rig.current.position.x = THREE.MathUtils.damp(rig.current.position.x, targetX, 2.2, delta);
      // Track the finger/mouse closely while dragging; ease gently otherwise.
      const follow = dragging.current ? 14 : 2.2;
      rig.current.rotation.y = THREE.MathUtils.damp(rig.current.rotation.y, targetRot, follow, delta);
    }
    setUniforms(revealUniforms.current, reveal.current);
    if (sweepElapsed.current === null) return;
    sweepElapsed.current += Math.min(delta, 1 / 30);
    const t = Math.min(sweepElapsed.current / SWEEP_DURATION, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    reveal.current = THREE.MathUtils.lerp(BUST_CUT, TARGET_HEIGHT + 0.1, eased);
    if (t >= 1) {
      sweepElapsed.current = null;
      reveal.current = REVEAL_SHOWN;
      setIntroFinished(true);
      markIntroSeen();
    }
  });

  return (
    <group
      ref={rig}
      position={[offset.x + (wide ? initialPose.x : 0), offset.y, offset.z]}
      rotation={[0, wide ? initialPose.rotY : 0, 0]}
    >
      <primitive object={scene} scale={scale} />
      {!introFinished && (
        <group scale={scale}>
          <PointCloudIntro
            source={scene}
            count={count}
            floorY={(BUST_CUT - offset.y) / scale}
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
