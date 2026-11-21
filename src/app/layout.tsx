import type { Metadata, Viewport } from "next";
import { Fraunces, Geist_Mono, Inter } from "next/font/google";
import { profile } from "@/content/profile";
import { palette } from "@/content/palette";
import { personJsonLd, siteUrl } from "@/content/seo";
import SceneRoot from "@/components/scene/SceneRoot";
import SiteHeader from "@/components/site/SiteHeader";
import ScrollCue from "@/components/site/ScrollCue";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Defaults for every page. Pages override title, description, canonical and
// the social card text through pageMetadata() in src/content/seo.ts.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${profile.name} — ${profile.title}`,
  description: `${profile.name}, ${profile.title}. ${profile.focus}.`,
  authors: [{ name: profile.name, url: `${siteUrl}/` }],
  creator: profile.name,
  openGraph: {
    type: "website",
    siteName: profile.name,
    locale: "en_US",
    title: `${profile.name} — ${profile.title}`,
    description: `${profile.name}, ${profile.title}. ${profile.focus}.`,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: palette.ink,
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${fraunces.variable} ${inter.variable} ${geistMono.variable}`}>
      <body>
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        {/* Lives in the root layout so the avatar persists across routes. */}
        <SceneRoot />
        <SiteHeader />
        {children}
        <ScrollCue />
        <script
          type="application/ld+json"
          // Static, build-time data from typed content; "<" is escaped.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
