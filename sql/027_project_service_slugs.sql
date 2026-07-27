-- Adds URL slugs to projects and services so each item can have its own
-- crawlable detail route (/projects/:slug, /services/:slug) instead of only
-- existing as listing-page modal state.

alter table projects add column if not exists slug text;
alter table services add column if not exists slug text;

-- Backfill: slugify(title), de-duplicating collisions with a numeric suffix
-- (matches the app-side ensureUniqueBlogSlug behavior in src/lib/slug.ts).
do $$
declare
  rec record;
  base_slug text;
  candidate text;
  suffix int;
begin
  for rec in select id, title from projects where slug is null order by created_at loop
    base_slug := trim(both '-' from regexp_replace(lower(rec.title), '[^a-z0-9]+', '-', 'g'));
    if base_slug = '' then base_slug := 'project'; end if;
    candidate := base_slug;
    suffix := 2;
    while exists (select 1 from projects where slug = candidate and id <> rec.id) loop
      candidate := base_slug || '-' || suffix;
      suffix := suffix + 1;
    end loop;
    update projects set slug = candidate where id = rec.id;
  end loop;

  for rec in select id, title from services where slug is null order by created_at loop
    base_slug := trim(both '-' from regexp_replace(lower(rec.title), '[^a-z0-9]+', '-', 'g'));
    if base_slug = '' then base_slug := 'service'; end if;
    candidate := base_slug;
    suffix := 2;
    while exists (select 1 from services where slug = candidate and id <> rec.id) loop
      candidate := base_slug || '-' || suffix;
      suffix := suffix + 1;
    end loop;
    update services set slug = candidate where id = rec.id;
  end loop;
end $$;

alter table projects alter column slug set not null;
alter table services alter column slug set not null;

alter table projects add constraint projects_slug_unique unique (slug);
alter table services add constraint services_slug_unique unique (slug);
