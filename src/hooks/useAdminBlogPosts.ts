import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { BlogPost } from "../types";

/**
 * Admin-only variant of useBlogPosts: fetches every post regardless of status
 * (RLS's authenticated_select_all_blog_posts policy allows this only when
 * signed in) with no pagination -- the dashboard list is expected to stay small.
 */
export function useAdminBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("blog_posts")
        .select("*, blog_categories(name,slug), blog_post_tags(blog_tags(*))")
        .order("updated_at", { ascending: false });
      if (!cancelled) {
        setPosts((data as BlogPost[] | null) ?? []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { posts, loading, refresh: () => setRefreshKey((k) => k + 1) };
}
