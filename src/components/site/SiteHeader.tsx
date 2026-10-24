"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { profile } from "@/content/profile";
import styles from "./SiteHeader.module.css";

// Only pages that exist. About/Contact join once their content is confirmed.
const NAV = [{ href: "/work/", label: "Work" }];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.mark} aria-label={`${profile.name}, home`}>
        E.B.B.
      </Link>
      <nav className={styles.nav} aria-label="Main">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={styles.link}
            aria-current={pathname.startsWith(item.href.replace(/\/$/, "")) ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
        <span className={styles.divider} aria-hidden="true" />
        <a href={profile.links.linkedin} className={styles.external} target="_blank" rel="noopener noreferrer">
          LinkedIn ↗
        </a>
        <a href={profile.links.github} className={styles.external} target="_blank" rel="noopener noreferrer">
          GitHub ↗
        </a>
      </nav>
    </header>
  );
}
