-- Singleton row driving the Home page hero + intro copy.
create table if not exists home_config (
  id int primary key default 1 check (id = 1),
  hero_heading text not null default 'Building Spaces That Stand The Test Of Time',
  hero_subheading text not null default 'Commercial, residential, and industrial construction -- delivered on schedule, on budget, and to code.',
  hero_image_url text,
  hero_cta_text text not null default 'Get a Free Quote',
  hero_cta_link text not null default '/contact',
  secondary_cta_text text not null default 'View Our Projects',
  secondary_cta_link text not null default '/projects',
  intro_heading text not null default 'A Full-Service General Contractor',
  intro_text text not null default 'From ground-up commercial builds to residential remodels, our licensed and insured crews handle every phase of the project so you don''t have to juggle subcontractors.',
  updated_at timestamptz not null default now()
);

alter table home_config enable row level security;

create policy "public_select_home_config" on home_config
  for select to anon, authenticated using (true);

create policy "authenticated_update_home_config" on home_config
  for update to authenticated using (true) with check (true);
