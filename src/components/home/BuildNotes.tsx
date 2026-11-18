"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { build } from "@/content/build";
import { setSceneFocus } from "@/components/scene/sceneFocus";
import styles from "./BuildNotes.module.css";

/**
 * "How this site is built": a quiet button in the hero. Opening it brings the
 * bust into focus (CameraRig/Avatar "focus") and shows the notes beside it.
 * The notes are always in the HTML (crawlable); closed, they're inert.
 */
export default function BuildNotes() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  const show = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setOpen(true);
    setSceneFocus(true);
  }, []);

  const hide = useCallback(() => {
    setOpen(false);
    setSceneFocus(false);
  }, []);

  // Focus follows the view: into the notes on open, back to the button on
  // close (once it's rendered visible again).
  const wasOpen = useRef(false);
  useEffect(() => {
    if (!open) {
      if (wasOpen.current) trigger.current?.focus({ preventScroll: true });
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    heading.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, hide]);

  // Leaving Home (or unmounting) always releases the focus view.
  useEffect(() => () => setSceneFocus(false), []);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls="build-notes"
        onClick={show}
        hidden={open}
      >
        How it&apos;s built <span aria-hidden="true">+</span>
      </button>

      <aside id="build-notes" className={styles.panel} data-open={open || undefined} inert={!open} aria-labelledby="build-title">
        <div className={styles.top}>
          <p className={styles.eyebrow}>Behind the bust</p>
          <button type="button" className={styles.close} onClick={hide}>
            Close <span aria-hidden="true">×</span>
          </button>
        </div>
        <h2 id="build-title" ref={heading} tabIndex={-1} className={styles.title}>
          {build.title}
        </h2>
        <p className={styles.intro}>{build.intro}</p>
        <ol className={styles.list}>
          {build.sections.map((s, i) => (
            <li key={s.title} className={styles.item}>
              <span className={styles.index}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className={styles.itemTitle}>{s.title}</h3>
                <p className={styles.body}>{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </aside>
    </>
  );
}
