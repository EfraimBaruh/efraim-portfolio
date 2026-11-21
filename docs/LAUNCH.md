# Launch — Portfolio v2

How the static build goes live (decided 2026-11-21).

| | |
|---|---|
| Host | **Cloudflare Pages**, connected to this GitHub repo; every push to `main` deploys |
| Domain | *to be bought by Efraim* (Cloudflare Registrar is simplest: DNS is wired automatically). Until then the site lives at `<project>.pages.dev` |

## Why the URL matters
`NEXT_PUBLIC_SITE_URL` (read in `src/content/seo.ts`) is the public origin.
It's baked in at build time and used for:
- canonical URLs on every page
- `sitemap.xml` and `robots.txt`
- the Open Graph / Twitter card URLs

Without it, all of these point at `http://localhost:3000`. On Cloudflare it's
a build environment variable; change it when the domain changes, then
redeploy.

## One-time setup (Efraim, in the Cloudflare dashboard)
1. **Create a Cloudflare account** at dash.cloudflare.com.
2. **Workers & Pages → Create → Pages → Connect to Git.** Authorize GitHub
   and pick `EfraimBaruh/efraim-portfolio`.
3. **Build settings:**
   | Setting | Value |
   |---|---|
   | Production branch | `main` |
   | Framework preset | None |
   | Build command | `npm run build` |
   | Build output directory | `out` |
4. **Environment variables** (Production):
   | Name | Value |
   |---|---|
   | `NODE_VERSION` | `24` |
   | `NEXT_PUBLIC_SITE_URL` | `https://<project>.pages.dev` for now, later `https://<your-domain>` (no trailing slash) |
5. **Save and deploy.** The first build takes a few minutes; the site then
   answers at `https://<project>.pages.dev`.

## Adding the domain (once bought)
1. **Buy it** (Cloudflare: Domain Registration → Register Domains). Bought
   elsewhere, add it to Cloudflare as a site and switch its nameservers.
2. **Pages project → Custom domains → Set up a domain**, enter the apex
   (e.g. `example.com`), and optionally `www` too.
3. Change `NEXT_PUBLIC_SITE_URL` to `https://<your-domain>` and **retry the
   latest deployment** so canonical URLs, sitemap and social cards use it.

## What the repo already handles
- `public/_headers`: long cache for hashed `_next/static` assets, a weekly
  cache and the right content type for the avatar `.glb`, basic security
  headers. Cloudflare compresses with brotli on its own.
- Routes use trailing slashes (`/work/`), so each page is `…/index.html`,
  which Pages serves directly; `out/404.html` is picked up as the not-found
  page automatically.
- Stills (poster, social card, icons) are already rendered in the Slate
  palette. Re-run them only if the live build looks different:
  `npm run serve:out`, then `npm run stills`, then commit.

## Before each launch-worthy push
```bash
NEXT_PUBLIC_SITE_URL=https://<your-origin> npm run build
```
```bash
NEXT_PUBLIC_SITE_URL=https://<your-origin> npm run test:build
```

## Verify live
Every page on desktop and at 375px, the social card in a link-preview tool,
`/sitemap.xml` and `/robots.txt` showing the real origin, and Lighthouse on
content pages.
