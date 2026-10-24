// The point-cloud assembly plays once per browser session, and never under
// reduced motion. Page text never waits on it (keeps LCP fast and crawlable).
const SEEN_KEY = "intro-seen";

export function shouldPlayIntro() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    return sessionStorage.getItem(SEEN_KEY) !== "1";
  } catch {
    return true;
  }
}

/** Call once the assembly has actually finished playing. */
export function markIntroSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {}
}
