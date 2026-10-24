import { profile } from "@/content/profile";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.hero}>
      <h1 className={styles.name}>
        {profile.shortName.split(" ").map((word) => (
          <span key={word}>{word}</span>
        ))}
      </h1>
      <p className={styles.role}>
        {profile.title} · {profile.focus}
      </p>
    </main>
  );
}
