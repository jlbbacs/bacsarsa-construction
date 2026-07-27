-- Structured NAP (address) fields + business hours for LocalBusiness/GBP schema.
-- The legacy `address` text column is kept (not dropped) so existing data/UI
-- that hasn't been touched yet still displays something; app code prefers the
-- structured fields when present and falls back to `address` otherwise.

alter table site_settings
  add column if not exists address_street text not null default '',
  add column if not exists address_city text not null default '',
  add column if not exists address_state text not null default '',
  add column if not exists address_postal_code text not null default '',
  add column if not exists address_country text not null default 'US',
  add column if not exists business_hours jsonb not null default '{
    "monday":    {"open": "07:00", "close": "17:00", "closed": false},
    "tuesday":   {"open": "07:00", "close": "17:00", "closed": false},
    "wednesday": {"open": "07:00", "close": "17:00", "closed": false},
    "thursday":  {"open": "07:00", "close": "17:00", "closed": false},
    "friday":    {"open": "07:00", "close": "17:00", "closed": false},
    "saturday":  {"open": "08:00", "close": "12:00", "closed": true},
    "sunday":    {"open": "08:00", "close": "12:00", "closed": true}
  }'::jsonb;
