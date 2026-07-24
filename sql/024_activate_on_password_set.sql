-- Robustly flips a pending_verification account to active whenever their
-- password is actually set. This used to rely solely on SetPassword.tsx
-- calling the clear_force_password_change RPC right after
-- auth.updateUser({password}) succeeds -- if that second call failed for
-- any reason (network hiccup, closed tab, etc.) the account was left
-- stuck showing "Pending Verification" forever even though the password
-- was really set and the account was fully usable. Moving the critical
-- state transition into a trigger means it can't be skipped by anything
-- that happens (or doesn't) on the client.

create or replace function handle_password_set() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.encrypted_password is distinct from old.encrypted_password then
    update profiles
    set force_password_change = false,
        status = case when status = 'pending_verification' then 'active' else status end
    where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_password_set
  after update of encrypted_password on auth.users
  for each row execute function handle_password_set();
