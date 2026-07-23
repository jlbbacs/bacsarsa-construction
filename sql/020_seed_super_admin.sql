-- Promotes the existing single admin login to Super Admin. This is the
-- only migration in this feature that needs hand-editing before you run
-- it: replace the email below if your admin login email changes again in
-- the future.
--
-- IMPORTANT: run the verification query at the bottom of this file
-- immediately after, in the same SQL editor session, BEFORE deploying any
-- of the RBAC-gating frontend changes (Phase C). If it doesn't return
-- exactly one row with role = super_admin, status = active,
-- force_password_change = false, stop and fix this first -- shipping the
-- RBAC gate on top of a bad seed can lock you out of your own dashboard.

do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = 'admin@gmail.com';

  if v_user_id is null then
    raise exception 'No auth.users row found for that email. Edit the email at the top of this file to match your real admin login, then re-run.';
  end if;

  insert into profiles (id, first_name, last_name, username, role, status, force_password_change)
  values (v_user_id, 'Admin', 'User', 'admin', 'super_admin', 'active', false)
  on conflict (id) do update set
    role = 'super_admin',
    status = 'active',
    force_password_change = false;
end $$;

-- Run this immediately after the block above and confirm exactly one row,
-- role = super_admin, status = active, force_password_change = false:
--
-- select u.email, p.username, p.role, p.status, p.force_password_change
-- from profiles p join auth.users u on u.id = p.id;
