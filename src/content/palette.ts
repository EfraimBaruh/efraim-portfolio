// Neon trial (branch theme-neon): deep indigo night, violet neon, cyan rim.
// Mirrors the CSS tokens in app/globals.css — the 3D scene needs raw hex.
export const palette = {
  ink: "#0c0a1d",
  surface: "#15122f",
  bone: "#ece8ff",
  muted: "#9b94c8",
  accent: "#b57bff",
  // Second neon: the cyan rim light and the point-cloud intro.
  accent2: "#4de3ff",
  // Baked into the avatar GLB by scripts/avatar/rig_avatar.py (the tie).
  // Regenerate the GLB after changing it.
  tie: "#111110",
} as const;
