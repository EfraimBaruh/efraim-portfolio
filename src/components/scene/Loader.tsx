"use client";

import { useProgress } from "@react-three/drei";
import styles from "./Loader.module.css";

export default function Loader() {
  const { progress, active } = useProgress();
  const done = !active && progress >= 100;

  return (
    <div className={styles.loader} data-done={done} role="status" aria-live="polite">
      <span>Loading scan</span>
      <span className={styles.value}>{Math.round(progress).toString().padStart(3, " ")}%</span>
      <span className={styles.bar} style={{ transform: `scaleX(${progress / 100})` }} />
    </div>
  );
}
