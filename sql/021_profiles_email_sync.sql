-- Denormalizes auth.users.email onto profiles. The Users management table
-- (Super Admin only) needs to display each admin's email, but auth.users
-- is a protected schema the browser client can't query directly even via
-- RLS -- this is the standard Supabase pattern for exposing a read-only
-- copy of an auth.users field to the rest of the app.

alter table profiles add column if not exists email text;

update profiles p set email = u.email from auth.users u where u.id = p.id and p.email is distinct from u.email;

-- Extend handle_new_user (018) to also set email on insert.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, first_name, last_name, username, role, status, force_password_change, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'admin'),
    'pending_verification',
    true,
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Keeps profiles.email in sync after a confirmed "change email" flow
-- (auth.users.email only updates once Supabase's own secure-email-change
-- confirmation completes, so this trigger firing means it's a real change).
create or replace function handle_user_email_updated() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function handle_user_email_updated();
