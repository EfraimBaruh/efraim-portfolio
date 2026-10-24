import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/content/projects";
import { profile } from "@/content/profile";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `Work — ${profile.name}`,
  description: `Selected real-time 3D, AR/VR and simulation projects by ${profile.name}.`,
};

export default function WorkPage() {
  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>Selected work</p>
      <h1 className={styles.title}>Work</h1>

      <ol className={styles.list}>
        {projects.map((project, i) => (
          <li key={project.slug} className={styles.item}>
            <Link href={`/work/${project.slug}/`} className={styles.link}>
              <span className={styles.index}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.body}>
                <span className={styles.projectTitle}>{project.title}</span>
                <span className={styles.meta}>
                  {project.company.name} · {project.role} · {project.period}
                </span>
                <span className={styles.summary}>{project.summary}</span>
                <span className={styles.stack}>{project.stack.join(" · ")}</span>
              </span>
              <span className={styles.arrow} aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
