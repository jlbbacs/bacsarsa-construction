create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null default 'Commercial', -- Commercial | Residential | Industrial
  location text,
  completion_date date,
  image_url text,
  client_name text,
  is_featured boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table projects enable row level security;

create policy "public_select_projects" on projects
  for select to anon, authenticated using (true);

create policy "authenticated_insert_projects" on projects
  for insert to authenticated with check (true);

create policy "authenticated_update_projects" on projects
  for update to authenticated using (true) with check (true);

create policy "authenticated_delete_projects" on projects
  for delete to authenticated using (true);
