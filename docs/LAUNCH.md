# Launch — Portfolio v2

How to take the static build live. The domain and host aren't chosen yet
(roadmap item 1 in `AGENTS.md`); fill them in here once they are.

| | |
|---|---|
| Domain | *not chosen* |
| Host | *not chosen* (any static host works: the build is plain files in `out/`) |

## Why the URL matters
`NEXT_PUBLIC_SITE_URL` (read in `src/content/seo.ts`) is the public origin.
It's baked in at build time and used for:
- canonical URLs on every page
- `sitemap.xml` and `robots.txt`
- the Open Graph / Twitter card URLs

Without it, all of these point at `http://localhost:3000`.

## Steps
1. **Build with the real origin** (no trailing slash):
   ```bash
   NEXT_PUBLIC_SITE_URL=https://example.com npm run build
   ```
2. **Check the output** in `out/`:
   - `out/sitemap.xml` and `out/robots.txt` use the real origin
   - `out/index.html` has `<link rel="canonical" href="https://…/">`
3. **Re-capture the stills** (no-WebGL poster, OG card, icons) from that build:
   ```bash
   python3 -m http.server 3001 -d out
   ```
   ```bash
   node scripts/capture/stills.mjs http://localhost:3001
   ```
   Then rebuild (step 1) so the new images are in `out/`.
4. **Deploy** the contents of `out/` to the host.
   - Routes use trailing slashes (`/work/`), so each page is `…/index.html`.
   - `out/404.html` is the not-found page; point the host's 404 at it.
   - Serve `.glb` as `model/gltf-binary` and enable gzip/brotli.
5. **Verify live:** every page on desktop and at 375px, the social card in a
   preview tool, and Lighthouse on content pages.
