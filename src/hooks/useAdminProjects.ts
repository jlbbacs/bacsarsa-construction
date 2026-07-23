import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Project } from "../types";

export function useAdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("projects").select("*").order("display_order", { ascending: true });
      if (!cancelled) {
        setProjects((data as Project[] | null) ?? []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { projects, loading, refresh: () => setRefreshKey((k) => k + 1) };
}
