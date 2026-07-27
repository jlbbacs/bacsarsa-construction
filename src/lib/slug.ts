import { supabase } from "./supabase";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Appends -2, -3, ... to `baseSlug` until it doesn't collide with an existing
 * row in `table` (excluding `excludeId`, so editing an item's own slug back to
 * itself doesn't false-positive as a collision).
 */
async function ensureUniqueSlug(table: string, baseSlug: string, fallback: string, excludeId?: string): Promise<string> {
  let candidate = baseSlug || fallback;

  for (let suffix = 2; suffix < 1000; suffix++) {
    let query = supabase.from(table).select("id").eq("slug", candidate);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    candidate = `${baseSlug}-${suffix}`;
  }

  return `${baseSlug}-${Date.now()}`;
}

export function ensureUniqueBlogSlug(baseSlug: string, excludeId?: string): Promise<string> {
  return ensureUniqueSlug("blog_posts", baseSlug, "post", excludeId);
}

export function ensureUniqueProjectSlug(baseSlug: string, excludeId?: string): Promise<string> {
  return ensureUniqueSlug("projects", baseSlug, "project", excludeId);
}

export function ensureUniqueServiceSlug(baseSlug: string, excludeId?: string): Promise<string> {
  return ensureUniqueSlug("services", baseSlug, "service", excludeId);
}
