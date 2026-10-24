import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/content/projects";
import { profile } from "@/content/profile";
import VideoEmbed from "@/components/work/VideoEmbed";
import styles from "./page.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return {
    title: `${project.title} — ${profile.name}`,
    description: project.summary,
  };
}

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.indexOf(project);
  const prev = projects[index - 1];
  const next = projects[index + 1];
  const count = String(projects.length).padStart(2, "0");

  return (
    <main className={styles.page}>
      <nav className={styles.top} aria-label="Case study">
        <Link href="/work/" className={styles.back}>
          ← All work
        </Link>
        <span>
          {String(index + 1).padStart(2, "0")} / {count}
        </span>
      </nav>

      <h1 className={styles.title}>{project.title}</h1>

      <dl className={styles.meta}>
        <div>
          <dt>Company</dt>
          <dd className={styles.company}>
            <Image src={project.company.logo} alt="" width={20} height={20} className={styles.logo} />
            {project.company.name}
          </dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>{project.role}</dd>
        </div>
        <div>
          <dt>Period</dt>
          <dd>{project.period}</dd>
        </div>
        <div>
          <dt>Stack</dt>
          <dd>{project.stack.join(" · ")}</dd>
        </div>
      </dl>

      <p className={styles.summary}>{project.summary}</p>

      <section className={styles.section} aria-label="Video">
        <VideoEmbed id={project.youtubeId} title={`${project.title} — video`} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>What I did</h2>
        <ul className={styles.list}>
          {project.responsibilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <nav className={styles.pager} aria-label="More work">
        {prev ? (
          <Link href={`/work/${prev.slug}/`}>
            <span className={styles.pagerLabel}>Previous</span>
            {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/work/${next.slug}/`} className={styles.next}>
            <span className={styles.pagerLabel}>Next</span>
            {next.title}
          </Link>
        )}
      </nav>
    </main>
  );
}
