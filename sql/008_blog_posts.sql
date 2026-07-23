create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content_markdown text not null default '',
  featured_image_url text,
  category_id uuid references blog_categories(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  meta_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_status_published_at_idx
  on blog_posts (status, published_at desc);

alter table blog_posts enable row level security;

-- Public visitors only ever see published posts.
create policy "public_select_published_blog_posts" on blog_posts
  for select to anon using (status = 'published');

-- The logged-in admin sees everything, including drafts, in the dashboard.
create policy "authenticated_select_all_blog_posts" on blog_posts
  for select to authenticated using (true);

create policy "authenticated_insert_blog_posts" on blog_posts
  for insert to authenticated with check (true);

create policy "authenticated_update_blog_posts" on blog_posts
  for update to authenticated using (true) with check (true);

create policy "authenticated_delete_blog_posts" on blog_posts
  for delete to authenticated using (true);
