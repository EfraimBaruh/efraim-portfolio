import type { Metadata } from "next";
import { Fraunces, Geist_Mono, Inter } from "next/font/google";
import { profile } from "@/content/profile";
import SceneRoot from "@/components/scene/SceneRoot";
import SiteHeader from "@/components/site/SiteHeader";
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

export const metadata: Metadata = {
  title: `${profile.name} — ${profile.title}`,
  description: `${profile.name}, ${profile.title}. ${profile.focus}.`,
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
      </body>
    </html>
  );
}
