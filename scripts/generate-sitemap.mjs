import { writeFileSync } from "node:fs";
import { fetchContentUrls } from "./lib/fetchContentUrls.mjs";

const SITE_URL = (process.env.VITE_SITE_URL || "https://example.com").replace(/\/$/, "");

function escapeXml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function urlEntry({ loc, lastmod, changefreq, priority, image }) {
  return [
    "  <url>",
    `    <loc>${escapeXml(loc)}</loc>`,
    lastmod ? `    <lastmod>${String(lastmod).slice(0, 10)}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    image ? `    <image:image><image:loc>${escapeXml(image)}</image:loc></image:image>` : null,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

async function main() {
  const { staticRoutes, blogPosts, projects, services } = await fetchContentUrls();

  const entries = [
    ...staticRoutes.map((r) => urlEntry({ loc: `${SITE_URL}${r.path}`, changefreq: r.changefreq, priority: r.priority })),
    ...blogPosts.map((p) =>
      urlEntry({
        loc: `${SITE_URL}/blog/${p.slug}`,
        lastmod: p.updated_at ?? p.published_at,
        changefreq: "monthly",
        priority: "0.6",
        image: p.featured_image_url,
      })
    ),
    ...projects.map((p) =>
      urlEntry({ loc: `${SITE_URL}/projects/${p.slug}`, lastmod: p.created_at, changefreq: "yearly", priority: "0.6", image: p.image_url })
    ),
    ...services.map((s) =>
      urlEntry({ loc: `${SITE_URL}/services/${s.slug}`, lastmod: s.created_at, changefreq: "yearly", priority: "0.7", image: s.image_url })
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${entries.join("\n")}\n</urlset>\n`;

  writeFileSync(new URL("../dist/sitemap.xml", import.meta.url), xml, "utf-8");
  console.log(`[generate-sitemap] Wrote dist/sitemap.xml with ${entries.length} URLs.`);
}

main();
