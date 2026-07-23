-- Introduces the admin user-management system: two roles (super_admin,
-- admin) backed by a `profiles` table extending auth.users. This is the
-- foundation migration for the whole feature -- everything else (RLS on
-- other tables, RBAC gating in the app, activity logs, etc.) reads
-- `current_user_role()` defined here.

create type user_role as enum ('super_admin', 'admin');
create type user_status as enum ('active', 'pending_verification', 'disabled', 'suspended', 'locked');

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  username text not null unique,
  phone text,
  role user_role not null default 'admin',
  status user_status not null default 'pending_verification',
  avatar_url text,
  failed_attempts int not null default 0,
  locked_until timestamptz,
  force_password_change boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Reads the caller's own role without recursive RLS (this function is used
-- INSIDE profiles' own RLS policies below, so it must bypass RLS itself).
create or replace function current_user_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

create policy "select_profiles" on profiles
  for select to authenticated
  using (auth.uid() = id or current_user_role() = 'super_admin');

create policy "update_profiles" on profiles
  for update to authenticated
  using (auth.uid() = id or current_user_role() = 'super_admin')
  with check (auth.uid() = id or current_user_role() = 'super_admin');

-- Deliberately no insert/delete policy for anon/authenticated: rows are
-- created only by the handle_new_user trigger (018) and removed only via
-- auth.users cascade, driven by the admin-users Edge Function's
-- service-role connection (which bypasses RLS entirely).

-- RLS above only restricts which ROWS a client can touch. This trigger
-- restricts which COLUMNS a plain authenticated client may change on a row
-- it's otherwise allowed to update -- a non-super-admin editing their own
-- row cannot promote their own role, change their own status, rename
-- themselves, or clear their own lockout/force-password-change flags via a
-- direct table update; those must go through the dedicated RPCs/Edge
-- Function instead. Only fires for genuine client connections (Postgres
-- role `authenticated`) -- SECURITY DEFINER RPCs run as their owner and the
-- admin-users Edge Function runs as `service_role`, both must pass through
-- untouched.
create or replace function enforce_profile_update_permissions() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if current_user <> 'authenticated' then
    return new;
  end if;

  if current_user_role() = 'super_admin' then
    new.updated_at := now();
    return new;
  end if;

  if new.role is distinct from old.role
     or new.status is distinct from old.status
     or new.username is distinct from old.username
     or new.force_password_change is distinct from old.force_password_change
     or new.failed_attempts is distinct from old.failed_attempts
     or new.locked_until is distinct from old.locked_until then
    raise exception 'Not permitted to change this field directly; use the appropriate action.';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_enforce_profile_update_permissions
  before update on profiles
  for each row execute function enforce_profile_update_permissions();
