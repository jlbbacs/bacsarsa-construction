create table if not exists blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

alter table blog_categories enable row level security;

create policy "public_select_blog_categories" on blog_categories
  for select to anon, authenticated using (true);

create policy "authenticated_insert_blog_categories" on blog_categories
  for insert to authenticated with check (true);

create policy "authenticated_update_blog_categories" on blog_categories
  for update to authenticated using (true) with check (true);

create policy "authenticated_delete_blog_categories" on blog_categories
  for delete to authenticated using (true);
