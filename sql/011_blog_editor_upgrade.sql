-- Phase 1 of the CMS-style blog editor upgrade: rich text content, tags,
-- expanded statuses, and an SEO panel. See src/components/admin/PostEditor.tsx.

alter table blog_posts
  add column if not exists content_html text,
  add column if not exists seo_title text,
  add column if not exists focus_keyword text,
  add column if not exists og_title text,
  add column if not exists og_description text,
  add column if not exists og_image_url text,
  add column if not exists scheduled_at timestamptz;

-- content_markdown / the old markdown editor are retired in favor of
-- content_html, but the column is left in place (unused going forward) so
-- any posts already written in markdown keep rendering via the fallback
-- path in BlogPost.tsx / BlogCard.tsx instead of going blank.

alter table blog_posts drop constraint if exists blog_posts_status_check;
alter table blog_posts add constraint blog_posts_status_check
  check (status in ('draft', 'scheduled', 'published', 'archived'));

create table if not exists blog_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists blog_post_tags (
  post_id uuid not null references blog_posts(id) on delete cascade,
  tag_id uuid not null references blog_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

alter table blog_tags enable row level security;
alter table blog_post_tags enable row level security;

create policy "public_select_blog_tags" on blog_tags
  for select to anon, authenticated using (true);

create policy "authenticated_insert_blog_tags" on blog_tags
  for insert to authenticated with check (true);

create policy "authenticated_update_blog_tags" on blog_tags
  for update to authenticated using (true) with check (true);

create policy "authenticated_delete_blog_tags" on blog_tags
  for delete to authenticated using (true);

create policy "public_select_blog_post_tags" on blog_post_tags
  for select to anon, authenticated using (true);

create policy "authenticated_insert_blog_post_tags" on blog_post_tags
  for insert to authenticated with check (true);

create policy "authenticated_delete_blog_post_tags" on blog_post_tags
  for delete to authenticated using (true);
