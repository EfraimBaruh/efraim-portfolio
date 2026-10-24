# Tech Stack Options — Portfolio v2

**Status: decided (2026-10-24): Next.js + R3F + drei + TypeScript, static export.**
Search visibility is a requirement. The chosen design is **A + C hybrid**
(Studio Noir with a one-time point-cloud intro). See `DESIGN_DIRECTIONS.md`.

## What the stack has to support
These come from the design, so they drive the choice:
1. **A persistent 3D canvas.** The avatar is the host across the whole site, so
   the WebGL context, loaded GLB, and camera state must **survive route
   changes**. Remounting the scene per page would mean reloading 3+ MB and
   replaying the intro.
2. **Scroll-driven camera:** smooth scroll mapped to camera paths and avatar
   orientation.
3. **Custom GLSL:** GPU particle assembly (about 200k points sampled from the scan
   surface) and a handoff to PBR lighting.
4. **Crawlable content:** case studies, About, and Writing should be real HTML for
   recruiters, LinkedIn previews, and search engines, not only text inside a canvas.
5. **MDX** for case studies and blog posts.
6. **Performance:** lazy-load the 3D, keep text pages light, Lighthouse 90+ on
   content pages, and a no-WebGL fallback.
7. **Free static hosting** (Vercel, Netlify, Cloudflare Pages, or GitHub Pages).

---

## Rendering layer

### R1. React Three Fiber + drei  ★ recommended
- **Pros:** declarative scene graph composes with UI state. drei provides
  `useGLTF` (meshopt decoder built in), `ScrollControls`, `View`,
  `PerformanceMonitor`, `AdaptiveDpr`, `useProgress` for loaders, and
  `Environment`/`Lightformer` for studio lighting. `@react-three/postprocessing`
  is mature. Large ecosystem and many reference projects.
- **Cons:** an abstraction over Three.js, so frame-loop and allocation discipline
  still matter (`useFrame`, no per-frame `new`). React reconciliation overhead
  only matters if you mount or unmount thousands of objects, which this site
  won't.

### R2. Vanilla Three.js (a scene class, framework-agnostic)
- **Pros:** full control and zero abstraction. Shows raw Three.js and GLSL skill.
  Works with any UI framework.
- **Cons:** you hand-roll loaders, disposal, resize, the render loop, and state
  sync with the UI. That's exactly what made v1 brittle. Slower to iterate.

### R3. Threlte (Svelte + Three.js)
- **Pros:** very ergonomic, small bundles, excellent DX.
- **Cons:** smaller ecosystem and fewer examples. Svelte is less relevant to your
  profile. Choose it only if you want to learn Svelte.

### R4. Unity WebGL build
- **Pros:** uses your main tool and is authentic to your profile. Animation,
  rigging, and shaders work in a familiar pipeline.
- **Cons:** 10–30 MB payload and a slow first load. Poor mobile Safari support.
  No HTML/SEO integration. Hard to blend with DOM typography. Accessibility is
  hard. **Not suitable as the site shell.** It fits better as an *embedded,
  click-to-load demo* inside a case study, such as a golf ball physics sandbox.

### R5. Babylon.js
- **Pros:** batteries included (inspector, physics, GUI), strong in WebXR.
- **Cons:** heavier, and a less "web-native" look and feel. Little advantage over
  Three.js here.

---

## App framework (shell, routing, content)

### F1. Next.js (App Router, `output: 'export'`) + R3F  ★ recommended
- **Pros:** the canvas lives in the **root layout**, so it persists across routes
  without extra work, which solves requirement 1 cleanly. Static HTML per page
  covers SEO and link previews. First-class MDX (`@next/mdx` or Velite). `next/font`
  for self-hosted fonts. Image tooling. Deploys to Vercel with zero config, or
  exports static files to any host.
- **Cons:** the heaviest framework option. R3F must be client-only
  (`'use client'` + `dynamic(..., { ssr: false })`). App Router has a learning
  curve (server vs. client components). Static export loses ISR and API routes;
  a contact form would need a third-party endpoint such as Formspree or Resend
  through a serverless function.

### F2. Vite + React + TypeScript (SPA) + R3F
- **Pros:** simplest and fastest DX. Instant HMR. A persistent canvas is trivial
  (one app root, router underneath). Smallest mental model, closest to the R3F
  examples.
- **Cons:** client-rendered, so SEO and link previews are weak unless you add
  prerendering (`vite-plugin-ssg`, `vite-react-ssg`), which adds back complexity.
  MDX needs `@mdx-js/rollup`. You assemble routing, meta tags, and fonts yourself.

### F3. Astro + React island (R3F)
- **Pros:** zero JS by default, so content pages are extremely fast and get the
  best Lighthouse scores. Content Collections for MDX with typed frontmatter.
  Ships JS only for the 3D island.
- **Cons:** keeping one canvas alive across pages relies on View Transitions plus
  `transition:persist`. That works, but it's the least natural fit for a
  site-wide host avatar, and state between islands and pages is clunkier. The
  scroll-driven camera has to cross island boundaries.

### F4. SvelteKit + Threlte
- **Pros:** light, fast, SSR/SSG built in, elegant.
- **Cons:** same ecosystem tradeoffs as R3. Choose it only for Svelte interest.

---

## Comparison

| | Persistent canvas | SEO / previews | MDX | DX / speed | Bundle | Fit |
|---|---|---|---|---|---|---|
| **Next.js + R3F** | ●●● layout | ●●● SSG | ●●● | ●●○ | ●●○ | **best overall** |
| Vite SPA + R3F | ●●● | ●○○ (●●○ with SSG plugin) | ●●○ | ●●● | ●●● | best DX |
| Astro + R3F island | ●●○ persist | ●●● | ●●● | ●●○ | ●●● | best perf |
| SvelteKit + Threlte | ●●● | ●●● | ●●○ | ●●● | ●●● | niche |
| Vanilla Three + Vite | ●●● | ●○○ | ●○○ | ●○○ | ●●● | max control |
| Unity WebGL shell | ●●● | ○○○ | ○○○ | ●●○ | ○○○ | ✗ shell / ✓ embedded demo |

## Supporting libraries (same for any React option)
- **3D:** `three`, `@react-three/fiber`, `@react-three/drei`,
  `@react-three/postprocessing`
- **Scroll and motion:** **Lenis** (smooth scroll) + **GSAP ScrollTrigger** (camera
  timelines), or drei `ScrollControls`. **Motion** (`motion/react`) for DOM
  transitions.
- **Shaders:** raw GLSL via `shaderMaterial` (drei), plus `MeshSurfaceSampler`
  for the point cloud. Optional: `lamina` or `three-custom-shader-material` to
  extend PBR materials for the particle-to-surface dissolve.
- **Asset pipeline:** `@gltf-transform/cli` (meshopt, WebP, resize) and
  `gltfjsx` (typed JSX components from GLBs)
- **Styling:** plain CSS Modules or vanilla-extract with design tokens. Tailwind
  is fine but not required for such a minimal system.
- **Content:** MDX + Velite / Content Collections (typed frontmatter)
- **Quality:** TypeScript strict, ESLint, Playwright smoke tests, Lighthouse CI,
  `r3f-perf` in development

## Recommendation
**Next.js (App Router, static export) + React Three Fiber + drei, with TypeScript.**
It's the only option that handles the persistent avatar canvas, crawlable
content, and MDX without workarounds. If SEO doesn't matter to you,
**Vite + R3F** is the leaner alternative with the best DX. Use **Unity WebGL**
only for optional, click-to-load interactive demos inside case studies. That's a
nice way to show both web-3D and Unity skill.
