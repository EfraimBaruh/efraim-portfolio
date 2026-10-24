"use client";

import { type RefObject, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useAnimations } from "@react-three/drei";
import * as THREE from "three";

// Head tracking limits (radians) and how the turn is shared down the neck.
const MAX_YAW = 0.7;
const MAX_PITCH_UP = 0.3;
const MAX_PITCH_DOWN = 0.35;
const NECK_SHARE = 0.4;
const HEAD_SHARE = 0.6;
const LOOK_DAMPING = 4;
const WAKE_SECONDS = 1.2;

const UP = new THREE.Vector3(0, 1, 0);
const RIGHT = new THREE.Vector3(1, 0, 0);

type Bones = { neck: THREE.Object3D; head: THREE.Object3D };

/**
 * Brings the rigged scan to life once `active`: plays the Idle loop and turns
 * head + neck toward the pointer (toward the viewer on touch devices).
 * Inert until active, and entirely under reduced motion.
 */
export function useHostBehavior({
  scene,
  animations,
  body,
  active,
}: {
  scene: THREE.Object3D;
  animations: THREE.AnimationClip[];
  body: RefObject<THREE.Object3D | null>;
  active: boolean;
}) {
  // Registered first, so the mixer updates before the look-at below.
  const { actions } = useAnimations(animations, scene);
  const camera = useThree((state) => state.camera);

  const bones = useRef<Bones | null>(null);
  const pointer = useRef(new THREE.Vector2(0, 0));
  const look = useRef({ yaw: 0, pitch: 0, weight: 0 });
  const enabled = useRef(false);
  const scratch = useRef({
    raycaster: new THREE.Raycaster(),
    headPos: new THREE.Vector3(),
    target: new THREE.Vector3(),
    bodyQ: new THREE.Quaternion(),
    bodyQInv: new THREE.Quaternion(),
    parentQ: new THREE.Quaternion(),
    local: new THREE.Quaternion(),
    world: new THREE.Quaternion(),
    yawQ: new THREE.Quaternion(),
    pitchQ: new THREE.Quaternion(),
  });

  useEffect(() => {
    const neck = scene.getObjectByName("Neck");
    const head = scene.getObjectByName("Head");
    bones.current = neck && head ? { neck, head } : null;
    // Skinned bounds don't follow animation; avoid wrong culling.
    scene.traverse((node) => {
      if ((node as THREE.SkinnedMesh).isSkinnedMesh) node.frustumCulled = false;
    });
  }, [scene]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!active || reduce) return;
    enabled.current = true;
    const idle = actions.Idle;
    idle?.reset().fadeIn(WAKE_SECONDS).play();

    // Window-level: page content sits above the canvas and would swallow
    // canvas pointer events.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.current.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    };
    const onLeave = () => pointer.current.set(0, 0);
    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      enabled.current = false;
      idle?.fadeOut(0.3);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [active, actions]);

  useFrame((_, delta) => {
    const b = bones.current;
    if (!enabled.current || !b || !body.current) return;
    const s = scratch.current;
    const l = look.current;

    // Where the pointer is, at the head's distance from the camera.
    b.head.getWorldPosition(s.headPos);
    s.raycaster.setFromCamera(pointer.current, camera);
    const dist = camera.position.distanceTo(s.headPos);
    s.target.copy(s.raycaster.ray.direction).multiplyScalar(dist).add(s.raycaster.ray.origin);

    // Direction in the body's frame (the scan faces +Z).
    body.current.getWorldQuaternion(s.bodyQ);
    s.bodyQInv.copy(s.bodyQ).invert();
    s.target.sub(s.headPos).applyQuaternion(s.bodyQInv);
    const yaw = THREE.MathUtils.clamp(Math.atan2(s.target.x, s.target.z), -MAX_YAW, MAX_YAW);
    const pitch = THREE.MathUtils.clamp(
      Math.atan2(s.target.y, Math.hypot(s.target.x, s.target.z)),
      -MAX_PITCH_DOWN,
      MAX_PITCH_UP,
    );

    l.weight = Math.min(l.weight + delta / WAKE_SECONDS, 1);
    l.yaw = THREE.MathUtils.damp(l.yaw, yaw * l.weight, LOOK_DAMPING, delta);
    l.pitch = THREE.MathUtils.damp(l.pitch, pitch * l.weight, LOOK_DAMPING, delta);

    // Layer the look on top of the Idle pose: neck first, then head.
    for (const [bone, share] of [
      [b.neck, NECK_SHARE],
      [b.head, HEAD_SHARE],
    ] as const) {
      s.yawQ.setFromAxisAngle(UP, l.yaw * share);
      s.pitchQ.setFromAxisAngle(RIGHT, -l.pitch * share);
      // Body-space rotation -> world space -> bone's parent space.
      s.local.multiplyQuaternions(s.yawQ, s.pitchQ);
      s.world.copy(s.bodyQ).multiply(s.local).multiply(s.bodyQInv);
      bone.parent!.getWorldQuaternion(s.parentQ);
      s.local.copy(s.parentQ).invert().multiply(s.world).multiply(s.parentQ);
      bone.quaternion.premultiply(s.local);
      bone.updateMatrixWorld(true);
    }
  });
}
