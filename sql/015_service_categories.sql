-- Groups services under categories for the public Services page: clicking a
-- category tile opens a modal listing that category's services. Mirrors the
-- blog_categories pattern (admin-managed, public-read).
create table if not exists service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  icon_name text not null default 'HardHat',
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table service_categories enable row level security;

create policy "public_select_service_categories" on service_categories
  for select to anon, authenticated using (true);

create policy "authenticated_insert_service_categories" on service_categories
  for insert to authenticated with check (true);

create policy "authenticated_update_service_categories" on service_categories
  for update to authenticated using (true) with check (true);

create policy "authenticated_delete_service_categories" on service_categories
  for delete to authenticated using (true);

alter table services
  add column if not exists category_id uuid references service_categories(id) on delete set null;

insert into service_categories (name, slug, icon_name, display_order) values
  ('Residential', 'residential', 'Home', 0),
  ('Commercial', 'commercial', 'Building2', 1),
  ('Industrial', 'industrial', 'Factory', 2)
on conflict (slug) do nothing;
