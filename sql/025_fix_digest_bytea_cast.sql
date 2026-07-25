-- Fixes "function digest(text, unknown) does not exist" -- pgcrypto's
-- digest() only accepts bytea, and Postgres won't implicitly cast text to
-- bytea (unlike crypt(), which does accept text directly). Missed this in
-- 022; re-creating both functions with an explicit ::bytea cast.

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
