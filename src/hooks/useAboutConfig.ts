import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { FALLBACK_ABOUT_CONFIG } from "../data/fallback";
import type { AboutConfig } from "../types";

export function useAboutConfig() {
  const [config, setConfig] = useState<AboutConfig>(FALLBACK_ABOUT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("about_config").select("*").eq("id", 1).single();
      if (!cancelled) {
        setConfig((data as AboutConfig | null) ?? FALLBACK_ABOUT_CONFIG);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { config, loading };
}
