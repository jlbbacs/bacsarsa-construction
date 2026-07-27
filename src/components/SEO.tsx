import { Helmet } from "react-helmet-async";
import { useSiteSettingsContext } from "../context/SiteSettingsContext";
import { JsonLd } from "./JsonLd";

interface SEOProps {
  title: string;
  description: string;
  image?: string | null;
  path?: string;
  type?: "website" | "article";
  ogTitle?: string | null;
  ogDescription?: string | null;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  ogImageWidth?: number;
  ogImageHeight?: number;
  twitterImage?: string | null;
  publishedTime?: string | null;
  modifiedTime?: string | null;
}

export function SEO({
  title,
  description,
  image,
  path = "",
  type = "website",
  ogTitle,
  ogDescription,
  jsonLd,
  ogImageWidth,
  ogImageHeight,
  twitterImage,
  publishedTime,
  modifiedTime,
}: SEOProps) {
  const { settings } = useSiteSettingsContext();
  const siteUrl = import.meta.env.VITE_SITE_URL || "";
  const fullTitle = `${title} | ${settings.brand_name}`;
  const url = `${siteUrl}${path}`;
  const socialTitle = ogTitle?.trim() ? ogTitle : fullTitle;
  const socialDescription = ogDescription?.trim() ? ogDescription : description;
  const socialImage = twitterImage ?? image;

  return (
    <>
      <Helmet>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        {siteUrl && <link rel="canonical" href={url} />}
        <meta property="og:type" content={type} />
        <meta property="og:title" content={socialTitle} />
        <meta property="og:description" content={socialDescription} />
        {siteUrl && <meta property="og:url" content={url} />}
        {image && <meta property="og:image" content={image} />}
        {image && ogImageWidth && <meta property="og:image:width" content={String(ogImageWidth)} />}
        {image && ogImageHeight && <meta property="og:image:height" content={String(ogImageHeight)} />}
        {type === "article" && publishedTime && <meta property="article:published_time" content={publishedTime} />}
        {type === "article" && modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
        <meta name="twitter:card" content={socialImage ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={socialTitle} />
        <meta name="twitter:description" content={socialDescription} />
        {socialImage && <meta name="twitter:image" content={socialImage} />}
      </Helmet>
      {jsonLd && <JsonLd data={jsonLd} />}
    </>
  );
}
