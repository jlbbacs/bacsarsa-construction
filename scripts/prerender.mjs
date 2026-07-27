// Snapshots every route to static HTML after `vite build`, so non-JS
// crawlers (GPTBot/ClaudeBot/PerplexityBot-class) and social-link unfurlers
// see real rendered content instead of the empty SPA shell. Google/Bing
// already get full coverage via client-side Helmet rendering since those
// bots execute JS -- this step doesn't change that, it's purely for the
// non-JS-executing audience.
import { createServer } from "node:http";
import { existsSync, statSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchContentUrls } from "./lib/fetchContentUrls.mjs";

const DIST_DIR = fileURLToPath(new URL("../dist/", import.meta.url));
const PORT = 4174;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
  ".xml": "application/xml",
};

// Read once, before any route is prerendered, and reused for every SPA
// fallback request. Routes are prerendered by overwriting files under dist/
// (including dist/index.html itself for "/") -- if the fallback instead
// re-read from disk each time, the first prerendered route would pollute the
// starting shell every later route boots from (observed: a stray leftover
// <title> from whichever route ran first, since Helmet appends rather than
// replaces a pre-existing static <title> it doesn't already own).
async function loadPristineShell() {
  return readFile(path.join(DIST_DIR, "index.html"));
}

function startStaticServer(pristineShell) {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const urlPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
      const filePath = path.join(DIST_DIR, urlPath);
      const isRealFile = existsSync(filePath) && !statSync(filePath).isDirectory();

      try {
        if (isRealFile) {
          const data = await readFile(filePath);
          res.writeHead(200, { "Content-Type": MIME_TYPES[path.extname(filePath)] ?? "application/octet-stream" });
          res.end(data);
        } else {
          // SPA fallback -- mirrors vercel.json's catch-all rewrite to index.html.
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(pristineShell);
        }
      } catch {
        res.writeHead(404);
        res.end("Not found");
      }
    });
    server.listen(PORT, () => resolve(server));
  });
}

async function main() {
  if (!existsSync(DIST_DIR)) {
    console.warn("[prerender] dist/ not found -- run `vite build` first. Skipping.");
    return;
  }

  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    console.warn("[prerender] playwright is not installed -- skipping prerender step.");
    return;
  }

  const { staticRoutes, blogPosts, projects, services } = await fetchContentUrls();
  const routes = [
    ...staticRoutes.map((r) => r.path),
    ...blogPosts.map((p) => `/blog/${p.slug}`),
    ...projects.map((p) => `/projects/${p.slug}`),
    ...services.map((s) => `/services/${s.slug}`),
  ];

  const pristineShell = await loadPristineShell();
  const server = await startStaticServer(pristineShell);
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Captured in memory and only written to disk after every route has been
  // crawled -- see loadPristineShell()'s comment for why writing mid-crawl
  // would let one route's rendered HTML leak into another's starting shell.
  const results = [];
  for (const route of routes) {
    try {
      // "load" first (reliable even when a page has continuous network
      // activity, e.g. an autoplaying hero video, which would keep
      // "networkidle" from ever resolving). Then best-effort wait for
      // networkidle with a short timeout to let one-shot Supabase data
      // fetches settle -- falling back to a fixed grace period if that
      // never quiets down, rather than failing the whole route.
      await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "load", timeout: 20000 });
      try {
        await page.waitForLoadState("networkidle", { timeout: 4000 });
      } catch {
        await page.waitForTimeout(1500);
      }
      results.push({ route, html: await page.content() });
    } catch (err) {
      console.warn(`[prerender] Failed to prerender ${route}:`, err instanceof Error ? err.message : err);
    }
  }

  await browser.close();
  server.close();

  for (const { route, html } of results) {
    const outDir = route === "/" ? DIST_DIR : path.join(DIST_DIR, route);
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, "index.html"), html, "utf-8");
  }

  console.log(`[prerender] Prerendered ${results.length}/${routes.length} routes.`);
}

main();
