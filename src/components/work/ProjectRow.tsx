import Link from "next/link";
import type { Project } from "@/content/projects";
import styles from "./ProjectRow.module.css";

// One numbered row of the editorial work index (used on / and /work).
export default function ProjectRow({ project, index }: { project: Project; index: number }) {
  return (
    <li className={styles.item}>
      <Link href={`/work/${project.slug}/`} className={styles.link}>
        <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
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
  );
}
