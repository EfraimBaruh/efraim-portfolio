// Content integrity: typed data in src/content/ is consistent with itself and
// with the files in public/. Runs on Node 24's built-in TypeScript stripping.
//   npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { projects } from "../src/content/projects.ts";
import { about } from "../src/content/about.ts";
import { profile } from "../src/content/profile.ts";

const PUBLIC = new URL("../public/", import.meta.url).pathname;
const inPublic = (src) => existsSync(PUBLIC + src.replace(/^\//, ""));

test("project slugs are unique and URL-safe", () => {
  const slugs = projects.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, "duplicate slug");
  for (const s of slugs) assert.match(s, /^[a-z0-9]+(-[a-z0-9]+)*$/, s);
});

test("every project has its required copy", () => {
  for (const p of projects) {
    for (const k of ["title", "summary", "role", "period"]) {
      assert.ok(p[k]?.trim(), `${p.slug}: empty ${k}`);
    }
    assert.ok(p.stack.length, `${p.slug}: empty stack`);
    assert.ok(p.responsibilities.length, `${p.slug}: no responsibilities`);
  }
});

test("project logos and images exist in public/", () => {
  for (const p of projects) {
    assert.ok(inPublic(p.company.logo), `${p.slug}: missing logo ${p.company.logo}`);
    for (const m of p.media) {
      if (m.type === "image") assert.ok(inPublic(m.src), `${p.slug}: missing image ${m.src}`);
      if (m.type === "image") assert.ok(m.alt.trim(), `${p.slug}: image without alt`);
      if (m.type === "youtube") assert.match(m.id, /^[\w-]{11}$/, `${p.slug}: bad YouTube id`);
    }
  }
});

test("About timeline links only to case studies that exist", () => {
  const slugs = new Set(projects.map((p) => p.slug));
  for (const r of about.experience) {
    if (r.caseStudy) assert.ok(slugs.has(r.caseStudy), `${r.company}: unknown case study ${r.caseStudy}`);
    for (const l of r.links ?? []) assert.match(l.href, /^https:\/\//, `${r.company}: ${l.href}`);
  }
});

test("each case study's company appears in the About timeline", () => {
  const companies = new Set(about.experience.map((r) => r.company));
  for (const p of projects) {
    assert.ok(companies.has(p.company.name), `${p.slug}: ${p.company.name} not in About`);
  }
});

test("nanotech appears only as 'nanotechnology'", () => {
  const all = JSON.stringify({ projects, about, profile });
  assert.doesNotMatch(all, /nanotech(?!nology)/i, "use 'nanotechnology', not 'nanotech'");
});

test("no placeholder text in content", () => {
  const all = JSON.stringify({ projects, about, profile });
  assert.doesNotMatch(all, /lorem ipsum|TODO|TBD|FIXME|example\.com/i);
});
