// Checks the static export in out/. Run after `npm run build`:
//   npm run test:build
// When NEXT_PUBLIC_SITE_URL is set, it also checks that no URL in the
// sitemap, robots.txt or canonical links still points at localhost.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const OUT = new URL("../out/", import.meta.url).pathname;
const SITE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

assert.ok(existsSync(OUT), "out/ is missing: run `npm run build` first");

const read = (p) => readFileSync(join(OUT, p), "utf8");

/** Route paths ("/", "/work/") of every exported page, except the 404s. */
function pages(dir = OUT) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return e.name === "_next" || e.name.startsWith("_not-found") || e.name === "404" ? [] : pages(p);
    return e.name === "index.html" ? [`/${relative(OUT, dir)}${dir === OUT ? "" : "/"}`.replace("//", "/")] : [];
  });
}

const routes = pages().sort();
const sitemap = [...read("sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const sitemapPaths = sitemap.map((u) => new URL(u).pathname).sort();

test("sitemap lists exactly the exported pages", () => {
  assert.deepEqual(sitemapPaths, routes);
});

test("robots.txt points at the sitemap", () => {
  assert.match(read("robots.txt"), /Sitemap: \S+\/sitemap\.xml/);
});

test("404 page exists", () => {
  assert.ok(existsSync(join(OUT, "404.html")));
});

for (const route of routes) {
  const html = read(join(route, "index.html"));

  test(`${route}: title, description, canonical, social card, one h1`, () => {
    assert.match(html, /<title>[^<]+<\/title>/);
    assert.match(html, /<meta name="description" content="[^"]+"/);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    assert.ok(canonical, "no canonical link");
    assert.equal(new URL(canonical).pathname, route);
    assert.match(html, /<meta property="og:image" content="[^"]+"/);
    assert.equal(html.match(/<h1[\s>]/g)?.length, 1, "expected exactly one <h1>");
  });

  test(`${route}: internal links and assets resolve`, () => {
    const refs = [...html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)].map((m) => m[1]);
    for (const ref of new Set(refs)) {
      const file = ref.endsWith("/") ? join(ref, "index.html") : ref;
      assert.ok(existsSync(join(OUT, decodeURIComponent(file))), `broken: ${ref}`);
    }
  });
}

// Search visibility (decided 2026-11-21): role keywords in the Home title,
// both surname spellings findable on every page and in the structured data.
const decode = (s) => s.replace(/&#x27;/g, "'").replace(/&amp;/g, "&");
const meta = (html, re) => decode(html.match(re)?.[1] ?? "");

test("Home title names the roles people search for", () => {
  const title = meta(read("index.html"), /<title>([^<]+)<\/title>/);
  for (const word of ["Unity", "AR/VR", "3D", "Bölükbaşı"]) assert.ok(title.includes(word), `title lacks ${word}: ${title}`);
});

test("every page carries the ASCII surname (Bolukbasi) in its description", () => {
  for (const route of routes) {
    const d = meta(read(join(route, "index.html")), /<meta name="description" content="([^"]+)"/);
    assert.match(d, /Bolukbasi/, route);
  }
});

test("structured data lists both spellings and the roles", () => {
  const html = read("index.html");
  const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(json, "no JSON-LD");
  const person = JSON.parse(json)["@graph"].find((n) => n["@type"] === "Person");
  assert.ok(person.name.includes("Bölükbaşı"));
  assert.ok(person.alternateName.some((n) => n.includes("Bolukbasi")));
  assert.ok(person.jobTitle.some((t) => /Unity/.test(t)) && person.jobTitle.some((t) => /AR\/VR/.test(t)));
});

test("public URLs use NEXT_PUBLIC_SITE_URL", { skip: !SITE && "NEXT_PUBLIC_SITE_URL not set" }, () => {
  for (const u of sitemap) assert.ok(u.startsWith(SITE), `sitemap: ${u}`);
  assert.ok(read("robots.txt").includes(`${SITE}/sitemap.xml`));
  for (const route of routes) {
    assert.doesNotMatch(read(join(route, "index.html")), /https?:\/\/localhost/, route);
  }
});
