import type { Metadata } from "next";
import Link from "next/link";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { pageMetadata, search } from "@/content/seo";
import ProjectRow from "@/components/work/ProjectRow";
import BuildNotes from "@/components/home/BuildNotes";
import styles from "./page.module.css";

export const metadata: Metadata = pageMetadata({
  title: search.home.title,
  description: search.home.description,
  path: "/",
});

const FEATURED = projects.slice(0, 3);

export default function Home() {
  return (
    <main id="content" className={styles.main}>
      {/* Text holds the left columns; the right is the avatar's stage. */}
      <section className={styles.hero} aria-labelledby="hero-name">
        <p className={styles.eyebrow}>
          {profile.current.title} · {profile.current.company}
        </p>

        <div className={styles.intro}>
          <h1 id="hero-name" className={styles.name}>
            {profile.shortName.split(" ").map((word) => (
              <span key={word}>{word}</span>
            ))}
          </h1>
          {/* Narrow screens only: the header drops these, so they sit under the name. */}
          <p className={styles.socials}>
            <a href={profile.links.linkedin} className={styles.secondary} target="_blank" rel="noopener noreferrer">
              LinkedIn<span aria-hidden="true"> ↗</span>
            </a>
            <a href={profile.links.github} className={styles.secondary} target="_blank" rel="noopener noreferrer">
              GitHub<span aria-hidden="true"> ↗</span>
            </a>
          </p>
          <p className={styles.lead}>{profile.positioning[0]}</p>
          <p className={styles.detail}>{profile.positioning[1]}</p>
          <p className={styles.actions}>
            <a href="#work" className={styles.primary}>
              Selected work<span aria-hidden="true"> ↓</span>
            </a>
          </p>
        </div>
        <BuildNotes />
      </section>

      <section id="work" className={styles.work} aria-labelledby="work-title">
        <p className={styles.eyebrow}>
          01–{String(FEATURED.length).padStart(2, "0")}
        </p>
        <h2 id="work-title" className={styles.workTitle}>
          Selected work
        </h2>
        <ol className={styles.list}>
          {FEATURED.map((project, i) => (
            <ProjectRow key={project.slug} project={project} index={i} />
          ))}
        </ol>
        <Link href="/work/" className={styles.all}>
          All work<span aria-hidden="true"> →</span>
        </Link>
      </section>
    </main>
  );
}
