# Efraim Baruh Bölükbaşı — Portfolio v2

## What this repo is
The personal portfolio of **Efraim Baruh Bölükbaşı**, a Senior Software Engineer
(Unity, C#/.NET, AR/VR, real-time 3D, mobile games), currently at Rapsodo. There
are two audiences (decided 2026-11-21): recruiters and hiring managers, and the
admissions readers of Efraim's **nanotechnology graduate program** application.
Within the first 10 seconds they should come away thinking *"this person is
excellent at real-time 3D and simulation, and is heading into molecular
self-assembly"*. Home's positioning (`profile.positioning`: a punchline lead, then a
detail paragraph) is Efraim's own copy and carries both: concrete projects,
the frame-rate constraint, and the self-assembly direction. Don't replace it with a generic
one-liner; change it only with his wording.

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
- Going live (build URL, stills, deploy): [`docs/LAUNCH.md`](docs/LAUNCH.md)

Read these before doing any design, content, or scaffolding work. After any
visual change, review **every** page (desktop and 375px), not just the one
you touched.

## What we are building
- **The 3D-scan avatar is the host.** `public/models/EfraimBaruh-rigged.glb` is
  a real 3D scan of Efraim, rigged by `scripts/avatar/rig_avatar.py` (see
  `docs/RIGGING.md`). The unrigged source lives in `assets/source/` (not served). It greets visitors on arrival and guides them through
  the site (head tracking, turning toward sections, gestures). It's the
  centerpiece, so treat it like a product feature, not a background.
- **It's presented as a bust** (head, shoulders, upper chest; decided
  2026-11-18). Below `BUST_CUT` in `src/components/scene/bust.ts` the surface
  fades into the background and isn't drawn. The point-cloud intro samples the
  bust only. `CameraRig` frames it as a portrait from the aspect ratio. Change
  the crop in `bust.ts` only.
- **The 3D work is the proof of skill.** Shader work, lighting, interaction, and
  performance are all part of what's being showcased. Polish matters more than
  quantity.
- **Visual language:** sleek, elegant, pure, low-color. Monochrome palette with at
  most one restrained accent. Generous whitespace, slow physical motion. No neon,
  no glitch or flicker effects, no "hacker terminal" look (v1 tried all of these).

## Sections
Home (avatar host) · Work / Projects (case studies) · About (bio, timeline,
skills) · Writing (MDX blog). No Contact page (decided 2026-11-19): the header's
Email link (`mailto:`, on every page) is the contact route.

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
- The avatar is **rigged** (22 bones, relaxed rest pose, `Idle` clip). Host
  behaviour lives in `useHostBehavior.ts` (idle, head and neck look-at,
  and a one-off downward glance toward the content as a scroll cue),
  starting after the intro, and is disabled under reduced motion. It's a
  `SkinnedMesh`: anything that samples or measures it must use skinned rest
  positions (`sampleSurface.ts` → `restGeometry`), not the raw position
  attribute. Regenerate the GLB with the script; never hand-edit it.
- Required quality bar: a real loading state, 60 fps on a mid-range laptop, a
  `prefers-reduced-motion` path, a non-WebGL fallback (a static render of the
  avatar), mobile layout at 375px, and a Lighthouse performance score of 90+ on
  content pages.
- Palette lives in `src/app/globals.css` (CSS tokens) and `src/content/palette.ts`
  (hex values for the 3D scene). Change both together; no hardcoded colors.
- Content lives in typed data files or MDX, not hard-coded in components.
- **SEO:** every page exports `pageMetadata({ title, description, path })`
  (`src/content/seo.ts`) for its canonical URL and social card, and new routes
  go in `staticRoutes` for the sitemap. Set `NEXT_PUBLIC_SITE_URL` at build
  time once the domain exists (until then URLs point at localhost).
- **Stills** (no-WebGL poster, OG card, icons) are rendered from the live site
  by `scripts/capture/stills.mjs`; re-run it after avatar, lighting or palette
  changes.
