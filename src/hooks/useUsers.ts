import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types";

/**
 * Super-Admin-only: fetches every profile (RLS's select_profiles policy
 * only allows this when the caller's own role is super_admin). No
 * server-side pagination -- the admin roster is expected to stay small;
 * search/filter/pagination are handled client-side in UsersPanel.
 */
export function useUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (!cancelled) {
        setUsers((data as Profile[] | null) ?? []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { users, loading, refresh: () => setRefreshKey((k) => k + 1) };
}
