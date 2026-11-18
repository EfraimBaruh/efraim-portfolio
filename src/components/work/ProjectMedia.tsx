import Image from "next/image";
import type { ProjectMedia as Media } from "@/content/projects";
import VideoEmbed from "./VideoEmbed";
import styles from "./ProjectMedia.module.css";

/** A case study's media: videos and images, stacked. */
export default function ProjectMedia({ items, title }: { items: Media[]; title: string }) {
  return (
    <div className={styles.stack}>
      {items.map((item, i) =>
        item.type === "youtube" ? (
          <VideoEmbed key={`yt-${item.id}`} id={item.id} title={item.title ?? `${title} — video`} />
        ) : (
          <figure key={`img-${i}`} className={styles.figure}>
            <Image src={item.src} alt={item.alt} width={item.width} height={item.height} className={styles.image} />
            {item.caption && <figcaption className={styles.caption}>{item.caption}</figcaption>}
          </figure>
        ),
      )}
    </div>
  );
}
