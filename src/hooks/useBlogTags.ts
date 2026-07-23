import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { BlogTag } from "../types";

export function useBlogTags() {
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("blog_tags").select("*").order("name", { ascending: true });
      if (!cancelled) {
        setTags((data as BlogTag[] | null) ?? []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { tags, loading, refresh: () => setRefreshKey((k) => k + 1) };
}
