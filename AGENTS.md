# Efraim Baruh Bölükbaşı — Portfolio v2

## What this repo is
The personal portfolio of **Efraim Baruh Bölükbaşı**, a Senior Software Engineer
(Unity, C#/.NET, AR/VR, real-time 3D, mobile games), currently at Rapsodo. The
audience is recruiters, hiring managers, and collaborators. They should come away
thinking *"this person is excellent at real-time 3D"* within the first 10 seconds.

## Status
**v1 is deprecated and is being rebuilt from scratch.** v1 (CRA + React 19 +
imperative Three.js) had weak UI/UX and an inconsistent visual identity. Its code
is not a reference for style or architecture. Only its **content and assets**
carry over.

- Extracted content, career data, and asset specs: [`docs/KNOWLEDGE.md`](docs/KNOWLEDGE.md)
- Design directions: [`docs/DESIGN_DIRECTIONS.md`](docs/DESIGN_DIRECTIONS.md).
  **Chosen: A + C hybrid.** "Studio Noir" (warm charcoal `#262624`, not near-black; rim-lit portrait,
  serif/grotesk, bone-colored text) is the site-wide system. The "Point Cloud"
  assembly of the avatar is used **once**, as the intro and loading sequence.
- Tech stack: [`docs/TECH_STACK.md`](docs/TECH_STACK.md). **Chosen: Next.js (App
  Router, static export) + React Three Fiber + drei + TypeScript**, because search
  visibility matters.

- How information is presented on each page: [`docs/INFORMATION_ARCHITECTURE.md`](docs/INFORMATION_ARCHITECTURE.md)
- Avatar rigging pipeline: [`docs/RIGGING.md`](docs/RIGGING.md)

Read these before doing any design, content, or scaffolding work. After any
visual change, review **every** page (desktop and 375px), not just the one
you touched.

## What we are building
- **The 3D-scan avatar is the host.** `public/models/EfraimBaruh-compressed.glb` is
  a real 3D scan of Efraim. It greets visitors on arrival and guides them through
  the site (head tracking, turning toward sections, gestures). It's the
  centerpiece, so treat it like a product feature, not a background.
- **The 3D work is the proof of skill.** Shader work, lighting, interaction, and
  performance are all part of what's being showcased. Polish matters more than
  quantity.
- **Visual language:** sleek, elegant, pure, low-color. Monochrome palette with at
  most one restrained accent. Generous whitespace, slow physical motion. No neon,
  no glitch or flicker effects, no "hacker terminal" look (v1 tried all of these).

## Sections
Home (avatar host) · Work / Projects (case studies) · About (bio, timeline,
skills) · Writing (MDX blog) · Contact.

## Technical rules
- **Next.js 16** with `output: "export"`, so every route is static HTML. Partial
  Prerendering and `cacheComponents` don't work with export; leave them off.
  Next 16 has breaking changes from older versions: check
  `node_modules/next/dist/docs/` before using an unfamiliar API.
- 3D: Three.js through **React Three Fiber + drei**. Keep scene code declarative
  and composable. The single `<Canvas>` is mounted from the **root layout**
  (`SceneRoot`, client-only through `next/dynamic`), so it persists across route
  changes. Never mount a second canvas per page; use drei `<View>` or scene
  state instead.
- Page content must render as server HTML (crawlable). Only the 3D layer is
  client-only.
- The avatar GLB needs `EXT_meshopt_compression`, `KHR_mesh_quantization`, and
  `EXT_texture_webp`. Use a meshopt decoder and make sure it's ready before parsing.
- The avatar is currently **static (no rig, no animations)**. Any host behavior
  beyond whole-body transforms needs a rigged re-export. Don't fake skeletal
  motion on the static mesh.
- Required quality bar: a real loading state, 60 fps on a mid-range laptop, a
  `prefers-reduced-motion` path, a non-WebGL fallback (a static render of the
  avatar), mobile layout at 375px, and a Lighthouse performance score of 90+ on
  content pages.
- Palette lives in `src/app/globals.css` (CSS tokens) and `src/content/palette.ts`
  (hex values for the 3D scene). Change both together; no hardcoded colors.
- Content lives in typed data files or MDX, not hard-coded in components.
- Don't ship placeholder content (missing images, lorem ipsum, fake cards).
- Third-party models need CC-BY attribution, or better, don't use them.

## Layout
```
src/
├── app/                 # routes (App Router); layout.tsx mounts SceneRoot
├── components/scene/    # SceneRoot → Experience (Canvas, lights) → Avatar
└── content/             # typed content (profile.ts); MDX later
public/
├── models/EfraimBaruh-compressed.glb   # the avatar (static scan)
└── images/logos/                       # company logos
docs/                    # knowledge, design, IA, stack, rigging guide
```
Runtime: **Node 24 LTS** (`.nvmrc`, `engines`), installed through Homebrew `node@24`.
Scripts: `npm run dev`, `npm run build` (static site in `out/`), `npm run lint`.

## Open questions (ask Efraim; don't guess)
The final job title, the public email address, the location wording, and the
missing role dates are listed in `docs/KNOWLEDGE.md` under "Inconsistencies to
resolve".
