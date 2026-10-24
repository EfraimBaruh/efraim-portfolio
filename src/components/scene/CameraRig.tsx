"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

// Pull back on narrow (portrait) screens so the full figure fits the width.
const LOOK_AT_Y = 0.95;

export default function CameraRig() {
  const camera = useThree((state) => state.camera);
  const aspect = useThree((state) => state.size.width / state.size.height);

  useEffect(() => {
    const distance = aspect < 0.75 ? 6.6 : 5.2;
    camera.position.set(0, 1.15, distance);
    camera.lookAt(0, LOOK_AT_Y, 0);
  }, [camera, aspect]);

  return null;
}
