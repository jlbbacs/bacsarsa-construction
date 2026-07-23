-- Makes the Home page "intro" section's eyebrow label and checklist bullets
-- editable instead of hardcoded in Home.tsx.
alter table home_config
  add column if not exists intro_eyebrow text not null default 'Why Us',
  add column if not exists intro_bullets jsonb not null default '[
    "Licensed, bonded & fully insured",
    "In-house project management on every job",
    "Transparent, itemized estimates",
    "On-time, on-budget delivery track record"
  ]'::jsonb;
