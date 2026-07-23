import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { FALLBACK_BLOG_CATEGORIES } from "../data/fallback";
import type { BlogCategory } from "../types";

export function useBlogCategories() {
  const [categories, setCategories] = useState<BlogCategory[]>(FALLBACK_BLOG_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("blog_categories").select("*").order("name", { ascending: true });
      if (!cancelled) {
        const rows = (data as BlogCategory[] | null) ?? [];
        setCategories(rows.length > 0 ? rows : FALLBACK_BLOG_CATEGORIES);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { categories, loading, refresh: () => setRefreshKey((k) => k + 1) };
}
