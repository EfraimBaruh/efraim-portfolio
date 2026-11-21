import type { Metadata } from "next";
import { projects } from "@/content/projects";
import { pageMetadata, search } from "@/content/seo";
import ProjectRow from "@/components/work/ProjectRow";
import styles from "./page.module.css";

export const metadata: Metadata = pageMetadata({
  title: search.work.title,
  description: search.work.description,
  path: "/work/",
});

export default function WorkPage() {
  return (
    <main id="content" className={styles.page}>
      <p className={styles.eyebrow}>Selected work</p>
      <h1 className={styles.title}>Work</h1>

      <ol className={styles.list}>
        {projects.map((project, i) => (
          <ProjectRow key={project.slug} project={project} index={i} />
        ))}
      </ol>
    </main>
  );
}
