import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { FALLBACK_BLOG_POSTS } from "../data/fallback";
import type { BlogPost } from "../types";

export const BLOG_PAGE_SIZE = 9;

interface UseBlogPostsParams {
  categoryId?: string | null;
  search?: string;
  page: number;
}

function filterFallback(categoryId: string | null | undefined, search: string | undefined): BlogPost[] {
  let rows = FALLBACK_BLOG_POSTS;
  if (categoryId) rows = rows.filter((p) => p.category_id === categoryId);
  if (search) {
    const term = search.toLowerCase();
    rows = rows.filter(
      (p) => p.title.toLowerCase().includes(term) || (p.excerpt ?? "").toLowerCase().includes(term)
    );
  }
  return rows;
}

export function useBlogPosts({ categoryId, search, page }: UseBlogPostsParams) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const from = page * BLOG_PAGE_SIZE;
      const to = from + BLOG_PAGE_SIZE - 1;

      let query = supabase
        .from("blog_posts")
        .select("id,title,slug,excerpt,featured_image_url,published_at,category_id,blog_categories(name,slug)", {
          count: "exact",
        })
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (categoryId) query = query.eq("category_id", categoryId);
      if (search) query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);

      const { data, count, error } = await query.range(from, to);
      if (cancelled) return;

      const noFiltersActive = !categoryId && !search;
      const tableLooksEmpty = error || (noFiltersActive && page === 0 && (count ?? 0) === 0 && (data?.length ?? 0) === 0);

      if (tableLooksEmpty) {
        const fallbackRows = filterFallback(categoryId, search);
        setPosts(fallbackRows.slice(from, to + 1));
        setTotalCount(fallbackRows.length);
      } else {
        setPosts((data as unknown as BlogPost[] | null) ?? []);
        setTotalCount(count ?? 0);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [categoryId, search, page]);

  return { posts, totalCount, loading, pageSize: BLOG_PAGE_SIZE };
}
