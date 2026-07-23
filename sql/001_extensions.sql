-- Enables gen_random_uuid() used as the default id generator on every table below.
-- Usually already enabled on Supabase projects, but safe to run regardless.
create extension if not exists pgcrypto;
