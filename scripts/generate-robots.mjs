import { writeFileSync } from "node:fs";

// Generated (not static in public/) so the Sitemap: directive can carry the
// real absolute VITE_SITE_URL for this deployment rather than a stale
// placeholder domain.
try {
  process.loadEnvFile();
} catch {
  // No .env file present -- fine on hosts that inject env vars directly.
}

const SITE_URL = (process.env.VITE_SITE_URL || "https://example.com").replace(/\/$/, "");

const DISALLOWED = ["/dashboard", "/login", "/forgot-password", "/reset-password", "/set-password", "/confirm-change"];

// AI crawlers are explicitly allowed (not blocked) -- GEO/AI-search visibility
// is a goal for this site, unlike sites that opt out of AI training crawlers.
const AI_CRAWLERS = ["GPTBot", "ChatGPT-User", "ClaudeBot", "Claude-Web", "anthropic-ai", "PerplexityBot", "Google-Extended", "CCBot", "Bytespider"];

const lines = [
  "User-agent: *",
  ...DISALLOWED.map((path) => `Disallow: ${path}`),
  "Allow: /",
  "",
  ...AI_CRAWLERS.flatMap((agent) => [`User-agent: ${agent}`, "Allow: /", ""]),
  `Sitemap: ${SITE_URL}/sitemap.xml`,
  "",
];

writeFileSync(new URL("../dist/robots.txt", import.meta.url), lines.join("\n"), "utf-8");
console.log("[generate-robots] Wrote dist/robots.txt.");
