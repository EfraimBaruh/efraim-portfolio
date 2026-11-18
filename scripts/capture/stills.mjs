// Renders stills of the live scene: the no-WebGL poster, the Open Graph card
// and the app icons. Run after `npm run build` with the static server up:
//
//   python3 -m http.server 3001 -d out   # or the "static-out" launch config
//   node scripts/capture/stills.mjs [http://localhost:3001]
//
// Reduced motion is emulated, so the intro is skipped and the pose is the
// deterministic rest pose. Re-run whenever the avatar, lighting or palette
// changes, then rebuild.
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { launch, open, screenshot } from "./cdp.mjs";
import { profile } from "../../src/content/profile.ts";

const BASE = (process.argv[2] ?? "http://localhost:3001").replace(/\/$/, "");
const ROOT = new URL("../../", import.meta.url).pathname;
const tmp = mkdtempSync(join(tmpdir(), "stills-"));

const sips = (...args) => execFileSync("sips", args, { stdio: "ignore" });

/** Hide everything but the canvas layer. */
const BARE = `(() => {
  const s = document.createElement('style');
  s.textContent = 'body > :not(:has(canvas)):not([data-capture]) { visibility: hidden !important }';
  document.head.append(s);
  return true;
})()`;

const escape = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** The OG card's type, set in the site's own fonts and tokens. */
const OG_OVERLAY = `(() => {
  const el = document.createElement('div');
  el.dataset.capture = '';
  el.style.cssText = 'position:fixed;inset:0;z-index:10;display:flex;flex-direction:column;justify-content:center;padding:0 72px;color:var(--bone)';
  el.innerHTML = \`
    <p style="margin:0 0 28px;font:400 15px/1 var(--font-geist-mono);letter-spacing:.14em;text-transform:uppercase;color:var(--muted)">${escape(
      `${profile.current.title} · ${profile.current.company}`,
    )}</p>
    <p style="margin:0;font:300 128px/.94 var(--font-fraunces);letter-spacing:-.02em">${escape(
      profile.shortName,
    ).replace(" ", "<br>")}</p>
    <p style="margin:36px 0 0;font:400 15px/1 var(--font-geist-mono);letter-spacing:.14em;text-transform:uppercase;color:var(--muted)">${escape(
      profile.focus,
    )}</p>\`;
  document.body.append(el);
  return document.fonts.ready.then(() => true);
})()`;

async function shot(url, size, steps, clip) {
  const page = await launch();
  try {
    await open(page, url, size);
    for (const step of steps) await page.evaluate(step);
    await page.sleep(400);
    return await screenshot(page, { clip });
  } finally {
    page.close();
  }
}

try {
  // Desktop hero at 2x: the poster is the bust's box, the icon its head.
  const heroSize = { width: 1440, height: 900, dpr: 2 };
  const poster = join(tmp, "bust.png");
  writeFileSync(poster, await shot(`${BASE}/`, heroSize, [BARE], { x: 840, y: 100, width: 560, height: 740 }));
  sips("-s", "format", "jpeg", "-s", "formatOptions", "82", poster, "--out", join(ROOT, "public/images/avatar/bust.jpg"));

  const head = join(tmp, "head.png");
  writeFileSync(head, await shot(`${BASE}/`, heroSize, [BARE], { x: 955, y: 118, width: 300, height: 300 }));
  sips("-z", "512", "512", head, "--out", join(ROOT, "src/app/icon.png"));
  sips("-z", "180", "180", head, "--out", join(ROOT, "src/app/apple-icon.png"));
  const fav = join(tmp, "fav.png");
  sips("-z", "48", "48", head, "--out", fav);
  sips("-s", "format", "ico", fav, "--out", join(ROOT, "src/app/favicon.ico"));

  // Open Graph / Twitter card: 1200×630, the real bust with the name.
  writeFileSync(
    join(ROOT, "src/app/opengraph-image.png"),
    await shot(`${BASE}/`, { width: 1200, height: 630 }, [BARE, OG_OVERLAY]),
  );
  writeFileSync(
    join(ROOT, "src/app/opengraph-image.alt.txt"),
    `${profile.name}, ${profile.title}: real-time render of a 3D-scanned bust.`,
  );
  console.log("stills written");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
