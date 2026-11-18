"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BUST_CUT, BUST_TOP } from "./bust";

// Portrait framing for the bust. Distance is solved from the aspect ratio so
// the bust fits both the height and the width the layout gives it.
const BUST_SPAN = BUST_TOP - BUST_CUT;

export default function CameraRig() {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const { width, height } = useThree((state) => state.size);

  useEffect(() => {
    const aspect = width / height;
    const perMetre = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const wide = width >= 768;
    // Desktop: crown ~14% from the top, fade ending above the hero floor line;
    // the bust sits right of centre, so leave room for it horizontally.
    // Mobile: the bust owns the top half; the text stacks below it.
    const viewHeight = wide ? BUST_SPAN / 0.74 : BUST_SPAN / 0.46;
    const viewWidth = wide ? 1.5 : 0.78;
    const distance = Math.max(viewHeight / perMetre, viewWidth / (perMetre * aspect));
    const visible = perMetre * distance;
    const topMargin = wide ? 0.14 : 0.11;
    const centerY = BUST_TOP + 0.02 - (0.5 - topMargin) * visible;
    camera.position.set(0, centerY + 0.05, distance);
    camera.lookAt(0, centerY, 0);
  }, [camera, width, height]);

  return null;
}
