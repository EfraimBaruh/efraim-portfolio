# Design Directions — Portfolio v2

Brief: **sleek, elegant, pure, low-color.** The site is a showcase of 3D skill, and
Efraim's **3D-scan avatar is the host**: the first thing a visitor meets, and it
guides them through the site.

Shared principles (apply to every direction):
- **Monochrome first.** At most one accent, used for one or two things at a time
  (focus state, active item).
- **The 3D is the content, not decoration.** Every 3D effect should show a skill a
  recruiter would hire for: shaders, lighting, performance, interaction.
- **Restraint in type.** Two typefaces at most, a large scale contrast, generous
  whitespace.
- **Slow, physical motion.** Eased camera moves and damped springs. No flicker, no
  glitch. Neon only as a faint accent glow (see Slate below).
- **Performance is part of the portfolio.** Show a loading state with real progress,
  target 60 fps on a mid-range laptop, and provide a static fallback for no-WebGL
  and `prefers-reduced-motion`.

---

## A — "Studio Noir"
*The avatar is lit like a portrait in a dark photo studio.*

- **Palette (updated 2026-10-24: warm charcoal like Claude's dark sidebar,
  near-black felt too heavy):** `#262624` ink · `#30302E` surface ·
  `#F5F4EE` bone text · `#A3A29C` muted · `#C8B89A` faint warm accent
  *(originally `#0B0B0C` / `#16161A` / `#EDEBE6` / `#8A8A8E`)*.
- **Type:** a high-contrast serif for display (*Cormorant*, *Fraunces*), a neutral
  grotesk for UI (*Inter*, *Geist*).
- **Hero:** full-bleed black, avatar three-quarter view, single key light plus a
  thin rim light. The name sits large, partly behind the avatar (depth layering).
  The head turns slightly toward the cursor.
- **Navigation:** scroll moves the camera. The camera orbits around the avatar as
  sections change, and the avatar turns toward each section's content.
- **Projects:** dark full-width "plates". The video plays muted on hover. Case
  study pages are editorial long-form.
- **Feel:** premium, cinematic, quiet confidence. Fits "Senior Engineer".

## B — "Gallery"
*The avatar is a sculpture on a plinth in a white gallery.*

- **Palette:** `#F4F2EE` paper · `#FFFFFF` · `#1A1A1A` ink · `#9B978F` stone.
  No accent.
- **Type:** an elegant serif throughout (*Instrument Serif*, *Newsreader*), with
  small-caps labels in a mono or grotesk.
- **Hero:** soft overcast studio light, ambient-occlusion contact shadow on a
  plinth, the avatar slowly turning. There's an optional "material" toggle
  (scan texture → clay/marble), which shows shader skill.
- **Projects:** a museum-label layout with lots of whitespace and numbered
  exhibits (01, 02, 03).
- **Feel:** pure, airy, distinctive. Unusual for an engineer portfolio, so it's
  memorable. Light theme (dark variant possible).

## C — "Point Cloud"
*The avatar assembles from its own scan data.*

- **Palette:** `#0A0A0A` · `#E6E6E6` · `#5C5C5C` graphite. One signal accent,
  used sparingly: `#D9FF5A` or a cold `#9FB4C7`.
- **Type:** a monospace for annotations (*JetBrains Mono*, *Geist Mono*), a clean
  grotesk for body text.
- **Hero:** about 200k GPU particles sampled from the scan surface drift, then
  converge into the textured avatar. Thin technical callouts point at features
  ("68k tris · meshopt · 17 WebP textures"). This ties directly to the Scalar
  Vision 3D-scanning and holographic work.
- **Projects:** each card shows a wireframe-to-solid reveal on hover.
- **Feel:** technical, precise, R&D lab. It shows off the most shader skill, but
  it risks feeling cold if overdone.

---

## ✅ Palette: "Slate" (decided by Efraim, 2026-11-21)
Replaces Studio Noir's warm charcoal. Tried on a branch against a violet neon
look and four alternatives (Ember, Ice, Mint, Lime); Efraim chose a calmer
point between Studio Noir and Ice, then raised the glow slightly.

- **Tokens** (`globals.css` + `palette.ts`): `#191d23` ink · `#222730` surface
  · `#eef1f3` text · `#9aa2ab` muted · `#84d8ec` ice-cyan accent · `#c5dde4`
  pale-ice second accent (labels, the main rim light, the point-cloud intro).
  Glows derive from `--accent-rgb` / `--accent-2-rgb`.
- **3D rig:** neutral key and sky light, so the face keeps its own skin tone;
  colour only rims the silhouette from well behind (pale ice right, ice-cyan
  left-back). The canvas is transparent and the page paints a faint haze
  behind it. Never put a tinted layer over the canvas: it tints the face.
- **Accents:** cyan eyebrows and labels, a cyan underline on the main link and
  current nav item, a soft oval wash plus a 6px title shift on project-row
  hover, a faint neon halo on case-study videos (always in colour,
  click-to-play).

## ✅ Chosen: A + C hybrid (decided by Efraim, 2026-10-24)
Use **Studio Noir** as the overall system, with the **Point Cloud assembly** used
*once*, as the intro and loading sequence. Particles form the avatar while the
assets load, then hand off to the lit portrait. That gives a technical "wow"
moment once, and elegance everywhere else. Keep strictly monochrome, with one
accent (now the Slate ice-cyan; originally a warm bone).

### Bust presentation (decided 2026-11-18)
The avatar is shown as a **bust**, not full-length: head, shoulders and upper
chest, fading softly into the charcoal like a lit sculpture bust (*büst*). The
reasons: the scan's detail is in the face, head tracking reads far better at
portrait size, and it hides the rig's weakest areas (hands, hips). The
point-cloud intro stays, assembling the bust only (chest up), which makes it
denser and finer.

### Host behavior (the avatar as guide)
| Moment | Behavior | Needs rig? |
|---|---|---|
| Arrival / load | point cloud assembles into the avatar | no |
| Idle | subtle breathing, weight shift | yes |
| Cursor | head and eyes track the pointer, clamped | yes (neck/head bones) |
| Scroll to section | camera orbits; avatar turns toward the content | partially |
| Contact | *(dropped: no Contact page)* | — |

**Prerequisite:** the current GLB is a static mesh. Rig it (Mixamo/AccuRig →
Blender cleanup), add 3–5 short clips (idle, look, wave, point), then re-compress
with glTF-Transform (meshopt + WebP, under ~4 MB).

### Stack
See [`TECH_STACK.md`](TECH_STACK.md) for the options, pros and cons, and the
recommendation.
