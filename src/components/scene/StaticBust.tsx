"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./StaticBust.module.css";

/**
 * Shown instead of the 3D scene when WebGL is unavailable or the scene fails
 * to start: a still of the real render (scripts/capture/stills.mjs), placed
 * where the live bust would stand. Same modes as Experience.
 */
export default function StaticBust() {
  const path = usePathname().replace(/\/$/, "");
  const mode = path === "" ? "hero" : /^\/work\/[^/]+$/.test(path) ? "detail" : "content";

  return (
    <div className={styles.layer} data-mode={mode} aria-hidden="true">
      <Image
        className={styles.bust}
        src="/images/avatar/bust.jpg"
        alt=""
        width={1120}
        height={1480}
        priority={mode === "hero"}
      />
    </div>
  );
}
