"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./ScrollCue.module.css";

/** How far (px) a page must extend past the fold to be worth a cue. */
const MIN_OVERFLOW = 160;
/** Scrolling this far dismisses the cue for the rest of the page view. */
const DISMISS_AT = 24;

/**
 * A quiet "Scroll" label with a hairline at the bottom of the first screen,
 * shown only on pages that continue past the fold. It fades in after a
 * moment, leaves on the first scroll and doesn't come back until the next
 * route. Decorative: the content below is reachable without it.
 */
export default function ScrollCue() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const scroller = document.documentElement;
    const onScroll = () => {
      if (window.scrollY <= DISMISS_AT) return;
      setVisible(false);
      window.removeEventListener("scroll", onScroll);
    };
    // Measure after the new route has laid out.
    const frame = requestAnimationFrame(() => {
      const fresh = window.scrollY <= DISMISS_AT;
      const overflows = scroller.scrollHeight - window.innerHeight > MIN_OVERFLOW;
      setVisible(fresh && overflows);
      if (fresh && overflows) window.addEventListener("scroll", onScroll, { passive: true });
    });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  return (
    <div className={styles.cue} data-visible={visible || undefined} aria-hidden="true">
      <span className={styles.label}>Scroll</span>
      <span className={styles.line} />
    </div>
  );
}
