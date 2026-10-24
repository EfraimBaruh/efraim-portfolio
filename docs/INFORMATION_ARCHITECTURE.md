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
- **Header:** monogram (home) · Work · About · Contact, with LinkedIn and
  GitHub as quiet external links. Only show links to pages that exist.
- **Avatar states:**
  - `hero` (Home): the portrait right of the name
  - `content` (all other pages): the avatar steps further right and turns
    toward the text column
  - The canvas persists across navigation, so the avatar *moves* between
    states instead of reloading.
- **Footer:** none for now. Contact lives in the header and on its own page.

## Pages

### Home `/`
Who is this, in five seconds.
1. Name (display serif)
2. Title · focus line (mono)
3. *(later)* One-sentence positioning statement plus "See work →"

### Work `/work`
What he has built. A numbered editorial index, not a card grid.
For each project, in this order:
- `01` · **Title** (serif)
- Company · role · period (mono, muted)
- One-sentence summary
- Stack (inline, muted, middle-dot separated)
- The whole row links to the case study.

### Case study `/work/[slug]`
How deep it goes. Fixed section order, so all case studies read the same:
1. Back link · index `01 / 03`
2. Title
3. Metadata table: Company · Role · Period · Stack
4. Summary (2–3 sentences)
5. Video (click to load, privacy-friendly YouTube embed; no autoplay)
6. **What I did:** concrete responsibilities, one line each
7. *(later, when written)* Challenge → Approach → Outcome
8. Previous / next project

### About `/about` *(blocked: needs the open questions answered)*
Bio paragraph → career timeline (company · role · period · one line) →
skills grouped by area → languages.

### Contact `/contact` *(blocked: needs the public email confirmed)*
One line of invitation → email → LinkedIn · GitHub → location and timezone.

### Writing `/writing` *(later)*
Date · title · one-line summary list → MDX article pages.
