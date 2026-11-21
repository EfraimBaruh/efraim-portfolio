import type { Metadata } from "next";
import Link from "next/link";
import { about } from "@/content/about";
import { pageMetadata, search } from "@/content/seo";
import styles from "./page.module.css";

export const metadata: Metadata = pageMetadata({
  title: search.about.title,
  description: search.about.description,
  path: "/about/",
});

export default function AboutPage() {
  return (
    <main id="content" className={styles.page}>
      <p className={styles.eyebrow}>About</p>
      <h1 className={styles.title}>About</h1>

      <div className={styles.bio}>
        {about.bio.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>

      <section className={styles.section} aria-labelledby="experience">
        <h2 id="experience" className={styles.heading}>
          Experience
        </h2>
        <ol className={styles.timeline}>
          {about.experience.map((r) => (
            <li key={r.company} className={styles.role}>
              <p className={styles.period}>{r.period}</p>
              <div className={styles.roleBody}>
                <h3 className={styles.company}>{r.company}</h3>
                <p className={styles.meta}>
                  {r.role} · {r.place}
                </p>
                <p className={styles.line}>{r.line}</p>
                {(r.caseStudy || r.links) && (
                  <p className={styles.links}>
                    {r.caseStudy && (
                      <Link href={`/work/${r.caseStudy}/`}>
                        Case study<span aria-hidden="true"> →</span>
                      </Link>
                    )}
                    {r.links?.map((l) => (
                      <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                        {l.label}
                        <span aria-hidden="true"> ↗</span>
                      </a>
                    ))}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="skills">
        <h2 id="skills" className={styles.heading}>
          Skills
        </h2>
        <dl className={styles.list}>
          {about.skills.map((s) => (
            <div key={s.area} className={styles.row}>
              <dt>{s.area}</dt>
              <dd>{s.items.join(" · ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.section} aria-labelledby="education">
        <h2 id="education" className={styles.heading}>
          Education &amp; certifications
        </h2>
        <dl className={styles.list}>
          {about.education.map((e) => (
            <div key={e.title} className={styles.row}>
              <dt>{e.period}</dt>
              <dd>
                {e.title}
                <span className={styles.sub}>{e.place}</span>
              </dd>
            </div>
          ))}
          {about.certifications.map((c) => (
            <div key={c.title} className={styles.row}>
              <dt>{c.year}</dt>
              <dd>
                {c.title}
                <span className={styles.sub}>{c.issuer}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.section} aria-labelledby="languages">
        <h2 id="languages" className={styles.heading}>
          Languages
        </h2>
        <dl className={styles.list}>
          {about.languages.map((l) => (
            <div key={l.name} className={`${styles.row} ${styles.compact}`}>
              <dt>{l.level}</dt>
              <dd>{l.name}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
