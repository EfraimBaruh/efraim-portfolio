"use client";

import { useSyncExternalStore } from "react";

// Shared between page content and the scene: is the bust "in focus" (the
// "How this site is built" view on Home)? Mirrored to <html data-focus> so
// page CSS can step the hero text aside and lock scrolling.
let focused = false;
const listeners = new Set<() => void>();

export function setSceneFocus(value: boolean) {
  if (value === focused) return;
  focused = value;
  if (value) document.documentElement.dataset.focus = "build";
  else delete document.documentElement.dataset.focus;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSceneFocus() {
  return useSyncExternalStore(
    subscribe,
    () => focused,
    () => false,
  );
}
