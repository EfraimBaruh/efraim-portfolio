# Efraim Baruh Bölükbaşı — Portfolio

Personal portfolio of a Senior Software Engineer working in real-time 3D. A
rigged 3D scan of Efraim hosts the site as a bust: it assembles from a point
cloud on arrival, then follows the visitor with its head.

**Stack:** Next.js 16 (App Router, static export) · React Three Fiber + drei ·
Three.js · TypeScript. Every route is static HTML; only the 3D layer runs on
the client.

## Quick start
Requires Node 24 (`.nvmrc`).

```bash
npm install
```
```bash
npm run dev
```
Open http://localhost:3000.

## Scripts
| Command | What it does |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Static site in `out/` |
| `npm run serve:out` | Serve `out/` on :3001 |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types, then `tsc --noEmit` |
| `npm test` | Content checks (`tests/content.test.mjs`) |
| `npm run test:build` | Checks the export in `out/`: sitemap, metadata, broken links (`tests/build.test.mjs`) |
| `npm run check` | Lint, typecheck and content tests |
| `npm run stills` | Re-render the no-WebGL poster, social card and icons from `out/` (needs Chrome and `serve:out` running) |

CI (`.github/workflows/ci.yml`) runs lint, typecheck, both test suites and the
build on every push and pull request.

## Layout
```
src/app/              routes; layout.tsx mounts the single 3D canvas
src/components/scene/ the avatar, intro, camera and host behaviour
src/content/          typed content: profile, projects, about, SEO, palette
public/models/        the rigged avatar (generated, never hand-edited)
scripts/avatar/       Blender rig + preview scripts (headless)
scripts/capture/      stills renderer
tests/                content and build-output tests
docs/                 design, content, rigging and launch notes
```

## Docs
- [`AGENTS.md`](AGENTS.md): goals, rules and roadmap (start here)
- [`docs/KNOWLEDGE.md`](docs/KNOWLEDGE.md): career data and assets
- [`docs/DESIGN_DIRECTIONS.md`](docs/DESIGN_DIRECTIONS.md): the visual system
- [`docs/INFORMATION_ARCHITECTURE.md`](docs/INFORMATION_ARCHITECTURE.md): what each page says
- [`docs/TECH_STACK.md`](docs/TECH_STACK.md): why this stack
- [`docs/RIGGING.md`](docs/RIGGING.md): regenerating the avatar (Blender, glTF-Transform)
- [`docs/LAUNCH.md`](docs/LAUNCH.md): going live
