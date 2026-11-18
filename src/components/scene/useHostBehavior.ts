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
/** Two damping stages in series: an eased start and a soft settle. */
const LOOK_DAMPING = 3;
/** The head ignores pointer moves until its gaze would change by this much. */
const GAZE_THRESHOLD = THREE.MathUtils.degToRad(8);
/** Once following, the pointer resting this long fixes the new gaze. */
const SETTLE_MS = 300;
const WAKE_SECONDS = 1.2;
/** Touch devices: no tracking; the head rests looking slightly down. */
const REST_PITCH = -THREE.MathUtils.degToRad(5);

const UP = new THREE.Vector3(0, 1, 0);
const RIGHT = new THREE.Vector3(1, 0, 0);

type Bones = { neck: THREE.Object3D; head: THREE.Object3D };

/**
 * Brings the rigged scan to life once `active`: plays the Idle loop and, on
 * devices with a mouse, turns head + neck toward the pointer. Touch devices
 * don't track; the head rests straight ahead, tilted 5° down. Under reduced
 * motion there is no idle or tracking, and the rest tilt applies instantly.
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
  // Smoothed look (two stages), and the committed gaze it eases toward.
  const look = useRef({ yaw: 0, pitch: 0, midYaw: 0, midPitch: 0, weight: 0 });
  const gaze = useRef({ yaw: 0, pitch: 0, following: false });
  const lastMove = useRef(0);
  // "track": follow the mouse. "rest": fixed look. "off": untouched.
  const lookMode = useRef<"off" | "track" | "rest">("off");
  const restPitch = useRef(0);
  const animated = useRef(false);
  const restPose = useRef<THREE.Quaternion[]>([]);
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
    restPose.current = neck && head ? [neck.quaternion.clone(), head.quaternion.clone()] : [];
    // Skinned bounds don't follow animation; avoid wrong culling.
    scene.traverse((node) => {
      if ((node as THREE.SkinnedMesh).isSkinnedMesh) node.frustumCulled = false;
    });
  }, [scene]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!active) return;
    // Look-at only where there is a hovering pointer to follow.
    const mouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    lookMode.current = mouse && !reduce ? "track" : "rest";
    restPitch.current = mouse ? 0 : REST_PITCH;
    animated.current = !reduce;
    if (reduce) look.current.weight = 1;
    const idle = reduce ? undefined : actions.Idle;
    idle?.reset().fadeIn(WAKE_SECONDS).play();

    // Window-level: page content sits above the canvas and would swallow
    // canvas pointer events.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.current.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      lastMove.current = performance.now();
    };
    const onLeave = () => pointer.current.set(0, 0);
    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      lookMode.current = "off";
      idle?.fadeOut(0.3);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [active, actions]);

  useFrame((_, delta) => {
    const b = bones.current;
    if (lookMode.current === "off" || !b || !body.current) return;
    const s = scratch.current;
    const l = look.current;

    // Without the mixer nothing resets the bones each frame; start from rest
    // so the look doesn't accumulate.
    if (!animated.current) {
      b.neck.quaternion.copy(restPose.current[0]);
      b.head.quaternion.copy(restPose.current[1]);
    }
    body.current.getWorldQuaternion(s.bodyQ);
    s.bodyQInv.copy(s.bodyQ).invert();

    let yaw = 0;
    let pitch = restPitch.current;
    if (lookMode.current === "track") {
      // Where the pointer is, at the head's distance from the camera.
      b.head.getWorldPosition(s.headPos);
      s.raycaster.setFromCamera(pointer.current, camera);
      const dist = camera.position.distanceTo(s.headPos);
      s.target.copy(s.raycaster.ray.direction).multiplyScalar(dist).add(s.raycaster.ray.origin);
      // Direction in the body's frame (the scan faces +Z).
      s.target.sub(s.headPos).applyQuaternion(s.bodyQInv);
      const wantYaw = THREE.MathUtils.clamp(Math.atan2(s.target.x, s.target.z), -MAX_YAW, MAX_YAW);
      const wantPitch = THREE.MathUtils.clamp(
        Math.atan2(s.target.y, Math.hypot(s.target.x, s.target.z)),
        -MAX_PITCH_DOWN,
        MAX_PITCH_UP,
      );

      // Hysteresis: small moves around the current gaze are ignored. Past the
      // threshold the gaze follows the pointer until it rests, then re-anchors.
      const g = gaze.current;
      if (!g.following && Math.hypot(wantYaw - g.yaw, wantPitch - g.pitch) > GAZE_THRESHOLD) {
        g.following = true;
      }
      if (g.following) {
        g.yaw = wantYaw;
        g.pitch = wantPitch;
        if (performance.now() - lastMove.current > SETTLE_MS) g.following = false;
      }
      yaw = g.yaw;
      pitch = g.pitch;
    }

    l.weight = Math.min(l.weight + delta / WAKE_SECONDS, 1);
    if (animated.current) {
      l.midYaw = THREE.MathUtils.damp(l.midYaw, yaw * l.weight, LOOK_DAMPING, delta);
      l.midPitch = THREE.MathUtils.damp(l.midPitch, pitch * l.weight, LOOK_DAMPING, delta);
      l.yaw = THREE.MathUtils.damp(l.yaw, l.midYaw, LOOK_DAMPING, delta);
      l.pitch = THREE.MathUtils.damp(l.pitch, l.midPitch, LOOK_DAMPING, delta);
    } else {
      l.yaw = yaw;
      l.pitch = pitch;
    }

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
