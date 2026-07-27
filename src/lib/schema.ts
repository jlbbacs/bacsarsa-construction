import { toOpeningHoursSpecification, toPostalAddressSchema } from "./address";
import type { BlogPost, Project, Service, SiteSettings } from "../types";

const SITE_URL = import.meta.env.VITE_SITE_URL || "";

function url(path = ""): string {
  return `${SITE_URL}${path}`;
}

function sameAs(settings: SiteSettings): string[] {
  return [settings.facebook_url, settings.instagram_url, settings.linkedin_url].filter((v): v is string => Boolean(v));
}

export function buildOrganization(settings: SiteSettings): Record<string, unknown> {
  return {
    "@type": "Organization",
    "@id": url("/#organization"),
    name: settings.brand_name,
    url: url("/"),
    logo: settings.logo_url || undefined,
    image: settings.logo_url || undefined,
    sameAs: sameAs(settings),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: settings.phone,
      email: settings.email,
      contactType: "customer service",
    },
  };
}

/** GeneralContractor is a schema.org LocalBusiness subtype -- the correct, specific type for this business. */
export function buildLocalBusiness(settings: SiteSettings): Record<string, unknown> {
  return {
    "@type": "GeneralContractor",
    "@id": url("/#localbusiness"),
    name: settings.brand_name,
    url: url("/"),
    telephone: settings.phone,
    email: settings.email,
    image: settings.logo_url || undefined,
    address: toPostalAddressSchema(settings),
    openingHoursSpecification: toOpeningHoursSpecification(settings.business_hours),
    sameAs: sameAs(settings),
  };
}

/** No SearchAction -- the site has no internal search feature, so one isn't declared. */
export function buildWebSite(settings: SiteSettings): Record<string, unknown> {
  return {
    "@type": "WebSite",
    "@id": url("/#website"),
    name: settings.brand_name,
    url: url("/"),
  };
}

export function buildWebPage({ name, description, path }: { name: string; description: string; path: string }): Record<string, unknown> {
  return {
    "@type": "WebPage",
    "@id": url(`${path}#webpage`),
    name,
    description,
    url: url(path),
  };
}

export function buildBreadcrumbList(items: { name: string; path: string }[]): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: url(item.path),
    })),
  };
}

/** author -> Organization, not Person: blog_posts has no author column today. */
export function buildBlogPosting(post: BlogPost, settings: SiteSettings): Record<string, unknown> {
  return {
    "@type": "BlogPosting",
    "@id": url(`/blog/${post.slug}#article`),
    headline: post.title,
    description: post.meta_description ?? post.excerpt ?? post.title,
    image: post.og_image_url ?? post.featured_image_url ?? undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    author: { "@type": "Organization", name: settings.brand_name },
    publisher: buildOrganization(settings),
    mainEntityOfPage: url(`/blog/${post.slug}`),
  };
}

export function buildService(service: Service, settings: SiteSettings): Record<string, unknown> {
  return {
    "@type": "Service",
    "@id": url(`/services/${service.slug}#service`),
    name: service.title,
    description: service.description,
    image: service.image_url || undefined,
    url: url(`/services/${service.slug}`),
    serviceType: service.service_categories?.name ?? service.title,
    provider: { "@type": "GeneralContractor", name: settings.brand_name, url: url("/") },
    areaServed: settings.address_city || undefined,
  };
}

/** Generic CreativeWork -- schema.org has no dedicated "completed construction project" type. */
export function buildProjectCreativeWork(project: Project, settings: SiteSettings): Record<string, unknown> {
  return {
    "@type": "CreativeWork",
    "@id": url(`/projects/${project.slug}#project`),
    name: project.title,
    description: project.description,
    url: url(`/projects/${project.slug}`),
    creator: { "@type": "Organization", name: settings.brand_name },
    about: project.category,
    locationCreated: project.location || undefined,
    dateCreated: project.completion_date || undefined,
    image: project.image_url ? { "@type": "ImageObject", url: project.image_url } : undefined,
  };
}

export function buildContactPage({ name, description, path }: { name: string; description: string; path: string }): Record<string, unknown> {
  return { "@type": "ContactPage", "@id": url(`${path}#webpage`), name, description, url: url(path) };
}

export function buildAboutPage({ name, description, path }: { name: string; description: string; path: string }): Record<string, unknown> {
  return { "@type": "AboutPage", "@id": url(`${path}#webpage`), name, description, url: url(path) };
}

export function buildCollectionPage({ name, description, path }: { name: string; description: string; path: string }): Record<string, unknown> {
  return { "@type": "CollectionPage", "@id": url(`${path}#webpage`), name, description, url: url(path) };
}

export function buildFAQPage(items: { question: string; answer: string }[]): Record<string, unknown> {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
