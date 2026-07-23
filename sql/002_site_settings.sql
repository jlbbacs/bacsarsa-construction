-- Singleton row (id is always 1) holding site-wide brand/contact info shown in
-- the NavBar and Footer on every page.
create table if not exists site_settings (
  id int primary key default 1 check (id = 1),
  brand_name text not null default 'Meridian Construction Group',
  tagline text not null default 'Building Tomorrow, Today.',
  logo_url text,
  phone text not null default '(555) 010-2938',
  email text not null default 'info@meridianconstruction.example',
  address text not null default '4820 Industrial Pkwy, Suite 200, Springfield, ST 00000',
  facebook_url text,
  instagram_url text,
  linkedin_url text,
  footer_text text not null default 'Licensed & insured general contractor serving the region since 2005.',
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;

create policy "public_select_site_settings" on site_settings
  for select to anon, authenticated using (true);

create policy "authenticated_update_site_settings" on site_settings
  for update to authenticated using (true) with check (true);
