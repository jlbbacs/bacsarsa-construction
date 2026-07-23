import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { FALLBACK_PROJECTS } from "../data/fallback";
import type { Project } from "../types";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(FALLBACK_PROJECTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("projects").select("*").order("display_order", { ascending: true });
      if (!cancelled) {
        const rows = (data as Project[] | null) ?? [];
        setProjects(rows.length > 0 ? rows : FALLBACK_PROJECTS);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { projects, loading };
}
