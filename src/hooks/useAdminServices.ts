import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Service } from "../types";

export function useAdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("services")
        .select("*, service_categories(name,slug)")
        .order("display_order", { ascending: true });
      if (!cancelled) {
        setServices((data as Service[] | null) ?? []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { services, loading, refresh: () => setRefreshKey((k) => k + 1) };
}
