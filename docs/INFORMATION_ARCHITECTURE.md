# Information Architecture — Portfolio v2

How information is presented across the site: what each page says, in what
order, and how the avatar host takes part. Visual system: see
`DESIGN_DIRECTIONS.md`.

## Principles
1. **Answer the recruiter's questions in order.** Who is this? → What has he
   built? → How deep does it go? → How do I reach him? Every page should answer
   one of these, and nothing else.
2. **Scannable first, deep second.** Each item shows a one-line summary and
   metadata (company · role · period) first. Depth (problem, approach, outcome,
   video) lives one click away.
3. **Proof over adjectives.** Prefer concrete facts (platforms, scale,
   constraints, shipped titles, video) over "passionate" or "innovative".
4. **One column of text, the avatar beside it.** On desktop, content stays in
   a left column (max ~640px wide) and the avatar stays visible on the right,
   turning toward the content. On mobile, the avatar dims behind the text so
   reading always wins.
5. **Every page is real HTML.** Headings, lists, and metadata are semantic, so
   search engines and LinkedIn previews can read them. 3D is never the only
   carrier of information.
6. **Typography carries the hierarchy, not boxes.** Serif display for titles,
   small mono labels for metadata, grotesk for body. Hairline dividers instead
   of cards. Numbers (01, 02, 03) give order.

## Global
- **Header:** monogram (home) · Work · About, with LinkedIn and
  GitHub as quiet external links. Only show links to pages that exist.
- **Avatar states:**
  - `hero` (Home): the portrait right of the name
  - `content` (all other pages): the avatar steps further right and turns
    toward the text column
  - The canvas persists across navigation, so the avatar *moves* between
    states instead of reloading.
- **Footer:** none for now. There's no Contact page (decided 2026-11-19); the
  header's Email link (every page) is the contact route.

## Pages

### Home `/`
Who is this, in five seconds, for both audiences (recruiters and the
nanotechnology graduate application).
1. Title · company (mono eyebrow)
2. Name (display serif)
3. Positioning (`profile.positioning`, Efraim's own copy), two paragraphs:
   a punchline lead (display serif: seven years of real-time 3D → molecular
   self-assembly), then the detail (the concrete work, the frame-rate
   constraint, the simulation tools)
4. "Selected work ↓" (in-page); the featured work list follows. Email lives
   in the header only (one email link per screen).

### Work `/work`
What he has built. A numbered editorial index, not a card grid.
For each project, in this order:
- `01` · **Title** (serif)
- Company · role · period (mono, muted)
- One-sentence summary
- Stack (inline, muted, middle-dot separated)
- The whole row links to the case study.

### Case study `/work/[slug]`
How deep it goes.

**Layout (decided 2026-11-18).** At 1200px and wider there are two columns.
The text column is on the left, with the bust faded behind it (about 20%
opacity), turned toward the media. The **media column** (videos, images, any
similar content) is on the right and pinned while the text scrolls. Narrower
screens use a single column, with media inline after the summary and the bust
faded behind. Drag-to-turn is off wherever the bust is faded behind text.
Media comes from each project's `media` list in `src/content/projects.ts`
(`youtube` or `image` items).

Fixed section order, so all case studies read the same:
1. Back link · index `01 / 03`
2. Title
3. Metadata table: Company · Role · Period · Stack
4. Summary (2–3 sentences)
5. Media: videos (click to load, privacy-friendly YouTube embed, no autoplay)
   and images, in the right-hand column on wide screens
6. **What I did:** concrete responsibilities, one line each
7. *(later, when written)* Challenge → Approach → Outcome
8. Previous / next project

### About `/about` *(built 2026-11-18, from the CV)*
Bio → experience timeline (period · company · role · place · one line, with
case-study and proof links) → skills by area → education & certifications →
languages. Content: `src/content/about.ts`. Location is left out until it's
confirmed.

### "How this site is built" *(built 2026-11-18: optional, opened from Home)*
Not a page and not in the nav. A quiet button on Home brings the bust into
focus (camera moves in, the text column steps aside) and opens an explanation
beside it: the 3D scan, the rigging pipeline, the point-cloud intro, head
tracking, and the shader/fade work. Closing it (button or Esc) returns to the
hero. The explanation is always in the HTML, so it's crawlable.
Desktop: notes on the left, the camera moves in on the head, bust at ~70% of
the width. Mobile: the head fills the top, the notes are a sheet below it.
Under reduced motion the camera cuts instead of gliding.

### Writing `/writing` *(later; MDX)*
Date · title · one-line summary list → MDX article pages.
