-- Seeds the three singleton config rows (their defaults already match this,
-- but INSERT is required once since the tables start empty) and a starter
-- set of blog categories so the admin's category dropdown isn't empty on day one.
-- services / projects / blog_posts are intentionally left empty -- the site's
-- FALLBACK_* placeholder content is what's shown until the admin adds real rows.

insert into site_settings (id) values (1) on conflict (id) do nothing;
insert into about_config (id) values (1) on conflict (id) do nothing;
insert into home_config (id) values (1) on conflict (id) do nothing;

insert into blog_categories (name, slug) values
  ('Company News', 'company-news'),
  ('Project Spotlights', 'project-spotlights'),
  ('Industry Insights', 'industry-insights'),
  ('Safety & Best Practices', 'safety-best-practices')
on conflict (slug) do nothing;
