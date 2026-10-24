"use client";

import { useState } from "react";
import styles from "./VideoEmbed.module.css";

// Click-to-load facade: no YouTube scripts or cookies until the visitor asks.
export default function VideoEmbed({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className={styles.frame}>
      {playing ? (
        <iframe
          className={styles.media}
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button type="button" className={styles.poster} onClick={() => setPlaying(true)}>
          {/* eslint-disable-next-line @next/next/no-img-element -- remote thumbnail, static export */}
          <img
            className={styles.media}
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt=""
            loading="lazy"
          />
          <span className={styles.play}>Play video</span>
        </button>
      )}
    </div>
  );
}
