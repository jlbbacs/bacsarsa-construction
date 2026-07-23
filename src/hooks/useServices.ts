import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { FALLBACK_SERVICES } from "../data/fallback";
import type { Service } from "../types";

export function useServices() {
  const [services, setServices] = useState<Service[]>(FALLBACK_SERVICES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("services")
        .select("*, service_categories(name,slug)")
        .order("display_order", { ascending: true });
      if (!cancelled) {
        const rows = (data as Service[] | null) ?? [];
        setServices(rows.length > 0 ? rows : FALLBACK_SERVICES);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { services, loading };
}
