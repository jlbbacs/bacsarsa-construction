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
 * blog_posts row (excluding `excludeId`, so editing a post's own slug back to
 * itself doesn't false-positive as a collision).
 */
export async function ensureUniqueBlogSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let candidate = baseSlug || "post";

  for (let suffix = 2; suffix < 1000; suffix++) {
    let query = supabase.from("blog_posts").select("id").eq("slug", candidate);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    candidate = `${baseSlug}-${suffix}`;
  }

  return `${baseSlug}-${Date.now()}`;
}
