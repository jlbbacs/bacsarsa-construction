import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { FALLBACK_SITE_SETTINGS } from "../data/fallback";
import type { SiteSettings } from "../types";

interface SiteSettingsContextValue {
  settings: SiteSettings;
  loading: boolean;
  refresh: () => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(null);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(FALLBACK_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
      if (!cancelled) {
        setSettings(data ? { ...FALLBACK_SITE_SETTINGS, ...(data as SiteSettings) } : FALLBACK_SITE_SETTINGS);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refresh: () => setRefreshKey((k) => k + 1) }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettingsContext(): SiteSettingsContextValue {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error("useSiteSettingsContext must be used within a SiteSettingsProvider");
  return ctx;
}
