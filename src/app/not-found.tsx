import type { Metadata } from "next";
import Link from "next/link";
import styles from "./not-found.module.css";

export const metadata: Metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>404</p>
      <h1 className={styles.title}>This page doesn&apos;t exist.</h1>
      <p className={styles.links}>
        <Link href="/">Home</Link>
        <span aria-hidden="true"> · </span>
        <Link href="/work/">Work</Link>
      </p>
    </main>
  );
}
