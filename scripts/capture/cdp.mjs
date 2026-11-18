// Minimal Chrome DevTools Protocol driver (Node 24: global WebSocket, fetch).
// Used to render stills of the live WebGL scene: the no-WebGL poster, the
// Open Graph card and the icons. No dependencies.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME =
  process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch(extraArgs = []) {
  const profile = mkdtempSync(join(tmpdir(), "capture-"));
  const port = 9300 + Math.floor(Math.random() * 500);
  const proc = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--hide-scrollbars",
      "--enable-gpu",
      "--use-angle=metal",
      ...extraArgs,
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  let target;
  for (let i = 0; i < 50 && !target; i++) {
    await sleep(200);
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      target = list.find((t) => t.type === "page");
    } catch {}
  }
  if (!target) throw new Error("Chrome did not start");

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r, j) => ((ws.onopen = r), (ws.onerror = j)));
  let id = 0;
  const pending = new Map();
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
  };
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      pending.set(++id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result.value;
  };

  const close = () => {
    ws.close();
    proc.kill();
    try {
      rmSync(profile, { recursive: true, force: true });
    } catch {}
  };

  return { send, evaluate, close, sleep };
}

/** Load `url` at the given size and wait until the avatar is on screen. */
export async function open(page, url, { width, height, dpr = 1, mobile = false, reducedMotion = true }) {
  await page.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: dpr, mobile });
  await page.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: reducedMotion ? "reduce" : "no-preference" }],
  });
  await page.send("Page.enable");
  await page.send("Page.navigate", { url });
  // The loader flips data-done once the GLB is parsed.
  for (let i = 0; i < 150; i++) {
    await page.sleep(200);
    const done = await page.evaluate(`document.querySelector('[role=status][data-done]')?.dataset.done === 'true'`);
    if (done) break;
  }
  await page.evaluate("document.fonts.ready.then(() => true)");
  await page.sleep(2500); // canvas fade-in and pose settle
}

export async function screenshot(page, { clip } = {}) {
  const params = { format: "png", captureBeyondViewport: false };
  if (clip) params.clip = { ...clip, scale: 1 };
  const { data } = await page.send("Page.captureScreenshot", params);
  return Buffer.from(data, "base64");
}
