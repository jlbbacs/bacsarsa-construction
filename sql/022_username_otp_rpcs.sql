-- Username-change confirmation flow and Super-Admin OTP gate for sensitive
-- self-changes (password/email/username). Neither RPC sends email itself
-- -- the client calls send-notification-email immediately after with the
-- token_id (and, for OTP, the raw code) these return, since a Postgres
-- function has no safe way to reach an external email API on its own (see
-- the project plan for why pg_net-from-Postgres was rejected).

-- Requests a username change for the CALLING user. Does not apply the
-- change yet -- only confirm_username_change (below) does that, once the
-- emailed link is clicked. Re-requesting overwrites any still-pending
-- request for the same user (the unique(user_id, type) constraint on
-- verification_tokens from migration 017 handles that via upsert).
create or replace function request_username_change(p_new_username text)
returns table(token_id uuid)
language plpgsql security definer set search_path = public as $$
declare
  v_token text;
  v_id uuid;
begin
  if p_new_username is null or length(trim(p_new_username)) = 0 then
    raise exception 'Username cannot be empty.';
  end if;

  if exists (select 1 from profiles where username = p_new_username and id <> auth.uid()) then
    raise exception 'That username is already taken.';
  end if;

  v_token := encode(gen_random_bytes(24), 'hex');

  insert into verification_tokens (user_id, type, token, new_value, expires_at)
  values (auth.uid(), 'username_change', v_token, p_new_username, now() + interval '24 hours')
  on conflict (user_id, type) do update set
    token = excluded.token,
    new_value = excluded.new_value,
    expires_at = excluded.expires_at,
    used_at = null
  returning id into v_id;

  return query select v_id;
end;
$$;
grant execute on function request_username_change(text) to authenticated;

-- Public (token itself is the credential -- the user may not still be
-- signed in on the device/browser where they open the confirmation email).
create or replace function confirm_username_change(p_token text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_row verification_tokens%rowtype;
begin
  select * into v_row from verification_tokens
  where token = p_token and type = 'username_change';

  if v_row.id is null then
    raise exception 'Invalid confirmation link.';
  end if;
  if v_row.used_at is not null then
    raise exception 'This confirmation link has already been used.';
  end if;
  if v_row.expires_at < now() then
    raise exception 'This confirmation link has expired. Request the change again.';
  end if;
  if exists (select 1 from profiles where username = v_row.new_value and id <> v_row.user_id) then
    raise exception 'That username was taken by someone else in the meantime.';
  end if;

  update profiles set username = v_row.new_value where id = v_row.user_id;
  update verification_tokens set used_at = now() where id = v_row.id;

  insert into activity_logs (actor_user_id, action, target_user_id, metadata)
  values (v_row.user_id, 'username_changed', v_row.user_id, jsonb_build_object('new_username', v_row.new_value));
end;
$$;
grant execute on function confirm_username_change(text) to anon, authenticated;

-- Generates a 6-digit OTP for the CALLING Super Admin, storing only its
-- hash. Returns the raw code once, here, to the already-authenticated,
-- already-role-checked caller -- this is the one and only place the raw
-- code exists outside the recipient's inbox.
create or replace function request_super_admin_otp()
returns table(token_id uuid, raw_code text)
language plpgsql security definer set search_path = public as $$
declare
  v_code text;
  v_id uuid;
begin
  if current_user_role() <> 'super_admin' then
    raise exception 'Only a Super Admin can request this.';
  end if;

  v_code := lpad(floor(random() * 1000000)::text, 6, '0');

  insert into verification_tokens (user_id, type, code_hash, expires_at)
  values (auth.uid(), 'otp_superadmin', encode(digest(v_code::bytea, 'sha256'), 'hex'), now() + interval '10 minutes')
  on conflict (user_id, type) do update set
    code_hash = excluded.code_hash,
    expires_at = excluded.expires_at,
    used_at = null
  returning id into v_id;

  return query select v_id, v_code;
end;
$$;
grant execute on function request_super_admin_otp() to authenticated;

-- Verifies a code against the CALLING Super Admin's own pending OTP. Only
-- confirms the code is correct/unexpired/unused and marks it consumed --
-- the actual password/email/username change happens as a separate step in
-- the frontend afterward, through Supabase Auth's normal update methods.
create or replace function verify_super_admin_otp(p_code text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_row verification_tokens%rowtype;
begin
  if current_user_role() <> 'super_admin' then
    raise exception 'Only a Super Admin can verify this.';
  end if;

  select * into v_row from verification_tokens
  where user_id = auth.uid() and type = 'otp_superadmin';

  if v_row.id is null or v_row.used_at is not null or v_row.expires_at < now() then
    return false;
  end if;
  if v_row.code_hash <> encode(digest(p_code::bytea, 'sha256'), 'hex') then
    return false;
  end if;

  update verification_tokens set used_at = now() where id = v_row.id;
  perform log_activity('super_admin_otp_verified');
  return true;
end;
$$;
grant execute on function verify_super_admin_otp(text) to authenticated;
