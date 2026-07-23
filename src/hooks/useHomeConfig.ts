import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { FALLBACK_HOME_CONFIG } from "../data/fallback";
import type { HomeConfig } from "../types";

export function useHomeConfig() {
  const [config, setConfig] = useState<HomeConfig>(FALLBACK_HOME_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("home_config").select("*").eq("id", 1).single();
      if (!cancelled) {
        setConfig(data ? { ...FALLBACK_HOME_CONFIG, ...(data as HomeConfig) } : FALLBACK_HOME_CONFIG);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { config, loading };
}
