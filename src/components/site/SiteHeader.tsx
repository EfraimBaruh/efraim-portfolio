"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { profile } from "@/content/profile";
import styles from "./SiteHeader.module.css";

// Only pages that exist. About/Contact join once their content is confirmed.
const NAV = [{ href: "/work/", label: "Work" }];

export default function SiteHeader() {
  const pathname = usePathname();
  const home = pathname === "/";
  const scrolled = useScrolled(home);

  return (
    <header className={styles.header} data-home={home || undefined} data-scrolled={scrolled || undefined}>
      {/* On home the hero H1 carries the name; the wordmark returns on scroll. */}
      <Link href="/" className={styles.wordmark} aria-hidden={home && !scrolled ? true : undefined} tabIndex={home && !scrolled ? -1 : undefined}>
        {profile.shortName}
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
        <a href={`mailto:${profile.email}`} className={styles.link}>
          Email
        </a>
        <span className={`${styles.divider} ${styles.external}`} aria-hidden="true" />
        <a href={profile.links.linkedin} className={`${styles.link} ${styles.external}`} target="_blank" rel="noopener noreferrer">
          LinkedIn<span aria-hidden="true"> ↗</span>
        </a>
        <a href={profile.links.github} className={`${styles.link} ${styles.external}`} target="_blank" rel="noopener noreferrer">
          GitHub<span aria-hidden="true"> ↗</span>
        </a>
      </nav>
    </header>
  );
}

// Home only: past the hero name, the header becomes a band with the wordmark.
function useScrolled(enabled: boolean) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const update = () => setScrolled(window.scrollY > window.innerHeight * 0.5);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [enabled]);

  return enabled && scrolled;
}
