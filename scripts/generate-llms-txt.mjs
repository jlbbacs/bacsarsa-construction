import { writeFileSync } from "node:fs";
import { fetchContentUrls } from "./lib/fetchContentUrls.mjs";

const SITE_URL = (process.env.VITE_SITE_URL || "https://example.com").replace(/\/$/, "");

async function fetchBrandSummary() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, key);
    const { data } = await supabase.from("site_settings").select("brand_name, tagline, footer_text").eq("id", 1).single();
    return data;
  } catch {
    return null;
  }
}

async function main() {
  const [{ blogPosts }, brand] = await Promise.all([fetchContentUrls(), fetchBrandSummary()]);

  const brandName = brand?.brand_name ?? "Construction Company";
  const summary = brand?.tagline || brand?.footer_text || "A licensed and insured general contractor.";

  const recentPosts = [...blogPosts]
    .sort((a, b) => new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime())
    .slice(0, 10);

  const lines = [
    `# ${brandName}`,
    "",
    `> ${summary}`,
    "",
    "## Pages",
    "",
    `- [Home](${SITE_URL}/): Overview of services, featured projects, and company introduction.`,
    `- [About](${SITE_URL}/about): Company history, mission, and team.`,
    `- [Services](${SITE_URL}/services): Full list of construction services offered.`,
    `- [Projects](${SITE_URL}/projects): Portfolio of completed commercial, residential, and industrial projects.`,
    `- [Blog](${SITE_URL}/blog): Company news, project spotlights, and industry insights.`,
    `- [Contact](${SITE_URL}/contact): Contact form, phone, email, and office address.`,
  ];

  if (recentPosts.length > 0) {
    lines.push("", "## Recent Blog Posts", "");
    for (const post of recentPosts) {
      lines.push(`- [${post.slug}](${SITE_URL}/blog/${post.slug})`);
    }
  }

  writeFileSync(new URL("../dist/llms.txt", import.meta.url), lines.join("\n") + "\n", "utf-8");
  console.log(`[generate-llms-txt] Wrote dist/llms.txt with ${recentPosts.length} recent posts listed.`);
}

main();
