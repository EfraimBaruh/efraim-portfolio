// Studio Noir, warm charcoal variant. Mirrors the CSS tokens in
// app/globals.css — the 3D scene needs raw hex values.
export const palette = {
  ink: "#262624",
  surface: "#30302e",
  bone: "#f5f4ee",
  muted: "#a3a29c",
  accent: "#c8b89a",
  // Baked into the avatar GLB by scripts/avatar/rig_avatar.py (the tie).
  // Regenerate the GLB after changing it.
  tie: "#111110",
} as const;
