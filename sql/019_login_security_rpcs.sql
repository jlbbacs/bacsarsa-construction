-- Login-attempt lockout and activity-logging RPCs, called directly from
-- Login.tsx with the ordinary anon/authenticated key. Safe to expose
-- because each function only does the one narrow thing its name says --
-- none of them let a caller read or write anything outside that.

-- Pre-flight check before attempting sign-in: lets Login.tsx show "locked,
-- try again in Xm" without even calling supabase.auth.signInWithPassword.
-- Never reveals whether the email exists at all (avoids user enumeration)
-- -- a non-existent or non-locked account and a locked-but-unknown-email
-- both just return locked = false in the "no match" branch below... except
-- we DO need to tell a genuinely locked user they're locked, so this
-- function accepts the small trade-off of confirming account existence
-- only for currently-locked accounts, which is the same information the
-- failed sign-in attempt itself would eventually reveal anyway.
create or replace function check_account_lock(p_email text)
returns table(locked boolean, locked_until timestamptz)
language plpgsql security definer set search_path = public as $$
declare
  v_locked_until timestamptz;
begin
  select p.locked_until into v_locked_until
  from profiles p join auth.users u on u.id = p.id
  where u.email = p_email and p.status = 'locked';

  if v_locked_until is not null and v_locked_until > now() then
    return query select true, v_locked_until;
  else
    return query select false, null::timestamptz;
  end if;
end;
$$;
grant execute on function check_account_lock(text) to anon, authenticated;

-- Called after every sign-in attempt, success or failure. Reads the real
-- client IP/User-Agent from PostgREST's request-headers GUC (only
-- populated when invoked via supabase.rpc(...) through PostgREST, so this
-- can't be spoofed by a client-supplied value the way a plain function
-- argument could be).
create or replace function record_login_activity(p_email text, p_success boolean)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid;
  v_headers json;
  v_ip text;
  v_ua text;
begin
  select id into v_user_id from auth.users where email = p_email;

  begin
    v_headers := current_setting('request.headers', true)::json;
    v_ip := v_headers->>'x-forwarded-for';
    v_ua := v_headers->>'user-agent';
  exception when others then
    v_ip := null;
    v_ua := null;
  end;

  insert into activity_logs (actor_user_id, action, target_user_id, ip_address, user_agent)
  values (v_user_id, case when p_success then 'login_success' else 'login_failed' end, v_user_id, v_ip, v_ua);

  if v_user_id is null then
    return;
  end if;

  if p_success then
    update profiles
    set failed_attempts = 0,
        locked_until = null,
        status = case when status = 'locked' then 'active' else status end,
        last_login_at = now()
    where id = v_user_id;
  else
    update profiles set failed_attempts = failed_attempts + 1 where id = v_user_id;
    update profiles set status = 'locked', locked_until = now() + interval '15 minutes'
    where id = v_user_id and failed_attempts >= 5 and status <> 'locked';
  end if;
end;
$$;
grant execute on function record_login_activity(text, boolean) to anon, authenticated;

-- Generic self-service activity logger, used for password changes, profile
-- edits, and anything else a signed-in user does to their own account.
create or replace function log_activity(p_action text, p_metadata jsonb default '{}'::jsonb)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_headers json;
begin
  begin
    v_headers := current_setting('request.headers', true)::json;
  exception when others then
    v_headers := null;
  end;

  insert into activity_logs (actor_user_id, action, target_user_id, ip_address, user_agent, metadata)
  values (auth.uid(), p_action, auth.uid(), v_headers->>'x-forwarded-for', v_headers->>'user-agent', p_metadata);
end;
$$;
grant execute on function log_activity(text, jsonb) to authenticated;

-- Called by /set-password right after auth.updateUser({password}) succeeds
-- on a freshly-invited account.
create or replace function clear_force_password_change()
returns void
language plpgsql security definer set search_path = public as $$
begin
  update profiles set force_password_change = false, status = 'active' where id = auth.uid();
  perform log_activity('password_set_initial');
end;
$$;
grant execute on function clear_force_password_change() to authenticated;

-- Lets a Super Admin manually unlock an account (spec: "Super Admin can
-- manually unlock"). A plain admin cannot call this on someone else's
-- account -- current_user_role() check enforces that; unlocking their own
-- (impossible state, but guarded anyway) is a no-op since only status =
-- 'locked' rows are affected.
create or replace function admin_unlock_user(p_user_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if current_user_role() <> 'super_admin' then
    raise exception 'Only a Super Admin can unlock accounts.';
  end if;

  update profiles set status = 'active', failed_attempts = 0, locked_until = null
  where id = p_user_id and status = 'locked';

  perform log_activity('account_unlocked', jsonb_build_object('target_user_id', p_user_id));
end;
$$;
grant execute on function admin_unlock_user(uuid) to authenticated;
