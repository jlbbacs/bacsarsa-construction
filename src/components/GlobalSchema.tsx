import { useSiteSettingsContext } from "../context/SiteSettingsContext";
import { buildLocalBusiness, buildOrganization, buildWebSite } from "../lib/schema";
import { JsonLd } from "./JsonLd";

/** Site-wide JSON-LD (Organization + LocalBusiness + WebSite), mounted once so every route carries it without prop drilling. */
export function GlobalSchema() {
  const { settings } = useSiteSettingsContext();
  return <JsonLd data={[buildOrganization(settings), buildLocalBusiness(settings), buildWebSite(settings)]} />;
}
