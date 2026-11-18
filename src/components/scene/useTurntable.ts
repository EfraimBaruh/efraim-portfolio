"use client";

import { type RefObject, useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BUST_CUT, BUST_TOP } from "./bust";

/** How far the visitor may turn the bust from its default angle. */
const MAX_TURN = THREE.MathUtils.degToRad(45);
/** Dragging across this fraction of the viewport width turns it fully. */
const DRAG_SPAN = 0.3;
/** Bust half-extents around its vertical axis (metres), for hit-testing. */
const HALF_WIDTH = 0.34;
const HALF_DEPTH = 0.25;

const INTERACTIVE = "a, button, input, textarea, select, label, [role='button']";

/**
 * Lets the visitor drag horizontally on the bust to turn it about its vertical
 * axis, capped at ±45°. Works with mouse and touch. Page content sits above the
 * canvas, so this listens on the window and only claims drags that start over
 * the bust's on-screen area (and not on links or buttons). Vertical touch
 * swipes still scroll: the page uses `touch-action: pan-y` (globals.css).
 *
 * Returns the current turn offset in radians; the caller adds it to the pose.
 */
export function useTurntable(target: RefObject<THREE.Object3D | null>, enabled: boolean) {
  const turn = useRef(0);
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    const box = new THREE.Box3();
    const center = new THREE.Vector3();
    const corner = new THREE.Vector3();
    let drag: { id: number; x: number; start: number } | null = null;

    // Project the bust's bounding box to screen space and hit-test.
    const overBust = (x: number, y: number) => {
      const body = target.current;
      if (!body) return false;
      body.getWorldPosition(center);
      box.min.set(center.x - HALF_WIDTH, BUST_CUT, center.z - HALF_DEPTH);
      box.max.set(center.x + HALF_WIDTH, BUST_TOP, center.z + HALF_DEPTH);
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (let i = 0; i < 8; i++) {
        corner
          .set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z)
          .project(camera);
        const sx = ((corner.x + 1) / 2) * window.innerWidth;
        const sy = ((1 - corner.y) / 2) * window.innerHeight;
        minX = Math.min(minX, sx);
        maxX = Math.max(maxX, sx);
        minY = Math.min(minY, sy);
        maxY = Math.max(maxY, sy);
      }
      return x >= minX && x <= maxX && y >= minY && y <= maxY;
    };

    const grabbable = (e: PointerEvent) =>
      !(e.target instanceof Element && e.target.closest(INTERACTIVE)) && overBust(e.clientX, e.clientY);

    const onDown = (e: PointerEvent) => {
      if (!e.isPrimary || e.button !== 0 || !grabbable(e)) return;
      drag = { id: e.pointerId, x: e.clientX, start: turn.current };
      if (e.pointerType === "mouse") {
        e.preventDefault(); // no text selection while turning
        root.style.cursor = "grabbing";
      }
    };
    const onMove = (e: PointerEvent) => {
      if (drag && e.pointerId === drag.id) {
        const perPixel = MAX_TURN / (DRAG_SPAN * window.innerWidth);
        turn.current = THREE.MathUtils.clamp(drag.start + (e.clientX - drag.x) * perPixel, -MAX_TURN, MAX_TURN);
      } else if (!drag && e.pointerType === "mouse") {
        root.style.cursor = grabbable(e) ? "grab" : "";
      }
    };
    const onUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null;
      if (e.pointerType === "mouse") root.style.cursor = grabbable(e) ? "grab" : "";
    };

    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      root.style.cursor = "";
    };
  }, [enabled, camera, target]);

  return turn;
}
