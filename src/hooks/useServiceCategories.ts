import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { FALLBACK_SERVICE_CATEGORIES } from "../data/fallback";
import type { ServiceCategory } from "../types";

export function useServiceCategories() {
  const [categories, setCategories] = useState<ServiceCategory[]>(FALLBACK_SERVICE_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("service_categories")
        .select("*")
        .order("display_order", { ascending: true });
      if (!cancelled) {
        const rows = (data as ServiceCategory[] | null) ?? [];
        setCategories(rows.length > 0 ? rows : FALLBACK_SERVICE_CATEGORIES);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { categories, loading, refresh: () => setRefreshKey((k) => k + 1) };
}
