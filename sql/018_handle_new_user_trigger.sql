-- Auto-creates a profiles row whenever a new auth.users row appears --
-- Supabase's documented pattern for extending auth.users. This is what
-- actually creates the profile for admins invited via the admin-users Edge
-- Function's `create` action: that function calls
-- auth.admin.inviteUserByEmail(email, { data: { first_name, last_name,
-- username, role } }), and this trigger reads that metadata back out of
-- raw_user_meta_data to build the row. Also acts as a safety net for any
-- user created directly in the Supabase dashboard.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, first_name, last_name, username, role, status, force_password_change)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'admin'),
    'pending_verification',
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
