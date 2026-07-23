import { Helmet } from "react-helmet-async";
import { useSiteSettingsContext } from "../context/SiteSettingsContext";

interface SEOProps {
  title: string;
  description: string;
  image?: string | null;
  path?: string;
  type?: "website" | "article";
  ogTitle?: string | null;
  ogDescription?: string | null;
}

export function SEO({ title, description, image, path = "", type = "website", ogTitle, ogDescription }: SEOProps) {
  const { settings } = useSiteSettingsContext();
  const siteUrl = import.meta.env.VITE_SITE_URL || "";
  const fullTitle = `${title} | ${settings.brand_name}`;
  const url = `${siteUrl}${path}`;
  const socialTitle = ogTitle?.trim() ? ogTitle : fullTitle;
  const socialDescription = ogDescription?.trim() ? ogDescription : description;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {siteUrl && <link rel="canonical" href={url} />}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={socialTitle} />
      <meta property="og:description" content={socialDescription} />
      {siteUrl && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={socialTitle} />
      <meta name="twitter:description" content={socialDescription} />
    </Helmet>
  );
}
