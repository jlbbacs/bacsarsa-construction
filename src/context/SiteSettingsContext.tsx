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

const CACHE_KEY = "site_settings_cache";

// Reads the last successfully-fetched settings from localStorage so a page
// refresh starts from the real brand name/logo instead of flashing the
// generic FALLBACK_SITE_SETTINGS ("Meridian Construction Group", no logo)
// while the async Supabase fetch is in flight.
function getCachedSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return FALLBACK_SITE_SETTINGS;
    return { ...FALLBACK_SITE_SETTINGS, ...(JSON.parse(raw) as SiteSettings) };
  } catch {
    return FALLBACK_SITE_SETTINGS;
  }
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(getCachedSettings);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
      if (!cancelled) {
        const resolved = data ? { ...FALLBACK_SITE_SETTINGS, ...(data as SiteSettings) } : FALLBACK_SITE_SETTINGS;
        setSettings(resolved);
        setLoading(false);
        if (data) {
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(resolved));
          } catch {
            // Ignore storage failures (private browsing, quota, etc.) --
            // caching is a nice-to-have, not required for correctness.
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // Keeps the browser-tab favicon in sync with the uploaded logo, same as
  // the nav/login/admin-header branding -- falls back to the static
  // /favicon.svg when no logo has been uploaded.
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) return;

    if (settings.logo_url) {
      link.href = settings.logo_url;
      link.removeAttribute("type");
    } else {
      link.href = "/favicon.svg";
      link.type = "image/svg+xml";
    }
  }, [settings.logo_url]);

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
