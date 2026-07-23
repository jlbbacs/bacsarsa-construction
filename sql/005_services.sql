create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  icon_name text not null default 'HardHat', -- a lucide-react icon component name
  image_url text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table services enable row level security;

create policy "public_select_services" on services
  for select to anon, authenticated using (true);

create policy "authenticated_insert_services" on services
  for insert to authenticated with check (true);

create policy "authenticated_update_services" on services
  for update to authenticated using (true) with check (true);

create policy "authenticated_delete_services" on services
  for delete to authenticated using (true);
