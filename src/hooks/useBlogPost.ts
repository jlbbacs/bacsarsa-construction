import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { FALLBACK_BLOG_POSTS } from "../data/fallback";
import type { BlogPost } from "../types";

export function useBlogPost(slug: string | undefined) {
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined); // undefined = loading, null = not found
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setPost(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setPost(undefined);

    (async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*, blog_categories(name,slug)")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (cancelled) return;

      if (data) {
        setPost(data as BlogPost);
      } else {
        const fallbackMatch = FALLBACK_BLOG_POSTS.find((p) => p.slug === slug) ?? null;
        setPost(fallbackMatch);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { post, loading };
}
