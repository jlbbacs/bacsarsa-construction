// Shared by generate-sitemap.mjs, generate-llms-txt.mjs, and prerender.mjs.
// Runs as plain Node (not through Vite), so env vars come from .env directly
// rather than import.meta.env.
try {
  process.loadEnvFile();
} catch {
  // No .env file present -- fine on hosts (e.g. Vercel) that inject env vars directly.
}

const STATIC_ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/services", changefreq: "weekly", priority: "0.9" },
  { path: "/projects", changefreq: "weekly", priority: "0.9" },
  { path: "/blog", changefreq: "daily", priority: "0.8" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
];

async function safeSelect(supabase, table, columns, filters = (q) => q) {
  try {
    const { data, error } = await filters(supabase.from(table).select(columns));
    if (error) {
      console.warn(`[fetchContentUrls] ${table}: ${error.message} -- skipping ${table} URLs.`);
      return [];
    }
    return (data ?? []).filter((row) => row.slug);
  } catch (err) {
    console.warn(`[fetchContentUrls] ${table} fetch failed:`, err instanceof Error ? err.message : err);
    return [];
  }
}

/**
 * Returns the site's static routes plus published blog posts / projects /
 * services from Supabase. Degrades to static-only (no crash) if Supabase env
 * vars are unset or a query fails -- e.g. before the slug migrations have
 * been run against the live database.
 */
export async function fetchContentUrls() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn("[fetchContentUrls] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set -- generating static routes only.");
    return { staticRoutes: STATIC_ROUTES, blogPosts: [], projects: [], services: [] };
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key);

  const [blogPosts, projects, services] = await Promise.all([
    safeSelect(supabase, "blog_posts", "slug, updated_at, published_at, featured_image_url", (q) => q.eq("status", "published")),
    safeSelect(supabase, "projects", "slug, created_at, image_url"),
    safeSelect(supabase, "services", "slug, created_at, image_url"),
  ]);

  return { staticRoutes: STATIC_ROUTES, blogPosts, projects, services };
}
