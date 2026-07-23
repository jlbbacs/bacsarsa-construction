-- Lets the dark page-header band on Services/Projects/Contact/Blog carry an
-- optional background image, same treatment as the Home hero and the About
-- page header (which already had image_url on about_config, just unused
-- until PageHeader.tsx wired it up).
alter table site_settings
  add column if not exists services_header_image_url text,
  add column if not exists projects_header_image_url text,
  add column if not exists contact_header_image_url text,
  add column if not exists blog_header_image_url text;
