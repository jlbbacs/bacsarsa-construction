import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { ActivityLog } from "../types";

/**
 * Super-Admin-only: fetches recent activity_logs rows (RLS restricts
 * select to super_admin). Capped at 200 most-recent rows -- this is an
 * audit trail viewer, not a full export tool.
 */
export function useActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (!cancelled) {
        setLogs((data as ActivityLog[] | null) ?? []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { logs, loading, refresh: () => setRefreshKey((k) => k + 1) };
}
