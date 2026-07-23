export interface SiteSettings {
  id: number;
  brand_name: string;
  tagline: string;
  logo_url: string | null;
  phone: string;
  email: string;
  address: string;
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  footer_text: string;
  services_header_image_url: string | null;
  projects_header_image_url: string | null;
  contact_header_image_url: string | null;
  blog_header_image_url: string | null;
}

export interface AboutStat {
  label: string;
  value: string;
}

export interface AboutConfig {
  id: number;
  heading: string;
  subheading: string;
  body_markdown: string;
  mission_statement: string;
  image_url: string | null;
  stats: AboutStat[];
}

export interface HomeConfig {
  id: number;
  hero_heading: string;
  hero_subheading: string;
  hero_image_url: string | null;
  hero_video_url: string | null;
  hero_cta_text: string;
  hero_cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
  intro_eyebrow: string;
  intro_heading: string;
  intro_text: string;
  intro_bullets: string[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon_name: string;
  display_order: number;
  created_at: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  image_url: string | null;
  display_order: number;
  created_at: string;
  category_id: string | null;
  service_categories?: { name: string; slug: string } | null;
}

export type ProjectCategory = "Commercial" | "Residential" | "Industrial";

export interface Project {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  location: string | null;
  completion_date: string | null;
  image_url: string | null;
  client_name: string | null;
  is_featured: boolean;
  display_order: number;
  created_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export type BlogPostStatus = "draft" | "scheduled" | "published" | "archived";

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_markdown: string;
  content_html: string | null;
  featured_image_url: string | null;
  category_id: string | null;
  status: BlogPostStatus;
  meta_description: string | null;
  seo_title: string | null;
  focus_keyword: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  blog_categories?: { name: string; slug: string } | null;
  blog_post_tags?: { blog_tags: BlogTag }[];
}

export type UserRole = "super_admin" | "admin";

export type UserStatus = "active" | "pending_verification" | "disabled" | "suspended" | "locked";

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  avatar_url: string | null;
  failed_attempts: number;
  locked_until: string | null;
  force_password_change: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  email: string | null;
}

export interface ActivityLog {
  id: string;
  actor_user_id: string | null;
  action: string;
  target_user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  actor?: { username: string; first_name: string; last_name: string } | null;
  target?: { username: string; first_name: string; last_name: string } | null;
}
