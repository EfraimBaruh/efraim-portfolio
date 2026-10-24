import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { profile } from "@/content/profile";
import SceneRoot from "@/components/scene/SceneRoot";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: `${profile.name} — ${profile.title}`,
  description: `${profile.name}, ${profile.title}. ${profile.focus}.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        {/* Lives in the root layout so the avatar persists across routes. */}
        <SceneRoot />
        {children}
      </body>
    </html>
  );
}
