-- Singleton row driving the About page.
create table if not exists about_config (
  id int primary key default 1 check (id = 1),
  heading text not null default 'Built On Trust, Backed By Craft.',
  subheading text not null default 'Two decades of construction experience across the region.',
  body_markdown text not null default 'Meridian Construction Group has been delivering commercial, residential, and industrial projects for over 20 years. We combine skilled crews, rigorous safety standards, and honest project management to build things that last.',
  mission_statement text not null default 'Our mission is to build safely, on schedule, and on budget -- every project, every time.',
  image_url text,
  stats jsonb not null default '[
    {"label": "Years in Business", "value": "20+"},
    {"label": "Projects Completed", "value": "350+"},
    {"label": "Certified Crew", "value": "45"},
    {"label": "Client Satisfaction", "value": "98%"}
  ]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table about_config enable row level security;

create policy "public_select_about_config" on about_config
  for select to anon, authenticated using (true);

create policy "authenticated_update_about_config" on about_config
  for update to authenticated using (true) with check (true);
