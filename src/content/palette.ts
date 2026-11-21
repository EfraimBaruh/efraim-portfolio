// Theme trial (branch theme-neon): "Slate", between Studio Noir and Ice.
// Mirrors the CSS tokens in app/globals.css — the 3D scene needs raw hex.
export const palette = {
  ink: "#191d23",
  surface: "#222730",
  bone: "#eef1f3",
  muted: "#9aa2ab",
  accent: "#84d8ec",
  // Pale ice: the main rim light and the point-cloud intro.
  accent2: "#c5dde4",
  // Baked into the avatar GLB by scripts/avatar/rig_avatar.py (the tie).
  // Regenerate the GLB after changing it.
  tie: "#111110",
} as const;
