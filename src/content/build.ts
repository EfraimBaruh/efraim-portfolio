// "How this site is built": the optional view opened from Home. Every fact
// here is checked against the code and docs/RIGGING.md; keep it that way.
export const build = {
  title: "How this site is built",
  intro:
    "The bust on this page is the main piece of work on this site. Here is what goes into it.",
  sections: [
    {
      title: "A real scan",
      body: "It's a 3D scan of me: about 68,000 triangles, 7 materials and 17 textures. With meshopt geometry compression, quantized vertices and WebP textures it ships at 3.1 MB.",
    },
    {
      title: "Rigged by a script",
      body: "The scan came without a skeleton, in a stiff pose. A headless Blender script places 22 bones from slices measured through the body, relaxes the pose and keys a four-second breathing idle. The scan is 282 separate pieces with open edges, which breaks Blender's usual automatic weighting, so each bone gets a tapered capsule of influence instead.",
    },
    {
      title: "Assembled from points",
      body: "On your first visit, up to 140,000 points sampled from the skinned surface rise into place bottom-up in a custom shader. Then the solid scan sweeps up through them. It plays once per session, and never if you've asked your system to reduce motion.",
    },
    {
      title: "Cut as a bust",
      body: "The scan's own materials are patched so that below the chest the surface fades into the background colour and is not drawn at all. It reads like a lit bust on a plinth.",
    },
    {
      title: "A host that pays attention",
      body: "With a mouse, the head and neck turn toward your cursor, sharing the turn 60/40 and ignoring small moves so it doesn't twitch. You can drag the bust to turn it up to 45° either way; left alone, it drifts back.",
    },
    {
      title: "One canvas for the whole site",
      body: "The site is a static Next.js export with React Three Fiber. A single WebGL canvas lives in the root layout, so the bust moves between pages instead of reloading, and every page's text is plain HTML underneath.",
    },
  ],
};
