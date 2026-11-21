"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BUST_CUT, BUST_TOP } from "./bust";

// Portrait framing for the bust. Distance is solved from the aspect ratio so
// the bust fits both the height and the width the layout gives it.
const BUST_SPAN = BUST_TOP - BUST_CUT;
/** Focus view: framed on the head and shoulders, centred on this height. */
const HEAD_Y = 1.6;
/** Where the bust sits (world X) in hero/focus on desktop; see Avatar POSES. */
const HERO_X = 0.42;

type Shot = { position: THREE.Vector3; target: THREE.Vector3 };

function solveShot(fov: number, width: number, height: number, focus: boolean): Shot {
  const aspect = width / height;
  const perMetre = 2 * Math.tan(THREE.MathUtils.degToRad(fov / 2));
  const wide = width >= 768;

  if (focus) {
    // Closer, on the head. Desktop: the bust sits right of the text panel.
    // Mobile: the head takes the top of the screen above the sheet.
    const viewHeight = wide ? 0.7 : 0.5;
    const viewWidth = wide ? 0.9 : 0.56;
    const distance = Math.max(viewHeight / perMetre, viewWidth / (perMetre * aspect));
    const visible = perMetre * distance;
    const fromTop = wide ? 0.45 : 0.3;
    const y = HEAD_Y - (0.5 - fromTop) * visible;
    const screenX = wide ? 0.7 : 0.5;
    const x = (wide ? HERO_X : 0) - (screenX - 0.5) * visible * aspect;
    return { position: new THREE.Vector3(x, y + 0.03, distance), target: new THREE.Vector3(x, y, 0) };
  }

  // Desktop: crown ~13% from the top, fade ending (~84%) above the hero floor
  // line, which sits at 90svh minus the gutter (the hero leaves a peek);
  // the bust sits right of centre, so leave room for it horizontally.
  // Mobile: the bust owns the top half (crown 9% down, cut at most ~49%,
  // where the hero text starts at 50svh); the text stacks below it.
  const viewHeight = wide ? BUST_SPAN / 0.71 : BUST_SPAN / 0.4;
  const viewWidth = wide ? 1.5 : 0.78;
  const distance = Math.max(viewHeight / perMetre, viewWidth / (perMetre * aspect));
  const visible = perMetre * distance;
  const topMargin = wide ? 0.13 : 0.09;
  const centerY = BUST_TOP + 0.02 - (0.5 - topMargin) * visible;
  return { position: new THREE.Vector3(0, centerY + 0.05, distance), target: new THREE.Vector3(0, centerY, 0) };
}

export default function CameraRig({ focus }: { focus: boolean }) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const { width, height } = useThree((state) => state.size);
  const shot = useRef<Shot | null>(null);
  const look = useRef(new THREE.Vector3());
  const snap = useRef(true);

  useEffect(() => {
    shot.current = solveShot(camera.fov, width, height, focus);
  }, [camera, width, height, focus]);

  // Resizes snap; focus changes glide (unless motion is reduced).
  useEffect(() => {
    snap.current = true;
  }, [width, height]);

  useFrame((_, delta) => {
    const s = shot.current;
    if (!s) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (snap.current || reduce) {
      camera.position.copy(s.position);
      look.current.copy(s.target);
      snap.current = false;
    } else {
      const k = 1 - Math.exp(-2.4 * Math.min(delta, 1 / 20));
      camera.position.lerp(s.position, k);
      look.current.lerp(s.target, k);
    }
    camera.lookAt(look.current);
  });

  return null;
}
