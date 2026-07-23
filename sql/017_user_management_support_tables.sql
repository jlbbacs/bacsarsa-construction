-- Supporting tables for the user-management system: pending verification
-- tokens (username change, email change, Super Admin OTP) and an immutable
-- activity log. Neither table is ever queried or written directly by the
-- browser client -- both are touched exclusively by SECURITY DEFINER RPCs
-- (019, 021) and the send-notification-email Edge Function (service role,
-- bypasses RLS entirely), so there is deliberately no client-facing policy
-- on verification_tokens, and only a read policy on activity_logs.

create type token_type as enum ('username_change', 'email_change', 'otp_superadmin');

create table if not exists verification_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type token_type not null,
  token text,          -- link-based flows (username/email change)
  code_hash text,       -- OTP flow: sha256 of the 6-digit code, never store it raw
  new_value text,        -- e.g. the pending new username
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, type) -- one pending token per (user, type); re-requesting overwrites
);

alter table verification_tokens enable row level security;
-- No select/insert/update/delete policy for anon/authenticated at all.

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_user_id uuid references auth.users(id) on delete set null,
  ip_address text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table activity_logs enable row level security;

create policy "select_activity_logs_super_admin" on activity_logs
  for select to authenticated
  using (current_user_role() = 'super_admin');

-- No insert/update/delete policy for anon/authenticated -- only SECURITY
-- DEFINER RPCs (owned by postgres, bypasses RLS by ownership) may write.
-- Immutable by omission: no client, including a super_admin, can edit or
-- delete a row through the normal API.
