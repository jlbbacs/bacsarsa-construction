import { HardHat } from "lucide-react";
import { useSiteSettingsContext } from "../context/SiteSettingsContext";

export function PageLoader() {
  const { settings } = useSiteSettingsContext();

  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-3 py-24 text-charcoal-900">
      {settings.logo_url ? (
        <img src={settings.logo_url} alt="" className="h-8 w-8 animate-pulse rounded-md object-contain" />
      ) : (
        <HardHat className="h-8 w-8 animate-pulse text-safety-500" />
      )}
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-steel-600">Loading</span>
    </div>
  );
}