- **Scene startup** is time-sliced (`prepareScan.ts`, `sampleSurface.ts`):
  keep heavy CPU work in `Work` generators and shader compiles in
  `compileAsync`, so the first frame isn't one long task. Lighthouse mobile
  perf is ~80–85 with the 3D layer; accessibility, best practices, SEO 100.
- Don't ship placeholder content (missing images, lorem ipsum, fake cards).
- Third-party models need CC-BY attribution, or better, don't use them.

## Layout
```
src/
├── app/                 # routes (App Router); layout.tsx mounts SceneRoot
├── components/scene/    # SceneRoot → Experience (Canvas, lights) → Avatar
└── content/             # typed content (profile.ts); MDX later
public/
├── models/EfraimBaruh-rigged.glb       # the avatar (rigged scan, served)
└── images/logos/                       # company logos
assets/source/           # unrigged source scan (input to the rig script)
scripts/avatar/          # Blender rig + preview scripts (headless)
scripts/capture/         # stills renderer (poster, OG card, icons)
tests/                   # content + build-output tests (node:test)
docs/                    # knowledge, design, IA, stack, rigging guide
```
Runtime: **Node 24 LTS** (`.nvmrc`, `engines`), installed through Homebrew `node@24`.
Scripts: `npm run dev`, `npm run build` (static site in `out/`), `npm run check`
(lint, typecheck, content tests), `npm run test:build` (checks `out/`),
`npm run stills`. CI runs all of them (`.github/workflows/ci.yml`). Content
changes must keep `npm test` green; add a check there for new content rules.

## Roadmap (decided 2026-11-18)
**Ship first, polish last.** Get every main section live with real content as
soon as possible; deep polish happens in one pass across the whole site at the
end. Don't stall a section on polish.

Done: Home, Work + case studies, About, "How this site is built" (the
optional focus view on Home: `src/components/home/BuildNotes.tsx`, copy in
`src/content/build.ts`, scene state in `sceneFocus.ts`).
Next / later (don't forget these):
1. **Go live**: choose domain and host, build with `NEXT_PUBLIC_SITE_URL` set,
   re-run `scripts/capture/stills.mjs` against the live build. Steps in
   `docs/LAUNCH.md`.
2. **Case-study depth** *(post-launch, decided 2026-11-21; takes time, so it
   doesn't block going live)*: Challenge → Approach → Outcome for
   every case study, with real numbers and constraints. Needs Efraim's answers;
   never invent details. Also new case studies: ADASTEC, Leke Games, Gleechi.
3. **Self-assembly experiment** *(later)*: a small interactive in-browser
   simulation where particles build structures from simple local rules. Supports
   the move toward molecular self-assembly. Write "nanotechnology" where it's
   accurate, never the buzzword "nanotech" (a content test enforces this).
4. **Writing** *(later)*: MDX blog; revive the two v1 posts (UPM/Verdaccio,
   ScriptableObject events).
5. **Final polish pass** over every page.

## Known bugs (not yet fixed)
- **Bust sometimes missing on iPad Safari** (seen 2026-11-21, iPadOS, Stage
  Manager): after closing the tab and opening the site in a new tab, the
  page text loaded but no bust, no "Loading scan" label and no Scroll cue
  appeared, even after 2 minutes. Not reproducible since, nor in Mac Safari
  or headless Chrome. The page had finished loading, so the `load` gate in
  `SceneRoot` isn't the cause. Lead: both the bust and the cue depend on
  `requestAnimationFrame`. Next time it happens, capture evidence on the
  iPad (Web Inspector, or an on-screen diagnostics overlay in a local build)
  before changing code.
- **Scroll cue overlaps text** at narrow desktop widths (~800px wide): it
  sits bottom-centre on top of the Home paragraph.

## Open questions (ask Efraim; don't guess)
See `docs/KNOWLEDGE.md` under "Inconsistencies to resolve".
